import { Filter } from 'lucide-react';

import { formatDays, formatDecimal, formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, PERIODS, WITHOUT_MEETING, type Lead, type Squad } from './data';

/**
 * Raincloud: a mesma distribuição em três camadas, uma embaixo da outra. A nuvem é a forma, a caixa
 * fina é o resumo, a chuva é um ponto por lead. Cada camada cobre a falha da outra: a nuvem mostra o
 * segundo pico que a caixa apaga, a caixa dá a mediana que a nuvem não tem, e a chuva mostra quantos
 * casos sustentam a forma.
 *
 * Aqui são dois trimestres por squad, e o vazado contra o cheio carrega essa diferença nas três
 * camadas: nuvem em contorno, caixa vazada e ponto vazado são o trimestre anterior; preenchidos, o
 * atual. A cor tem um papel só.
 *
 * O ponto da chuva tem a posição horizontal do dado e a vertical de um encaixe determinístico (dias,
 * depois código do lead): cada ponto fica a 2 px ou mais de todo outro, então são tantos pontos
 * visíveis quanto leads. A sub-faixa cresce o necessário e nenhum ponto invade a caixa nem o vizinho.
 *
 * A geometria é SVG puro, desenhado no tamanho do corpo do cartão para a escala sair 1 (GEO-18).
 */
export interface CadenceRaincloudProps {
  readonly data?: readonly Squad[];
  readonly withoutMeeting?: { readonly previous: number; readonly current: number };
  readonly height?: number;
  readonly className?: string;
}

interface CurvePoint {
  readonly value: number;
  readonly density: number;
}

interface Layer {
  readonly leads: readonly Lead[];
  readonly q1: number;
  readonly median: number;
  readonly q3: number;
  readonly curve: readonly CurvePoint[];
  readonly peak: number;
}

interface Row {
  readonly squad: Squad;
  /** `null` quando o squad não tem lead agendado no trimestre: sem camada, nunca zero. */
  readonly previous: Layer | null;
  readonly current: Layer | null;
}

/** Largura do desenho: o corpo do cartão de 960 px, para o `<svg>` sair em escala 1. */
const VIEW_W = 894;
const TOP = 6;
const AXIS_H = 22;
const LABEL_W = 178;
const PLOT_X0 = LABEL_W;
const PLOT_X1 = VIEW_W - 24;
/** As três sub-faixas de cada squad, de cima para baixo. A soma dá a banda, com piso de 56 px. */
const CLOUD_H = 30;
const LAYER_GAP = 5;
const BOX_H = 6;
const BOX_GAP = 4;
const LANE_GAP = 2;
const ROW_GAP = 16;
const DOT_R = 1.5;
/** Distância mínima entre centros de dois pontos da chuva: nenhum par a menos de 2 px. */
const MIN_GAP = 2.2;
const MAX_SLOTS = 40;
const MEDIAN_OVERHANG = 1.5;
const AXIS_STEP = 2;
const CURVE_STEPS = 80;
const CURRENT_FILL = 'var(--chart-1)';
const PREVIOUS_STROKE = 'var(--text-secondary)';
const MEDIAN_STROKE = 'var(--text-primary)';
const SURFACE = 'var(--surface-raised)';
const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

/** Quartil por interpolação linear. `null` para lista vazia. */
function quantile(sorted: readonly number[], p: number): number | null {
  const position = (sorted.length - 1) * p;
  const base = Math.floor(position);
  const low = sorted[base];
  if (low === undefined) return null;
  const high = sorted[base + 1] ?? low;
  return low + (position - base) * (high - low);
}

/** Banda de Silverman de um grupo. `null` com menos de dois casos ou sem dispersão nenhuma. */
function silverman(sorted: readonly number[]): number | null {
  const n = sorted.length;
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  if (n < 2 || q1 === null || q3 === null) return null;
  const mean = sorted.reduce((sum, value) => sum + value, 0) / n;
  const deviation = Math.sqrt(sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1));
  const iqr = q3 - q1;
  const spread = iqr > 0 ? Math.min(deviation, iqr / 1.34) : deviation;
  if (spread <= 0) return null;
  return 0.9 * spread * n ** -0.2;
}

/** Densidade por núcleo gaussiano no valor pedido. `null` para lista vazia. */
function densityAt(values: readonly number[], band: number, x: number): number | null {
  if (values.length === 0) return null;
  let total = 0;
  for (const value of values) {
    const z = (x - value) / band;
    total += Math.exp(-0.5 * z * z);
  }
  return total / (values.length * band * SQRT_TWO_PI);
}

