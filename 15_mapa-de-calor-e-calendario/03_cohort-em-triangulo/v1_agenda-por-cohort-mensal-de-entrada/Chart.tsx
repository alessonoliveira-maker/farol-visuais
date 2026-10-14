import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CURRENT_MONTH, data as defaultData, ELAPSED_MONTHS, type CohortRow } from './data';

/**
 * Cohort de conversão em triângulo: cada linha é o mês de entrada, cada coluna é o tempo decorrido
 * desde a entrada, e a célula é a taxa acumulada de agenda até ali. As três leituras que o formato
 * precisa entregar são a horizontal (um cohort amadurecendo), a vertical (cohorts diferentes na
 * mesma idade, que é o que a média ponderada do rodapé resume) e a diagonal (o mês de calendário
 * que atravessa todos os cohorts ao mesmo tempo, que aqui é a diagonal tracejada de setembro).
 *
 * Duas ausências diferentes aparecem no mesmo desenho e não podem ser confundidas: a célula vazia é
 * um período que ainda não começou, e a célula tracejada é um período começado e ainda em curso, que
 * conta menos dias e por isso parece queda. Nenhuma das duas é dado faltando.
 */
export interface CohortTriangleProps {
  readonly data?: readonly CohortRow[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Cinco degraus da rampa sequencial, pulando `--seq-4` e `--seq-5`: são os dois tons em que nenhum
 * dos textos disponíveis alcança 4,5:1 nos dois temas ao mesmo tempo (medição da família 15).
 */
const SEQ_TOKENS = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-6)', 'var(--seq-7)'] as const;
const SEQ_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const CELL_GAP = 2;
const TRACK_HEIGHT = 6;

function monthIndex(month: string): number {
  return Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;
}

/** Período em curso: o mês de entrada mais os meses decorridos cai no mês corrente do recorte. */
function isOpenPeriod(month: string, elapsed: number): boolean {
  return monthIndex(month) + elapsed === monthIndex(CURRENT_MONTH);
}

function levelForValue(value: number, min: number, max: number): number {
  const span = max - min || 1;
  const ratio = (value - min) / span;
  return Math.min(SEQ_TOKENS.length - 1, Math.max(0, Math.round(ratio * (SEQ_TOKENS.length - 1))));
}

export default function CohortTriangle({ data = defaultData, height, className }: CohortTriangleProps) {
  const columns = Array.from({ length: ELAPSED_MONTHS }, (_, index) => index);
  const values = data.flatMap((row) => row.cumulative);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 1;
  const maxSize = data.reduce((largest, row) => Math.max(largest, row.size), 0);

  /**
   * Média ponderada pelo tamanho do cohort, e só sobre período fechado: juntar o mês em curso na
   * coluna puxaria a média para baixo por causa dos dias que ainda não aconteceram.
   */
  const columnAverages = columns.map((elapsed) => {
    let weighted = 0;
    let weight = 0;
    for (const row of data) {
      const value = row.cumulative[elapsed];
      if (value === undefined || isOpenPeriod(row.month, elapsed)) continue;
      weighted += value * row.size;
      weight += row.size;
    }
    return weight === 0 ? null : { rate: weighted / weight, cohorts: weight };
  });

  /** O melhor cohort é o de maior taxa na última coluna fechada que ele tem. */
  const best = data.reduce<{ month: string; elapsed: number; rate: number } | null>((champion, row) => {
    for (let elapsed = row.cumulative.length - 1; elapsed >= 0; elapsed -= 1) {
      const value = row.cumulative[elapsed];
      if (value === undefined || isOpenPeriod(row.month, elapsed)) continue;
      if (champion === null || value > champion.rate) return { month: row.month, elapsed, rate: value };
      return champion;
    }
    return champion;
  }, null);

  const summary = best
    ? `Triângulo de cohort com a conversão de lead em agenda de ${formatInt(data.length)} meses de entrada, de M0 a M${formatInt(ELAPSED_MONTHS - 1)}. ` +
      `O melhor é o cohort de ${formatMonthShort(best.month)}, com ${formatPercent(best.rate, 1)} em M${formatInt(best.elapsed)}. ` +
      `A diagonal tracejada é ${formatMonthShort(CURRENT_MONTH)}, que ainda está em curso.`
    : 'Triângulo de cohort sem nenhum período fechado para comparar.';

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <table className="w-full flex-1 table-fixed text-[11px]" style={{ borderCollapse: 'separate', borderSpacing: CELL_GAP }}>
        <thead>
          <tr>
            <th className="w-14 text-left align-bottom font-medium text-text-muted" scope="col">
              Entrada
            </th>
            <th className="w-24 text-left align-bottom font-medium text-text-muted" scope="col">
              Leads
            </th>
            {columns.map((elapsed) => (
              <th className="text-center align-bottom font-display font-medium tabular-nums text-text-muted" key={elapsed} scope="col">
                {`M${formatInt(elapsed)}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.month}>
              <th className="text-left align-middle font-medium text-text-secondary" scope="row">
                {formatMonthShort(row.month)}
              </th>
              <td className="pr-2 align-middle">
                <div className="flex items-center gap-1.5">
                  <div className="relative min-w-0 flex-1 rounded-full bg-surface-sunken" style={{ height: TRACK_HEIGHT }}>
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{ width: `${String(maxSize > 0 ? (row.size / maxSize) * 100 : 0)}%` }}
                    />
                  </div>
                  <span className="font-display tabular-nums text-text-secondary">{formatInt(row.size)}</span>
                </div>
              </td>
              {columns.map((elapsed) => {
                const value = row.cumulative[elapsed];
                if (value === undefined) {
                  return <td aria-label="período ainda não começou" className="align-middle" key={elapsed} />;
                }
                const level = levelForValue(value, min, max);
                const open = isOpenPeriod(row.month, elapsed);
                return (
                  <td
                    className={cn(
                      'rounded-sm px-1 py-1 text-center font-display font-medium tabular-nums',
                      open && 'border border-dashed',
                    )}
                    key={elapsed}
                    style={{
                      backgroundColor: SEQ_TOKENS[level],
                      color: SEQ_TEXT[level],
                      borderColor: open ? 'var(--text-primary)' : undefined,
                    }}
                  >
                    {formatPercent(value, 1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th className="border-t border-line-subtle pt-1 text-left align-middle font-medium text-text-muted" scope="row">
              Média
            </th>
            <td className="border-t border-line-subtle pr-2 pt-1 align-middle text-text-muted">ponderada</td>
            {columnAverages.map((average, elapsed) => (
              <td
                className="border-t border-line-subtle pt-1 text-center align-middle font-display font-semibold tabular-nums text-text-primary"
                key={elapsed}
              >
                {average === null ? '' : formatPercent(average.rate, 1)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>

      <figcaption aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-4 text-text-muted">
        <span className="flex items-center gap-2">
          <span className="font-display tabular-nums">{formatPercent(min, 0)}</span>
          <span className="flex overflow-hidden rounded-sm" style={{ gap: CELL_GAP }}>
            {SEQ_TOKENS.map((token) => (
              <span className="h-3 w-5" key={token} style={{ backgroundColor: token }} />
            ))}
          </span>
          <span className="font-display tabular-nums">{formatPercent(max, 0)}</span>
        </span>
        <span>taxa acumulada de agenda</span>
        <span>tracejado: período em curso</span>
        <span>célula vazia: período que ainda não começou</span>
        <span>média ponderada pelo tamanho, só períodos fechados</span>
      </figcaption>
    </figure>
  );
}
