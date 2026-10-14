import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, reasons as defaultReasons, type ExecutiveLosses, type LossReason } from './data';

/**
 * Barras empilhadas 100% no caso denso: os motivos de perda de cada executivo, uma barra por
 * pessoa, ordenadas pela fatia do primeiro motivo (sem fit), que fica na base da pilha para ser
 * lida contra a linha do zero. O percentual vai escrito no centro do segmento quando cabe, o n de
 * perdas fica à direita e a fatia do time inteiro entra como linha de referência.
 */
export interface LossReasonBarsProps {
  /** Um item por executivo. A ordem de entrada não importa: o componente ordena pela fatia da base. */
  readonly data?: readonly ExecutiveLosses[];
  /** Motivos na ordem da pilha e da legenda; o primeiro não neutro é a base e define a ordem das barras. */
  readonly reasons?: readonly LossReason[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** O topo reserva o rótulo da linha de referência, fora das barras (ANO-3). */
const MARGIN = { top: 20, right: 0, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 116;
/** Coluna do n à direita, com o número alinhado à direita. */
const COUNT_AXIS_WIDTH = 60;
const BAR_MAX = 24;
const BAR_CATEGORY_GAP = '32%';
/**
 * Passo por executivo (ESP-6): com `barCategoryGap` de 32% sobra 36% da banda para a marca, então
 * `ROW_STEP × 0,36` precisa passar o piso de 18 px da ESP-2 (texto de 12 px desenhado dentro do
 * segmento mais 6 px). `58 × 0,36 = 20,88 px`, com folga sobre o piso.
 */
const ROW_STEP = 58;
/** Espaço reservado para o eixo de percentual abaixo das barras (tique de 11 px mais tickMargin). */
const AXIS_HEIGHT = 26;
/** Vão entre segmentos vizinhos (COR-5): as categóricas não contrastam entre si. */
const SEGMENT_GAP = 2;
const SEGMENT_RADIUS = 2;
const NEUTRAL_STROKE = 'var(--text-muted)';
const NEUTRAL_STROKE_WIDTH = 1.5;
/** Texto sobre segmento colorido (ROT-6): inverte com o tema e passa 5:1 contra `--chart-1`, `--chart-3`, `--chart-5` e `--chart-6`. */
const ON_SEGMENT_TEXT = 'var(--accent-cyan-contrast)';
/** Largura estimada de um caractere do rótulo em Space Grotesk 12 px e a folga mínima de cada lado. */
const LABEL_CHAR_WIDTH = 7.5;
const LABEL_PADDING = 6;
/**
 * Altura mínima do segmento vazado para o percentual não tocar no próprio contorno: o rótulo é
 * desenhado na mesma cor do traço (`NEUTRAL_STROKE`), e a caixa interna (descontado o traço) só
 * comporta o texto de 12 px acima deste piso; abaixo dele o rótulo é suprimido, nunca cortado.
 */
const NEUTRAL_LABEL_MIN_HEIGHT = 20;
const PERCENT_TICKS = [0, 0.5, 1];
const REFERENCE_STROKE = 'var(--text-muted)';
/** Abaixo das barras (300): a linha do time aparece nos vãos entre executivos e não cruza os rótulos. */
const REFERENCE_Z = 250;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
/** Ordem de atribuição quando o motivo não traz slot (COR-8). */
const SLOT_ORDER = [1, 3, 6, 5, 2, 4] as const;

interface LossRow extends ExecutiveLosses {
  /** Total de perdas do executivo: o n escrito à direita. */
  readonly n: number;
  /** Percentual inteiro por motivo, na ordem de `reasons`, somando 100 pelo maior resto. */
  readonly shares: readonly number[];
  /** Fração exata do motivo da base, usada só para ordenar. */
  readonly baseFraction: number;
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

/** Arredonda para inteiros que somam 100: piso de cada parte e o que falta para as maiores sobras. */
function largestRemainder(values: readonly number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const shares = raw.map((value) => Math.floor(value));
  let missing = 100 - shares.reduce((sum, value) => sum + value, 0);
  const bySurplus = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of bySurplus) {
    if (missing <= 0) break;
    shares[index] = (shares[index] ?? 0) + 1;
    missing -= 1;
  }
  return shares;
}

/** O seletor: total, percentuais e ordem calculados antes do gráfico, sem divisão por zero. */
function toRows(data: readonly ExecutiveLosses[], reasons: readonly LossReason[], baseIndex: number): LossRow[] {
  return data
    .map((executive) => {
      const values = reasons.map((reason) => executive.counts[reason.id]);
      const n = values.reduce((sum, value) => sum + value, 0);
      const baseFraction = n > 0 ? (values[baseIndex] ?? 0) / n : 0;
      return { ...executive, n, shares: largestRemainder(values, n), baseFraction };
    })
    .sort((a, b) => b.baseFraction - a.baseFraction || b.n - a.n || a.name.localeCompare(b.name, 'pt-BR'));
}

function slotColor(reason: LossReason, fallbackIndex: number): string {
  const slot = reason.slot ?? SLOT_ORDER[Math.min(fallbackIndex, SLOT_ORDER.length - 1)] ?? 1;
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Segmento com meio vão de cada lado; a ausência sai vazada, com contorno por dentro da caixa. */
function segmentShape(fill: string | null) {
  return ({ x, y, width, height }: BarShapeProps): ReactElement => {
    const drawnWidth = width - SEGMENT_GAP;
    if (drawnWidth <= 0 || height <= 0) return <g />;
    if (fill === null) {
      const inset = NEUTRAL_STROKE_WIDTH / 2;
      return (
        <rect
          fill="none"
          height={height - inset * 2}
          rx={SEGMENT_RADIUS}
          stroke={NEUTRAL_STROKE}
          strokeWidth={NEUTRAL_STROKE_WIDTH}
          width={Math.max(drawnWidth - inset * 2, 0)}
          x={x + SEGMENT_GAP / 2 + inset}
          y={y + inset}
        />
      );
    }
    return <rect fill={fill} height={height} rx={SEGMENT_RADIUS} width={drawnWidth} x={x + SEGMENT_GAP / 2} y={y} />;
  };
}

function labelFits(text: string, segmentWidth: number): boolean {
  return segmentWidth >= text.length * LABEL_CHAR_WIDTH + LABEL_PADDING * 2;
}

/** Altura do corpo do gráfico derivada do número de executivos (ESP-6). */
function plotHeight(count: number): number {
  return MARGIN.top + MARGIN.bottom + AXIS_HEIGHT + count * ROW_STEP;
}

export default function LossReasonBars({
  data = defaultData,
  reasons = defaultReasons,
  height,
  className,
}: LossReasonBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const baseIndex = reasons.findIndex((reason) => !reason.neutral);
  const base = reasons[baseIndex];
  const rows = toRows(data, reasons, baseIndex);
  const total = rows.reduce((sum, row) => sum + row.n, 0);
  const measured = rows.filter((row) => row.n > 0);
  const top = measured[0];
  const bottom = measured[measured.length - 1];

  if (!base || !top || !bottom || total === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda neste recorte: não há motivos para comparar entre executivos.</span>
      </div>
    );
  }

  const colors = reasons.map((reason, index) => (reason.neutral ? null : slotColor(reason, index)));
  const baseLabel = base.label.toLowerCase();
  const teamFraction = rows.reduce((sum, row) => sum + row.counts[base.id], 0) / total;
  const teamText = formatPercent(teamFraction, 0);
  const topText = formatPercent((top.shares[baseIndex] ?? 0) / 100, 0);
  const bottomText = formatPercent((bottom.shares[baseIndex] ?? 0) / 100, 0);

  const summary = [
    `Gráfico de barras 100% com os motivos de ${formatInt(total)} perdas de ${String(rows.length)} executivos, ordenados pela fatia de ${baseLabel}.`,
    `${top.name} tem a maior, ${topText} de ${formatInt(top.n)} perdas; ${bottom.name}, a menor, ${bottomText}.`,
    `No time, ${baseLabel} responde por ${teamText}.`,
  ].join(' ');

  const renderShare =
    (reasonIndex: number) =>
    ({ x, y, width, height: segmentHeight, index }: LabelProps): ReactElement | null => {
      const row = index === undefined ? undefined : rows[index];
      const share = row?.shares[reasonIndex] ?? 0;
      if (!row || share === 0) return null;
      const isNeutral = colors[reasonIndex] === null;
      if (isNeutral && Number(segmentHeight) < NEUTRAL_LABEL_MIN_HEIGHT) return null;
      const text = formatPercent(share / 100, 0);
      if (!labelFits(text, Number(width) - SEGMENT_GAP)) return null;
      return (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={colors[reasonIndex] === null ? NEUTRAL_STROKE : ON_SEGMENT_TEXT}
          fontSize={12}
          fontWeight={500}
          textAnchor="middle"
          x={Number(x) + Number(width) / 2}
          y={Number(y) + Number(segmentHeight) / 2}
        >
          {text}
        </text>
      );
    };

  const renderName = ({ y, payload }: AxisTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );

  const renderCount = ({ x, y, index = -1 }: AxisTickProps): ReactElement => {
    const row = rows[index];
    if (!row) return <g />;
    return (
      <text dominantBaseline="central" textAnchor="end" x={Number(x) + COUNT_AXIS_WIDTH} y={Number(y)}>
        <tspan className="font-sans" fill="var(--text-muted)" fontSize={11}>
          {'n = '}
        </tspan>
        <tspan className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500}>
          {formatInt(row.n)}
        </tspan>
      </text>
    );
  };

  const renderPercentTick = ({ x, y, payload }: AxisTickProps): ReactElement => (
    <text className="font-display" dominantBaseline="hanging" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={Number(x)} y={Number(y)}>
      {formatPercent(Number(payload?.value ?? 0), 0)}
    </text>
  );

  const renderReferenceLabel = ({ viewBox }: ReferenceLabelProps): ReactElement => (
    <text fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={viewBox?.x ?? 0} y={(viewBox?.y ?? 0) - 8}>
      <tspan className="font-sans">{`${baseLabel} no time `}</tspan>
      <tspan className="font-display">{teamText}</tspan>
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{top.name}</span> perde mais por {baseLabel}:{' '}
        <span className="kpi-number font-medium text-text-primary">{topText}</span> de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(top.n)}</span> perdas, contra{' '}
        <span className="kpi-number font-medium text-text-primary">{teamText}</span> do time
      </p>
      <ul className="mb-1 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {reasons.map((reason, index) => {
          const color = colors[index] ?? null;
          return (
            <li className="flex items-center gap-2.5 text-xs leading-5" key={reason.id}>
              <span
                aria-hidden
                className={cn('size-2.5 shrink-0 rounded-[2px]', color === null && 'border-[1.5px] border-text-muted')}
                style={color === null ? undefined : { backgroundColor: color }}
              />
              <span className={color === null ? 'text-text-muted' : 'text-text-secondary'}>{reason.label}</span>
            </li>
          );
        })}
      </ul>
      <div className="shrink-0" style={{ height: plotHeight(rows.length) }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN} stackOffset="expand">
            <XAxis axisLine={false} domain={[0, 1]} tick={renderPercentTick} tickLine={false} tickMargin={6} ticks={PERCENT_TICKS} type="number" />
            <YAxis axisLine={false} dataKey="name" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              orientation="right"
              tick={renderCount}
              tickLine={false}
              tickMargin={0}
              tickSize={0}
              type="category"
              width={COUNT_AXIS_WIDTH}
              yAxisId="n"
            />
            {reasons.map((reason, index) => (
              <Bar
                dataKey={`counts.${reason.id}`}
                isAnimationActive={animate}
                key={reason.id}
                maxBarSize={BAR_MAX}
                name={reason.label}
                shape={segmentShape(colors[index] ?? null)}
                stackId="mix"
              >
                <LabelList content={renderShare(index)} />
              </Bar>
            ))}
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderReferenceLabel}
              stroke={REFERENCE_STROKE}
              strokeDasharray="3 3"
              strokeWidth={1}
              x={teamFraction}
              zIndex={REFERENCE_Z}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
