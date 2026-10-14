import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { capacityCeiling, data as defaultData, type DailyQueueStock } from './data';

/**
 * Área empilhada com o estoque diário da fila de pré-vendas em quatro etapas, na ordem do
 * processo, contra o teto de capacidade combinado. A linha de leitura conta os dias acima do
 * teto e aponta a etapa que mais incha nesses dias; o dia sem medição interrompe as quatro
 * camadas juntas, nunca vira zero.
 */
export interface QueueStockAreaProps {
  readonly data?: readonly DailyQueueStock[];
  readonly height?: number;
  readonly className?: string;
}

const STAGE_KEYS = ['novo', 'emCadencia', 'aguardandoAgenda', 'reagendar'] as const;
type StageKey = (typeof STAGE_KEYS)[number];
const STAGE_LABEL: Record<StageKey, string> = {
  novo: 'Novo',
  emCadencia: 'Em cadência',
  aguardandoAgenda: 'Aguardando agenda',
  reagendar: 'Reagendar',
};
/** Slots categóricos na ordem 1, 3, 6, 5 da COR-8, uma cor fixa por etapa do processo. */
const STAGE_FILL: Record<StageKey, string> = {
  novo: 'var(--chart-1)',
  emCadencia: 'var(--chart-3)',
  aguardandoAgenda: 'var(--chart-6)',
  reagendar: 'var(--chart-5)',
};
const LAYER_STROKE = 'var(--surface-raised)';
const CEILING_STROKE = 'var(--text-muted)';
const MARGIN = { top: 26, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 36;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface QueueRow extends DailyQueueStock {
  readonly total: number | null;
}

interface CeilingLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number };
}

function totalOf(row: DailyQueueStock): number | null {
  if (row.novo === null || row.emCadencia === null || row.aguardandoAgenda === null || row.reagendar === null) {
    return null;
  }
  return row.novo + row.emCadencia + row.aguardandoAgenda + row.reagendar;
}

/** Média de uma etapa num subconjunto de linhas, ignorando o dia de lacuna. */
function stageAverage(rows: readonly QueueRow[], stage: StageKey): number {
  const valid = rows.map((row) => row[stage]).filter((value): value is number => value !== null);
  if (valid.length === 0) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

/** Um tique de eixo por mês: o primeiro dia de cada mês que aparece no dado. */
function monthTicks(rows: readonly QueueRow[]): readonly string[] {
  const seen = new Set<string>();
  const ticks: string[] = [];
  for (const row of rows) {
    const monthKey = row.date.slice(0, 7);
    if (seen.has(monthKey)) continue;
    seen.add(monthKey);
    ticks.push(row.date);
  }
  return ticks;
}

export default function QueueStockArea({ data = defaultData, height, className }: QueueStockAreaProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum dia neste recorte: a fila de pré-vendas não tem estoque registrado.</span>
      </div>
    );
  }

  const rows: readonly QueueRow[] = data.map((row) => ({ ...row, total: totalOf(row) }));
  const first = rows[0];
  const last = rows[rows.length - 1];
  const overCeiling = rows.filter((row) => row.total !== null && row.total > capacityCeiling);
  const daysOver = overCeiling.length;

  const swollenStage = STAGE_KEYS.reduce<{ stage: StageKey; ratio: number } | null>((best, stage) => {
    const overallAverage = stageAverage(rows, stage);
    if (overallAverage <= 0 || overCeiling.length === 0) return best;
    const ratio = stageAverage(overCeiling, stage) / overallAverage;
    if (!best || ratio > best.ratio) return { stage, ratio };
    return best;
  }, null);
  /** O todo, nos dias acima do teto: a média do estoque total nesses dias. */
  const overCeilingTotalAverage =
    overCeiling.length === 0 ? 0 : overCeiling.reduce((sum, row) => sum + (row.total ?? 0), 0) / overCeiling.length;
  /** A parte: quanto da média acima do teto é a etapa que mais incha. */
  const swollenShare =
    swollenStage && overCeilingTotalAverage > 0
      ? stageAverage(overCeiling, swollenStage.stage) / overCeilingTotalAverage
      : null;

  const summary = first && last
    ? `Área empilhada com o estoque diário da fila de pré-vendas em quatro etapas, ${formatInt(rows.length)} dias. ` +
      `Passou do teto de ${formatInt(capacityCeiling)} em ${formatInt(daysOver)} dias` +
      `${swollenStage && swollenShare !== null ? `, quando ${STAGE_LABEL[swollenStage.stage]} responde por ${formatPercent(swollenShare, 0)} do estoque em média` : ''}. ` +
      'Um dia ficou sem medição e aparece como lacuna nas quatro etapas.'
    : 'Área empilhada do estoque diário da fila de pré-vendas por etapa.';

  const ticks = monthTicks(rows);

  const renderCeilingLabel = ({ viewBox }: CeilingLabelProps): ReactElement => (
    <text
      className="font-display"
      fill={CEILING_STROKE}
      fontSize={11}
      style={HALO}
      textAnchor="end"
      x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)}
      y={(viewBox?.y ?? 0) - 7}
    >
      <tspan className="font-sans">teto </tspan>
      {formatInt(capacityCeiling)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="kpi-number font-semibold text-text-primary">{formatInt(daysOver)}</span> de{' '}
        <span className="tabular-nums">{formatInt(rows.length)}</span> dias acima do teto de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(capacityCeiling)}</span>
        {swollenStage ? (
          <>
            {' '}
            · etapa que mais incha:{' '}
            <span className="font-semibold text-text-primary">{STAGE_LABEL[swollenStage.stage]}</span>
          </>
        ) : null}
      </p>
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1" aria-hidden>
        {[...STAGE_KEYS].reverse().map((stage) => (
          <li
            className={cn(
              'flex items-center gap-1.5 text-xs leading-5 text-text-secondary',
              swollenStage?.stage === stage && 'font-semibold text-text-primary',
            )}
            key={stage}
          >
            <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: STAGE_FILL[stage] }} />
            {STAGE_LABEL[stage]}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="date"
              interval={0}
              tickFormatter={formatMonthShort}
              tickLine={false}
              tickMargin={8}
              ticks={[...ticks]}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, 'dataMax']}
              tickFormatter={formatInt}
              tickLine={false}
              width={VALUE_AXIS_WIDTH}
            />
            {STAGE_KEYS.map((stage) => (
              <Area
                connectNulls={false}
                dataKey={stage}
                fill={STAGE_FILL[stage]}
                fillOpacity={0.85}
                isAnimationActive={animate}
                key={stage}
                name={STAGE_LABEL[stage]}
                stackId="fila"
                stroke={LAYER_STROKE}
                strokeWidth={1.5}
                type="monotone"
              />
            ))}
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderCeilingLabel}
              stroke={CEILING_STROKE}
              strokeDasharray="3 3"
              strokeWidth={1}
              y={capacityCeiling}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