function daysOf(leads: readonly Lead[]): number[] {
  return leads.map((lead) => lead.days).sort((a, b) => a - b);
}

/** Uma camada: resumo e curva cortada no menor e no maior valor observados. */
function buildLayer(leads: readonly Lead[], band: number): Layer | null {
  const sorted = daysOf(leads);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  if (min === undefined || max === undefined || q1 === null || median === null || q3 === null) return null;
  const curve: CurvePoint[] = [];
  for (let step = 0; step <= CURVE_STEPS; step += 1) {
    const value = min + ((max - min) * step) / CURVE_STEPS;
    const density = densityAt(sorted, band, value);
    if (density !== null) curve.push({ value, density });
  }
  return { leads, q1, median, q3, curve, peak: Math.max(...curve.map((point) => point.density)) };
}

/** Meio violino: a curva sobe a partir da linha de base e fecha nela. */
function cloudPath(curve: readonly CurvePoint[], toX: (value: number) => number, toRise: (density: number) => number, base: number): string {
  const pair = (x: number, y: number): string => `${String(Math.round(x * 100) / 100)},${String(Math.round(y * 100) / 100)}`;
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (first === undefined || last === undefined) return '';
  const upper = curve.map((point) => pair(toX(point.value), base - toRise(point.density)));
  return `M${pair(toX(first.value), base)}L${upper.join('L')}L${pair(toX(last.value), base)}Z`;
}

/**
 * Encaixe determinístico da chuva: leads em ordem de dias e de código, cada um no primeiro degrau
 * (do centro para fora, alternando) cujo centro fica a `MIN_GAP` ou mais de todo ponto já posto.
 * Devolve o deslocamento vertical de cada lead e o maior deslocamento usado.
 */
