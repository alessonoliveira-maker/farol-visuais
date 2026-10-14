import { useState, type KeyboardEvent, type PointerEvent } from 'react';
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
import {
  axes as defaultAxes,
  brush as defaultBrush,
  data as defaultData,
  period,
  rankBy as defaultRankBy,
  type BrushRange,
  type Campaign,
  type MetricAxis,
  type MetricId,
  type MetricUnit,
} from './data';

/**
 * Coordenadas paralelas de muitas linhas com SELEÇÃO POR FAIXA: 48 campanhas em quatro eixos de
 * escala própria, e dois limites arrastáveis num eixo que acendem só as campanhas dentro da faixa.
 * O espaguete se resolve por filtro, e não por cor: o que está fora vira contexto neutro e o que
 * está dentro ganha nome e valor na lista da direita.
 *
 * CINCO DECISÕES, e cada uma responde a uma regra medida.
 *
 * 1. Fora da seleção apaga por TOKEN, nunca por opacidade (ACE-5): `--text-muted` opaco, o neutro
 *    de série de muitos elementos sem valor escrito (17.2). Contra `--chart-1` ele mede só 1,82:1 e
 *    1,12:1 (TOK-9), então a seleção engrossa e ganha revestimento em `--surface-raised` (TOK-4).
 * 2. Métrica ausente QUEBRA a linha (EIX-10): o trecho se encerra no último eixo medido, sem
 *    interpolar e sem descer ao zero, e a campanha ganha um anel vazado na faixa de ausência,
 *    abaixo do pé dos eixos. Zero medido é outra coisa: a linha TOCA o pé do eixo.
 * 3. A seleção é estado React e é operável sem ponteiro: cada limite é um `role="slider"` com as
 *    setas do teclado, e o arrasto usa a matriz do próprio SVG, então vale em qualquer escala.
 * 4. A lista da direita responde ao "quais": as selecionadas em ordem da métrica de `rankBy`, com
 *    a taxa e o volume escritos, que é o que dispensa frase de ordenação (GEO-12).
 * 5. Seleção sem campanha não apaga o gráfico: os limites continuam ali para serem abertos, e a
 *    lista dá lugar a um bloco `role="status"`. Sem dado nenhum, o vazio substitui tudo (EST-1).
 */
