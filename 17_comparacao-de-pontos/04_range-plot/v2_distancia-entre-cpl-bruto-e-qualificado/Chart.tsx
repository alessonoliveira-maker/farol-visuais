import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatDecimal, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadOriginCost } from './data';

/**
 * Range plot horizontal do CPL: uma cápsula por origem de lead indo do custo bruto ao custo
 * qualificado, ordenada pela largura, com só a origem de maior distância acesa. Responde "onde o
 * lead qualificado custa muito mais que o bruto", que é a pergunta real do orçamento de agosto.
 */
export interface LeadCostRangePlotProps {
  /** Origens em qualquer ordem: o componente calcula os CPL e ordena pela largura da faixa. */
  readonly data?: readonly LeadOriginCost[];
  /** Altura da raiz em px, para pai sem altura. O gráfico em si mede ROW_STEP por origem. */
  readonly height?: number;
  readonly className?: string;
}

interface CostRow extends LeadOriginCost {
  /** Custo por lead captado, em reais, arredondado ao centavo. */
  readonly raw: number;
  /** Custo por lead qualificado, em reais, arredondado ao centavo. */
  readonly qualified: number;
  /** Largura da faixa: o que a barra empilhada sobre a base invisível desenha. */
  readonly span: number;
  /** Quantas vezes o qualificado custa o bruto. */
  readonly factor: number;
}

interface CapsuleProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly fill?: string;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

