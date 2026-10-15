import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatHours, formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  DAY_LABELS,
  DAY_ORDER,
  HOURS,
  LABELLED_HOURS,
  windowCaption as defaultCaption,
  type RadialHourCell,
  type WeekDay,
} from './data';

/**
 * Relógio de entradas por hora: 7 anéis de 24 setores anulares, 0h no topo e sentido horário.
 *
 * O setor é um `path` de dois arcos, com a geometria calculada aqui em TypeScript e SEM `transform`:
 * giro em volta de forma cega as guardas `CONTRASTE-MARCA` e `ESPESSURA-MARCA`, que saem com o
 * motivo `preview_com_transform`, e a peça passa no portão sem ninguém medir a cor dela. Coordenada
 * calculada custa umas linhas e devolve a medição.
 *
 * A escala tem TRÊS faixas, e não as cinco da v1 deste modelo. Com 168 setores não há onde escrever
 * o valor de cada um, então aqui a cor é o único canal de grandeza, e pela `TOK-8` do ARMADILHAS.md
 * só `--seq-5`, `--seq-6` e `--seq-7` passam de 3:1 contra o cartão nos dois temas. O que substitui
 * os degraus perdidos é a faixa nomeada, com o intervalo escrito ao lado da amostra, e a lista de
 * picos ao lado do relógio, que é também o que a `GEO-5` exige de todo visual radial: o número vem
 * escrito em algum lugar, porque anel de fora parece mais intenso com o mesmo valor.
 *
 * Três estados de setor, porque célula não desenhada é ausência e ausência não é zero (EST-2,
 * DAD-2): hora medida leva a faixa da rampa; zero medido leva o poço `--surface-sunken` com contorno
 * sólido; hora em que a campanha não veiculou leva contorno tracejado, sem preenchimento.
 */
export interface HourClockHeatmapProps {
  readonly data?: readonly RadialHourCell[];
  /** O que a célula mede, impresso na legenda e na frase acessível. */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 694;
const VIEW_H = 401.5;
const CX = 183;
/** Recuo do texto encostado na esquerda: a tinta do primeiro glifo passa da âncora (ESP-3). */
const TEXT_LEFT = 4;
const CY = 186;
const R_IN = 40;
const R_OUT = 146;
const LABEL_R = 158;
const HOURS_IN_DAY = 24;
const SECTOR_DEG = 360 / HOURS_IN_DAY;
const RING_COUNT = 7;
const RING_T = (R_OUT - R_IN) / RING_COUNT;
const READ_BASELINE = 12;
const LIST_X = 376;
const LIST_HEADER = 46;
const LIST_FIRST = 66;
const LIST_STEP = 18;
const LIST_HOUR_X = 520;
const LIST_VALUE_X = 600;
const CAPTION_Y = 200;
const BAND_FIRST = 220;
const CRITERION_Y = 274;
const BAND_STEP = 18;
const BAND_SWATCH_W = 20;
const BAND_SWATCH_H = 10;
const STATE_FIRST = 296;
const STATE_STEP = 18;
const STATE_SWATCH_W = 16;
const STATE_SWATCH_H = 11;
const FOOT_ONE = 372;
const FOOT_TWO = 389;
/** Horas seguidas da janela de pico, num ciclo de 24 horas. */
const PEAK_SPAN = 5;

/** As três faixas que passam de 3:1 contra o cartão nos dois temas (TOK-8). */
const BAND_COLORS = [
  CHART_SEQUENTIAL_COLORS[4],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const BAND_COUNT = BAND_COLORS.length;

function r2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Maior valor de uma lista: `null` na lista vazia, porque `Math.max` de nada devolve infinito. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((champion, value) => (value > champion ? value : champion), values[0] ?? 0);
}

function polarX(radius: number, degrees: number): number {
  return CX + radius * Math.cos(((degrees - 90) * Math.PI) / 180);
}

function polarY(radius: number, degrees: number): number {
  return CY + radius * Math.sin(((degrees - 90) * Math.PI) / 180);
}

/** Setor anular por dois arcos: o de fora no sentido horário, o de dentro na volta. */
function sectorPath(inner: number, outer: number, fromDeg: number, toDeg: number): string {
  const ax = r2(polarX(outer, fromDeg));
  const ay = r2(polarY(outer, fromDeg));
  const bx = r2(polarX(outer, toDeg));
  const by = r2(polarY(outer, toDeg));
  const cx = r2(polarX(inner, toDeg));
  const cy = r2(polarY(inner, toDeg));
  const dx = r2(polarX(inner, fromDeg));
  const dy = r2(polarY(inner, fromDeg));
  return [
    `M ${String(ax)} ${String(ay)}`,
    `A ${String(r2(outer))} ${String(r2(outer))} 0 0 1 ${String(bx)} ${String(by)}`,
    `L ${String(cx)} ${String(cy)}`,
    `A ${String(r2(inner))} ${String(r2(inner))} 0 0 0 ${String(dx)} ${String(dy)}`,
    'Z',
  ].join(' ');
}

/**
 * Quantil de uma lista JÁ ORDENADA: `null` na lista vazia, porque lista sem elemento não tem
 * quantil (EST-1b).
 */
function quantileOf(sorted: readonly number[], fraction: number): number | null {
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round(fraction * (sorted.length - 1))));
  return sorted[index] ?? null;
}