export interface BrushedParallelCoordinatesProps {
  readonly data?: readonly Campaign[];
  /** Os eixos, na ordem de leitura, cada um com a unidade e a polaridade. */
  readonly axes?: readonly MetricAxis[];
  /** O eixo da seleção e a faixa com que ela nasce. Os limites seguem em estado do componente. */
  readonly brush?: BrushRange;
  /** A métrica que ordena a lista das selecionadas. */
  readonly rankBy?: MetricId;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas por número no `meta.json` (960 x 454): o corpo dessa moldura mede 894 x 335,5 px e o
 * `viewBox` repete esse número, para a escala sair 1 e os 11 px declarados serem 11 px na tela
 * (GEO-18).
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 335.5;
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
/** À esquerda do primeiro eixo ficam os limites da seleção e o rótulo da faixa de ausência (61 px). */
const AXIS_LEFT = 84;
const SIDE_LABEL_GAP = 12;
/** Lista das selecionadas: 14 px de marcador, até 105 px de nome e até 103 px de taxa com volume. */
const LIST_WIDTH = 236;
/** Do último eixo à lista: metade do título do eixo (38 px) mais o respiro até o título da lista. */
const LIST_GAP = 60;
const LIST_STATUS_X = 22;
const LIST_ICON = 16;
const LIST_FIRST_ROW = 62;
const LIST_ROW = 16;
const LIST_MARKER_X = 4;
const LIST_NAME_X = 14;
const LIST_MARKER_RADIUS = 3;
const MAX_LIST_ROWS = 14;
const TICK_HALF = 3;
/** Da linha de base ao centro óptico de um texto de 11 px. */
const TEXT_DROP = 4;
const PERCENT = 100;
/** O passo do arredondamento do domínio é o passo redondo mais próximo de um décimo da amplitude. */
const DOMAIN_PARTS = 10;
/** O passo do limite da seleção, no teclado e no arrasto: cerca de 1/32 do domínio, redondo. */
const BRUSH_PARTS = 32;
const BRUSH_WIDTH = 6;
const HANDLE_RADIUS = 5.5;
/** Abaixo desta distância os dois rótulos de limite se juntam num só, para não se atropelarem. */
const MERGE_BELOW = 13;
const CONTEXT_WIDTH = 1;
const SELECTED_WIDTH = 2;
const HOVER_EXTRA = 1;
const HIT_WIDTH = 8;
const DOT_RADIUS = 2.5;
const MARKER_RADIUS = 3.5;
/** Passo entre anéis de ausência do mesmo eixo: o anel aceso mede 9 px por fora, e sobram 2 px. */
const MARKER_STEP = 11;
const TEXT_SIZE = 11;
const READING_SIZE = 12;

const SELECTED_STROKE = 'var(--chart-1)';
/** O neutro de série de muitos elementos sem valor escrito (17.2): 5,21:1 e 5,37:1 contra o cartão. */
const CONTEXT_STROKE = 'var(--text-muted)';
/** Revestimento que corta o feixe sob cada linha selecionada. */
const CUT_STROKE = 'var(--surface-raised)';
const CUT_EXTRA = 3;
/** A marca de ausência precisa ser vista mesmo fora da seleção: 5,21:1 e 5,37:1. */
const MARKER_STROKE = 'var(--text-muted)';
/** Realce do ponteiro sobre linha de contexto: token mais forte, além de 1 px a mais. */
const HOVER_STROKE = 'var(--text-secondary)';
const AXIS_STROKE = 'var(--line-strong)';

type Handle = 'min' | 'max';

interface Vertex {
  readonly x: number;
  readonly y: number;
}

interface Domain {
  readonly min: number;
  readonly max: number;
}

/**
 * O valor da campanha no eixo, na unidade do eixo (percentual na escala de 0 a 100). Divisor zero
 * não é valor zero: é ausência (EST-1b), e o ciclo já chega `null` do dado quando não foi medido.
 */
function metricOf(campaign: Campaign, id: MetricId): number | null {
  switch (id) {
    case 'costPerLead':
      return campaign.leads > 0 ? campaign.spend / campaign.leads : null;
    case 'scheduleRate':
      return campaign.qualified > 0 ? (campaign.scheduled / campaign.qualified) * PERCENT : null;
    case 'attendance':
      return campaign.scheduled > 0 ? (campaign.attended / campaign.scheduled) * PERCENT : null;
    case 'cycle':
      return campaign.cycleDays;
  }
}

/** O valor por extenso, para a lista e para a dica: taxa com o volume, moeda compacta, dias. */
function describeMetric(campaign: Campaign, id: MetricId): string {
  if (id === 'scheduleRate') return formatRateWithVolume(campaign.scheduled, campaign.qualified);
  if (id === 'attendance') return formatRateWithVolume(campaign.attended, campaign.scheduled);
  const value = metricOf(campaign, id);
  if (value === null) return formatUnavailable();
  return id === 'cycle' ? formatDays(value) : formatCurrencyCompact(value);
}

/** Rótulo de mínimo, de máximo e de limite da seleção, com a unidade no próprio rótulo (NUM-6). */
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

function clampTo(value: number, domain: Domain): number {
  return Math.min(Math.max(value, domain.min), domain.max);
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

/** Nome de eixo no meio da oração entra em minúscula. */
function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export default function BrushedParallelCoordinates({
  data = defaultData,
  axes = defaultAxes,
  brush = defaultBrush,
  rankBy = defaultRankBy,
  height,
  className,
}: BrushedParallelCoordinatesProps) {
  const [range, setRange] = useState({ min: brush.min, max: brush.max });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // EST-1: sem campanha, ou com menos de dois eixos, não existe linha a traçar.
  if (data.length === 0 || axes.length < 2) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte: não há métrica para comparar nem faixa para selecionar.</span>
      </div>
    );
  }

