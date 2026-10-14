import { useState } from 'react';
import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercentFromScale100, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { axes as defaultAxes, data as defaultData, period, type OriginFunnel, type RateAxis } from './data';

/**
 * Coordenadas paralelas em SVG puro: cada taxa do funil é um eixo vertical na MESMA escala de 0 a
 * 100, e cada origem de lead é uma linha que atravessa os seis. O que se lê é o feixe: origens de
 * perfil parecido correm juntas, e o grupo à parte aparece como um feixe separado.
 *
 * TRÊS DECISÕES, e cada uma responde a uma regra medida.
 *
 * 1. A linha é o dado (ACE-6): tapada ela, ninguém sabe o perfil de origem nenhuma. Por isso sai
 *    de `--line-strong`, que mede 1,79:1 no escuro e 1,83:1 no claro, e vai em `--text-muted`,
 *    que mede 5,21:1 e 5,37:1. Continua cinza (COR-1), agora acima do piso de 3:1.
 * 2. Toda linha tem nome no desenho parado (TIP-7): a coluna da esquerda escreve as 14 origens na
 *    altura em que cada uma toca o primeiro eixo, espalhadas com passo mínimo e ligadas por linha
 *    de chamada. O texto sai do lugar; a marca fina, nunca (GEO-4), então nenhum rótulo leva halo.
 * 3. Taxa sem denominador não é taxa zero (EST-1b): o trecho da linha se encerra naquele eixo e a
 *    origem ganha um anel vazado na faixa de ausência, abaixo do pé dos eixos.
 */
