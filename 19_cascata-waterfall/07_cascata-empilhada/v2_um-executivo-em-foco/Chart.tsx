import type { ReactElement } from 'react';

import { formatInt, formatMonthLong, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, parts as defaultParts, period as defaultPeriod, type BridgeStep, type Part } from './data';

/** Cascata da carteira do mês com um executivo aceso: os demais ficam em neutro e o aceso fica na base de cada passo. */
export interface StackedBridgeProps {
  readonly data?: readonly BridgeStep[];
  readonly parts?: readonly Part[];
  readonly period?: string;
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas `largo`, corpo 894 x 281,5 px (seção 13). Descontados a linha de leitura e a legenda
 * (2 x 24 px), o SVG tem 894 x 233 px: o viewBox é do tamanho dele, então a escala é 1 e o texto
 * escreve nos 11 e 12 px declarados (GEO-18). Seis colunas em 878 px dão banda de 146 px.
 */
const VIEW_W = 894;
const VIEW_H = 233;
const PAD_X = 8;
const LABEL_ROOM = 28;
const AXIS_ROOM = 28;
const BAR_W = 40;
const SEPARATOR = 1.5;
const LABEL_GAP = 8;
const CHAR_W = 7;
const ARROW = 6;
const FOCUS_FILL = 'var(--chart-1)';
/** Neutro dos demais em --text-muted (17.2: marca sem número próprio), desvio declarado no `notes`. */
const OTHER_FILL = 'var(--text-muted)';
const LEVEL_H = 3;
/** Passos que contam a conversão (ganhos sobre ganhos mais perdas), pelo `id` do dado. */
const WON_ID = 'ganhos';
const LOST_ID = 'perdas';
const NOTE_GAP = 6;

interface Segment {
  readonly part: Part;
  readonly value: number;
  readonly low: number;
  readonly high: number;
}

interface Block {
  readonly step: BridgeStep;
  readonly net: number;
  readonly end: number;
  readonly low: number;
  readonly high: number;
  readonly segments: readonly Segment[];
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signed(value: number): string {
  if (value === 0) return formatInt(0);
  return `${value > 0 ? '+' : '−'}${formatInt(Math.abs(value))}`;
}

function sumParts(step: BridgeStep): number | null {
  if (step.kind !== 'segmented' || step.parts.length === 0) return null;
  return step.sign * step.parts.reduce((acc, item) => acc + item.value, 0);
}

/** Cada passo nasce onde o anterior terminou; a pilha cresce da base (o menor valor do passo) para cima. */
function buildBlocks(steps: readonly BridgeStep[], parts: readonly Part[], focusId: string): readonly Block[] {
  let running = 0;
  return steps.map((step) => {
    const start = step.kind === 'total' ? 0 : running;
    const net = step.kind === 'total' ? step.value : (sumParts(step) ?? 0);
    const end = step.kind === 'total' ? step.value : running + net;
    running = end;
    const low = Math.min(start, end);
    let cursor = low;
    // Ordenação estável: o executivo em foco vai para a base de todo passo, e a posição dele fica comparável.
    const ordered = step.kind === 'total' ? [] : [...step.parts].sort((a, b) => Number(b.partId === focusId) - Number(a.partId === focusId));
    const segments: Segment[] = ordered.flatMap((item) => {
      const part = parts.find((candidate) => candidate.id === item.partId);
      if (!part || item.value <= 0 || step.kind === 'total') return [];
      const segment = { part, value: step.sign * item.value, low: cursor, high: cursor + item.value };
      cursor += item.value;
      return [segment];
    });
    return { step, net, end, low, high: Math.max(start, end), segments };
  });
}

/** Diferença entre o fim declarado e início mais passos; `null` sem as duas pontas ou sem passo. */
function closureGap(blocks: readonly Block[]): number | null {
  const first = blocks[0];
  const last = blocks[blocks.length - 1];
  const middle = blocks.filter((block) => block.step.kind === 'segmented');
  if (!first || !last || first.step.kind !== 'total' || last.step.kind !== 'total' || middle.length === 0) return null;
  return last.net - first.net - middle.reduce((acc, block) => acc + block.net, 0);
}

/** A cor vem da polaridade declarada no dado (COR-6), não do sinal: ganho reduz a carteira e continua sendo o bom desfecho. */
function polarityColor(step: BridgeStep): string {
  if (step.kind !== 'segmented') return 'var(--text-muted)';
  return step.polarity === 'good' ? 'var(--positive)' : 'var(--negative)';
}

/** Ganhos e perdas de um executivo, pelo `id` dos passos; `null` quando falta um dos passos ou ele não decidiu nada. */
function decisions(steps: readonly BridgeStep[], partId: string): { readonly won: number; readonly decided: number } | null {
  const valueIn = (stepId: string): number | null => {
    const step = steps.find((candidate) => candidate.id === stepId);
    if (!step || step.kind !== 'segmented') return null;
    return step.parts.find((item) => item.partId === partId)?.value ?? null;
  };
  const won = valueIn(WON_ID);
  const lost = valueIn(LOST_ID);
  if (won === null || lost === null || won + lost === 0) return null;
  return { won, decided: won + lost };
}

/** Mediana das taxas; `null` sem nenhuma (EST-1b). */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? (sorted[mid] ?? null) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/** Triângulo de polaridade: a seta é desenhada, porque o glifo em linha engorda o preview (GEO-17). */
function arrowPoints(x: number, y: number, up: boolean): string {
  const tip = up ? y - ARROW / 2 : y + ARROW / 2;
  const base = up ? y + ARROW / 2 : y - ARROW / 2;
  return `${String(x)},${String(tip)} ${String(x + ARROW * 0.7)},${String(base)} ${String(x - ARROW * 0.7)},${String(base)}`;
}

interface ColumnProps {
  readonly block: Block;
  readonly cx: number;
  readonly next: Block | undefined;
  readonly nextCx: number;
  readonly y: (value: number) => number;
  readonly focusId: string;
  /** Pixels por oportunidade. */
  readonly unit: number;
}

function Column({ block, cx, next, nextCx, y, focusId, unit }: ColumnProps): ReactElement {
  const isTotal = block.step.kind === 'total';
  const left = cx - BAR_W / 2;
  const levelY = y(block.end);
  const text = isTotal ? `${formatInt(block.net)} abertas` : signed(block.net);
  const width = text.length * CHAR_W + (isTotal ? 0 : ARROW * 2 + 4);
  const labelY = y(block.high) - LABEL_GAP;
  const textX = isTotal ? cx - width / 2 : cx - width / 2 + ARROW * 2 + 4;
  const color = isTotal ? 'var(--text-primary)' : polarityColor(block.step);
  // Vão só entre vizinhos, descontado do passo em proporção: cada fatia perde a mesma fração e o passo mantém a altura do valor.
  const count = block.segments.length;
  const full = y(block.low) - y(block.high);
  const shrink = full > 0 ? Math.max(full - SEPARATOR * (count - 1), 0) / full : 1;
  const focus = block.segments.find((segment) => segment.part.id === focusId);
  // Passo que sobe recebe o conector pela base e sai pelo topo; passo que desce, o contrário. O nome do
  // executivo fica do lado em que a base está livre: à direita na subida, à esquerda na descida.
  const rising = block.net > 0;
  return (
    <g>
      {next ? <line stroke="var(--line-strong)" strokeWidth={1} x1={left + BAR_W} x2={nextCx - BAR_W / 2} y1={levelY} y2={levelY} /> : null}
      {isTotal ? (
        <rect fill="var(--text-secondary)" height={LEVEL_H} width={BAR_W} x={left} y={levelY - LEVEL_H / 2}>
          <title>{`${block.step.label}: ${formatInt(block.net)} oportunidades abertas`}</title>
        </rect>
      ) : (
        block.segments.map((segment, index) => {
          const bottom = y(block.low) - (segment.low - block.low) * unit * shrink - index * SEPARATOR;
          const top = y(block.low) - (segment.high - block.low) * unit * shrink - index * SEPARATOR;
          return (
            <rect fill={segment.part.id === focusId ? FOCUS_FILL : OTHER_FILL} height={bottom - top} key={segment.part.id} width={BAR_W} x={left} y={top}>
              <title>{`${segment.part.label}: ${signed(segment.value)} de ${signed(block.net)} em ${block.step.label.toLowerCase()}`}</title>
            </rect>
          );
        })
      )}
      {focus ? (
        <text
          className="font-display"
          fill={FOCUS_FILL}
          fontSize={12}
          fontWeight={600}
          textAnchor={rising ? 'start' : 'end'}
          x={rising ? left + BAR_W + NOTE_GAP : left - NOTE_GAP}
          y={(y(focus.low) + y(focus.high)) / 2 + 4}
        >
          {`${focus.part.label} ${signed(focus.value)}`}
        </text>
      ) : null}
      {isTotal ? null : <polygon fill={color} points={arrowPoints(textX - ARROW - 2, labelY - 4, block.net > 0)} />}
      <text className="font-display" fill={color} fontSize={12} fontWeight={isTotal ? 600 : 500} textAnchor="start" x={textX} y={labelY}>
        {text}
      </text>
    </g>
  );
}

export default function StackedBridge({
  data = defaultData,
  parts = defaultParts,
  period = defaultPeriod,
  highlightId = defaultHighlightId,
  height,
  className,
}: StackedBridgeProps) {
  const style = height === undefined ? undefined : { height };
  const blocks = buildBlocks(data, parts, highlightId);
  const first = blocks[0];
  const last = blocks[blocks.length - 1];

  if (!first || !last || first.step.kind !== 'total' || last.step.kind !== 'total') {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum passo neste recorte: não há carteira medida para montar a cascata.
      </div>
    );
  }