  const rows = data.map((campaign) => ({ campaign, values: axes.map((axis) => metricOf(campaign, axis.id)) }));
  const hasGap = rows.some((row) => row.values.some((value) => value === null));
  const axisBottom = VIEW_HEIGHT - FOOT_LABEL - (hasGap ? GAP_LANE : 0);
  const laneY = axisBottom + FOOT_LABEL + GAP_LANE / 2;
  const plotHeight = axisBottom - AXIS_TOP;
  const listX = VIEW_WIDTH - LIST_WIDTH;
  const lastIndex = axes.length - 1;
  const axisStep = (listX - LIST_GAP - AXIS_LEFT) / lastIndex;
  const xs = axes.map((_axis, index) => AXIS_LEFT + index * axisStep);
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

  const brushIndex = axes.findIndex((axis) => axis.id === brush.axisId);
  const brushScale = brushIndex < 0 ? undefined : scales[brushIndex];
  const brushDomain = brushScale === undefined ? null : brushScale.domain;
  const brushStep = brushDomain === null ? 1 : niceStep((brushDomain.max - brushDomain.min) / BRUSH_PARTS);

  const lines = rows.map((row) => {
    const ys = row.values.map((value, index) => yOf(index, value));
    const brushed = brushIndex < 0 ? null : (row.values[brushIndex] ?? null);
    const described = axes.map((axis) => `${lowerFirst(axis.label)} ${describeMetric(row.campaign, axis.id)}`);
    return {
      id: row.campaign.id,
      label: row.campaign.label,
      campaign: row.campaign,
      ys,
      pieces: linePieces(ys, xs),
      // Campanha sem valor no eixo da seleção nunca entra na faixa: ausência não é zero.
      selected: brushed !== null && brushed >= range.min && brushed <= range.max,
      incomplete: ys.some((y) => y === null),
      rank: metricOf(row.campaign, rankBy),
      // DIC-1: a dica traz o valor de cada métrica na unidade dela, que o corpo não escreve.
      tip: `${row.campaign.label}: ${described.join('; ')}.`,
    };
  });
  // Contexto primeiro, seleção por cima e a linha sob o ponteiro por último dentro do seu grupo.
  const drawRank = (line: (typeof lines)[number]): number => (line.selected ? 2 : 0) + (line.id === hoveredId ? 1 : 0);
  const drawOrder = [...lines].sort((a, b) => drawRank(a) - drawRank(b));

  const rankAxis = axes.find((axis) => axis.id === rankBy);
  const rankAscending = rankAxis !== undefined && rankAxis.lowerIsBetter;
  const selected = lines
    .filter((line) => line.selected)
    .sort((a, b) => {
      if (a.rank === null || b.rank === null) return Number(a.rank === null) - Number(b.rank === null);
      return rankAscending ? a.rank - b.rank : b.rank - a.rank;
    });
  const listed = selected.slice(0, MAX_LIST_ROWS);
  const leader = selected[0];

  const gapByAxis = scales.map((scale, index) => ({
    axis: scale.axis,
    x: scale.x,
    missing: lines.filter((line) => line.ys[index] === null),
  }));
  let worstSoFar: (typeof gapByAxis)[number] | null = null;
  for (const item of gapByAxis) {
    if (item.missing.length === 0) continue;
    if (worstSoFar === null || item.missing.length > worstSoFar.missing.length) worstSoFar = item;
  }
  const worstGap = worstSoFar;
  const gapMarkers = gapByAxis
    .flatMap((item) =>
      item.missing.map((line, k) => ({
        key: `${item.axis.id}-${line.id}`,
        selected: line.selected,
        x: item.x + (k - (item.missing.length - 1) / 2) * MARKER_STEP,
      })),
    )
    .sort((a, b) => Number(a.selected) - Number(b.selected));
  // A faixa de ausência vai até o último anel: com muitos anéis no último eixo, a fila passa dele.
  const laneEnd = gapMarkers.reduce((far, marker) => Math.max(far, marker.x), lastX);

