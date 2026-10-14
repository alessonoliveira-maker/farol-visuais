import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, reasons as defaultReasons, type LossReason, type SquadLosses } from './data';

/**
 * Barras empilhadas 100% no caso limite: um squad com só 3 casos (n baixo, opacidade reduzida e
 * selo), um squad medido sem nenhuma perda (total zero, escreve "sem casos") e um squad sem coleta
 * (`counts` nulo, escreve "indisponível", separado do zero medido). O selo e a opacidade são
 * decididos no seletor (`toRows`); o `shape` só lê a marcação pronta em `payload`.
 */
export interface LossReasonLimitBarsProps {
  /** Um item por squad. A ordem de entrada é preservada: o componente não reordena. */
  readonly data?: readonly SquadLosses[];
  /** Motivos na ordem da pilha e da legenda; o primeiro não neutro é a base. */
  readonly reasons?: readonly LossReason[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 108;
/** Coluna do n à direita, larga o bastante para "n = 96" e o selo "n baixo". */
const COUNT_AXIS_WIDTH = 112;
const BAR_MAX = 22;
const BAR_CATEGORY_GAP = '34%';
/**
 * Passo por squad (ESP-6): com `barCategoryGap` de 34% sobra 32% da banda para a marca, então
 * `ROW_STEP × 0,32` precisa passar o piso de 18 px da ESP-2 (texto de 12 px desenhado dentro do
 * segmento mais 6 px). `64 × 0,32 = 20,48 px`, com folga sobre o piso.
 */
const ROW_STEP = 64;
/** Espaço reservado para o eixo de percentual abaixo das barras (tique de 11 px mais tickMargin). */
const AXIS_HEIGHT = 28;
/** Vão entre segmentos vizinhos (COR-5): as categóricas não contrastam entre si. */
const SEGMENT_GAP = 2;
const SEGMENT_RADIUS = 2;
const NEUTRAL_STROKE = 'var(--text-muted)';
const NEUTRAL_STROKE_WIDTH = 1.5;
/** Texto sobre segmento colorido (ROT-6): inverte com o tema e passa 5:1 contra as categóricas usadas aqui. */
const ON_SEGMENT_TEXT = 'var(--accent-cyan-contrast)';
const LABEL_CHAR_WIDTH = 7.5;
const LABEL_PADDING = 6;
const PERCENT_TICKS = [0, 0.5, 1];
/** Abaixo deste total a proporção não é confiável: opacidade reduzida e selo "n baixo". */
const LOW_N_THRESHOLD = 10;
const LOW_N_OPACITY = 0.5;
/** Ordem de atribuição quando o motivo não traz slot (COR-8). */
const SLOT_ORDER = [1, 3, 6, 5, 2, 4] as const;

interface LossRow extends SquadLosses {
  /** Total de perdas do squad; 0 quando sem casos ou sem coleta. */
  readonly n: number;
  /** Percentual inteiro por motivo, somando 100 pelo maior resto; zerado quando não há o que repartir. */
  readonly shares: readonly number[];
  /** `counts` era `null`: squad sem coleta no período. */
  readonly isUnavailable: boolean;
  /** `counts` existe mas soma zero: squad medido sem nenhuma perda. */
  readonly isEmpty: boolean;
  /** Total medido abaixo do piso de confiança (`LOW_N_THRESHOLD`). */
  readonly isLowN: boolean;
  /**
   * Valores que de fato vão para o `Bar`. Para squad vazio ou sem coleta, um placeholder no
   * primeiro motivo evita a divisão por zero do `stackOffset="expand"`; o `shape` ignora o valor
   * e desenha o texto do estado a partir de `isEmpty` / `isUnavailable`.
   */
  readonly chart: Readonly<Record<string, number>>;
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

/** O seletor: total, percentuais, estado e placeholder de pilha calculados antes do gráfico. */
function toRows(data: readonly SquadLosses[], reasons: readonly LossReason[]): LossRow[] {
  return data.map((squad) => {
    const isUnavailable = squad.counts === null;
    const values = reasons.map((reason) => (squad.counts ? squad.counts[reason.id] : 0));
    const n = values.reduce((sum, value) => sum + value, 0);
    const isEmpty = !isUnavailable && n === 0;
    const shares = isUnavailable || isEmpty ? reasons.map(() => 0) : largestRemainder(values, n);
    const isLowN = !isUnavailable && n > 0 && n < LOW_N_THRESHOLD;
    const chart: Record<string, number> = {};
    reasons.forEach((reason, index) => {
      chart[reason.id] = isUnavailable || isEmpty ? (index === 0 ? 1 : 0) : (values[index] ?? 0);
    });
    return { ...squad, n, shares, isUnavailable, isEmpty, isLowN, chart };
  });
}

function slotColor(reason: LossReason, fallbackIndex: number): string {
  const slot = reason.slot ?? SLOT_ORDER[Math.min(fallbackIndex, SLOT_ORDER.length - 1)] ?? 1;
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

function labelFits(text: string, segmentWidth: number): boolean {
  return segmentWidth >= text.length * LABEL_CHAR_WIDTH + LABEL_PADDING * 2;
}

/** Altura do corpo do gráfico derivada do número de squads (ESP-6). */
function plotHeight(count: number): number {
  return MARGIN.top + MARGIN.bottom + AXIS_HEIGHT + count * ROW_STEP;
}

/**
 * Segmento com meio vão de cada lado. No primeiro motivo, squad sem casos ou sem coleta troca o
 * retângulo pelo texto do estado, ocupando a barra inteira; a ausência normal sai vazada.
 */
function segmentShape(fill: string | null, isFirst: boolean) {
  return ({ x, y, width, height, payload }: BarShapeProps): ReactElement => {
    const row = payload as LossRow | undefined;
    if (isFirst && row?.isUnavailable) {
      return (
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={12} x={x + LABEL_PADDING} y={y + height / 2}>
          {formatUnavailable()}
        </text>
      );
    }
    if (isFirst && row?.isEmpty) {
      return (
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={12} x={x + LABEL_PADDING} y={y + height / 2}>
          sem casos
        </text>
      );
    }
    const drawnWidth = width - SEGMENT_GAP;
    if (drawnWidth <= 0 || height <= 0) return <g />;
    const opacity = row?.isLowN ? LOW_N_OPACITY : 1;
    if (fill === null) {
      const inset = NEUTRAL_STROKE_WIDTH / 2;
      return (
        <rect
          fill="none"
          fillOpacity={opacity}
          height={height - inset * 2}
          rx={SEGMENT_RADIUS}
          stroke={NEUTRAL_STROKE}
          strokeOpacity={opacity}
          strokeWidth={NEUTRAL_STROKE_WIDTH}
          width={Math.max(drawnWidth - inset * 2, 0)}
          x={x + SEGMENT_GAP / 2 + inset}
          y={y + inset}
        />
      );
    }
    return <rect fill={fill} fillOpacity={opacity} height={height} rx={SEGMENT_RADIUS} width={drawnWidth} x={x + SEGMENT_GAP / 2} y={y} />;
  };
}

export default function LossReasonLimitBars({
  data = defaultData,
  reasons = defaultReasons,
  height,
  className,
}: LossReasonLimitBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum squad neste recorte: não há composição de motivos para comparar.</span>
      </div>
    );
  }

  const rows = toRows(data, reasons);
  const baseIndex = reasons.findIndex((reason) => !reason.neutral);
  const base = reasons[baseIndex];
  const colors = reasons.map((reason, index) => (reason.neutral ? null : slotColor(reason, index)));
  const measured = rows.filter((row) => !row.isUnavailable && !row.isEmpty);
  const empty = rows.filter((row) => row.isEmpty);
  const unavailable = rows.filter((row) => row.isUnavailable);
  const lowN = rows.filter((row) => row.isLowN);
  const ranked = [...measured].sort((a, b) => (b.shares[baseIndex] ?? 0) - (a.shares[baseIndex] ?? 0));
  const leader = ranked[0];
  const focus = lowN[0];
  const baseLabel = base?.label.toLowerCase() ?? '';

  const summary = [
    `Gráfico de barras 100% com os motivos de perda de ${String(rows.length)} squads: ${String(measured.length)} medidos, ${String(empty.length)} sem casos e ${String(unavailable.length)} sem coleta.`,
    leader && base
      ? `${leader.label} concentra a maior fatia de ${baseLabel}, ${formatPercent((leader.shares[baseIndex] ?? 0) / 100, 0)} de ${formatInt(leader.n)} casos.`
      : '',
    focus ? `${focus.label} tem só ${formatInt(focus.n)} casos e aparece com opacidade reduzida.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderShare =
    (reasonIndex: number) =>
    ({ x, y, width, height: segmentHeight, index }: LabelProps): ReactElement | null => {
      const row = index === undefined ? undefined : rows[index];
      if (!row || row.isUnavailable || row.isEmpty) return null;
      /**
       * n baixo desenha a marca em `LOW_N_OPACITY` (ACE-4 veta opacidade em texto e no contêiner
       * que o contém); sobre ela o texto de contraste cheio cai a 3,55:1 no escuro e 2,23:1 no
       * claro, abaixo do piso da ACE-3. O sinal de n baixo já está garantido pelo selo e pela
       * própria marca apagada (COL. `n = <n> n baixo`), então o percentual some aqui.
       */
      if (row.isLowN) return null;
      const share = row.shares[reasonIndex] ?? 0;
      if (share === 0) return null;
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
    if (!row || row.isUnavailable || row.isEmpty) return <g />;
    return (
      <text dominantBaseline="central" textAnchor="end" x={Number(x) + COUNT_AXIS_WIDTH} y={Number(y)}>
        <tspan className="font-sans" fill="var(--text-muted)" fontSize={11}>
          {'n = '}
        </tspan>
        <tspan className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500}>
          {formatInt(row.n)}
        </tspan>
        {row.isLowN ? (
          <tspan className="font-sans" dx={4} fill="var(--warning)" fontSize={11}>
            {' n baixo'}
          </tspan>
        ) : null}
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
      {leader && base ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{leader.label}</span> lidera em {baseLabel} com{' '}
          <span className="kpi-number font-medium text-text-primary">{formatPercent((leader.shares[baseIndex] ?? 0) / 100, 0)}</span>
          {focus ? (
            <>
              ; {focus.label} tem só <span className="kpi-number font-medium text-text-primary">{formatInt(focus.n)}</span> casos
            </>
          ) : null}
        </p>
      ) : null}
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
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
            {reasons.map((reason, index) => (
              <Bar
                dataKey={`chart.${reason.id}`}
                isAnimationActive={animate}
                key={reason.id}
                maxBarSize={BAR_MAX}
                name={reason.label}
                shape={segmentShape(colors[index] ?? null, index === 0)}
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