const HIGHLIGHT_FILL = 'var(--chart-2)';
/** Neutro das faixas sem destaque: --text-muted passa de 3:1 como marca, o que o --line-strong não faz (TOK-5). */
const NEUTRAL_FILL = 'var(--text-muted)';
const MARGIN = { top: 4, right: 132, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 168;
const X_AXIS_HEIGHT = 26;
/** Passo fixo por linha: 32 px com vão de 30% dá cápsula de 12,8 px, acima do piso de 12 (ESP-2). */
const ROW_STEP = 32;
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX = 16;
const END_LABEL_GAP = 6;
const RING_RADIUS = 6;
const RING_STROKE = 2;
const NOTE_GAP = 8;
const MAX_GRID_INTERVALS = 4;
const STEP_MULTIPLIERS = [1, 2, 2.5, 5, 10] as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;
const LOCALE = 'pt-BR';

const cents = (value: number): number => Math.round(value * 100) / 100;

/** Maior distância primeiro; empate pelo nome para a ordem não mudar a cada recarga. */
function rankBySpan(rows: readonly LeadOriginCost[]): CostRow[] {
  return rows
    .map((row) => {
      const raw = cents(row.spend / row.leads);
      const qualified = cents(row.spend / row.qualifiedLeads);
      return { ...row, raw, qualified, span: cents(qualified - raw), factor: qualified / raw };
    })
    .sort((a, b) => b.span - a.span || a.origin.localeCompare(b.origin, LOCALE));
}

/** Maior valor da lista, ou `null` quando ela é vazia (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

/** Domínio e tiques redondos calculados do dado: a grade fecha na primeira linha acima do maior valor. */
function niceScale(maxValue: number): { readonly domainMax: number; readonly ticks: number[] } {
  const rough = maxValue / MAX_GRID_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = STEP_MULTIPLIERS.map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  const intervals = Math.ceil(maxValue / step);
  return { domainMax: intervals * step, ticks: Array.from({ length: intervals + 1 }, (_, i) => i * step) };
}

/** Nome no meio da oração: letra minúscula na frente, sem tocar no resto. */
function inSentence(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

function NameTick({ y, payload, bold }: NameTickProps & { readonly bold: boolean }): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill={bold ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={12} fontWeight={bold ? 700 : 500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );
}

/**
 * A cápsula é desenhada à mão porque a barra empilhada chega retangular. Faixa de largura zero vira
 * ponto com anel: o Recharts só chama o `shape` de dimensão zero quando ele existe (REC-11).
 */
function Capsule({ x, y, width, height, fill }: CapsuleProps): ReactElement | null {
  if (x === undefined || y === undefined || width === undefined || height === undefined) return null;
  if (width === 0) {
    return <circle cx={x} cy={y + height / 2} fill="var(--surface-raised)" r={RING_RADIUS} stroke="var(--text-secondary)" strokeWidth={RING_STROKE} />;
  }
  const radius = Math.min(height, width) / 2;
  return <rect fill={fill} height={height} rx={radius} ry={radius} width={width} x={x} y={y} />;
}

export default function LeadCostRangePlot({ data = defaultData, height, className }: LeadCostRangePlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = rankBySpan(data);
  const widest = rows[0];
  const ceiling = maxOf(rows.map((row) => row.qualified));

  if (!widest || ceiling === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não houve lead medido em agosto.</span>
      </div>
    );
  }

  const { domainMax, ticks } = niceScale(ceiling);
  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;
  const zeroSpan = rows.filter((row) => row.span === 0).length;
  const summary = [
    `Gráfico de faixas do CPL bruto ao qualificado em agosto, em ${formatInt(rows.length)} origens, da faixa mais larga à mais estreita.`,
    `Maior distância: ${inSentence(widest.origin)}, de ${formatCurrency(widest.raw)} a ${formatCurrency(widest.qualified)}, ${formatDecimal(widest.factor, 1)} vezes o bruto.`,
    zeroSpan > 0 ? `${formatInt(zeroSpan)} sem distância, com 100% qualificado.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  /** O índice do rótulo conta as marcas desenhadas, e aqui nenhuma é descartada: ele coincide com a linha. */
  const rowAt = (index: number | undefined): CostRow | undefined => (index === undefined ? undefined : rows[index]);

  const renderMinLabel = ({ x, y, width, height, value }: LabelProps) => {
    if (typeof value !== 'number' || Number(width) === 0) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="end" x={Number(x) - END_LABEL_GAP} y={Number(y) + Number(height) / 2}>
        {formatCurrency(value)}
      </text>
    );
  };

  /** Ponta direita: o qualificado, com a nota da linha quando ela existe (a de maior distância e a de largura zero). */
  const renderMaxLabel = ({ x, y, width, height, value, index }: LabelProps) => {
    if (typeof value !== 'number') return null;
    const row = rowAt(index);
    const isHighlight = row?.id === widest.id;
    const isZero = Number(width) === 0;
    const note = isHighlight ? `qualificado: ${formatDecimal(widest.factor, 1)} vezes o bruto` : isZero ? '100% qualificado' : null;
    const offset = isZero ? RING_RADIUS + RING_STROKE / 2 + END_LABEL_GAP : END_LABEL_GAP;
    return (
      <text className="font-display" dominantBaseline="central" fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={12} fontWeight={isHighlight ? 700 : 500} style={HALO} x={Number(x) + Number(width) + offset} y={Number(y) + Number(height) / 2}>
        {formatCurrency(value)}
        {note === null ? null : (
          <tspan className="font-sans" dx={NOTE_GAP} fill="var(--text-muted)" fontSize={11} fontWeight={500} style={{ stroke: 'none' }}>
            {note}
          </tspan>
        )}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as CostRow | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'raw', name: 'CPL bruto', value: formatCurrency(row.raw) },
      { dataKey: 'qualified', name: 'CPL qualificado', value: formatCurrency(row.qualified) },
      { dataKey: 'span', name: 'Distância', value: formatCurrency(row.span) },
      { dataKey: 'rate', name: 'Leads qualificados', value: formatRateWithVolume(row.qualifiedLeads, row.leads) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.origin} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Faixa do CPL bruto ao qualificado. Ordenado pela largura, a mais larga no topo.
      </p>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            {/* O primeiro item do array nasce no alto em BarChart vertical (REC-3), então a faixa mais larga vai primeiro. */}
            <YAxis
              axisLine={false}
              dataKey="origin"
              interval={0}
              tick={(props: NameTickProps) => <NameTick {...props} bold={String(props.payload?.value ?? '') === widest.origin} />}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {/* Base invisível: empurra a cápsula até o CPL bruto sem desenhar nada (REC-8). */}
            <Bar dataKey="raw" fill="none" isAnimationActive={false} stackId="range" />
            <Bar dataKey="span" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={Capsule} stackId="range">
              {rows.map((row) => (
                <Cell fill={row.id === widest.id ? HIGHLIGHT_FILL : NEUTRAL_FILL} key={row.id} />
              ))}
              <LabelList content={renderMinLabel} dataKey="raw" />
              <LabelList content={renderMaxLabel} dataKey="qualified" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