export interface OriginParallelCoordinatesProps {
  readonly data?: readonly OriginFunnel[];
  /** Os eixos, na ordem de leitura. A ordem é decisão de dado e está justificada no `data.ts`. */
  readonly axes?: readonly RateAxis[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * O `viewBox` repete o CORPO medido do preset `largo` (960 x 400 menos a moldura, com o caso de
 * uso em uma linha): 894 x 281,5 px. Assim a escala do SVG sai 1 e os 11 px declarados são 11 px
 * na tela (GEO-18). Cartão de outra proporção pede outro `VIEW_HEIGHT`, nunca texto menor.
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 281.5;
const READING_BASELINE = 13;
const AXIS_TITLE_BASELINE = 40;
const AXIS_TOP = 54;
const BOTTOM_PAD = 8;
/** Faixa de ausência: só ocupa altura quando alguma taxa do recorte não tem denominador. */
const GAP_LANE = 26;
const LANE_INSET = 8;
/** Coluna de nomes à esquerda: o nome mais largo do dado mede 124 px em 11 px (soma por glifo). */
const LABEL_RIGHT = 150;
const LEADER_START = 154;
const LEADER_GAP = 4;
const AXIS_LEFT = 176;
/** À direita do último eixo ficam os níveis da escala e o rótulo da faixa de ausência (61 px). */
const AXIS_RIGHT_PAD = 80;
const LEVEL_GAP = 10;
const LABEL_STEP = 14;
const LABEL_INSET = 2;
const TICK_HALF = 3;
/** Da linha de base ao centro óptico de um texto de 11 px. */
const TEXT_DROP = 4;
const SCALE_MAX = 100;
const LEVELS = [0, 50, SCALE_MAX] as const;
const LINE_WIDTH = 1.5;
const HOVER_WIDTH = 2.5;
const HIT_WIDTH = 10;
const DOT_RADIUS = 2.5;
const MARKER_RADIUS = 3.5;
const MARKER_STEP = 9;
const TEXT_SIZE = 11;
const READING_SIZE = 12;
const NAMED_LIMIT = 3;

const LINE_STROKE = 'var(--text-muted)';
const HOVER_STROKE = 'var(--chart-1)';
const AXIS_STROKE = 'var(--line-strong)';

interface Vertex {
  readonly x: number;
  readonly y: number;
}

interface Profile {
  readonly id: string;
  readonly label: string;
  readonly mean: number;
}

interface GroupSplit {
  readonly apart: readonly Profile[];
  readonly rest: readonly Profile[];
}

/** Taxa na escala de 0 a 100. Denominador zero não é taxa zero: é ausência (EST-1b). */
function rateOf(origin: OriginFunnel, axis: RateAxis): number | null {
  const base = origin[axis.denominator];
  return base > 0 ? (origin[axis.numerator] / base) * SCALE_MAX : null;
}

function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Grupo à parte pelo MAIOR SALTO: as origens são ordenadas pela média das próprias taxas, o maior
 * vão entre vizinhas corta a fila em duas, e o lado menor é o grupo à parte. Critério de uma
 * dimensão de propósito: cabe numa frase e não muda quando a ordem dos eixos muda.
 */
function splitByLargestGap(profiles: readonly Profile[]): GroupSplit | null {
  const sorted = [...profiles].sort((a, b) => b.mean - a.mean);
  let cut = 0;
  let widest = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const above = sorted[index - 1];
    const below = sorted[index];
    if (above === undefined || below === undefined) continue;
    if (above.mean - below.mean > widest) {
      widest = above.mean - below.mean;
      cut = index;
    }
  }
  if (cut === 0) return null;
  const upper = sorted.slice(0, cut);
  const lower = sorted.slice(cut);
  return upper.length <= lower.length ? { apart: upper, rest: lower } : { apart: lower, rest: upper };
}

/** Quebra a linha onde falta valor: eixo sem taxa encerra o trecho (EIX-10), sem interpolar. */
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

export default function OriginParallelCoordinates({
  data = defaultData,
  axes = defaultAxes,
  height,
  className,
}: OriginParallelCoordinatesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // EST-1: sem origem, ou com menos de dois eixos, não existe linha a traçar.
  if (data.length === 0 || axes.length < 2) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem de lead neste recorte: não há perfil para comparar entre as taxas do funil.</span>
      </div>
    );
  }

  const rows = data.map((origin) => ({ origin, rates: axes.map((axis) => rateOf(origin, axis)) }));
  const hasGap = rows.some((row) => row.rates.some((rate) => rate === null));
  const axisBottom = VIEW_HEIGHT - BOTTOM_PAD - (hasGap ? GAP_LANE : 0);
  const laneY = axisBottom + GAP_LANE - LANE_INSET;
  const plotHeight = axisBottom - AXIS_TOP;
  const axisStep = (VIEW_WIDTH - AXIS_LEFT - AXIS_RIGHT_PAD) / (axes.length - 1);
  const xs = axes.map((_axis, index) => AXIS_LEFT + index * axisStep);
  const lastX = AXIS_LEFT + (axes.length - 1) * axisStep;
  const yOf = (rate: number): number => axisBottom - (rate / SCALE_MAX) * plotHeight;

  const lines = rows.map((row) => {
    const ys = row.rates.map((rate) => (rate === null ? null : yOf(rate)));
    const values = axes.map(
      (axis) => `${lowerFirst(axis.label)} ${formatRateWithVolume(row.origin[axis.numerator], row.origin[axis.denominator])}`,
    );
    return {
      id: row.origin.id,
      label: row.origin.label,
      ys,
      pieces: linePieces(ys, xs),
      // O nome fica na altura em que a linha toca o primeiro eixo; sem taxa ali, na faixa de ausência.
      anchorY: ys[0] ?? laneY,
      // DIC-1: a dica traz os seis valores com o volume, que o corpo não escreve.
      tip: `${row.origin.label}: ${values.join('; ')}.`,
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

  const gapMarkers = axes.flatMap((axis, axisIndex) => {
    const x = xs[axisIndex];
    if (x === undefined) return [];
    const missing = lines.filter((line) => line.ys[axisIndex] === null);
    return missing.map((line, k) => ({ key: `${axis.id}-${line.id}`, x: x + (k - (missing.length - 1) / 2) * MARKER_STEP }));
  });

  const profiles: Profile[] = [];
  for (const row of rows) {
    const value = mean(row.rates.filter((rate): rate is number => rate !== null));
    if (value !== null) profiles.push({ id: row.origin.id, label: row.origin.label, mean: value });
  }
  const split = splitByLargestGap(profiles);
  const apartIds = new Set(split === null ? [] : split.apart.map((profile) => profile.id));
  const apartMean = split === null ? null : mean(split.apart.map((profile) => profile.mean));
  const restMean = split === null ? null : mean(split.rest.map((profile) => profile.mean));

  // Cada texto é calculado UMA vez e serve à linha de leitura e à frase acessível (DAD-5).
  const monthText = formatMonthShort(period);
  const originsText = `${formatInt(data.length)} origens`;
  const ratesText = `${formatInt(axes.length)} taxas`;
  const scaleText = `de ${formatPercentFromScale100(0, 0)} a ${formatPercentFromScale100(SCALE_MAX, 0)}`;
  const apartCountText = formatInt(split === null ? 0 : split.apart.length);
  const restCountText = formatInt(split === null ? 0 : split.rest.length);
  const apartMeanText = apartMean === null ? formatUnavailable() : formatPercentFromScale100(apartMean);
  const restMeanText = restMean === null ? formatUnavailable() : formatPercentFromScale100(restMean);
  const verb = split !== null && split.apart.length === 1 ? 'forma' : 'formam';
  // A frase acessível nomeia até três origens do grupo, para não passar de 250 caracteres (ACE-1).
  const named = (split === null ? [] : split.apart.slice(0, NAMED_LIMIT)).map((profile) => lowerFirst(profile.label));
  const unnamed = (split === null ? 0 : split.apart.length) - named.length;
  const apartNames = unnamed > 0 ? `${named.join(', ')} e mais ${formatInt(unnamed)}` : joinNames(named);

  const base = `Coordenadas paralelas de ${originsText} de lead em ${ratesText} de ${monthText}, na escala ${scaleText}.`;
  const summary =
    split === null
      ? `${base} Nenhum salto na média das taxas separa um grupo à parte: as origens seguem um perfil contínuo.`
      : `${base} Grupo à parte de ${apartCountText} ${split.apart.length === 1 ? 'origem' : 'origens'}, com média de ${apartMeanText} contra ${restMeanText} nas outras ${restCountText}: ${apartNames}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        {axes.map((axis, index) => {
          const x = xs[index];
          if (x === undefined) return null;
          return (
            <g key={axis.id}>
              <line stroke={AXIS_STROKE} strokeWidth={1} x1={x} x2={x} y1={AXIS_TOP} y2={axisBottom} />
              {LEVELS.map((level) => (
                <line key={level} stroke={AXIS_STROKE} strokeWidth={1} x1={x - TICK_HALF} x2={x + TICK_HALF} y1={yOf(level)} y2={yOf(level)} />
              ))}
              <text className="font-medium" fill="var(--text-secondary)" fontSize={TEXT_SIZE} textAnchor="middle" x={x} y={AXIS_TITLE_BASELINE}>
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Escala comum: os três níveis valem para os seis eixos e são escritos uma vez, à direita. */}
        {LEVELS.map((level) => (
          <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} key={level} x={lastX + LEVEL_GAP} y={yOf(level) + TEXT_DROP}>
            {formatPercentFromScale100(level, 0)}
          </text>
        ))}

        {hasGap ? (
          <g>
            <line stroke="var(--line-subtle)" strokeDasharray="2 3" strokeWidth={1} x1={AXIS_LEFT} x2={lastX} y1={laneY} y2={laneY} />
            <text fill="var(--text-muted)" fontSize={TEXT_SIZE} x={lastX + LEVEL_GAP} y={laneY + TEXT_DROP}>
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
                // Trecho de um ponto só (vizinhos sem taxa) vira ponto cheio: valor medido não some.
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
          <circle cx={marker.x} cy={laneY} fill="var(--surface-raised)" key={marker.key} r={MARKER_RADIUS} stroke={LINE_STROKE} strokeWidth={LINE_WIDTH} />
        ))}

        {ordered.map((line, index) => {
          const y = labelYs[index];
          if (y === undefined) return null;
          const active = line.id === hoveredId;
          const strong = active || apartIds.has(line.id);
          return (
            <g key={line.id} onMouseEnter={() => setHoveredId(line.id)} onMouseLeave={() => setHoveredId(null)}>
              <line stroke={active ? HOVER_STROKE : LINE_STROKE} strokeWidth={1} x1={LEADER_START} x2={AXIS_LEFT - LEADER_GAP} y1={y} y2={line.anchorY} />
              {/* COR-2: o grupo à parte se distingue pelo peso do nome, o mesmo peso da linha de leitura. */}
              <text
                className={strong ? 'font-semibold' : undefined}
                fill={strong ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={TEXT_SIZE}
                textAnchor="end"
                x={LABEL_RIGHT}
                y={y + TEXT_DROP}
              >
                {line.label}
              </text>
            </g>
          );
        })}

        {/* Linha de leitura (ANO-5): a conclusão calculada do dado, com o período do recorte (DAD-9). */}
        <text className="tabular-nums" fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
          {split === null ? (
            <tspan>{`Em ${monthText}, ${originsText} em ${ratesText}, na escala comum ${scaleText}, sem grupo à parte.`}</tspan>
          ) : (
            <>
              <tspan>{`Em ${monthText}, `}</tspan>
              <tspan className="font-semibold" fill="var(--text-primary)">{`${apartCountText} das ${originsText}`}</tspan>
              <tspan>{` ${verb} um grupo à parte: média das ${ratesText} de ${apartMeanText}, contra ${restMeanText} nas outras ${restCountText}.`}</tspan>
            </>
          )}
        </text>
      </svg>
    </figure>
  );
}
