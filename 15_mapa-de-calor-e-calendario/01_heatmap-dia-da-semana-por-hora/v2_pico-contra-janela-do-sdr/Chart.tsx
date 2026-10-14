import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatHours, formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  DAY_LABELS,
  DAY_ORDER,
  HOURS,
  SHORT_STAFF_HOURS,
  STAFF_AWAY,
  STAFF_TOTAL,
  windowCaption as defaultCaption,
  type LeadHourCell,
  type WeekDay,
} from './data';

/**
 * Pico de entradas contra a janela em que a pré-vendas fica desfalcada.
 *
 * O `viewBox` é declarado no tamanho exato do corpo do cartão (894 x 281,5 px na moldura `card` de
 * 960x400 com o caso de uso em uma linha), e não numa grade abstrata escalada depois. A razão é de
 * medição: quando a escala do SVG é diferente de 1, as guardas `COLISAO-TEXTO` e `CONTRASTE-TEXTO`
 * saem com o motivo `preview_com_escala` e a peça atravessa o portão sem ninguém medir o contraste
 * dela, que foi o que aconteceu com a v1 deste modelo. Com escala 1 elas medem.
 *
 * A janela de pico NÃO leva contorno por cima das células. Medido nesta peça: `--chart-1` mede
 * 9,50:1 no escuro e 6,00:1 no claro contra o cartão, mas 1,36:1 e 1,10:1 contra `--seq-6` e 1,07:1
 * e 1,38:1 contra `--seq-7`, que são justamente as cores do pico. Nenhum token do Farol alcança 3:1
 * contra o cartão e contra a marca ao mesmo tempo (ARMADILHAS, TOK-10), então o contorno corre por
 * FORA das células, num canal de 6 px aberto de propósito nas duas bordas da janela, onde o fundo é
 * sempre o do cartão.
 *
 * A escala tem 5 faixas e o valor vai escrito em toda célula medida, porque a rampa do Farol não
 * ordena sozinha: degrau contra degrau os vizinhos desta escala medem de 1,23:1 a 1,52:1 (TOK-8).
 * Quem ordena aqui é o número dentro da célula e o teto de cada faixa escrito na própria amostra da
 * legenda; a cor é apoio.
 *
 * Três estados de célula, com três canais para separá-los, porque célula não desenhada é ausência e
 * ausência não é zero (EST-2, DAD-2): hora medida leva preenchimento da rampa e o valor escrito;
 * zero medido leva o poço `--surface-sunken` com contorno sólido e o zero escrito; hora em que a
 * campanha não veiculou leva contorno tracejado, sem preenchimento e sem número.
 */
export interface PeakWindowHeatmapProps {
  readonly data?: readonly LeadHourCell[];
  /** O que a célula mede, impresso na legenda e na frase acessível. */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 894;
const VIEW_H = 281.5;
const RIGHT_PAD = 2;
/** Recuo do texto encostado na esquerda: a tinta do primeiro glifo passa da âncora (ESP-3). */
const TEXT_LEFT = 4;
/** 62 px porque 'Segunda' mede 50 px em 12 px de Manrope e o recuo de 8 ainda precisa caber. */
const LEFT_W = 62;
const GAP = 1.5;
/** Canal aberto nas bordas da janela de pico, para o contorno não pisar em célula nenhuma. */
const PEAK_CHANNEL = 6;
const PEAK_EXTRA = PEAK_CHANNEL - GAP;
const PEAK_SPAN = 3;
const GRID_TOP = 44;
const GRID_BOTTOM = 210;
const HOUR_BASELINE = 34;
const RIBBON_TOP = 216;
/** 18 px porque o rótulo de 11 px desenhado por dentro pede o tamanho do texto mais 6 (ESP-2). */
const RIBBON_H = 18;
const SCALE_TOP = 240;
const SCALE_H = 18;
const SWATCH_W = 34;
const FOOT_BASELINE = 272;
const FOOT_SWATCH_W = 16;
const FOOT_SWATCH_H = 12;
const ZERO_SWATCH_X = 340;
/** Contagem de linhas e de colunas da grade: eixo fechado do modelo, não amostra a agregar. */
const DAY_COUNT = 7;
const HOUR_COUNT = 13;
const CELL_H = (GRID_BOTTOM - GRID_TOP - (DAY_COUNT - 1) * GAP) / DAY_COUNT;
const CELL_W = (VIEW_W - RIGHT_PAD - LEFT_W - (HOUR_COUNT - 1) * GAP - 2 * PEAK_EXTRA) / HOUR_COUNT;

/** As 3 faixas baixas leem com o texto principal; as 2 altas, com o texto sobre acento. */
const BUCKET_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const BUCKET_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const BUCKET_COUNT = BUCKET_COLORS.length;

/** Média de uma lista: `null` na lista vazia, porque lista sem elemento não tem média (EST-1b). */
function averageOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Maior valor de uma lista: `null` na lista vazia, porque `Math.max` de nada devolve infinito. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((champion, value) => (value > champion ? value : champion), values[0] ?? 0);
}