  // Cada texto é calculado UMA vez e serve ao corpo e à frase acessível (DAD-5).
  const periodText = `${formatMonthShort(period.start)} a ${formatMonthShort(period.end)}`;
  const campaignsText = `${formatInt(data.length)} campanhas`;
  const metricsText = `${formatInt(axes.length)} métricas`;
  const selectedCountText = formatInt(selected.length);
  const hiddenText = `mais ${formatInt(selected.length - listed.length)} na seleção`;
  const minText = brushScale === undefined ? '' : formatTick(brushScale.axis.unit, range.min);
  const maxText = brushScale === undefined ? '' : formatTick(brushScale.axis.unit, range.max);
  const rangeText = `faixa de ${minText} a ${maxText} de ${brushScale === undefined ? '' : lowerFirst(brushScale.axis.label)}`;
  const rankName = rankAxis === undefined ? '' : lowerFirst(rankAxis.label);
  const gapText =
    worstGap === null
      ? `as ${campaignsText} têm as ${metricsText} medidas`
      : `${formatInt(worstGap.missing.length)} de ${campaignsText} ${worstGap.axis.missingLabel}`;
  const selectedGapText = formatInt(worstGap === null ? 0 : worstGap.missing.filter((line) => line.selected).length);
  const readingTail =
    selected.length === 0
      ? `; na ${rangeText}, nenhuma campanha.`
      : worstGap === null
        ? `; na ${rangeText}, ${selectedCountText} selecionadas.`
        : `; na ${rangeText}, ${selectedGapText} das ${selectedCountText} selecionadas.`;
  const selectionSentence =
    leader === undefined
      ? ` Nenhuma campanha na ${rangeText}.`
      : ` Na ${rangeText} ${selected.length === 1 ? 'fica' : 'ficam'} ${selectedCountText}. ${leader.label} lidera em ${rankName}, com ${describeMetric(leader.campaign, rankBy)}.`;
  const gapSentence = worstGap === null ? `Todas as ${campaignsText} têm as ${metricsText} medidas` : gapText;
  const summary = `Coordenadas paralelas de ${campaignsText} em ${metricsText}, de ${periodText}.${selectionSentence} ${gapSentence}.`;

