import { AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

import { formatCurrencyCompact, formatDays, formatDecimal, formatHours, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, METRICS, type AreaRow, type MetricColumn, type MetricFormat } from './data';

/**
 * Painel de metas com 9 áreas por 8 métricas de unidades diferentes. A cor de cada célula é a
 * posição percentual da área dentro da própria coluna (não o valor absoluto), com a direção do
 * "bom" vinda do dado: em ciclo de venda, SLA e turnover, menor é melhor, e a rampa inverte.
 */
export interface PerfilDasAreasPorColunaProps {
  readonly data?: readonly AreaRow[];
  readonly metrics?: readonly MetricColumn[];
  readonly height?: number;
  readonly className?: string;
}

/** Mesmos cinco degraus e o mesmo par de texto medido da v1 e da v2. */
const SEQ_TOKENS = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-6)', 'var(--seq-7)'];
const SEQ_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
];
const CELL_GAP = 2;

function formatByColumn(value: number, format: MetricFormat): string {
  if (format === 'currencyCompact') return formatCurrencyCompact(value);
  if (format === 'days') return formatDays(value);
  if (format === 'decimal') return formatDecimal(value, 1);
  if (format === 'hours') return formatHours(value);
  return formatPercent(value, 0);
}

interface ColumnScale {
  readonly scoreByArea: ReadonlyMap<string, number>;
  readonly bestAreaId: string | null;
  readonly worstAreaId: string | null;
}

function scaleForColumn(rows: readonly AreaRow[], metric: MetricColumn): ColumnScale {
  const entries = rows.flatMap((row) => {
    const value = row.values[metric.id];
    return value === null || value === undefined ? [] : [{ areaId: row.areaId, value }];
  });
  const values = entries.map((entry) => entry.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const scoreByArea = new Map(
    entries.map(({ areaId, value }) => [areaId, metric.goodDirection === 'up' ? (value - min) / span : (max - value) / span]),
  );
  let bestAreaId: string | null = null;
  let worstAreaId: string | null = null;
  let bestScore = -Infinity;
  let worstScore = Infinity;
  for (const [areaId, score] of scoreByArea) {
    if (score > bestScore) {
      bestScore = score;
      bestAreaId = areaId;
    }
    if (score < worstScore) {
      worstScore = score;
      worstAreaId = areaId;
    }
  }
  return { scoreByArea, bestAreaId, worstAreaId };
}

export default function PerfilDasAreasPorColuna({
  data = defaultData,
  metrics = METRICS,
  height,
  className,
}: PerfilDasAreasPorColunaProps) {
  const scales = new Map(metrics.map((metric) => [metric.id, scaleForColumn(data, metric)]));
  const leadCount = new Map<string, number>();
  for (const scale of scales.values()) {
    if (scale.bestAreaId === null) continue;
    leadCount.set(scale.bestAreaId, (leadCount.get(scale.bestAreaId) ?? 0) + 1);
  }
  const leader = data.reduce<{ name: string; count: number } | null>((acc, row) => {
    const count = leadCount.get(row.areaId) ?? 0;
    return acc === null || count > acc.count ? { name: row.areaName, count } : acc;
  }, null);

  const summary = `Tabela de calor com o perfil de ${String(data.length)} áreas em ${String(metrics.length)} métricas de 2026. A cor mede a posição de cada área na própria coluna; direção do bom vem do dado. ${leader?.name ?? ''} lidera ${String(leader?.count ?? 0)} das ${String(metrics.length)} colunas.`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col gap-1.5', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <table className="w-full flex-1 table-fixed text-[11px]" style={{ borderCollapse: 'separate', borderSpacing: CELL_GAP }}>
        <thead>
          <tr>
            <th className="w-28 text-left align-bottom text-[11px] font-medium text-text-muted">Área</th>
            {metrics.map((metric) => {
              const DirectionIcon = metric.goodDirection === 'up' ? ArrowUp : ArrowDown;
              return (
                <th className="align-bottom text-center leading-tight font-medium text-text-muted" key={metric.id}>
                  <span className="inline-flex items-center gap-0.5">
                    {metric.label}
                    <DirectionIcon aria-hidden className="size-2.5 shrink-0" />
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.areaId}>
              <th className="truncate text-left align-middle font-medium text-text-secondary" scope="row">
                {row.areaName}
              </th>
              {metrics.map((metric) => {
                const value = row.values[metric.id];
                if (value === null || value === undefined) {
                  return (
                    <td className="rounded-sm border border-dashed border-line-strong p-0.5 text-center" key={metric.id}>
                      <span className="break-words text-[11px] leading-tight text-text-muted">{formatUnavailable()}</span>
                    </td>
                  );
                }
                const scale = scales.get(metric.id);
                const score = scale?.scoreByArea.get(row.areaId) ?? 0;
                const level = Math.min(SEQ_TOKENS.length - 1, Math.max(0, Math.round(score * (SEQ_TOKENS.length - 1))));
                const isBest = scale?.bestAreaId === row.areaId;
                const isWorst = scale?.worstAreaId === row.areaId;
                return (
                  <td
                    className={cn('rounded-sm p-0.5 text-center font-display tabular-nums', isBest ? 'font-bold' : 'font-medium')}
                    key={metric.id}
                    style={{ backgroundColor: SEQ_TOKENS[level], color: SEQ_TEXT[level] }}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {formatByColumn(value, metric.format)}
                      {isWorst ? <AlertTriangle aria-hidden className="size-2.5 shrink-0" /> : null}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption aria-hidden className="flex shrink-0 flex-wrap items-center gap-2 text-[11px] text-text-muted">
        <span>pior da coluna</span>
        <span className="flex overflow-hidden rounded-sm" style={{ gap: CELL_GAP }}>
          {SEQ_TOKENS.map((token) => (
            <span className="h-3 w-6" key={token} style={{ backgroundColor: token }} />
          ))}
        </span>
        <span>melhor da coluna</span>
        <span>· cor por coluna, direção no cabeçalho</span>
        <span className="inline-flex shrink-0 items-center gap-1">
          <ArrowUp aria-hidden className="size-2.5 shrink-0" />
          sobe é melhor
        </span>
        <span className="inline-flex shrink-0 items-center gap-1">
          <ArrowDown aria-hidden className="size-2.5 shrink-0" />
          desce é melhor
        </span>
        <span>· negrito é o melhor da coluna</span>
        <span className="inline-flex shrink-0 items-center gap-1">
          <AlertTriangle aria-hidden className="size-2.5 shrink-0" />é o pior
        </span>
      </figcaption>
    </figure>
  );
}
