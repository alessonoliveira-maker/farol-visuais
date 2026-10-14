import { Filter } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import {
  Bar,
  ComposedChart,
  LabelList,
  Line,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyCompact, formatInt, formatPercent, formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import { cutPercent as defaultCutPercent, data as defaultData, type StageLosses, type StageLossReason } from './data';

/**
 * Um pareto por etapa do funil, lado a lado, com alternância entre as duas grandezas da perda:
 * quantidade de negócios e valor em reais. As duas nunca aparecem juntas, porque ordenam
 * diferente: o motivo que derruba mais negócios não é o que custa mais caro, e um gráfico só
 * teria de escolher qual ordem obedecer. As barras são horizontais (`layout="vertical"`) para o
 * nome do motivo caber inteiro à esquerda, sem reticência. O eixo das barras vai de zero ao total
 * da própria etapa, então a primeira barra toca o primeiro ponto da linha; o eixo do percentual
 * acumulado é o mesmo nos dois painéis, de 0 a 100, e é ele que os torna comparáveis. O corte de
 * 80% é recalculado a cada troca de grandeza e em cada etapa, e a contagem de motivos até ele sai
 * escrita no título do painel.
 */
export interface StageLossParetoProps {
  readonly data?: readonly StageLosses[];
  /** Percentual acumulado do corte. Padrão 80, a regra de Pareto. */
  readonly cutPercent?: number;
  readonly height?: number;
  readonly className?: string;
}

type Mode = 'count' | 'amount';

interface PanelRow {
  readonly id: string;
  readonly reason: string;
  readonly value: number;
  readonly acumPct: number;
  readonly sharePct: number;
  readonly inCut: boolean;
  readonly isOther: boolean;
}

interface Panel {
  readonly id: string;
  readonly stage: string;
  readonly rows: readonly PanelRow[];
  readonly total: number;
  readonly cutCount: number;
  readonly cutAcum: number;
}

interface AxisTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
  readonly payload?: { readonly value?: unknown };
}

interface ReferenceLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number };
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const MODE_LABEL: Record<Mode, string> = { count: 'quantidade', amount: 'valor perdido' };
/** A margem direita reserva o rótulo de valor na ponta livre da barra: `R$ 820,0 mil` pede 63 px. */
const PANEL_MARGIN = { top: 18, right: 80, bottom: 0, left: 0 } as const;
/** Cabe `Concorrência` em 11 px (70,5 px de tinta) com a sobrecarga de 18 px do eixo. */
const NAME_AXIS_WIDTH = 112;
const PCT_AXIS_HEIGHT = 30;
const MAX_BAR_SIZE = 24;
const BAR_CATEGORY_GAP = '34%';
const BAR_RADIUS = [0, 3, 3, 0] as const;
/**
 * Respiro do rótulo de valor até a ponta da barra (17.7). São 10 px e não 6 porque o primeiro
 * ponto da linha do acumulado cai exatamente na ponta da primeira barra, por construção do pareto,
 * e com 6 px o ponto de raio 3 encostava no primeiro algarismo: medido no render, "14 perdas" lia
 * como se o ponto fosse parte do algarismo.
 */
const VALUE_LABEL_GAP = 10;
/** Respiro do rótulo do último ponto da linha até o ponto em si. */
const ACUM_LABEL_GAP = 10;
/** Respiro do rótulo do corte até a linha de referência, na faixa reservada do topo (REC-4). */
const CUT_LABEL_GAP = 7;
const BAR_FILL = 'var(--chart-1)';
/** Neutro da cauda agregada: permitido porque o valor está escrito na ponta de cada barra. */
const OTHER_FILL = 'var(--line-strong)';
const LINE_STROKE = 'var(--chart-3)';
const CUT_STROKE = 'var(--text-muted)';
const PCT_TICKS = [0, 50, 100] as const;
/** Halo na cor do cartão: o rótulo continua legível quando a linha do acumulado passa por ele. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function modeValue(reason: StageLossReason, mode: Mode): number {
  return mode === 'count' ? reason.count : reason.amount;
}

/** O valor na grandeza escolhida, com a unidade sempre escrita (NUM-6). */
function modeText(value: number, mode: Mode): string {
  if (mode === 'amount') return formatCurrencyCompact(value);
  return `${formatInt(value)} ${value === 1 ? 'perda' : 'perdas'}`;
}

/**
 * Um painel: ordena os motivos pela grandeza escolhida, em ordem decrescente com desempate
 * estável por nome, mantém "Outros" no fim, acumula sobre os valores brutos e marca as linhas até
 * o corte. Devolve `null` para etapa sem motivo ou sem perda medida (EST-1b), nunca zero.
 */
