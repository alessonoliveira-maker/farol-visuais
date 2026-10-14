import { Fragment, useState, type KeyboardEvent } from 'react';
import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercentFromScale100, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  axes as defaultAxes,
  data as defaultData,
  highlightId as defaultHighlightId,
  period,
  type OriginFunnel,
  type RateAxis,
} from './data';

/**
 * Coordenadas paralelas com UMA origem em foco: as seis taxas do funil na mesma escala de 0 a 100,
 * a origem em foco em `--chart-1` com 2,5 px e desenhada por último, e as outras como contexto.
 * A pergunta é em que taxas o foco se descola, então cada eixo ganha o traço da MEDIANA das outras
 * origens, e o eixo de maior distância ganha a barra que mede o vão e a anotação com os dois números.
 *
 * QUATRO DECISÕES, e cada uma responde a uma regra medida.
 *
 * 1. O contexto apaga por TOKEN, nunca por opacidade (ACE-5): `--text-muted` opaco, o neutro de
 *    série de muitos elementos sem valor escrito (17.2), a 5,21:1 e 5,37:1 contra o cartão. Contra
 *    `--chart-1` ele mede só 1,82:1 e 1,12:1 (TOK-9): quem separa é o revestimento em
 *    `--surface-raised` sob o foco e sob a mediana (9,50:1 e 6,00:1 contra `--chart-1`, TOK-4).
 * 2. O destaque não mora só na cor (COR-2): espessura maior, ponto em cada eixo, nome em peso 700
 *    e o valor escrito no cabeçalho de cada eixo.
 * 3. O valor do foco fica numa pista FORA do plano, sob o título do eixo (GEO-4): junto do ponto
 *    ele cairia em cima das linhas de contexto, e halo em traço de 1,5 px apaga a marca.
 * 4. A coluna de nomes é a lista lateral: cada nome é um botão com `aria-pressed`, e o clique no
 *    nome ou na linha troca o foco, em estado React.
 */