function packLane(leads: readonly Lead[], toX: (value: number) => number): { offsets: Map<string, number>; reach: number } {
  const order = [...leads].sort((a, b) => a.days - b.days || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const placed: { x: number; y: number }[] = [];
  const offsets = new Map<string, number>();
  let reach = 0;
  for (const lead of order) {
    const x = toX(lead.days);
    const near = placed.filter((point) => Math.abs(point.x - x) < MIN_GAP);
    for (let slot = 0; slot < MAX_SLOTS; slot += 1) {
      const y = (slot % 2 === 0 ? 1 : -1) * Math.ceil(slot / 2) * MIN_GAP;
      if (near.every((point) => Math.hypot(point.x - x, point.y - y) >= MIN_GAP)) {
        placed.push({ x, y });
        offsets.set(lead.id, y);
        reach = Math.max(reach, Math.abs(y));
        break;
      }
    }
  }
  return { offsets, reach };
}

/** Dias com uma casa e a palavra no número certo: abaixo de 2 é singular em português. */
function daysLabel(value: number): string {
  return `${formatDecimal(value, 1)} ${value < 2 ? 'dia' : 'dias'}`;
}

export default function CadenceRaincloud({
  data = defaultData,
  withoutMeeting = WITHOUT_MEETING,
  height,
  className,
}: CadenceRaincloudProps) {
  const style = height === undefined ? undefined : { height };

  /** Banda única para as seis nuvens: a mediana das bandas de Silverman de cada uma. */
  const bands = data
    .flatMap((squad) => [silverman(daysOf(squad.previous)), silverman(daysOf(squad.current))])
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  const band = quantile(bands, 0.5);

  /** Ordem pela mediana do trimestre atual, do squad mais rápido no topo; sem lead atual por último. */
  const rows: readonly Row[] = data
    .map((squad) => ({
      squad,
      previous: band === null ? null : buildLayer(squad.previous, band),
      current: band === null ? null : buildLayer(squad.current, band),
    }))
    .sort((a, b) => {
      if (a.current === null || b.current === null) return (a.current === null ? 1 : 0) - (b.current === null ? 1 : 0);
      return a.current.median - b.current.median;
    });
  const layers = rows.flatMap((row) => [row.previous, row.current]).filter((layer): layer is Layer => layer !== null);

  if (band === null || layers.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead agendado neste recorte: não há tempo até a agenda para desenhar.</span>
      </div>
    );
  }

  /** Medianas do conjunto inteiro, uma por trimestre. `null` quando o trimestre não tem lead. */
  const before = quantile(daysOf(data.flatMap((squad) => squad.previous)), 0.5);
  const after = quantile(daysOf(data.flatMap((squad) => squad.current)), 0.5);

  /** Quem ficou para trás: leads do trimestre atual acima da mediana do anterior, por squad. */
  const slow = rows.map((row) => ({
    name: row.squad.name,
    count: before === null ? null : row.squad.current.filter((lead) => lead.days > before).length,
  }));
  const slowTotal = slow.reduce((sum, item) => sum + (item.count ?? 0), 0);
  const worst = slow.reduce<{ name: string; count: number } | null>(
    (top, item) => (item.count !== null && (top === null || item.count > top.count) ? { name: item.name, count: item.count } : top),
    null,
  );

  const change =
    before === null || after === null
      ? `Mediana ${formatUnavailable()} em um dos trimestres: sem lead agendado para comparar`
      : after === before
        ? `A mediana ficou em ${daysLabel(after)} depois da nova cadência`
        : `A mediana ${after < before ? 'caiu' : 'subiu'} de ${formatDecimal(before, 1)} para ${daysLabel(after)} depois da nova cadência`;
  const tail =
    before === null || worst === null || slowTotal === 0
      ? ''
      : `${formatInt(slowTotal)} leads do trimestre atual ainda passam de ${daysLabel(before)}, ${formatInt(worst.count)} deles em ${worst.name}`;
  const reading = tail === '' ? `${change}.` : `${change}; ${tail}.`;
  const summary =
    `Raincloud do tempo até a agenda em ${formatInt(rows.length)} squads, antes e depois da nova cadência. ` +
    `${change}.${tail === '' ? '' : ` ${tail}.`}`;

  /** Largura por área: uma escala só, contra a maior densidade das seis nuvens. */
  const peak = Math.max(...layers.map((layer) => layer.peak));
  const longest = Math.max(AXIS_STEP, ...layers.flatMap((layer) => layer.leads.map((lead) => lead.days)));
  const ceiling = Math.ceil(longest / AXIS_STEP) * AXIS_STEP;
  const ticks = Array.from({ length: ceiling / AXIS_STEP + 1 }, (_, index) => index * AXIS_STEP);
  const toX = (value: number): number => PLOT_X0 + (value / ceiling) * (PLOT_X1 - PLOT_X0);
  const toRise = (density: number): number => (density / peak) * CLOUD_H;
  /* Chuva com tinta própria por lead: a altura da sub-faixa sai do maior empilhamento do conjunto. */
  const packs = new Map<Layer, ReturnType<typeof packLane>>(layers.map((layer) => [layer, packLane(layer.leads, toX)]));
  const laneReach = Math.max(0, ...[...packs.values()].map((pack) => pack.reach));
  const LANE_H = Math.ceil(laneReach * 2 + DOT_R * 2 + 2);
  const BAND_H = CLOUD_H + LAYER_GAP + BOX_H * 2 + BOX_GAP + LAYER_GAP + LANE_H * 2 + LANE_GAP;
  const ROW_PITCH = Math.max(BAND_H, 56) + ROW_GAP;
  const axisY = TOP + rows.length * ROW_PITCH - ROW_GAP / 2;
  const viewH = axisY + AXIS_H;
  const period = (range: { readonly from: string; readonly to: string }): string =>
    `${formatMonthShort(range.from)} a ${formatMonthShort(range.to)}`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <p aria-hidden className="shrink-0 text-xs leading-4 font-medium text-text-secondary tabular-nums">
        {reading}
      </p>
      {/* Legenda de uma linha, na ordem em que a frase cita os trimestres: anterior e depois atual. */}
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full border-[1.5px]" style={{ borderColor: PREVIOUS_STROKE }} />
          <span className="tabular-nums">{`anterior, ${period(PERIODS.previous)}`}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: CURRENT_FILL }} />
          <span className="tabular-nums">{`atual, ${period(PERIODS.current)}`}</span>
        </span>
        <span className="text-text-muted">nuvem: forma da distribuição</span>
        <span className="text-text-muted">caixa: metade central e mediana</span>
        <span className="text-text-muted">chuva: um ponto por lead</span>
      </div>

      {/* `viewBox` do tamanho do corpo e altura pela proporção: escala 1, texto de 11 px em 11 px (GEO-18). */}
      <svg
        aria-hidden
        className="block h-auto w-full shrink-0"
        style={{ aspectRatio: `${String(VIEW_W)} / ${String(viewH)}` }}
        viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}
      >
        {ticks.map((tick) => (
          <g key={`tick-${String(tick)}`}>
            <line stroke="var(--line-subtle)" strokeWidth={1} x1={toX(tick)} x2={toX(tick)} y1={TOP} y2={axisY} />
            <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={toX(tick)} y={axisY + 15}>
              {formatDays(tick)}
            </text>
          </g>
        ))}
        {rows.map((row, index) => {
          const top = TOP + index * ROW_PITCH;
          const cloudBase = top + CLOUD_H;
          const boxY = { previous: cloudBase + LAYER_GAP, current: cloudBase + LAYER_GAP + BOX_H + BOX_GAP };
          const laneTop = boxY.current + BOX_H + LAYER_GAP;
          const laneY = { previous: laneTop + LANE_H / 2, current: laneTop + LANE_H + LANE_GAP + LANE_H / 2 };
          const { previous, current } = row;
          /* Encaixe preso na sub-faixa: a altura da faixa cobre o maior deslocamento mais o raio. */
          const dotY = (layer: Layer, lead: Lead, center: number): number => center + (packs.get(layer)?.offsets.get(lead.id) ?? 0);
          const medianTick = (layer: Layer, y: number) => (
            <g>
              <line stroke={SURFACE} strokeWidth={4} x1={toX(layer.median)} x2={toX(layer.median)} y1={y - MEDIAN_OVERHANG} y2={y + BOX_H + MEDIAN_OVERHANG} />
              <line stroke={MEDIAN_STROKE} strokeWidth={2} x1={toX(layer.median)} x2={toX(layer.median)} y1={y - MEDIAN_OVERHANG} y2={y + BOX_H + MEDIAN_OVERHANG} />
            </g>
          );
          return (
            <g key={row.squad.id}>
              <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={top + 12}>
                {row.squad.name}
              </text>
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={top + 29}>
                {`anterior n ${formatInt(row.squad.previous.length)} · atual n ${formatInt(row.squad.current.length)}`}
              </text>
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={top + 44}>
                {previous === null || current === null
                  ? `mediana ${formatUnavailable()} num trimestre`
                  : `mediana de ${formatDecimal(previous.median, 1)} para ${daysLabel(current.median)}`}
              </text>
              {current === null ? null : <path d={cloudPath(current.curve, toX, toRise, cloudBase)} fill={CURRENT_FILL} />}
              {previous === null ? null : (
                <>
                  {/* Revestimento na cor da superfície por baixo do contorno: sem ele o traço some
                      onde cruza a nuvem preenchida, porque nenhum token contrasta com os dois fundos (TOK-10). */}
                  <path d={cloudPath(previous.curve, toX, toRise, cloudBase)} fill="none" stroke={SURFACE} strokeLinejoin="round" strokeWidth={4} />
                  <path d={cloudPath(previous.curve, toX, toRise, cloudBase)} fill="none" stroke={PREVIOUS_STROKE} strokeLinejoin="round" strokeWidth={1.5} />
                  <rect
                    fill="none"
                    height={BOX_H}
                    stroke={PREVIOUS_STROKE}
                    strokeWidth={1.5}
                    width={Math.max(toX(previous.q3) - toX(previous.q1), 2)}
                    x={toX(previous.q1)}
                    y={boxY.previous}
                  />
                  {medianTick(previous, boxY.previous)}
                  {previous.leads.map((lead) => (
                    <circle cx={toX(lead.days)} cy={dotY(previous, lead, laneY.previous)} fill={SURFACE} key={lead.id} r={DOT_R - 0.5} stroke={PREVIOUS_STROKE} strokeWidth={1} />
                  ))}
                </>
              )}
              {current === null ? null : (
                <>
                  <rect fill={CURRENT_FILL} height={BOX_H} width={Math.max(toX(current.q3) - toX(current.q1), 2)} x={toX(current.q1)} y={boxY.current} />
                  {medianTick(current, boxY.current)}
                  {current.leads.map((lead) => (
                    <circle cx={toX(lead.days)} cy={dotY(current, lead, laneY.current)} fill={CURRENT_FILL} key={lead.id} r={DOT_R} stroke={SURFACE} strokeWidth={0.5} />
                  ))}
                </>
              )}
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span>dias da entrada do lead até a primeira agenda</span>
        {/* A ordem vai escrita: sem esta linha os nomes leem como lista arbitrária (GEO-12). */}
        <span>squads em ordem de mediana atual crescente, de cima para baixo</span>
        <span>altura do ponto na chuva só separa leads, sem significado</span>
        <span className="tabular-nums">{`nuvem: largura por área na mesma escala, banda de Silverman única de ${daysLabel(band)}`}</span>
        {withoutMeeting.previous <= 0 && withoutMeeting.current <= 0 ? null : (
          <span className="tabular-nums">
            {`sem agenda, fora: ${formatInt(withoutMeeting.previous)} leads no anterior e ${formatInt(withoutMeeting.current)} no atual`}
          </span>
        )}
      </div>
    </figure>
  );
}