function buildPanel(stage: StageLosses, mode: Mode, cut: number): Panel | null {
  if (stage.reasons.length === 0) return null;
  const named = stage.reasons
    .filter((item) => !item.isOther)
    .sort((a, b) => modeValue(b, mode) - modeValue(a, mode) || a.reason.localeCompare(b.reason, 'pt-BR'));
  const ordered = [...named, ...stage.reasons.filter((item) => item.isOther)];
  const total = ordered.reduce((sum, item) => sum + modeValue(item, mode), 0);
  if (total <= 0) return null;

  let acum = 0;
  const partial = ordered.map((item) => {
    const value = modeValue(item, mode);
    acum += value;
    return {
      id: item.id,
      reason: item.reason,
      value,
      acumPct: (acum / total) * 100,
      sharePct: value / total,
      isOther: item.isOther === true,
    };
  });

  // O corte é o primeiro motivo cujo acumulado alcança a marca, recalculado a cada grandeza: o
  // laço evita ler o array por índice e a contagem sai do dado, não de um número escrito à mão.
  let cutCount = 0;
  let cutAcum = 0;
  for (const row of partial) {
    if (cutAcum >= cut) break;
    cutCount += 1;
    cutAcum = row.acumPct;
  }

  return {
    id: stage.id,
    stage: stage.stage,
    rows: partial.map((row, index) => ({ ...row, inCut: index < cutCount })),
    total,
    cutCount,
    cutAcum,
  };
}

/** As duas linhas da dica de um motivo: valor com a fatia da etapa, e o acumulado até ali. */
function buildTooltipEntries(row: PanelRow, mode: Mode): readonly TooltipEntry[] {
  return [
    {
      color: row.isOther ? OTHER_FILL : BAR_FILL,
      dataKey: 'value',
      graphicalItemId: 'value',
      name: MODE_LABEL[mode],
      value: `${modeText(row.value, mode)} (${formatPercent(row.sharePct)} da etapa)`,
    },
    {
      color: LINE_STROKE,
      dataKey: 'acumPct',
      graphicalItemId: 'acumPct',
      name: 'Acumulado',
      value: formatPercentPoints(row.acumPct),
    },
  ];
}