  const moveHandle = (handle: Handle, value: number): void => {
    setRange((current) =>
      handle === 'min'
        ? { min: Math.min(value, current.max), max: current.max }
        : { min: current.min, max: Math.max(value, current.min) },
    );
  };
  const stepWithKeyboard = (event: KeyboardEvent<SVGCircleElement>, handle: Handle): void => {
    if (brushDomain === null) return;
    const current = handle === 'min' ? range.min : range.max;
    let next: number | null = null;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') next = current + brushStep;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') next = current - brushStep;
    else if (event.key === 'Home') next = brushDomain.min;
    else if (event.key === 'End') next = brushDomain.max;
    if (next === null) return;
    event.preventDefault();
    moveHandle(handle, clampTo(next, brushDomain));
  };
  // O arrasto lê a matriz do próprio SVG: vale com o cartão em qualquer tamanho, sem medir a janela.
  const dragWithPointer = (event: PointerEvent<SVGCircleElement>, handle: Handle): void => {
    if (brushDomain === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const matrix = event.currentTarget.ownerSVGElement?.getScreenCTM();
    if (matrix === null || matrix === undefined || matrix.d === 0) return;
    const y = (event.clientY - matrix.f) / matrix.d;
    const raw = brushDomain.min + ((axisBottom - y) / plotHeight) * (brushDomain.max - brushDomain.min);
    moveHandle(handle, clampTo(Math.round(raw / brushStep) * brushStep, brushDomain));
  };

  const yMax = brushDomain === null ? null : yOf(brushIndex, clampTo(range.max, brushDomain));
  const yMin = brushDomain === null ? null : yOf(brushIndex, clampTo(range.min, brushDomain));
  const handles =
    brushScale === undefined || brushDomain === null || yMax === null || yMin === null
      ? []
      : [
          { handle: 'max' as const, y: yMax, value: range.max, text: maxText, name: `Limite superior de ${lowerFirst(brushScale.axis.label)}` },
          { handle: 'min' as const, y: yMin, value: range.min, text: minText, name: `Limite inferior de ${lowerFirst(brushScale.axis.label)}` },
        ].map((item) => ({ ...item, x: brushScale.x, low: brushDomain.min, high: brushDomain.max }));
  const listTitle = `${selectedCountText} de ${formatInt(data.length)} selecionadas`;
  // Os limites só são escritos ao lado quando o eixo da seleção é o primeiro: ali a margem esquerda
  // está livre. Num eixo do meio o rótulo cairia sobre as linhas, e a faixa segue na linha de leitura.
  const sideLabels =
    brushIndex !== 0 || yMax === null || yMin === null
      ? []
      : yMin - yMax < MERGE_BELOW
        ? [{ key: 'range', y: (yMin + yMax) / 2, text: `${minText} a ${maxText}` }]
        : [
            { key: 'max', y: yMax, text: maxText },
            { key: 'min', y: yMin, text: minText },
          ];

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg className="h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        <g aria-hidden>
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
              <line stroke="var(--line-subtle)" strokeDasharray="2 3" strokeWidth={1} x1={AXIS_LEFT} x2={laneEnd} y1={laneY} y2={laneY} />
              <text fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={AXIS_LEFT - SIDE_LABEL_GAP} y={laneY + TEXT_DROP}>
                {formatUnavailable()}
              </text>
            </g>
          ) : null}

          {drawOrder.map((line) => {
            const active = line.id === hoveredId;
            const stroke = line.selected ? SELECTED_STROKE : active ? HOVER_STROKE : CONTEXT_STROKE;
            const width = (line.selected ? SELECTED_WIDTH : CONTEXT_WIDTH) + (active ? HOVER_EXTRA : 0);
            return (
              <g key={line.id} onMouseEnter={() => setHoveredId(line.id)} onMouseLeave={() => setHoveredId(null)}>
                <title>{line.tip}</title>
                {line.selected
                  ? line.pieces.map((piece) => {
                      const first = piece[0];
                      if (first === undefined || piece.length === 1) return null;
                      return <path d={pathOf(piece)} fill="none" key={first.x} stroke={CUT_STROKE} strokeLinejoin="round" strokeWidth={SELECTED_WIDTH + CUT_EXTRA} />;
                    })
                  : null}
                {line.pieces.map((piece) => {
                  const first = piece[0];
                  if (first === undefined) return null;
                  // Trecho de um ponto só (vizinhos sem medição) vira ponto cheio: valor medido não some.
                  return piece.length === 1 ? (
                    <circle cx={first.x} cy={first.y} fill={stroke} key={first.x} r={DOT_RADIUS} />
                  ) : (
                    <path d={pathOf(piece)} fill="none" key={first.x} stroke={stroke} strokeLinejoin="round" strokeWidth={width} />
                  );
                })}
                {/* Área de ponteiro: traço largo sem tinta, porque 1 px não se acerta com o cursor. */}
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
              stroke={marker.selected ? SELECTED_STROKE : MARKER_STROKE}
              strokeWidth={marker.selected ? SELECTED_WIDTH : 1.5}
            />
          ))}

          {/* A faixa selecionada, sobre o próprio eixo; os limites arrastáveis vêm fora do aria-hidden. */}
          {brushScale === undefined || yMax === null || yMin === null ? null : (
            <line stroke={SELECTED_STROKE} strokeLinecap="round" strokeWidth={BRUSH_WIDTH} x1={brushScale.x} x2={brushScale.x} y1={yMax} y2={yMin} />
          )}
          {sideLabels.map((label) => (
            <text className="tabular-nums font-semibold" fill="var(--text-primary)" fontSize={TEXT_SIZE} key={label.key} textAnchor="end" x={AXIS_LEFT - SIDE_LABEL_GAP} y={label.y + TEXT_DROP}>
              {label.text}
            </text>
          ))}

          {/* Linha de leitura (ANO-5): a parte do recorte sem medição e o que a faixa pega dela. */}
          <text className="tabular-nums" fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
            <tspan>{`De ${periodText}, `}</tspan>
            <tspan className="font-semibold" fill="var(--text-primary)">
              {gapText}
            </tspan>
            <tspan>{readingTail}</tspan>
          </text>
        </g>

        {/* Cada limite é um controle deslizante: arrasto com o ponteiro, setas, Home e End no teclado. */}
        {handles.map((item) => (
          <circle
            aria-label={item.name}
            aria-orientation="vertical"
            aria-valuemax={item.high}
            aria-valuemin={item.low}
            aria-valuenow={item.value}
            aria-valuetext={item.text}
            className="cursor-ns-resize touch-none"
            cx={item.x}
            cy={item.y}
            fill="var(--surface-raised)"
            key={item.handle}
            onKeyDown={(event) => stepWithKeyboard(event, item.handle)}
            onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
            onPointerMove={(event) => dragWithPointer(event, item.handle)}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            r={HANDLE_RADIUS}
            role="slider"
            stroke={SELECTED_STROKE}
            strokeWidth={SELECTED_WIDTH}
            tabIndex={0}
          />
        ))}

        {/* A lista responde ao "quais": fica fora do aria-hidden, porque nomes e taxas só existem aqui. */}
        <text className="tabular-nums font-semibold" fill="var(--text-primary)" fontSize={TEXT_SIZE} x={listX} y={AXIS_TITLE_BASELINE}>
          {listTitle}
        </text>
        <text fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={VIEW_WIDTH} y={AXIS_TITLE_BASELINE}>
          {rankName}
        </text>
        {listed.length === 0 ? (
          <g role="status">
            <Filter aria-hidden className="text-text-muted" height={LIST_ICON} width={LIST_ICON} x={listX} y={LIST_FIRST_ROW - LIST_ICON + TEXT_DROP} />
            <text fill="var(--text-muted)" fontSize={TEXT_SIZE} y={LIST_FIRST_ROW}>
              <tspan x={listX + LIST_STATUS_X}>Nenhuma campanha nesta faixa: </tspan>
              <tspan dy={LIST_ROW} x={listX + LIST_STATUS_X}>
                arraste um limite ou use as setas{' '}
              </tspan>
              <tspan dy={LIST_ROW} x={listX + LIST_STATUS_X}>
                do teclado para abrir a seleção.
              </tspan>
            </text>
          </g>
        ) : (
          listed.map((line, index) => {
            const y = LIST_FIRST_ROW + index * LIST_ROW;
            const active = line.id === hoveredId;
            return (
              <g key={line.id} onMouseEnter={() => setHoveredId(line.id)} onMouseLeave={() => setHoveredId(null)}>
                {/* O marcador repete a forma do desenho: cheio com tudo medido, anel com métrica ausente. */}
                <circle
                  aria-hidden
                  cx={listX + LIST_MARKER_X}
                  cy={y - TEXT_DROP}
                  fill={line.incomplete ? 'var(--surface-raised)' : SELECTED_STROKE}
                  r={LIST_MARKER_RADIUS}
                  stroke={SELECTED_STROKE}
                  strokeWidth={1.5}
                />
                <text
                  className={cn('tabular-nums', active && 'font-semibold')}
                  fill={active ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={TEXT_SIZE}
                  x={listX + LIST_NAME_X}
                  y={y}
                >
                  {line.label}
                </text>
                <text className="tabular-nums" fill="var(--text-primary)" fontSize={TEXT_SIZE} textAnchor="end" x={VIEW_WIDTH} y={y}>
                  {describeMetric(line.campaign, rankBy)}
                </text>
              </g>
            );
          })
        )}
        {selected.length > listed.length ? (
          <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={listX + LIST_NAME_X} y={LIST_FIRST_ROW + listed.length * LIST_ROW}>
            {hiddenText}
          </text>
        ) : null}
      </svg>
    </figure>
  );
}
