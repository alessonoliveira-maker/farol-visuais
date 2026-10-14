import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, goodDirection, type AreaCost } from './data';

/**
 * Lollipop divergente do desvio de custo por unidade entregue contra o orçado: a haste sai da linha
 * do orçado, para a direita quando o custo estourou e para a esquerda quando ficou abaixo. A linha de
 * cima é a área que mais estourou, e o desvio vai escrito com sinal na ponta livre de cada haste.
 */
export interface CostDeviationLollipopProps {
  /** Áreas em qualquer ordem: o componente ordena pelo desvio e desempata pelo nome. */
  readonly data?: readonly AreaCost[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 24, right: 8, bottom: 2, left: 0 } as const;
const NAME_AXIS_WIDTH = 168;
const ROW_STEP = 18;
const BAR_CATEGORY_GAP = '34%';
const STEM_WIDTH = 2;
const DISC_RADIUS = 5.5;
const VALUE_LABEL_GAP = 8;
const ZERO_LINE_WIDTH = 1.5;
/** O rótulo extremo ocupa cerca de um terço da meia largura: o domínio é o maior desvio vezes isto. */
const LABEL_ROOM_FACTOR = 1.5;
const DOMAIN_STEP = 2;
const LOCALE = 'pt-BR';
const NEUTRAL_COLOR = 'var(--text-secondary)';

interface DeviationRow extends AreaCost {
  /** Realizado menos orçado, em reais, com centavos exatos. */
  readonly deviation: number;
}

interface LollipopShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: DeviationRow;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

interface ZeroLabelProps {
  /** O pacote entrega a caixa da linha; o tipo dele é a união de caixas cartesiana e polar. */
  readonly viewBox?: unknown;
}

function withDeviation(rows: readonly AreaCost[]): DeviationRow[] {
  return rows.map((row) => ({ ...row, deviation: Math.round((row.actual - row.budget) * 100) / 100 }));
}

/** Maior estouro primeiro (a mensagem na primeira linha, REC-3); empate pelo nome. */
function rankByDeviation(rows: readonly DeviationRow[]): DeviationRow[] {
  return [...rows].sort((a, b) => b.deviation - a.deviation || a.name.localeCompare(b.name, LOCALE));
}

/** Maior desvio absoluto; lista vazia devolve `null`, nunca zero (EST-1b). */
function maxAbsDeviation(rows: readonly DeviationRow[]): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((max, row) => Math.max(max, Math.abs(row.deviation)), 0);
}

/** Cor pela polaridade da métrica: com `down` como bom, estourar é `--negative`. Zero é neutro. */
function deviationColor(deviation: number): string {
  if (deviation === 0) return NEUTRAL_COLOR;
  const isGood = goodDirection === 'down' ? deviation < 0 : deviation > 0;
  return isGood ? 'var(--positive)' : 'var(--negative)';
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico (NUM-3). Zero medido sai sem sinal. */
function signedCurrency(deviation: number): string {
  if (deviation === 0) return formatCurrency(0);
  return `${deviation < 0 ? '−' : '+'}${formatCurrency(Math.abs(deviation))}`;
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );
}

/**
 * A faixa vai de zero ao desvio e o retângulo chega com `x` e `width` que dependem do sinal, então a
 * conta normaliza com `Math.min` e `Math.abs`: a ponta é o lado oposto ao zero, e o rótulo ancora
 * nela (ROT-2). O desvio zero chega com largura zero e só a forma própria o desenha (REC-11).
 */
function LollipopShape({ x, y, width, height, payload }: LollipopShapeProps): ReactElement | null {
  if (x === undefined || y === undefined || width === undefined || height === undefined || payload === undefined) return null;
  const left = Math.min(x, x + width);
  const span = Math.abs(width);
  const below = payload.deviation < 0;
  const zeroX = below ? left + span : left;
  const tipX = below ? left : left + span;
  const centerY = y + height / 2;
  const color = deviationColor(payload.deviation);
  return (
    <g>
      <line stroke={color} strokeLinecap="round" strokeWidth={STEM_WIDTH} x1={zeroX} x2={tipX} y1={centerY} y2={centerY} />
      <circle cx={tipX} cy={centerY} fill={color} r={DISC_RADIUS} />
      <text
        className="font-display"
        dominantBaseline="central"
        fill={color}
        fontSize={12}
        fontWeight={600}
        textAnchor={below ? 'end' : 'start'}
        x={below ? tipX - DISC_RADIUS - VALUE_LABEL_GAP : tipX + DISC_RADIUS + VALUE_LABEL_GAP}
        y={centerY}
      >
        {signedCurrency(payload.deviation)}
      </text>
    </g>
  );
}

/** Rótulo do zero acima da linha, na margem reservada do topo, fora das hastes (REC-4). */
function renderZeroLabel(props: ZeroLabelProps): ReactElement {
  const box = (props.viewBox ?? {}) as { readonly x?: number; readonly y?: number };
  return (
    <text className="font-sans" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={box.x ?? 0} y={(box.y ?? 0) - 8}>
      orçado
    </text>
  );
}

export default function CostDeviationLollipop({ data = defaultData, height, className }: CostDeviationLollipopProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /** Maior estouro primeiro: com `layout="vertical"` o primeiro item do array nasce no alto (REC-3). */
  const rows = rankByDeviation(withDeviation(data));
  const worst = rows[0];
  const reach = maxAbsDeviation(rows);

  if (worst === undefined || reach === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma área neste recorte: não há custo por unidade entregue para comparar com o orçado.</span>
      </div>
    );
  }

  /** Domínio simétrico: o zero fica no meio e o rótulo extremo tem onde caber. */
  const bound = Math.max(DOMAIN_STEP, Math.ceil((reach * LABEL_ROOM_FACTOR) / DOMAIN_STEP) * DOMAIN_STEP);
  const above = rows.filter((row) => row.deviation > 0).length;
  const plotHeight = MARGIN.top + MARGIN.bottom + rows.length * ROW_STEP;
  const summary = [
    `Gráfico de pirulitos divergente com o desvio do custo por unidade entregue contra o orçado em ${formatInt(rows.length)} áreas.`,
    `${formatInt(above)} ficaram acima.`,
    worst.deviation > 0 ? `Maior estouro: ${worst.name}, ${signedCurrency(worst.deviation)}.` : 'Nenhuma área passou do orçado.',
  ].join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as DeviationRow | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'budget', name: 'Orçado por unidade', value: formatCurrency(row.budget) },
      { dataKey: 'actual', name: 'Realizado por unidade', value: formatCurrency(row.actual) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="kpi-number font-semibold text-text-primary">{formatInt(above)}</span> de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(rows.length)}</span> áreas passaram do orçado
        {worst.deviation > 0 ? (
          <>
            ; o maior estouro é de <span className="font-semibold text-text-primary">{worst.name}</span>,{' '}
            <span className="kpi-number font-medium text-text-primary">{signedCurrency(worst.deviation)}</span>
          </>
        ) : null}
      </p>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-4 text-text-secondary">
        <li className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full bg-negative" />
          Acima do orçado, pior
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full bg-positive" />
          Abaixo do orçado, melhor
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full bg-text-secondary" />
          No orçado
        </li>
      </ul>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[-bound, bound]} hide type="number" />
            <YAxis axisLine={false} dataKey="name" interval={0} tick={NameTick} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" label={{ content: renderZeroLabel }} stroke="var(--text-secondary)" strokeWidth={ZERO_LINE_WIDTH} x={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey={(row: DeviationRow) => [0, row.deviation]} isAnimationActive={animate} shape={(props: LollipopShapeProps) => <LollipopShape {...props} />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