/**
 * As faixas são os TERÇOS DA AMOSTRA, não terços do intervalo, e a troca veio de olhar o render.
 * Com faixas de largura igual sobre [0, máximo] a madrugada inteira caía na primeira, e quatro de
 * cada cinco setores saíam da mesma cor: o relógio ficava liso e não mostrava o ciclo, que é a
 * única coisa que ele existe para mostrar. Por terço da amostra as três faixas ficam com 53, 52 e
 * 58 setores, e o desenho separa madrugada, ombro e meio do dia. O critério não é adivinhável, e
 * por isso vai escrito ao lado da legenda, junto com o intervalo de cada faixa.
 */
function bandOf(value: number, edges: readonly number[]): number {
  for (let index = BAND_COUNT - 1; index > 0; index -= 1) {
    const edge = edges[index - 1];
    if (edge !== undefined && value >= edge) return index;
  }
  return 0;
}

/** Índice da primeira hora da janela cíclica de `PEAK_SPAN` horas com a maior soma. */
function peakWindowStart(sums: readonly number[]): number {
  let best = 0;
  let bestSum = -1;
  for (let index = 0; index < sums.length; index += 1) {
    let running = 0;
    for (let step = 0; step < PEAK_SPAN; step += 1) running += sums[(index + step) % sums.length] ?? 0;
    if (running > bestSum) {
      bestSum = running;
      best = index;
    }
  }
  return best;
}

function anchorFor(degrees: number): 'start' | 'middle' | 'end' {
  const cosine = Math.cos(((degrees - 90) * Math.PI) / 180);
  if (cosine > 0.3) return 'start';
  if (cosine < -0.3) return 'end';
  return 'middle';
}

