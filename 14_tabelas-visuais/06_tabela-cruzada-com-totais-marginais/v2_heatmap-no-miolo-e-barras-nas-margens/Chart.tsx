import { Ban } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, STAGES, type ExecutiveStageLoad } from './data';

/**
 * Tabela cruzada com o miolo em heatmap (degrau proporcional à contagem, escala só das
 * células internas) e barra nos totais de linha e de coluna, cada uma com o próprio domínio.
 * A etapa em destaque leva peso 700 no cabeçalho e uma anotação curta; célula sem caso não
 * entra na escala de cor nem nas somas.
 */
export interface StageLoadHeatmapProps {
  readonly data?: readonly ExecutiveStageLoad[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Cinco degraus, não sete: --seq-4 e --seq-5 não têm par de texto acima de 4,5:1 estável nos
 * dois temas (mesma medição do modelo 02/v1 desta família).
 */
const SEQ_TOKENS = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-6)', 'var(--seq-7)'];
const SEQ_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
];
const NAME_COLUMN_WIDTH = 160;
const TOTAL_COLUMN_WIDTH = 60;
/** Altura do trilho da barra de total, na coluna e na linha. */
const BAR_TRACK = 14;

function levelForValue(value: number, min: number, max: number): number {
  const span = max - min || 1;
  const t = (value - min) / span;
  return Math.min(SEQ_TOKENS.length - 1, Math.max(0, Math.round(t * (SEQ_TOKENS.length - 1))));
}

function sum(values: readonly (number | null)[]): number {
  return values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
}

export default function StageLoadHeatmap({ data = defaultData, height, className }: StageLoadHeatmapProps) {
  const style = height === undefined ? undefined : { height };
  const measured = data.flatMap((row) => row.counts.filter((value): value is number => value !== null));
  const min = measured.length > 0 ? Math.min(...measured) : 0;
  const max = measured.length > 0 ? Math.max(...measured) : 1;
  const rowTotals = data.map((row) => sum(row.counts));
  const colTotals = STAGES.map((_, stageIndex) => sum(data.map((row) => row.counts[stageIndex] ?? null)));
  const rowMax = Math.max(1, ...rowTotals);
  const colMax = Math.max(1, ...colTotals);
  const grandTotal = sum(rowTotals);
  const busiestStageIndex = colTotals.reduce((best, value, index) => (value > (colTotals[best] ?? 0) ? index : best), 0);
  const highlightStage = STAGES[busiestStageIndex] ?? '';

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center', className)} role="status" style={style}>
        <p className="text-xs text-text-muted">Nenhum executivo neste recorte: sem carga para cruzar por etapa.</p>
      </div>
    );
  }

  const summary =
    `Tabela cruzada em heatmap com ${String(data.length)} executivos por ${String(STAGES.length)} etapas do funil em 2026-09. ` +
    `${STAGES[busiestStageIndex] ?? ''} concentra o maior total de coluna, com ${String(colTotals[busiestStageIndex] ?? 0)}. ` +
    `Total geral de ${String(grandTotal)} oportunidades. Etapa em destaque por ter o maior total: ${highlightStage}.`;

  const gridTemplateColumns = `${String(NAME_COLUMN_WIDTH)}px repeat(${String(STAGES.length)}, minmax(0, 1fr)) ${String(TOTAL_COLUMN_WIDTH)}px`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-1', className)} role="group" style={style}>
      <div className="grid gap-x-1 gap-y-1" style={{ gridTemplateColumns }}>
        <span className="self-end pb-0.5 text-[0.6875rem] font-medium text-text-muted">Executivo</span>
        {STAGES.map((stage, stageIndex) => {
          const isHighlight = stageIndex === busiestStageIndex;
          return (
            <span className="flex flex-col items-center self-end pb-0.5 text-center" key={stage}>
              <span className={cn('text-[0.6875rem]', isHighlight ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                {stage}
              </span>
              {isHighlight ? (
                <span aria-hidden className="text-[0.6875rem] text-text-muted">
                  {formatInt(colTotals[busiestStageIndex] ?? 0)} no total, o maior
                </span>
              ) : null}
            </span>
          );
        })}
        <span className="self-end pb-0.5 text-right text-[0.6875rem] font-medium text-text-secondary">Total</span>

        {data.map((row, rowIndex) => {
          const total = rowTotals[rowIndex] ?? 0;
          const pct = (total / rowMax) * 100;
          return (
            <div className="col-span-full grid grid-cols-subgrid border-t border-line-subtle" key={row.id}>
              <span className="py-0.5 pr-2 text-[0.6875rem] text-text-secondary">
                {row.name}
              </span>
              {STAGES.map((stage, stageIndex) => {
                const value = row.counts[stageIndex] ?? null;
                if (value === null) {
                  return (
                    <span className="flex items-center justify-center py-0.5 text-text-muted" key={stage}>
                      <Ban aria-hidden className="size-3" strokeWidth={1.75} />
                      <span className="sr-only">não se aplica</span>
                    </span>
                  );
                }
                const level = levelForValue(value, min, max);
                return (
                  <span className="flex items-center justify-center rounded-sm py-0.5" key={stage} style={{ backgroundColor: SEQ_TOKENS[level] }}>
                    <span className="font-display text-xs font-medium tabular-nums" style={{ color: SEQ_TEXT[level] }}>
                      {formatInt(value)}
                    </span>
                  </span>
                );
              })}
              <span className="flex items-center gap-1.5 py-0.5 pl-1">
                <span className="relative min-w-0 flex-1 rounded-full bg-surface-sunken" style={{ height: BAR_TRACK }}>
                  <span className="absolute inset-y-0 left-0 rounded-full bg-chart-1" style={{ width: `${String(pct)}%` }} />
                </span>
                <span className="w-6 shrink-0 text-right font-display text-[0.6875rem] font-semibold tabular-nums text-text-primary">
                  {formatInt(total)}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid gap-x-1 border-t border-line-strong pt-1" style={{ gridTemplateColumns }}>
        <span className="self-end pb-0.5 text-[0.6875rem] font-semibold text-text-secondary">Total</span>
        {STAGES.map((stage, stageIndex) => {
          const total = colTotals[stageIndex] ?? 0;
          const pct = (total / colMax) * 100;
          return (
            <div className="flex flex-col items-center gap-0.5" key={stage}>
              <span className="font-display text-[0.6875rem] font-semibold tabular-nums text-text-primary">{formatInt(total)}</span>
              <span className="flex w-4 flex-col-reverse rounded-sm bg-surface-sunken" style={{ height: 28 }}>
                <span className="w-full rounded-sm bg-chart-1" style={{ height: `${String(pct)}%` }} />
              </span>
            </div>
          );
        })}
        <span className="flex items-end justify-end pb-0.5 font-display text-sm font-semibold tabular-nums text-text-primary">
          {formatInt(grandTotal)}
        </span>
      </div>

      <figcaption aria-hidden className="flex shrink-0 flex-wrap items-center gap-2 text-[0.6875rem] text-text-muted">
        <span>{formatInt(min)}</span>
        <span className="flex overflow-hidden rounded-sm">
          {SEQ_TOKENS.map((token) => (
            <span className="h-3 w-5" key={token} style={{ backgroundColor: token }} />
          ))}
        </span>
        <span>{formatInt(max)}</span>
        <span>· escala só do miolo; totais e barras ficam fora dela</span>
        <span className="inline-flex items-center gap-1">
          <Ban aria-hidden className="size-3" strokeWidth={1.75} /> não se aplica ao papel
        </span>
      </figcaption>
    </figure>
  );
}
