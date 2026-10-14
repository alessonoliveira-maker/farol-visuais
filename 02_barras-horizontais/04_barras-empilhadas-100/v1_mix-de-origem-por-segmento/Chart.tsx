import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { components as defaultComponents, data as defaultData, type OriginComponent, type SegmentMix } from './data';

/**
 * Barras empilhadas 100%: cada segmento de conta vai de 0 a 100% e se divide pelas origens dos
 * leads, na ordem natural de porte. O percentual é calculado aqui, sobre o dado, porque o
 * `stackOffset="expand"` só normaliza o desenho: o rótulo continua recebendo o valor absoluto.
 * O n de cada barra fica escrito à direita, porque 38 leads desenham uma barra tão cheia quanto 412.
 */
export interface OriginMixBarsProps {
  /** Um item por segmento de conta, na ordem em que deve aparecer (o componente não reordena). */
  readonly data?: readonly SegmentMix[];
  /** Origens na ordem da pilha e da legenda; a cor vem do slot de cada uma. */
  readonly components?: readonly OriginComponent[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 112;
/** Coluna do n à direita da barra, com o número alinhado à direita. */
const COUNT_AXIS_WIDTH = 72;
const BAR_MAX = 24;
const BAR_CATEGORY_GAP = '34%';
/**
 * Passo por segmento de conta (ESP-6): com `barCategoryGap` de 34% sobra 32% da banda para a
 * marca, então `ROW_STEP × 0,32` precisa passar o piso de 18 px da ESP-2 (texto de 12 px desenhado
 * dentro do segmento mais 6 px). `64 × 0,32 = 20,48 px`, com folga sobre o piso.
 */
const ROW_STEP = 64;
/** Espaço reservado para o eixo de percentual abaixo das barras (tique de 11 px mais tickMargin). */
const AXIS_HEIGHT = 28;
/** Vão entre segmentos vizinhos (COR-5): as categóricas não contrastam entre si. */
const SEGMENT_GAP = 2;
const SEGMENT_RADIUS = 2;
const NEUTRAL_STROKE = 'var(--text-muted)';
const NEUTRAL_STROKE_WIDTH = 1.5;
/**
 * Texto sobre segmento colorido. `--accent-cyan-contrast` inverte com o tema (quase preto no
 * escuro, branco no claro) e mede, pela fórmula da WCAG sobre `tokens.css`: 10,06, 6,86, 7,83 e
 * 6,26 contra `--chart-1`, `--chart-3`, `--chart-6` e `--chart-5` no escuro; 6,00, 6,18, 5,39 e
 * 6,25 no claro. `--text-primary` sobre as categóricas reprova (ROT-6).
 */
const ON_SEGMENT_TEXT = 'var(--accent-cyan-contrast)';
/** Largura estimada de um caractere do rótulo em Space Grotesk 12 px, e a folga dos dois lados. */
const LABEL_CHAR_WIDTH = 7.5;
const LABEL_PADDING = 8;
/** Só as duas linhas de base e o meio: os segmentos já trazem o percentual escrito. */
const PERCENT_TICKS = [0, 0.5, 1];
/** Ordem de atribuição quando a origem não traz slot (COR-8). */
const SLOT_ORDER = [1, 3, 6, 5, 2, 4] as const;

interface MixRow extends SegmentMix {
  /** Total de leads do segmento: o n escrito à direita. */
  readonly n: number;
  /** Percentual inteiro por origem, na ordem de `components`, somando 100 pelo maior resto. */
  readonly shares: readonly number[];
}

interface AxisTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
  readonly payload?: { readonly value?: unknown };
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

/** O seletor: total e percentuais calculados antes do gráfico, sem divisão por zero. */
function toRows(data: readonly SegmentMix[], components: readonly OriginComponent[]): MixRow[] {
  return data.map((segment) => {
    const values = components.map((component) => segment.counts[component.id]);
    const n = values.reduce((sum, value) => sum + value, 0);
    return { ...segment, n, shares: largestRemainder(values, n) };
  });
}

function slotColor(component: OriginComponent, fallbackIndex: number): string {
  const slot = component.slot ?? SLOT_ORDER[Math.min(fallbackIndex, SLOT_ORDER.length - 1)] ?? 1;
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

/** Altura do corpo do gráfico derivada do número de segmentos de conta (ESP-6). */
function plotHeight(count: number): number {
  return MARGIN.top + MARGIN.bottom + AXIS_HEIGHT + count * ROW_STEP;
}

export default function OriginMixBars({
  data = defaultData,
  components = defaultComponents,
  height,
  className,
}: OriginMixBarsProps) {
  const animate = useAnimateOnce();
  const rows = toRows(data, components);
  const style = height === undefined ? undefined : { height };

  if (rows.every((row) => row.n === 0)) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há composição de origem para comparar entre segmentos.</span>
      </div>
    );
  }

  const colors = components.map((component, index) => (component.neutral ? null : slotColor(component, index)));
  const baseIndex = components.findIndex((component) => !component.neutral);
  const base = components[baseIndex];
  const measured = rows.filter((row) => row.n > 0);
  const byBase = [...measured].sort((a, b) => (a.shares[baseIndex] ?? 0) - (b.shares[baseIndex] ?? 0));
  const lowest = byBase[0];
  const highest = byBase[byBase.length - 1];
  const reading =
    base && lowest && highest && lowest !== highest
      ? {
          label: base.label,
          low: formatPercent((lowest.shares[baseIndex] ?? 0) / 100, 0),
          lowName: lowest.label.toLowerCase(),
          high: formatPercent((highest.shares[baseIndex] ?? 0) / 100, 0),
          highName: highest.label.toLowerCase(),
        }
      : null;
  const total = rows.reduce((sum, row) => sum + row.n, 0);
  const smallest = measured.reduce((a, b) => (b.n < a.n ? b : a));

  const summary = [
    `Gráfico de barras 100% com a origem de ${formatInt(total)} leads em ${String(rows.length)} segmentos de conta.`,
    reading ? `${reading.label} vai de ${reading.low} em ${reading.lowName} a ${reading.high} em ${reading.highName}.` : '',
    `O menor volume é ${smallest.label.toLowerCase()}, com ${formatInt(smallest.n)} leads.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderShare =
    (componentIndex: number) =>
    ({ x, y, width, height: segmentHeight, index }: LabelProps): ReactElement | null => {
      const row = index === undefined ? undefined : rows[index];
      const share = row?.shares[componentIndex] ?? 0;
      if (!row || share === 0) return null;
      const text = formatPercent(share / 100, 0);
      if (!labelFits(text, Number(width) - SEGMENT_GAP)) return null;
      return (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={colors[componentIndex] === null ? NEUTRAL_STROKE : ON_SEGMENT_TEXT}
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
      <text dominantBaseline="central" fontSize={12} textAnchor="end" x={Number(x) + COUNT_AXIS_WIDTH} y={Number(y)}>
        <tspan className="font-display" fill="var(--text-secondary)" fontWeight={500}>
          {`${formatInt(row.n)} `}
        </tspan>
        <tspan className="font-sans" fill="var(--text-muted)" fontSize={11}>
          leads
        </tspan>
      </text>
    );
  };

  const renderPercentTick = ({ x, y, payload }: AxisTickProps): ReactElement => (
    <text className="font-display" dominantBaseline="hanging" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={Number(x)} y={Number(y)}>
      {formatPercent(Number(payload?.value ?? 0), 0)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{reading.label}</span> vai de{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.low}</span> dos leads em {reading.lowName} a{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.high}</span> em {reading.highName}
        </p>
      ) : null}
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {components.map((component, index) => {
          const color = colors[index] ?? null;
          return (
            <li className="flex items-center gap-2.5 text-xs leading-5" key={component.id}>
              <span
                aria-hidden
                className={cn('size-2.5 shrink-0 rounded-[2px]', color === null && 'border-[1.5px] border-text-muted')}
                style={color === null ? undefined : { backgroundColor: color }}
              />
              <span className={color === null ? 'text-text-muted' : 'text-text-secondary'}>{component.label}</span>
            </li>
          );
        })}
      </ul>
      <div className="shrink-0" style={{ height: plotHeight(rows.length) }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN} stackOffset="expand">
            <XAxis axisLine={false} domain={[0, 1]} tick={renderPercentTick} tickLine={false} tickMargin={8} ticks={PERCENT_TICKS} type="number" />
            <YAxis axisLine={false} dataKey="label" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
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
            {components.map((component, index) => (
              <Bar
                dataKey={`counts.${component.id}`}
                isAnimationActive={animate}
                key={component.id}
                maxBarSize={BAR_MAX}
                name={component.label}
                shape={segmentShape(colors[index] ?? null)}
                stackId="mix"
              >
                <LabelList content={renderShare(index)} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