function bucketOf(value: number, ceiling: number): number {
  if (ceiling <= 0) return 0;
  const step = Math.floor((value / ceiling) * BUCKET_COUNT);
  return Math.min(BUCKET_COUNT - 1, Math.max(0, step));
}

function cellX(hourIndex: number, peakStart: number): number {
  const beforeWindow = hourIndex >= peakStart ? PEAK_EXTRA : 0;
  const afterWindow = hourIndex > peakStart + PEAK_SPAN - 1 ? PEAK_EXTRA : 0;
  return LEFT_W + hourIndex * (CELL_W + GAP) + beforeWindow + afterWindow;
}

function cellY(dayIndex: number): number {
  return GRID_TOP + dayIndex * (CELL_H + GAP);
}

/** Índice da primeira hora da janela de 3 horas seguidas com a maior soma do recorte. */
function peakWindowStart(sums: readonly number[]): number {
  let best = 0;
  let bestSum = -1;
  for (let index = 0; index + PEAK_SPAN <= sums.length; index += 1) {
    let running = 0;
    for (let step = 0; step < PEAK_SPAN; step += 1) running += sums[index + step] ?? 0;
    if (running > bestSum) {
      bestSum = running;
      best = index;
    }
  }
  return best;
}

export default function PeakWindowHeatmap({
  data = defaultData,
  caption = defaultCaption,
  height,
  className,
}: PeakWindowHeatmapProps) {
  const byKey = new Map<string, number | null>();
  for (const cell of data) byKey.set(`${cell.day}-${String(cell.hour)}`, cell.value);

  const measured = data.filter((cell): cell is LeadHourCell & { value: number } => cell.value !== null);
  const values = measured.map((cell) => cell.value);
  const ceiling = maxOf(values);
  const generalAverage = averageOf(values);
  const total = values.reduce((sum, value) => sum + value, 0);

  const hourSums = HOURS.map((hour) =>
    measured.filter((cell) => cell.hour === hour).reduce((sum, cell) => sum + cell.value, 0),
  );
  const peakStart = peakWindowStart(hourSums);
  const peakEnd = peakStart + PEAK_SPAN - 1;
  const firstPeakHour = HOURS[peakStart];
  const lastPeakHour = HOURS[peakEnd];
  const peakSum = hourSums.slice(peakStart, peakEnd + 1).reduce((sum, value) => sum + value, 0);

  let hottest = measured[0];
  for (const cell of measured) if (hottest === undefined || cell.value > hottest.value) hottest = cell;

  if (
    ceiling === null ||
    generalAverage === null ||
    hottest === undefined ||
    firstPeakHour === undefined ||
    lastPeakHour === undefined
  ) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma hora medida neste recorte: a grade não tem o que colorir.</span>
      </div>
    );
  }

  const shortStaffIndexes = HOURS.map((hour, index) => (SHORT_STAFF_HOURS.includes(hour) ? index : -1)).filter(
    (index) => index >= 0,
  );
  const firstShort = shortStaffIndexes[0];
  const lastShort = shortStaffIndexes[shortStaffIndexes.length - 1];
  const share = formatRateWithVolume(peakSum, total);
  const peakStartX = cellX(peakStart, peakStart);
  const peakEndX = cellX(peakEnd, peakStart) + CELL_W;

  const summary =
    `Mapa de calor de ${formatInt(DAY_ORDER.length)} dias por ${formatInt(HOURS.length)} horas com as entradas de lead por hora. ` +
    `Pico na ${DAY_LABELS[hottest.day].toLowerCase()} às ${formatHours(hottest.hour)}, ${formatDecimal(hottest.value, 1)}, contra a média geral de ${formatDecimal(generalAverage, 1)}. ` +
    `A janela de ${formatHours(firstPeakHour)} às ${formatHours(lastPeakHour)} soma ${share}, e nela ${formatInt(STAFF_AWAY)} de ${formatInt(STAFF_TOTAL)} SDRs saem para almoço.`;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text className="tabular-nums" fill="var(--text-secondary)" fontSize={12} x={TEXT_LEFT} y={12}>
          Pico das {formatHours(firstPeakHour)} às {formatHours(lastPeakHour)}, as {formatInt(PEAK_SPAN)} horas seguidas de
          maior soma:{' '}
          <tspan className="font-display font-semibold" fill="var(--text-primary)">
            {share}
          </tspan>{' '}
          das entradas de uma semana média.
        </text>

        {HOURS.map((hour, hourIndex) => {
          const inWindow = hourIndex >= peakStart && hourIndex <= peakEnd;
          if (hour % 2 !== 0 && !inWindow) return null;
          return (
            <text
              className="font-display tabular-nums"
              fill={inWindow ? 'var(--chart-1)' : 'var(--text-muted)'}
              fontSize={11}
              fontWeight={inWindow ? 600 : 500}
              key={`hour-${String(hour)}`}
              textAnchor="middle"
              x={cellX(hourIndex, peakStart) + CELL_W / 2}
              y={HOUR_BASELINE}
            >
              {formatHours(hour)}
            </text>
          );
        })}

        {DAY_ORDER.map((day, dayIndex) => (
          <text
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={12}
            key={day}
            textAnchor="end"
            x={LEFT_W - 8}
            y={cellY(dayIndex) + CELL_H / 2}
          >
            {DAY_LABELS[day]}
          </text>
        ))}

        {DAY_ORDER.flatMap((day: WeekDay, dayIndex) =>
          HOURS.map((hour, hourIndex) => {
            const value = byKey.get(`${day}-${String(hour)}`) ?? null;
            const x = cellX(hourIndex, peakStart);
            const y = cellY(dayIndex);
            if (value === null) {
              return (
                <rect
                  fill="none"
                  height={CELL_H}
                  key={`${day}-${String(hour)}`}
                  rx={2}
                  stroke="var(--text-muted)"
                  strokeDasharray="3 3"
                  width={CELL_W}
                  x={x}
                  y={y}
                />
              );
            }
            const zero = value === 0;
            const bucket = bucketOf(value, ceiling);
            return (
              <g key={`${day}-${String(hour)}`}>
                <rect
                  fill={zero ? 'var(--surface-sunken)' : BUCKET_COLORS[bucket]}
                  height={CELL_H}
                  rx={2}
                  stroke={zero ? 'var(--text-muted)' : undefined}
                  width={CELL_W}
                  x={x}
                  y={y}
                />
                <text
                  className="font-display tabular-nums"
                  dominantBaseline="central"
                  fill={zero ? 'var(--text-primary)' : (BUCKET_TEXT[bucket] ?? 'var(--text-primary)')}
                  fontSize={12}
                  textAnchor="middle"
                  x={x + CELL_W / 2}
                  y={y + CELL_H / 2}
                >
                  {formatDecimal(value, 1)}
                </text>
              </g>
            );
          }),
        )}

        <rect
          fill="none"
          height={GRID_BOTTOM - GRID_TOP + 6}
          rx={4}
          stroke="var(--chart-1)"
          strokeWidth={1.5}
          width={peakEndX - peakStartX + 6}
          x={peakStartX - 3}
          y={GRID_TOP - 3}
        />

        {firstShort === undefined || lastShort === undefined ? null : (
          <g>
            <text
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={11}
              textAnchor="end"
              x={LEFT_W - 8}
              y={RIBBON_TOP + RIBBON_H / 2}
            >
              Almoço
            </text>
            <rect
              fill="var(--surface-sunken)"
              height={RIBBON_H}
              rx={2}
              stroke="var(--text-muted)"
              width={cellX(lastShort, peakStart) + CELL_W - cellX(firstShort, peakStart)}
              x={cellX(firstShort, peakStart)}
              y={RIBBON_TOP}
            />
            <text
              className="tabular-nums"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize={11}
              textAnchor="middle"
              x={(cellX(firstShort, peakStart) + cellX(lastShort, peakStart) + CELL_W) / 2}
              y={RIBBON_TOP + RIBBON_H / 2}
            >
              {formatInt(STAFF_AWAY)} de {formatInt(STAFF_TOTAL)} SDRs
            </text>
          </g>
        )}

        <text
          className="font-display tabular-nums"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          textAnchor="end"
          x={LEFT_W + 22}
          y={SCALE_TOP + SCALE_H / 2}
        >
          {formatDecimal(0, 1)}
        </text>
        {BUCKET_COLORS.map((color, index) => {
          const x = LEFT_W + 28 + index * (SWATCH_W + GAP);
          return (
            <g key={`scale-${String(index)}`}>
              <rect fill={color} height={SCALE_H} rx={2} width={SWATCH_W} x={x} y={SCALE_TOP} />
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill={BUCKET_TEXT[index] ?? 'var(--text-primary)'}
                fontSize={11}
                textAnchor="middle"
                x={x + SWATCH_W / 2}
                y={SCALE_TOP + SCALE_H / 2}
              >
                {formatDecimal((ceiling * (index + 1)) / BUCKET_COUNT, 1)}
              </text>
            </g>
          );
        })}
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={LEFT_W + 28 + BUCKET_COUNT * (SWATCH_W + GAP) + 10}
          y={SCALE_TOP + SCALE_H / 2}
        >
          {caption}
        </text>
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          textAnchor="end"
          x={VIEW_W - RIGHT_PAD}
          y={SCALE_TOP + SCALE_H / 2}
        >
          o número na amostra é o teto da faixa
        </text>

        <rect
          fill="none"
          height={FOOT_SWATCH_H}
          rx={2}
          stroke="var(--text-muted)"
          strokeDasharray="3 3"
          width={FOOT_SWATCH_W}
          x={TEXT_LEFT}
          y={FOOT_BASELINE - FOOT_SWATCH_H / 2}
        />
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={TEXT_LEFT + FOOT_SWATCH_W + 6}
          y={FOOT_BASELINE}
        >
          {formatUnavailable()}: a campanha não veiculou nesta hora
        </text>
        <rect
          fill="var(--surface-sunken)"
          height={FOOT_SWATCH_H}
          rx={2}
          stroke="var(--text-muted)"
          width={FOOT_SWATCH_W}
          x={ZERO_SWATCH_X}
          y={FOOT_BASELINE - FOOT_SWATCH_H / 2}
        />
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={ZERO_SWATCH_X + FOOT_SWATCH_W + 6}
          y={FOOT_BASELINE}
        >
          zero medido: veiculou e nenhuma pessoa entrou
        </text>
      </svg>
    </div>
  );
}
