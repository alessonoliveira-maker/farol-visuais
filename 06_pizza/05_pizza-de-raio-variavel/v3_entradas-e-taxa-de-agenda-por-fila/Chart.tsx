import { Filter } from 'lucide-react';
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip, type PieSectorShapeProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QueueIntakeSlice } from './data';

/**
 * Pizza de raio variável com domínio de raio declarado: o ângulo de cada setor é a participação da
 * fila nas entradas do mês, e o raio é a taxa de agenda numa escala fixa de 0 a 100%, não do menor
 * ao maior valor do recorte. O domínio declarado é o que deixa a peça comparável entre meses, e é
 * também o que faz a folga até o anel de 100% significar alguma coisa. A legenda lateral é tabular
 * e carrega as três medidas por fila, para cada parte se nomear no desenho parado (ROT-10).
 */
export interface RadiusPieQueueProps {
  readonly data?: readonly QueueIntakeSlice[];
  readonly height?: number;
  readonly className?: string;
}

const BOX = 196;
const CENTER = BOX / 2;
const R_MAX = CENTER - 9;
/**
 * Os dois rótulos de anel saem à DIREITA da vertical, com âncora no início do texto.
 *
 * Centrados no topo eles ficavam metade sobre o último setor, porque a pizza fecha exatamente em
 * `END_ANGLE`, que é a mesma direção do topo: o último setor encosta na vertical por construção, e
 * quando o raio dele passa do anel o halo come a marca (GEO-4). À direita da vertical quem está
 * embaixo é o primeiro setor, e os dois anéis ficam acima do raio dele.
 */
const RING_TEXT_X = CENTER + 4;
/** Fração do raio máximo reservada como piso: nenhum setor nasce com raio zero. */
const R_MIN_RATIO = 0.3;
const R_MIN = R_MAX * R_MIN_RATIO;
/** Topo do domínio do raio, DECLARADO: uma taxa não passa de 100%, e é essa a régua. */
const RATE_DOMAIN_TOP = 1;
/** Anéis de escala do raio, em fração da taxa: o último é o topo do domínio declarado. */
const RING_RATES = [0.5, RATE_DOMAIN_TOP] as const;
const START_ANGLE = 90;
const END_ANGLE = -270;
/** Slots categóricos na ordem da COR-8 (1, 3, 6, 5, 2): a cor segue o slot do dado, não a posição. */
const SLOT_COLORS = [
  CHART_SERIES_COLORS[0],
  CHART_SERIES_COLORS[2],
  CHART_SERIES_COLORS[5],
  CHART_SERIES_COLORS[4],
  CHART_SERIES_COLORS[1],
] as const;
/** Halo na cor do cartão: o rótulo do anel fica sobre o próprio tracejado e precisa vencê lo. */
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;

/**
 * Raio em pixels para uma fração, entre o piso e o raio máximo, por área.
 *
 * A área do setor cresce com o quadrado do raio, então o raio honesto é o que faz a coroa acima do
 * piso crescer junto com o valor: `r² − rMin²` proporcional a `v / topo` (GEO-3).
 */
function radiusForRate(rate: number): number {
  const fraction = Math.min(1, Math.max(0, rate / RATE_DOMAIN_TOP));
  return Math.sqrt(R_MIN * R_MIN + (R_MAX * R_MAX - R_MIN * R_MIN) * fraction);
}

/**
 * Taxa de agenda de uma fila, ou `null` quando a fila não teve entrada.
 *
 * Fila sem entrada não tem taxa zero: tem taxa indisponível (EST-1b). Devolver `0` aqui desenharia
 * o setor no piso do raio como se a fila tivesse fracassado, quando ela nem foi medida.
 */
function agendaRate(row: QueueIntakeSlice): number | null {
  if (row.entradas <= 0) return null;
  return row.agendas / row.entradas;
}

/** Percentual inteiro pelo maior resto, sempre somando 100 (NUM-2). */
function integerPercents(values: readonly number[]): readonly number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  let missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  for (const { index } of order) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