export interface FocusedOriginParallelCoordinatesProps {
  readonly data?: readonly OriginFunnel[];
  /** Os eixos, na ordem de leitura. A ordem é decisão de dado e está justificada no `data.ts`. */
  readonly axes?: readonly RateAxis[];
  /** A origem que nasce em foco. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas por número no `meta.json` (960 x 430): o corpo dessa moldura mede 894 x 311,5 px e o
 * `viewBox` repete esse número, para a escala sair 1 e os 11 px declarados serem 11 px na tela
 * (GEO-18). São 30 px a mais que o preset `largo`, gastos nas duas linhas novas do cabeçalho.
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 311.5;
const READING_BASELINE = 13;
const AXIS_TITLE_BASELINE = 40;
/** Pista do valor do foco, uma linha sob o título de cada eixo. */
const VALUE_BASELINE = 54;
/** Pista da anotação, só no eixo de maior distância. Nenhum outro texto mora nesta linha. */
const NOTE_BASELINE = 69;
const NOTE_SHIFT = 40;
const AXIS_TOP = 82;
const BOTTOM_PAD = 8;
/** Faixa de ausência: só ocupa altura quando alguma taxa do recorte não tem denominador. */
const GAP_LANE = 26;
const LANE_INSET = 8;
/** Coluna de nomes à esquerda: o nome mais largo do dado mede 124 px em 11 px (soma por glifo). */
const LABEL_RIGHT = 150;
const LABEL_HIT_WIDTH = 150;
const LEADER_START = 158;
const LEADER_GAP = 4;
const AXIS_LEFT = 176;
/** À direita do último eixo ficam os níveis da escala e o rótulo da faixa de ausência (61 px). */
const AXIS_RIGHT_PAD = 80;
const LEVEL_GAP = 10;
const LABEL_STEP = 14;
const LABEL_INSET = 2;
const TICK_HALF = 3;
const MEDIAN_HALF = 7;
const MEDIAN_WIDTH = 2;
const SPAN_WIDTH = 3;
/** Legenda do traço de mediana, na linha da leitura: 12 px de amostra e 158 px de texto. */
const LEGEND_X = 706;
const LEGEND_SWATCH = 12;
const LEGEND_TEXT_GAP = 6;
/** Da linha de base ao centro óptico de um texto de 11 px. */
const TEXT_DROP = 4;
const SCALE_MAX = 100;
const LEVELS = [0, 50, SCALE_MAX] as const;
const CONTEXT_WIDTH = 1.5;
const FOCUS_WIDTH = 2.5;
const FOCUS_DOT = 3.5;
const HIT_WIDTH = 10;
const DOT_RADIUS = 2.5;
const MARKER_RADIUS = 3.5;
const MARKER_STEP = 9;
const TEXT_SIZE = 11;
const READING_SIZE = 12;

const FOCUS_STROKE = 'var(--chart-1)';
/** O neutro de série de muitos elementos sem valor escrito (17.2): 5,21:1 e 5,37:1 contra o cartão. */
const CONTEXT_STROKE = 'var(--text-muted)';
/** Revestimento que corta o feixe sob o foco e sob a mediana. */
const CUT_STROKE = 'var(--surface-raised)';
const CUT_EXTRA = 3;
const RING_STROKE = 'var(--ring)';
/** Referência que precisa ser vista por cima do contexto: mediana, barra do vão, chamada, anel. */
const REFERENCE_STROKE = 'var(--text-muted)';
const AXIS_STROKE = 'var(--line-strong)';

interface Vertex {
  readonly x: number;
  readonly y: number;
}

/** Taxa na escala de 0 a 100. Denominador zero não é taxa zero: é ausência (EST-1b). */
function rateOf(origin: OriginFunnel, axis: RateAxis): number | null {
  const base = origin[axis.denominator];
  return base > 0 ? (origin[axis.numerator] / base) * SCALE_MAX : null;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  const lower = sorted[middle - 1];
  if (upper === undefined) return null;
  return sorted.length % 2 === 1 || lower === undefined ? upper : (lower + upper) / 2;
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

/** Nome de origem ou de eixo no meio da oração entra em minúscula. */
function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export default function FocusedOriginParallelCoordinates({
  data = defaultData,
  axes = defaultAxes,
  highlightId = defaultHighlightId,
  height,
  className,
}: FocusedOriginParallelCoordinatesProps) {
  const [focusId, setFocusId] = useState(highlightId);

  // EST-1: sem origem, ou com menos de dois eixos, não existe linha a traçar.
  if (data.length === 0 || axes.length < 2) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem de lead neste recorte: não há perfil para pôr em foco nem mediana para comparar.</span>
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
      focused: row.origin.id === focusId,
      ys,
      pieces: linePieces(ys, xs),
      // O nome fica na altura em que a linha toca o primeiro eixo; sem taxa ali, na faixa de ausência.
      anchorY: ys[0] ?? laneY,
      // DIC-1: a dica traz os seis valores com o volume, que o corpo só escreve para o foco.
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

  const gapMarkers = axes.flatMap((axis, axisIndex) => {
    const x = xs[axisIndex];
    if (x === undefined) return [];
    const missing = lines.filter((line) => line.ys[axisIndex] === null);
    return missing.map((line, k) => ({
      key: `${axis.id}-${line.id}`,
      focused: line.focused,
      x: x + (k - (missing.length - 1) / 2) * MARKER_STEP,
    }));
  });

  // A base de comparação é a mediana das OUTRAS origens, eixo a eixo: o foco não entra nela.
  const focusRow = rows.find((row) => row.origin.id === focusId);
  const others = rows.filter((row) => row.origin.id !== focusId);
  const comparisons = axes.map((axis, index) => {
    const reference = median(others.map((row) => row.rates[index] ?? null).filter((rate): rate is number => rate !== null));
    const focusRate = focusRow?.rates[index] ?? null;
    return {
      axis,
      x: AXIS_LEFT + index * axisStep,
      reference,
      focusRate,
      distance: reference === null || focusRate === null ? null : focusRate - reference,
      valueText:
        focusRow === undefined ? '' : formatRateWithVolume(focusRow.origin[axis.numerator], focusRow.origin[axis.denominator]),
    };
  });
  let widestSoFar: (typeof comparisons)[number] | null = null;
  for (const comparison of comparisons) {
    if (comparison.distance === null) continue;
    if (widestSoFar === null || widestSoFar.distance === null || Math.abs(comparison.distance) > Math.abs(widestSoFar.distance)) {
      widestSoFar = comparison;
    }
  }
  const widest = widestSoFar;
  const widestIndex = widest === null ? -1 : comparisons.indexOf(widest);
  // A anotação mora numa linha só dela; nos eixos das pontas ela ancora para dentro do corpo.
  const noteAnchor = widestIndex <= 0 ? 'start' : widestIndex >= axes.length - 1 ? 'end' : 'middle';
  const noteShift = noteAnchor === 'start' ? -NOTE_SHIFT : noteAnchor === 'end' ? NOTE_SHIFT : 0;

  // Cada texto é calculado UMA vez e serve ao corpo e à frase acessível (DAD-5).
  const monthText = formatMonthShort(period);
  const originsText = `${formatInt(data.length)} origens`;
  const ratesText = `${formatInt(axes.length)} taxas`;
  const othersText = formatInt(others.length);
  const aboveText = formatInt(comparisons.filter((item) => item.distance !== null && item.distance > 0).length);
  const measuredText = formatInt(comparisons.filter((item) => item.distance !== null).length);
  const widestFocusText = widest === null || widest.focusRate === null ? formatUnavailable() : formatPercentFromScale100(widest.focusRate);
  const widestReferenceText = widest === null || widest.reference === null ? formatUnavailable() : formatPercentFromScale100(widest.reference);
  const focusLabel = focusRow === undefined ? '' : focusRow.origin.label;
  // O período do recorte vai onde o número aparece, e não só na frase acessível (DAD-9).
  const claim = ` supera a mediana das outras ${othersText} origens em ${aboveText} das ${measuredText} taxas de ${monthText}.`;
  const legendText = focusRow === undefined ? `mediana das ${originsText}` : `mediana das outras ${othersText} origens`;
  // ANO-2 e a pergunta da anotação sem dono: ela diz sozinha de quem é cada número, foco primeiro.
  const noteText = `${widest === null ? '' : widest.axis.label} ${widestFocusText}, mediana ${widestReferenceText}`;
  const base = `Coordenadas paralelas de ${originsText} de lead em ${ratesText}`;
  const widestSentence =
    widest === null ? '' : ` Maior distância em ${lowerFirst(widest.axis.label)}, ${widestFocusText} contra mediana de ${widestReferenceText}.`;
  const summary =
    focusRow === undefined
      ? `${base} de ${monthText}, na escala de ${formatPercentFromScale100(0, 0)} a ${formatPercentFromScale100(SCALE_MAX, 0)} e sem origem em foco: escolha um nome na coluna lateral.`
      : `${base}, com ${lowerFirst(focusLabel)} em foco:${claim}${widestSentence}`;

  const pressWithKeyboard = (event: KeyboardEvent<SVGGElement>, id: string): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setFocusId(id);
  };

  const renderLine = (line: (typeof lines)[number]) => {
    const stroke = line.focused ? FOCUS_STROKE : CONTEXT_STROKE;
    return (
      <g className="cursor-pointer" key={line.id} onClick={() => setFocusId(line.id)}>
        <title>{line.tip}</title>
        {line.focused
          ? line.pieces.map((piece) => {
              const first = piece[0];
              if (first === undefined || piece.length === 1) return null;
              return <path d={pathOf(piece)} fill="none" key={first.x} stroke={CUT_STROKE} strokeLinejoin="round" strokeWidth={FOCUS_WIDTH + CUT_EXTRA} />;
            })
          : null}
        {line.pieces.map((piece) => {
          const first = piece[0];
          if (first === undefined) return null;
          // Trecho de um ponto só (vizinhos sem taxa) vira ponto cheio: valor medido não some.
          return piece.length === 1 ? (
            <circle cx={first.x} cy={first.y} fill={stroke} key={first.x} r={DOT_RADIUS} />
          ) : (
            <path d={pathOf(piece)} fill="none" key={first.x} stroke={stroke} strokeLinejoin="round" strokeWidth={line.focused ? FOCUS_WIDTH : CONTEXT_WIDTH} />
          );
        })}
        {/* Área de ponteiro: traço largo sem tinta, porque 1,5 px não se acerta com o cursor. */}
        <path d={line.pieces.map(pathOf).join(' ')} fill="none" pointerEvents="stroke" stroke="none" strokeWidth={HIT_WIDTH} />
        {line.focused
          ? line.pieces.flat().map((vertex) => (
              <circle cx={vertex.x} cy={vertex.y} fill={FOCUS_STROKE} key={vertex.x} r={FOCUS_DOT} stroke="var(--surface-raised)" strokeWidth={1.5} />
            ))
          : null}
      </g>
    );
  };

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg className="h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        <g aria-hidden>
          {comparisons.map((item, index) => (
            <g key={item.axis.id}>
              <line stroke={AXIS_STROKE} strokeWidth={1} x1={item.x} x2={item.x} y1={AXIS_TOP} y2={axisBottom} />
              {LEVELS.map((level) => (
                <line key={level} stroke={AXIS_STROKE} strokeWidth={1} x1={item.x - TICK_HALF} x2={item.x + TICK_HALF} y1={yOf(level)} y2={yOf(level)} />
              ))}
              <text className="font-medium" fill="var(--text-secondary)" fontSize={TEXT_SIZE} textAnchor="middle" x={item.x} y={AXIS_TITLE_BASELINE}>
                {item.axis.label}
              </text>
              {/* TIP-3: o 700 fica no valor do eixo de maior distância e no nome do foco; os demais em 600. */}
              <text
                className={cn('tabular-nums', index === widestIndex ? 'font-bold' : 'font-semibold')}
                fill="var(--text-primary)"
                fontSize={TEXT_SIZE}
                textAnchor="middle"
                x={item.x}
                y={VALUE_BASELINE}
              >
                {item.valueText}
              </text>
            </g>
          ))}

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

          {/* Contexto primeiro, referência por cima dele e foco por último: nada cobre a linha acesa. */}
          {lines.filter((line) => !line.focused).map(renderLine)}
          {comparisons.map((item) =>
            item.reference === null ? null : (
              <g key={item.axis.id}>
                <line
                  stroke={CUT_STROKE}
                  strokeWidth={MEDIAN_WIDTH + CUT_EXTRA}
                  x1={item.x - MEDIAN_HALF - 1}
                  x2={item.x + MEDIAN_HALF + 1}
                  y1={yOf(item.reference)}
                  y2={yOf(item.reference)}
                />
                <line
                  stroke={REFERENCE_STROKE}
                  strokeWidth={MEDIAN_WIDTH}
                  x1={item.x - MEDIAN_HALF}
                  x2={item.x + MEDIAN_HALF}
                  y1={yOf(item.reference)}
                  y2={yOf(item.reference)}
                />
              </g>
            ),
          )}
          {widest === null || widest.focusRate === null || widest.reference === null ? null : (
            <g>
              <line stroke={CUT_STROKE} strokeWidth={SPAN_WIDTH + CUT_EXTRA} x1={widest.x} x2={widest.x} y1={yOf(widest.focusRate)} y2={yOf(widest.reference)} />
              <line stroke={REFERENCE_STROKE} strokeWidth={SPAN_WIDTH} x1={widest.x} x2={widest.x} y1={yOf(widest.focusRate)} y2={yOf(widest.reference)} />
            </g>
          )}
          {lines.filter((line) => line.focused).map(renderLine)}

          {/* Ausência é anel vazado na faixa de baixo; zero medido é linha que toca o pé do eixo. */}
          {gapMarkers.map((marker) => (
            <circle
              cx={marker.x}
              cy={laneY}
              fill="var(--surface-raised)"
              key={marker.key}
              r={MARKER_RADIUS}
              stroke={marker.focused ? FOCUS_STROKE : REFERENCE_STROKE}
              strokeWidth={marker.focused ? FOCUS_WIDTH : CONTEXT_WIDTH}
            />
          ))}

          {/* ROT-4: a amostra tem a forma da marca que ela nomeia, o traço horizontal da mediana. */}
          <line
            stroke={REFERENCE_STROKE}
            strokeWidth={MEDIAN_WIDTH}
            x1={LEGEND_X}
            x2={LEGEND_X + LEGEND_SWATCH}
            y1={READING_BASELINE - TEXT_DROP}
            y2={READING_BASELINE - TEXT_DROP}
          />
          <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={LEGEND_X + LEGEND_SWATCH + LEGEND_TEXT_GAP} y={READING_BASELINE}>
            {legendText}
          </text>

          {/* Linha de leitura (ANO-5): em quantas taxas o foco passa da mediana das outras. */}
          {focusRow === undefined ? null : (
            <text className="tabular-nums" fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
              <tspan className="font-semibold" fill="var(--text-primary)">
                {focusLabel}
              </tspan>
              <tspan>{claim}</tspan>
            </text>
          )}

          {focusRow === undefined || widest === null ? null : (
            <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor={noteAnchor} x={widest.x + noteShift} y={NOTE_BASELINE}>
              {noteText}
            </text>
          )}
        </g>

        {/* A coluna de nomes é a lista lateral: cada nome é um botão, e o foco vai em `aria-pressed`. */}
        {ordered.map((line, index) => {
          const y = labelYs[index];
          if (y === undefined) return null;
          return (
            <Fragment key={line.id}>
              {/* A chamada fica fora do botão: a caixa dele é só a linha do nome (ROT-7, ESP-3). */}
              <line
                aria-hidden
                stroke={line.focused ? FOCUS_STROKE : REFERENCE_STROKE}
                strokeWidth={line.focused ? CONTEXT_WIDTH : 1}
                x1={LEADER_START}
                x2={AXIS_LEFT - LEADER_GAP}
                y1={y}
                y2={line.anchorY}
              />
              <g
                aria-label={line.label}
                aria-pressed={line.focused}
                className="group cursor-pointer"
                onClick={() => setFocusId(line.id)}
                onKeyDown={(event) => pressWithKeyboard(event, line.id)}
                role="button"
                style={{ outline: 'none' }}
                tabIndex={0}
              >
                <rect fill="none" height={LABEL_STEP} pointerEvents="all" width={LABEL_HIT_WIDTH} x={LABEL_RIGHT - LABEL_HIT_WIDTH} y={y - LABEL_STEP / 2} />
                {/* Indicador de foco de teclado dentro da linha do nome, só em :focus-visible. */}
                <rect className="opacity-0 group-focus-visible:opacity-100" fill={RING_STROKE} height={12} width={3} x={LABEL_RIGHT + 2} y={y - 6} />
                <text
                  className={line.focused ? 'font-bold' : undefined}
                  fill={line.focused ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={TEXT_SIZE}
                  textAnchor="end"
                  x={LABEL_RIGHT}
                  y={y + TEXT_DROP}
                >
                  {line.label}
                </text>
              </g>
            </Fragment>
          );
        })}
      </svg>
    </figure>
  );
}
