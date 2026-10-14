import { useState } from 'react';
import { Filter } from 'lucide-react';

import {
  formatCurrencyAxis,
  formatCurrencyCompact,
  formatDays,
  formatInt,
  formatMonthShort,
  formatPercentFromScale100,
  formatRateWithVolume,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { axes as defaultAxes, data as defaultData, period, type MetricAxis, type MetricId, type MetricUnit, type OriginQuarter } from './data';

/**
 * Coordenadas paralelas com ESCALA PRÓPRIA em cada eixo: custo por lead em reais, duas taxas em
 * percentual, ticket médio em reais e ciclo em dias, sem normalizar nada. Cada origem de lead é
 * uma linha, e a posição dela em cada eixo só se lê contra o mínimo e o máximo DAQUELE eixo.
 *
 * QUATRO DECISÕES, e cada uma responde a uma regra medida.
 *
 * 1. Escala diferente sem rótulo é lida como escala única. Por isso o mínimo vai escrito no pé e o
 *    máximo no topo de cada eixo, com o formatador da unidade, e a linha de leitura avisa.
 * 2. O domínio nasce do recorte, arredondado PARA FORA num passo redondo, e nunca é forçado a
 *    começar no zero: aqui a marca é posição numa linha, e não barra (EIX-1).
 * 3. Em custo por lead e em ciclo, menor é melhor. O eixo NÃO é invertido em silêncio: o topo
 *    continua sendo o maior valor, e a polaridade vai escrita sob o título do eixo.
 * 4. Ausência não é zero (DAD-2): origem sem negócio ganho não tem ticket nem ciclo. O trecho da
 *    linha se encerra no último eixo medido e a origem ganha um anel vazado na faixa de ausência,
 *    abaixo do pé dos eixos; zero medido é a linha que TOCA o pé do eixo.
 */
export interface OwnScaleParallelCoordinatesProps {
  readonly data?: readonly OriginQuarter[];
  /** Os eixos, na ordem de leitura, cada um com a unidade e a polaridade. */
  readonly axes?: readonly MetricAxis[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas por número no `meta.json` (960 x 442): o corpo dessa moldura mede 894 x 323,5 px e o
 * `viewBox` repete esse número, para a escala sair 1 e os 11 px declarados serem 11 px na tela
 * (GEO-18).
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 323.5;
const READING_BASELINE = 13;
const AXIS_TITLE_BASELINE = 40;
/** Polaridade do eixo, uma linha sob o título, só onde menor é melhor. */
const DIRECTION_BASELINE = 54;
const MAX_BASELINE = 70;
const AXIS_TOP = 76;
/** Do pé do eixo à linha de base do rótulo de mínimo, e a altura que esse rótulo reserva. */
const MIN_DROP = 14;
const FOOT_LABEL = 18;
/** Faixa de ausência: só ocupa altura quando alguma métrica do recorte não tem medição. */
const GAP_LANE = 22;
const LANE_LABEL_GAP = 12;
/** À esquerda do primeiro eixo fica o rótulo da faixa de ausência, que mede 61 px em 11 px. */
const AXIS_LEFT = 84;
/** Coluna de nomes à direita: 22 px de chamada e o nome mais largo do dado, com 124 px. */
const AXIS_RIGHT_PAD = 172;
const LEADER_GAP = 4;
const LEADER_LENGTH = 22;
const LABEL_STEP = 14;
const LABEL_INSET = 2;
const TICK_HALF = 3;
/** Da linha de base ao centro óptico de um texto de 11 px. */
const TEXT_DROP = 4;
const PERCENT = 100;
/** O passo do arredondamento é o passo redondo mais próximo de um décimo da amplitude. */
const DOMAIN_PARTS = 10;
const LINE_WIDTH = 1.5;
const HOVER_WIDTH = 2.5;
const HIT_WIDTH = 10;
const DOT_RADIUS = 2.5;
const MARKER_RADIUS = 3.5;
const MARKER_STEP = 9;
const TEXT_SIZE = 11;
const READING_SIZE = 12;

/** A linha é o dado (ACE-6): `--text-muted` mede 5,21:1 no escuro e 5,37:1 no claro. */
const LINE_STROKE = 'var(--text-muted)';
const HOVER_STROKE = 'var(--chart-1)';
const AXIS_STROKE = 'var(--line-strong)';

interface Vertex {
  readonly x: number;
  readonly y: number;
}

interface Domain {
  readonly min: number;
  readonly max: number;
}

/**
 * O valor da origem no eixo, na unidade do eixo (percentual na escala de 0 a 100). Divisor zero
 * não é valor zero: é ausência (EST-1b), e o ciclo já chega `null` do dado quando não foi medido.
 */
function metricOf(origin: OriginQuarter, id: MetricId): number | null {
  switch (id) {
    case 'costPerLead':
      return origin.leads > 0 ? origin.spend / origin.leads : null;
    case 'scheduleRate':
      return origin.qualified > 0 ? (origin.scheduled / origin.qualified) * PERCENT : null;
    case 'winRate':
      return origin.opportunities > 0 ? (origin.won / origin.opportunities) * PERCENT : null;
    case 'averageTicket':
      return origin.won > 0 ? origin.wonRevenue / origin.won : null;
    case 'cycle':
      return origin.cycleDays;
  }
}

/** O valor por extenso, para a dica: taxa com o volume, moeda compacta, dias com a palavra. */
function describeMetric(origin: OriginQuarter, id: MetricId): string {
  if (id === 'scheduleRate') return formatRateWithVolume(origin.scheduled, origin.qualified);
  if (id === 'winRate') return formatRateWithVolume(origin.won, origin.opportunities);
  const value = metricOf(origin, id);
  if (value === null) return formatUnavailable();
  return id === 'cycle' ? formatDays(value) : formatCurrencyCompact(value);
}

/** Rótulo de mínimo e de máximo, com a unidade no próprio rótulo (NUM-6, EIX-6). */
function formatTick(unit: MetricUnit, value: number): string {
  if (unit === 'currency') return formatCurrencyAxis(value);
  if (unit === 'percent') return formatPercentFromScale100(value, 0);
  return formatDays(value);
}

/** Passo redondo (1, 2 ou 5 vezes uma potência de 10) igual ou acima do valor pedido. */
function niceStep(raw: number): number {
  const power = 10 ** Math.floor(Math.log10(raw));
  const ratio = raw / power;
  return (ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10) * power;
}

/**
 * Domínio do eixo, arredondado PARA FORA a partir dos valores do recorte. Devolve `null` quando
 * o eixo não tem valor medido nenhum: eixo sem medição não ganha escala inventada.
 */
function outwardDomain(values: readonly number[]): Domain | null {
  const first = values[0];
  if (first === undefined) return null;
  let low = first;
  let high = first;
  for (const value of values) {
    if (value < low) low = value;
    if (value > high) high = value;
  }
  const spread = high > low ? high - low : Math.max(Math.abs(high), 1);
  const step = niceStep(spread / DOMAIN_PARTS);
  const min = Math.floor(low / step) * step;
  const max = Math.ceil(high / step) * step;
  return { min, max: max > min ? max : min + step };
}

/** Quebra a linha onde falta valor: eixo sem medição encerra o trecho (EIX-10), sem interpolar. */
function linePieces(ys: readonly (number | null)[], xs: readonly number[]): Vertex[][] {
  const pieces: Vertex[][] = [];
  let current: Vertex[] = [];
  ys.forEach((y, index) => {
    const x = xs[index];
    if (y === null || x === undefined) {
      if (current.length > 0) pieces.push(current);
      current = [];
      return;
    }
    current.push({ x, y });
  });
  if (current.length > 0) pieces.push(current);
  return pieces;
}

function tenth(value: number): string {
  return String(Math.round(value * 10) / 10);
}

function pathOf(piece: readonly Vertex[]): string {
  return piece.map((vertex, index) => `${index === 0 ? 'M' : 'L'} ${tenth(vertex.x)},${tenth(vertex.y)}`).join(' ');
}

/**
 * Espalha os nomes de uma coluna com passo mínimo, cada um o mais perto possível do próprio alvo:
 * regressão isotônica por blocos (vizinhos que se atropelam viram um bloco centrado na média dos
 * alvos), e depois o conjunto é preso entre `min` e `max`. Os alvos chegam em ordem crescente.
 */
function spreadLabels(targets: readonly number[], step: number, min: number, max: number): number[] {
  const blocks: { count: number; sum: number }[] = [];
  targets.forEach((target, index) => {
    let block = { count: 1, sum: target - index * step };
    let previous = blocks[blocks.length - 1];
    while (previous !== undefined && previous.sum / previous.count > block.sum / block.count) {
      block = { count: previous.count + block.count, sum: previous.sum + block.sum };
      blocks.pop();
      previous = blocks[blocks.length - 1];
    }
    blocks.push(block);
  });
  const placed: number[] = [];
  for (const block of blocks) {
    for (let k = 0; k < block.count; k += 1) placed.push(block.sum / block.count + placed.length * step);
  }
  const last = placed.length - 1;
  return placed.map((value, index) => Math.min(Math.max(value, min + index * step), max - (last - index) * step));
}

function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

/** Nome de origem ou de eixo no meio da oração entra em minúscula. */
function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export default function OwnScaleParallelCoordinates({
  data = defaultData,
  axes = defaultAxes,
  height,
  className,
}: OwnScaleParallelCoordinatesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // EST-1: sem origem, ou com menos de dois eixos, não existe linha a traçar.
  if (data.length === 0 || axes.length < 2) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem de lead neste recorte: não há métrica para comparar entre os eixos.</span>
      </div>
    );
  }

  const rows = data.map((origin) => ({ origin, values: axes.map((axis) => metricOf(origin, axis.id)) }));
  const hasGap = rows.some((row) => row.values.some((value) => value === null));
  const axisBottom = VIEW_HEIGHT - FOOT_LABEL - (hasGap ? GAP_LANE : 0);
  const laneY = axisBottom + FOOT_LABEL + GAP_LANE / 2;
  const plotHeight = axisBottom - AXIS_TOP;
  const axisStep = (VIEW_WIDTH - AXIS_LEFT - AXIS_RIGHT_PAD) / (axes.length - 1);
  const xs = axes.map((_axis, index) => AXIS_LEFT + index * axisStep);
  const lastIndex = axes.length - 1;
  const lastX = AXIS_LEFT + lastIndex * axisStep;

  // Cada eixo mede com a régua dele: o domínio sai dos valores medidos NAQUELE eixo.
  const scales = axes.map((axis, index) => {
    const domain = outwardDomain(rows.map((row) => row.values[index] ?? null).filter((value): value is number => value !== null));
    return {
      axis,
      x: AXIS_LEFT + index * axisStep,
      domain,
      minText: domain === null ? formatUnavailable() : formatTick(axis.unit, domain.min),
      maxText: domain === null ? '' : formatTick(axis.unit, domain.max),
    };
  });
  const yOf = (axisIndex: number, value: number | null): number | null => {
    const domain = scales[axisIndex]?.domain;
    if (value === null || domain === null || domain === undefined) return null;
    return axisBottom - ((value - domain.min) / (domain.max - domain.min)) * plotHeight;
  };

  const lines = rows.map((row) => {
    const ys = row.values.map((value, index) => yOf(index, value));
    const described = axes.map((axis) => `${lowerFirst(axis.label)} ${describeMetric(row.origin, axis.id)}`);
    return {
      id: row.origin.id,
      label: row.origin.label,
      ys,
      pieces: linePieces(ys, xs),
      // O nome fica na altura em que a linha toca o último eixo; sem medição ali, na faixa de ausência.
      anchorY: ys[lastIndex] ?? laneY,
      // DIC-1: a dica traz o valor de cada métrica na unidade dela, que o corpo não escreve.
      tip: `${row.origin.label}: ${described.join('; ')}.`,
    };
  });
  const ordered = [...lines].sort((a, b) => a.anchorY - b.anchorY);
  const labelYs = spreadLabels(
    ordered.map((line) => line.anchorY),
    LABEL_STEP,
    AXIS_TOP + LABEL_INSET,
    hasGap ? laneY : axisBottom,
  );
  // Linha sob o ponteiro é desenhada por último, para não ficar coberta pelas vizinhas.
  const drawOrder = [...lines].sort((a, b) => Number(a.id === hoveredId) - Number(b.id === hoveredId));

  const gapMarkers = scales.flatMap((scale, axisIndex) => {
    const missing = lines.filter((line) => line.ys[axisIndex] === null);
    return missing.map((line, k) => ({
      key: `${scale.axis.id}-${line.id}`,
      id: line.id,
      x: scale.x + (k - (missing.length - 1) / 2) * MARKER_STEP,
    }));
  });
  const gapCount = lines.filter((line) => line.ys.some((y) => y === null)).length;

  // Cada texto é calculado UMA vez e serve à linha de leitura e à frase acessível (DAD-5).
  const periodText = `${formatMonthShort(period.start)} a ${formatMonthShort(period.end)}`;
  const originsText = `${formatInt(data.length)} origens`;
  const metricsText = `${formatInt(axes.length)} métricas`;
  const gapText =
    gapCount === 0
      ? `as ${originsText} têm as ${metricsText} medidas`
      : `${formatInt(gapCount)} de ${originsText} ${gapCount === 1 ? 'tem' : 'têm'} métrica sem medição`;
  const lowerNames = joinNames(axes.filter((axis) => axis.lowerIsBetter).map((axis) => lowerFirst(axis.label)));
  const polarityText = lowerNames === '' ? '' : ` Em ${lowerNames}, menor é melhor.`;
  const summary = `Coordenadas paralelas de ${originsText} de lead em ${metricsText}, de ${periodText}, cada eixo com escala própria.${polarityText} No recorte, ${gapText}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        {scales.map((scale) => (
          <g key={scale.axis.id}>
            <line stroke={AXIS_STROKE} strokeWidth={1} x1={scale.x} x2={scale.x} y1={AXIS_TOP} y2={axisBottom} />
            <line stroke={AXIS_STROKE} strokeWidth={1} x1={scale.x - TICK_HALF} x2={scale.x + TICK_HALF} y1={AXIS_TOP} y2={AXIS_TOP} />
            <line stroke={AXIS_STROKE} strokeWidth={1} x1={scale.x - TICK_HALF} x2={scale.x + TICK_HALF} y1={axisBottom} y2={axisBottom} />
            <text className="font-medium" fill="var(--text-secondary)" fontSize={TEXT_SIZE} textAnchor="middle" x={scale.x} y={AXIS_TITLE_BASELINE}>
              {scale.axis.label}
            </text>
            {/* A polaridade vai ESCRITA: o eixo não é invertido, o topo segue sendo o maior valor. */}
            {scale.axis.lowerIsBetter ? (
              <text fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="middle" x={scale.x} y={DIRECTION_BASELINE}>
                menor é melhor
              </text>
            ) : null}
            <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="middle" x={scale.x} y={MAX_BASELINE}>
              {scale.maxText}
            </text>
            <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="middle" x={scale.x} y={axisBottom + MIN_DROP}>
              {scale.minText}
            </text>
          </g>
        ))}

        {hasGap ? (
          <g>
            <line stroke="var(--line-subtle)" strokeDasharray="2 3" strokeWidth={1} x1={AXIS_LEFT} x2={lastX} y1={laneY} y2={laneY} />
            <text fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={AXIS_LEFT - LANE_LABEL_GAP} y={laneY + TEXT_DROP}>
              {formatUnavailable()}
            </text>
          </g>
        ) : null}

        {drawOrder.map((line) => {
          const active = line.id === hoveredId;
          const stroke = active ? HOVER_STROKE : LINE_STROKE;
          return (
            <g key={line.id} onMouseEnter={() => setHoveredId(line.id)} onMouseLeave={() => setHoveredId(null)}>
              <title>{line.tip}</title>
              {line.pieces.map((piece) => {
                const first = piece[0];
                if (first === undefined) return null;
                // Trecho de um ponto só (vizinhos sem medição) vira ponto cheio: valor medido não some.
                return piece.length === 1 ? (
                  <circle cx={first.x} cy={first.y} fill={stroke} key={first.x} r={DOT_RADIUS} />
                ) : (
                  <path d={pathOf(piece)} fill="none" key={first.x} stroke={stroke} strokeLinejoin="round" strokeWidth={active ? HOVER_WIDTH : LINE_WIDTH} />
                );
              })}
              {/* Área de ponteiro: traço largo sem tinta, porque 1,5 px não se acerta com o cursor. */}
              <path d={line.pieces.map(pathOf).join(' ')} fill="none" pointerEvents="stroke" stroke="none" strokeWidth={HIT_WIDTH} />
            </g>
          );
        })}

        {/* Ausência é anel vazado na faixa de baixo; zero medido é linha que toca o pé do eixo. */}
        {gapMarkers.map((marker) => (
          <circle
            cx={marker.x}
            cy={laneY}
            fill="var(--surface-raised)"
            key={marker.key}
            r={MARKER_RADIUS}
            stroke={marker.id === hoveredId ? HOVER_STROKE : LINE_STROKE}
            strokeWidth={LINE_WIDTH}
          />
        ))}

        {ordered.map((line, index) => {
          const y = labelYs[index];
          if (y === undefined) return null;
          const active = line.id === hoveredId;
          return (
            <g key={line.id} onMouseEnter={() => setHoveredId(line.id)} onMouseLeave={() => setHoveredId(null)}>
              <line stroke={active ? HOVER_STROKE : LINE_STROKE} strokeWidth={1} x1={lastX + LEADER_GAP} x2={lastX + LEADER_LENGTH} y1={line.anchorY} y2={y} />
              <text
                className={active ? 'font-semibold' : undefined}
                fill={active ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={TEXT_SIZE}
                x={lastX + LEADER_LENGTH + LEADER_GAP}
                y={y + TEXT_DROP}
              >
                {line.label}
              </text>
            </g>
          );
        })}

        {/* Linha de leitura (ANO-5): o aviso da escala e a parte do recorte sem medição (DAD-9). */}
        <text className="tabular-nums" fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
          <tspan className="font-semibold" fill="var(--text-primary)">
            Cada eixo tem sua escala
          </tspan>
          <tspan>{`, do mínimo ao máximo rotulados. De ${periodText}, ${gapText}.`}</tspan>
        </text>
      </svg>
    </figure>
  );
}