export default function HourClockHeatmap({
  data = defaultData,
  caption = defaultCaption,
  height,
  className,
}: HourClockHeatmapProps) {
  const measured = data.filter((cell): cell is RadialHourCell & { value: number } => cell.value !== null);
  const ceiling = maxOf(measured.map((cell) => cell.value));

  if (ceiling === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma hora medida neste recorte: o relógio não tem o que colorir.</span>
      </div>
    );
  }

  const sorted = measured.map((cell) => cell.value).slice().sort((left, right) => left - right);
  const lowEdge = quantileOf(sorted, 1 / 3);
  const highEdge = quantileOf(sorted, 2 / 3);
  const edges = lowEdge === null || highEdge === null ? [] : [lowEdge, highEdge];

  const byKey = new Map<string, number | null>();
  for (const cell of data) byKey.set(`${cell.day}-${String(cell.hour)}`, cell.value);

  const total = measured.reduce((sum, cell) => sum + cell.value, 0);
  const hourSums = HOURS.map((hour) =>
    measured.filter((cell) => cell.hour === hour).reduce((sum, cell) => sum + cell.value, 0),
  );
  const peakStart = peakWindowStart(hourSums);
  const peakSum = Array.from({ length: PEAK_SPAN }, (_unused, step) => hourSums[(peakStart + step) % HOURS.length] ?? 0).reduce(
    (sum, value) => sum + value,
    0,
  );
  const firstPeakHour = HOURS[peakStart];
  const lastPeakHour = HOURS[(peakStart + PEAK_SPAN - 1) % HOURS.length];

  let hottest = measured[0];
  for (const cell of measured) if (hottest === undefined || cell.value > hottest.value) hottest = cell;

  if (hottest === undefined || firstPeakHour === undefined || lastPeakHour === undefined) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma hora medida neste recorte: o relógio não tem o que colorir.</span>
      </div>
    );
  }

  const share = formatRateWithVolume(peakSum, total);
  const peaks = DAY_ORDER.map((day) => {
    const own = measured.filter((cell) => cell.day === day);
    let best = own[0];
    for (const cell of own) if (best === undefined || cell.value > best.value) best = cell;
    return { day, best };
  });

  const summary =
    `Relógio de ${formatInt(RING_COUNT)} anéis por ${formatInt(HOURS_IN_DAY)} horas com as entradas de lead por hora, segunda no centro e domingo na borda. ` +
    `A janela das ${formatHours(firstPeakHour)} às ${formatHours(lastPeakHour)} soma ${share} das entradas de uma semana média, ` +
    `e a maior célula é ${DAY_LABELS[hottest.day].toLowerCase()} às ${formatHours(hottest.hour)}, ${formatDecimal(hottest.value, 1)}.`;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text className="tabular-nums" fill="var(--text-secondary)" fontSize={12} x={TEXT_LEFT} y={READ_BASELINE}>
          Pico das {formatHours(firstPeakHour)} às {formatHours(lastPeakHour)}, as {formatInt(PEAK_SPAN)} horas seguidas de
          maior soma:{' '}
          <tspan className="font-display font-semibold" fill="var(--text-primary)">
            {share}
          </tspan>{' '}
          das entradas de uma semana média.
        </text>

        {DAY_ORDER.flatMap((day: WeekDay, ringIndex) => {
          const inner = R_IN + ringIndex * RING_T;
          const outer = inner + RING_T;
          return HOURS.map((hour, hourIndex) => {
            const value = byKey.get(`${day}-${String(hour)}`) ?? null;
            const path = sectorPath(inner, outer, hourIndex * SECTOR_DEG, (hourIndex + 1) * SECTOR_DEG);
            const key = `${day}-${String(hour)}`;
            if (value === null) {
              return (
                <path
                  d={path}
                  fill="none"
                  key={key}
                  stroke="var(--text-muted)"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />
              );
            }
            if (value === 0) {
              return (
                <path d={path} fill="var(--surface-sunken)" key={key} stroke="var(--text-muted)" strokeWidth={0.75} />
              );
            }
            return (
              <path
                d={path}
                fill={BAND_COLORS[bandOf(value, edges)]}
                key={key}
                stroke="var(--surface-raised)"
                strokeWidth={1}
              />
            );
          });
        })}

        {LABELLED_HOURS.map((hour) => {
          const middle = (HOURS.indexOf(hour) + 0.5) * SECTOR_DEG;
          return (
            <text
              className="font-display tabular-nums"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              key={`clock-${String(hour)}`}
              textAnchor={anchorFor(middle)}
              x={r2(polarX(LABEL_R, middle))}
              y={r2(polarY(LABEL_R, middle))}
            >
              {formatHours(hour)}
            </text>
          );
        })}

        <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={LIST_X} y={LIST_HEADER}>
          Pico de cada dia, do anel do centro para o de fora
        </text>
        {peaks.map((entry, index) => (
          <g key={`peak-${entry.day}`}>
            <text
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={11}
              x={LIST_X}
              y={LIST_FIRST + index * LIST_STEP}
            >
              {DAY_LABELS[entry.day]}
            </text>
            <text
              className="font-display tabular-nums"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              textAnchor="end"
              x={LIST_HOUR_X}
              y={LIST_FIRST + index * LIST_STEP}
            >
              {entry.best === undefined ? formatUnavailable() : formatHours(entry.best.hour)}
            </text>
            <text
              className="font-display tabular-nums"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize={11}
              textAnchor="end"
              x={LIST_VALUE_X}
              y={LIST_FIRST + index * LIST_STEP}
            >
              {entry.best === undefined ? formatUnavailable() : formatDecimal(entry.best.value, 1)}
            </text>
          </g>
        ))}

        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={LIST_X} y={CAPTION_Y}>
          {caption}
        </text>
        {BAND_COLORS.map((color, index) => {
          const y = BAND_FIRST + index * BAND_STEP;
          const inBand = measured.map((cell) => cell.value).filter((v) => v > 0 && bandOf(v, edges) === index);
          const floor = inBand.length === 0 ? null : Math.min(...inBand);
          const roof = maxOf(inBand);
          return (
            <g key={`band-${String(index)}`}>
              <rect
                fill={color}
                height={BAND_SWATCH_H}
                rx={2}
                width={BAND_SWATCH_W}
                x={LIST_X}
                y={y - BAND_SWATCH_H / 2}
              />
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                x={LIST_X + BAND_SWATCH_W + 6}
                y={y}
              >
                {floor === null || roof === null
                  ? formatUnavailable()
                  : `${formatDecimal(floor, 1)} a ${formatDecimal(roof, 1)}`}
              </text>
            </g>
          );
        })}

        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={LIST_X} y={CRITERION_Y}>
          faixas por terço das horas medidas, não por terço do intervalo
        </text>
        <rect
          fill="none"
          height={STATE_SWATCH_H}
          rx={2}
          stroke="var(--text-muted)"
          strokeDasharray="2 2"
          width={STATE_SWATCH_W}
          x={LIST_X}
          y={STATE_FIRST - STATE_SWATCH_H / 2}
        />
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={LIST_X + STATE_SWATCH_W + 6}
          y={STATE_FIRST}
        >
          {formatUnavailable()}: a campanha não veiculou
        </text>
        <rect
          fill="var(--surface-sunken)"
          height={STATE_SWATCH_H}
          rx={2}
          stroke="var(--text-muted)"
          width={STATE_SWATCH_W}
          x={LIST_X}
          y={STATE_FIRST + STATE_STEP - STATE_SWATCH_H / 2}
        />
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={LIST_X + STATE_SWATCH_W + 6}
          y={STATE_FIRST + STATE_STEP}
        >
          zero medido: veiculou e nenhuma pessoa entrou
        </text>

        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={TEXT_LEFT} y={FOOT_ONE}>
          O anel de fora tem célula maior e parece mais intenso com o mesmo valor: os anéis não se comparam entre si.
        </text>
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={TEXT_LEFT} y={FOOT_TWO}>
          O valor de cada dia vem escrito na lista ao lado, e a comparação precisa entre dias é a da grade cartesiana.
        </text>
      </svg>
    </div>
  );
}