export default function RadiusPieQueue({ data = defaultData, height, className }: RadiusPieQueueProps) {
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
        <span>Nenhuma entrada neste recorte: não há fila da pré-vendas para comparar.</span>
      </div>
    );
  }

  const percents = integerPercents(data.map((row) => row.entradas));
  const totalEntradas = data.reduce((sum, row) => sum + row.entradas, 0);
  const bestIndex = data.reduce(
    (best, row, index) => ((agendaRate(row) ?? -1) > (agendaRate(data[best] ?? row) ?? -1) ? index : best),
    0,
  );
  const best = data[bestIndex];
  const bestRate = best ? agendaRate(best) : null;

  const reading =
    best && bestRate !== null
      ? `${best.name} converte ${formatRateWithVolume(best.agendas, best.entradas)} com ${formatPercent((percents[bestIndex] ?? 0) / 100, 0)} das entradas.`
      : `Sem taxa de agenda medida em nenhuma das ${formatInt(data.length)} filas.`;

  const summaryIntro = `Gráfico de pizza de raio variável com ${formatInt(data.length)} filas da pré-vendas: o ângulo mede as entradas e o raio mede a taxa de agenda, no domínio declarado de 0 a 100%.`;
  const summary =
    best && bestRate !== null
      ? `${summaryIntro} ${best.name} lidera com ${formatRateWithVolume(best.agendas, best.entradas)} sobre ${formatInt(totalEntradas)} entradas no mês.`
      : summaryIntro;

  const renderSlice = (props: PieSectorShapeProps) => {
    const row = props.payload as QueueIntakeSlice | undefined;
    const fill = row ? (SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0]) : CHART_SERIES_COLORS[0];
    const rate = row ? agendaRate(row) : null;
    return (
      <Sector
        cx={props.cx}
        cy={props.cy}
        endAngle={props.endAngle}
        fill={fill}
        innerRadius={0}
        outerRadius={rate === null ? R_MIN : radiusForRate(rate)}
        startAngle={props.startAngle}
        stroke="var(--surface-raised)"
        strokeWidth={2}
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary tabular-nums">
        {reading}
      </p>
      <div className="flex min-h-0 flex-1 items-start gap-4">
        <div className="relative shrink-0" style={{ height: BOX, width: BOX }}>
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="entradas"
                endAngle={END_ANGLE}
                innerRadius={0}
                isAnimationActive={animate}
                nameKey="name"
                outerRadius={R_MAX}
                shape={renderSlice}
                startAngle={START_ANGLE}
              />
              <Tooltip
                content={(tooltipProps) => {
                  const row = tooltipProps.payload[0]?.payload as QueueIntakeSlice | undefined;
                  if (!row) return null;
                  const color = SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0];
                  const rate = agendaRate(row);
                  return (
                    <ChartTooltip
                      active={tooltipProps.active}
                      label={row.name}
                      payload={[
                        { color, graphicalItemId: 'entradas', name: 'Entradas', value: row.entradas },
                        {
                          color,
                          graphicalItemId: 'taxa',
                          name: 'Taxa de agenda',
                          value: rate === null ? formatUnavailable() : formatRateWithVolume(row.agendas, row.entradas),
                        },
                      ]}
                      valueFormat="int"
                    />
                  );
                }}
                isAnimationActive={false}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Anéis do domínio declarado, os dois no topo do desenho: o de 100% é a régua inteira, e
              a folga entre a maior fatia e ele é a parte da conversão que ainda não aconteceu. O
              `viewBox` tem o tamanho exato da caixa, para a escala do texto sair 1. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0"
            viewBox={`0 0 ${String(BOX)} ${String(BOX)}`}
          >
            {RING_RATES.map((ringRate) => {
              const radius = radiusForRate(ringRate);
              return (
                <g key={ringRate}>
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    fill="none"
                    r={radius}
                    stroke="var(--text-muted)"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <text
                    className="font-display"
                    dominantBaseline="central"
                    fill="var(--text-muted)"
                    fontSize={11}
                    style={HALO}
                    textAnchor="start"
                    x={RING_TEXT_X}
                    y={CENTER - radius}
                  >
                    {formatPercent(ringRate, 0)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-2 text-[0.6875rem] text-text-muted">
            <span aria-hidden className="size-2.5 shrink-0" />
            <span className="min-w-0 flex-1">Fila da pré-vendas</span>
            <span className="w-10 shrink-0 text-right">Part.</span>
            <span className="w-12 shrink-0 text-right">Taxa</span>
            <span className="w-14 shrink-0 text-right">Entradas</span>
          </div>
          <ul className="mt-1 flex min-w-0 flex-col gap-1">
            {data.map((row, index) => {
              const rate = agendaRate(row);
              return (
                <li className="flex items-center gap-2 text-xs text-text-secondary" key={row.id}>
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0] }}
                  />
                  <span className="min-w-0 flex-1 truncate">{row.name}</span>
                  <span className="font-display w-10 shrink-0 text-right text-text-primary">
                    {formatPercent((percents[index] ?? 0) / 100, 0)}
                  </span>
                  <span className="font-display w-12 shrink-0 text-right text-text-primary">
                    {rate === null ? formatUnavailable() : formatPercent(rate, 1)}
                  </span>
                  <span className="font-display w-14 shrink-0 text-right text-text-secondary">
                    {formatInt(row.entradas)}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 shrink-0 text-[0.6875rem] text-text-muted tabular-nums">
            {`Ângulo: participação nas entradas. Raio: taxa de agenda, domínio declarado de ${formatPercent(0, 0)} a ${formatPercent(RATE_DOMAIN_TOP, 0)}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