  const gap = closureGap(blocks);
  const steps = blocks.filter((block) => block.step.kind === 'segmented');
  const peak = blocks.reduce((max, block) => Math.max(max, block.high), 1);
  // Desvio declarado: o eixo parte do menor nível dos passos (a carteira inicial), e os totais são níveis, não colunas do zero.
  const floor = steps.reduce((min, block) => Math.min(min, block.low), peak);
  const baseline = VIEW_H - AXIS_ROOM;
  const unit = (baseline - LABEL_ROOM) / Math.max(peak - floor, 1);
  const y = (value: number): number => baseline - (value - floor) * unit;
  const band = (VIEW_W - 2 * PAD_X) / blocks.length;
  const centerOf = (index: number): number => PAD_X + band * (index + 0.5);
  const focusPart = parts.find((part) => part.id === highlightId);
  const focusName = focusPart?.label ?? 'O executivo em foco';
  const own = decisions(data, highlightId);
  const rates = parts.flatMap((part) => {
    const found = decisions(data, part.id);
    return found ? [found.won / found.decided] : [];
  });
  const teamMedian = median(rates);
  const rateText = own ? formatRateWithVolume(own.won, own.decided) : null;
  const medianText = teamMedian === null ? null : formatPercent(teamMedian);

  const stepText = steps.map((block) => `${block.step.label.toLowerCase()} ${signed(block.net)}`).join(', ');
  const focusSentence =
    rateText !== null && medianText !== null
      ? `${focusName} converte ${rateText} contra mediana de ${medianText} do time`
      : `${focusName} sem ganhos e perdas medidos para comparar com o time`;
  const summary =
    `Gráfico de cascata empilhada da carteira de ${formatMonthLong(period)}, de ${formatInt(first.net)} para ${formatInt(last.net)} abertas ` +
    `(${stepText}). ${focusSentence}.`;
  const reading = `${focusSentence}, em ${formatMonthLong(period)}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 h-4 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
        {`; eixo parte de ${formatInt(floor)}`}
        {gap !== null && gap !== 0 ? `; os passos não fecham em ${signed(gap)}` : ''}
      </p>
      <ul aria-hidden className="mb-2 flex h-4 shrink-0 gap-x-4 text-xs text-text-secondary">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: FOCUS_FILL }} />
          {focusName}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: OTHER_FILL }} />
          Demais executivos
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {blocks.map((block, index) => (
            <g key={block.step.id}>
              <Column block={block} cx={centerOf(index)} next={blocks[index + 1]} nextCx={centerOf(index + 1)} unit={unit} y={y} focusId={highlightId} />
              <text fill="var(--text-muted)" fontSize={12} textAnchor="middle" x={centerOf(index)} y={baseline + 18}>
                {block.step.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
