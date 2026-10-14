import { Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveQuota } from './data';

/**
 * Lista de barras por executivo: cada linha mostra o atingimento da cota do trimestre em
 * percentual, com o valor absoluto ao lado, numa escala comum ao grupo inteiro para o comprimento
 * das barras se comparar entre linhas. Ordenada por atingimento, nunca por nome. A mediana da
 * equipe é um traço comum a todas as linhas. Quem não tem cota definida no período vai para o
 * fim, fora do cálculo da mediana, com o texto "sem meta definida" no lugar do percentual.
 */
export interface QuotaListProps {
  readonly data?: readonly ExecutiveQuota[];
  readonly className?: string;
}

/** Folga acima do maior atingimento do grupo, para o traço da cota nunca sair do trilho. */
const DOMAIN_SLACK = 1.05;
/** Abaixo deste percentual do trilho a ponta arredondada vira quase reta (mesma regra da v1). */
const ROUNDED_FLOOR = 0.04;

interface Row extends ExecutiveQuota {
  readonly percent: number | null;
}

/**
 * Mediana, ou `null` quando não há amostra. Devolver `0` para lista vazia imprimiria "mediana da
 * equipe 0%", que é zero medido no lugar de ausência: nunca trocar por `?? 0` no chamador.
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
  return sorted[mid] ?? 0;
}

export default function QuotaList({ data = defaultData, className }: QuotaListProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: o filtro não devolveu executivo no período.</span>
      </div>
    );
  }

  const rows: readonly Row[] = data.map((row) => ({
    ...row,
    percent: row.target === null || row.target === 0 ? null : row.value / row.target,
  }));

  const withQuota = rows.filter((row): row is Row & { percent: number } => row.percent !== null);
  const withoutQuota = rows.filter((row) => row.percent === null);
  const sorted: readonly Row[] = [...[...withQuota].sort((a, b) => b.percent - a.percent), ...withoutQuota];

  /** A guarda de vazio da mediana é `withQuota`, a lista que a alimenta, não `data`: há linha no
   * recorte e ainda assim pode não haver nenhuma cota definida. */
  const teamMedian = median(withQuota.map((row) => row.percent));
  const domainMax = Math.max(1, ...withQuota.map((row) => row.percent)) * DOMAIN_SLACK;
  const medianRatio = teamMedian === null ? null : teamMedian / domainMax;
  const aboveOrAtQuota = withQuota.filter((row) => row.percent >= 1).length;

  const medianPhrase =
    teamMedian === null
      ? `Mediana da equipe ${formatUnavailable()}: nenhum executivo com cota definida no período`
      : `Mediana da equipe em ${formatPercent(teamMedian)}`;
  const summary = `Lista de barras com o atingimento da cota do trimestre entre ${String(rows.length)} executivos, ordenada da maior para a menor. ${medianPhrase}. ${String(aboveOrAtQuota)} bateram ou passaram a cota, e ${String(withoutQuota.length)} sem meta definida no período, fora da mediana.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-3', className)}
      role="table"
    >
      <p aria-hidden className="text-xs text-text-muted">
        atingimento da cota, 2026 T3 · mediana da equipe{' '}
        {teamMedian === null ? (
          <span className="inline-flex items-center gap-1 align-[-2px]">
            <Unplug aria-hidden className="size-3.5" />
            {formatUnavailable()}
          </span>
        ) : (
          <span className="kpi-number">{formatPercent(teamMedian)}</span>
        )}{' '}
        · sem ritmo esperado calculado
      </p>

      <div className="flex flex-col gap-2.5">
        {sorted.map((row) => {
          const isOver = row.percent !== null && row.percent > 1;
          const baseRatio = row.percent === null ? 0 : Math.min(row.percent, 1) / domainMax;
          const overRatio = isOver && row.percent !== null ? (row.percent - 1) / domainMax : 0;
          const capRatio = 1 / domainMax;

          return (
            <div className="flex min-w-0 items-center gap-3" key={row.id}>
              <p className="w-28 shrink-0 text-xs leading-tight break-words text-text-secondary">{row.name}</p>
              <div className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                {row.percent === null ? (
                  <div className="absolute inset-0 rounded-full border border-dashed border-line-strong" />
                ) : (
                  <>
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 bg-chart-1',
                        baseRatio < ROUNDED_FLOOR ? 'rounded-sm' : 'rounded-full',
                      )}
                      style={{ width: `${String(baseRatio * 100)}%` }}
                    />
                    {isOver ? (
                      <div
                        className="absolute inset-y-0 rounded-r-full bg-positive"
                        style={{ left: `${String(capRatio * 100)}%`, width: `${String(overRatio * 100)}%` }}
                      />
                    ) : null}
                  </>
                )}
                {/* Sem cota na amostra não existe mediana para desenhar: o traço no zero do trilho
                    seria lido como mediana de 0%. */}
                {medianRatio === null ? null : (
                  <div
                    className="absolute inset-y-[-3px] w-0 border-l border-dashed border-text-muted"
                    style={{ left: `${String(medianRatio * 100)}%` }}
                  />
                )}
              </div>
              <p className="w-32 shrink-0 text-right text-xs">
                {row.percent === null ? (
                  <span className="text-text-muted">
                    sem meta definida <span className="kpi-number">({formatCurrencyCompact(row.value)})</span>
                  </span>
                ) : (
                  <>
                    <span className={cn('kpi-number font-semibold', isOver ? 'text-positive' : 'text-text-primary')}>
                      {formatPercent(row.percent)}
                    </span>{' '}
                    <span className="kpi-number text-text-muted">{formatCurrencyCompact(row.value)}</span>
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