export default function StageLossPareto({
  data = defaultData,
  cutPercent = defaultCutPercent,
  height,
  className,
}: StageLossParetoProps) {
  const animate = useAnimateOnce();
  const [mode, setMode] = useState<Mode>('count');
  const style = height === undefined ? undefined : { height };

  const panels: readonly Panel[] = data
    .map((stage) => buildPanel(stage, mode, cutPercent))
    .filter((panel): panel is Panel => panel !== null);

  if (panels.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve oportunidade perdida no período.</span>
      </div>
    );
  }

  const grandTotal = panels.reduce((sum, panel) => sum + panel.total, 0);
  const cutList = panels.map((panel) => `${formatInt(panel.cutCount)} em ${panel.stage}`).join(' e ');
  const totalText = `Total do trimestre: ${modeText(grandTotal, mode)}`;

  const summary =
    `${formatInt(panels.length)} gráficos de barras com os motivos de perda por etapa, em ${MODE_LABEL[mode]}, cada ` +
    `um com a linha do percentual acumulado e o corte de ${formatPercentPoints(cutPercent, 0)}. Motivos até o ` +
    `corte: ${cutList}. ${totalText}.`;

  const renderPanel = (panel: Panel): ReactElement => {
    const { rows } = panel;
    const title = `${panel.stage} · ${formatInt(panel.cutCount)} motivos até ${formatPercentPoints(cutPercent, 0)}`;

    const renderBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
      const row = rows[index];
      return (
        <Rectangle
          fill={row?.isOther === true ? OTHER_FILL : BAR_FILL}
          height={Number(barHeight)}
          radius={[...BAR_RADIUS]}
          width={Number(width)}
          x={Number(x)}
          y={Number(y)}
        />
      );
    };

    const renderName = ({ y, index = -1, payload }: AxisTickProps): ReactElement => {
      const row = rows[index];
      return (
        <text
          className="font-sans"
          dominantBaseline="central"
          fill={row?.inCut === true ? 'var(--text-secondary)' : 'var(--text-muted)'}
          fontSize={11}
          fontWeight={row?.inCut === true ? 600 : 400}
          x={PANEL_MARGIN.left}
          y={Number(y)}
        >
          {String(payload?.value ?? '')}
        </text>
      );
    };

    /** A âncora é a ponta livre da barra, `x + width`, nunca o zero (ROT-2). */
    const renderValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
      const row = index === undefined ? undefined : rows[index];
      if (!row) return null;
      return (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={row.inCut ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={12}
          fontWeight={row.inCut ? 600 : 500}
          style={HALO}
          x={Number(x) + Number(width) + VALUE_LABEL_GAP}
          y={Number(y) + Number(barHeight) / 2}
        >
          {modeText(row.value, mode)}
        </text>
      );
    };

    const renderAcumLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
      if (index === undefined || index !== rows.length - 1) return null;
      const row = rows[index];
      if (!row) return null;
      return (
        <text
          className="font-display"
          fill={LINE_STROKE}
          fontSize={11}
          style={HALO}
          textAnchor="end"
          x={Number(x)}
          y={Number(y) - ACUM_LABEL_GAP}
        >
          Acumulado {formatPercentPoints(row.acumPct)}
        </text>
      );
    };

    const renderCutLabel = ({ viewBox }: ReferenceLabelProps): ReactElement => (
      <text fill={CUT_STROKE} fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={(viewBox?.y ?? 0) - CUT_LABEL_GAP}>
        <tspan className="font-sans">corte </tspan>
        <tspan className="font-display">{formatPercentPoints(cutPercent, 0)}</tspan>
      </text>
    );

    const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
      const reason = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
      const row = reason === undefined ? undefined : rows.find((candidate) => candidate.reason === reason);
      if (!tooltipProps.active || !row) return null;
      return (
        <ChartTooltip
          active={tooltipProps.active}
          label={reason}
          payload={buildTooltipEntries(row, mode)}
          valueFormat="text"
        />
      );
    };

    return (
      <div className="flex min-w-0 flex-1 flex-col" key={panel.id}>
        <p aria-hidden className="mb-1 shrink-0 truncate text-[0.6875rem] font-medium text-text-secondary">
          {title}
        </p>
        <div className="min-h-0 flex-1">
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart
              accessibilityLayer={false}
              barCategoryGap={BAR_CATEGORY_GAP}
              data={[...rows]}
              layout="vertical"
              margin={PANEL_MARGIN}
            >
              <YAxis
                axisLine={false}
                dataKey="reason"
                interval={0}
                tick={renderName}
                tickLine={false}
                type="category"
                width={NAME_AXIS_WIDTH}
              />
              <XAxis domain={[0, panel.total]} hide type="number" xAxisId="val" />
              <XAxis
                axisLine={false}
                domain={[0, 100]}
                height={PCT_AXIS_HEIGHT}
                tick={{ fill: LINE_STROKE, fontSize: 11 }}
                tickFormatter={(value: number) => formatPercentPoints(value, 0)}
                tickLine={false}
                tickMargin={8}
                ticks={[...PCT_TICKS]}
                type="number"
                xAxisId="pct"
              />
              <Tooltip
                content={renderTooltip}
                cursor={{ fill: 'var(--line-subtle)' }}
                isAnimationActive={false}
                itemSorter={(item) => (item.dataKey === 'value' ? 0 : 1)}
              />
              <Bar
                dataKey="value"
                isAnimationActive={animate}
                maxBarSize={MAX_BAR_SIZE}
                name={MODE_LABEL[mode]}
                shape={renderBar}
                xAxisId="val"
              >
                <LabelList content={renderValue} dataKey="value" />
              </Bar>
              <ReferenceLine
                ifOverflow="extendDomain"
                label={renderCutLabel}
                stroke={CUT_STROKE}
                strokeDasharray="3 3"
                strokeWidth={1}
                x={cutPercent}
                xAxisId="pct"
              />
              <Line
                activeDot={{ r: 4, fill: LINE_STROKE }}
                dataKey="acumPct"
                dot={{ r: 3, fill: LINE_STROKE, strokeWidth: 0 }}
                isAnimationActive={animate}
                name="Acumulado"
                stroke={LINE_STROKE}
                strokeWidth={2}
                type="linear"
                xAxisId="pct"
              >
                <LabelList content={renderAcumLabel} dataKey="acumPct" />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
        <p aria-hidden className="truncate text-xs text-text-secondary">
          {totalText}
        </p>
        <div
          aria-label="Grandeza da perda"
          className="inline-flex shrink-0 rounded-md border border-line-subtle p-0.5"
          role="radiogroup"
        >
          {(Object.keys(MODE_LABEL) as Mode[]).map((key) => (
            <button
              aria-checked={mode === key}
              className={cn(
                'rounded px-1.5 py-0.5 text-xs font-medium',
                mode === key ? 'bg-chart-1' : 'text-text-secondary',
              )}
              key={key}
              onClick={() => {
                setMode(key);
              }}
              role="radio"
              style={mode === key ? { color: 'var(--accent-cyan-contrast)' } : undefined}
              type="button"
            >
              {MODE_LABEL[key]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 gap-2">{panels.map(renderPanel)}</div>
    </div>
  );
}
