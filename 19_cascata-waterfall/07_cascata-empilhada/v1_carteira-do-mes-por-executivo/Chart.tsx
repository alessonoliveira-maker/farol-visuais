import type { ReactElement } from 'react';

import { formatInt, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, parts as defaultParts, period as defaultPeriod, type BridgeStep, type Part } from './data';

/** Cascata da carteira do mês: cada passo flutuante se divide por executivo, e o rótulo traz só o líquido. */
export interface StackedBridgeProps {
  readonly data?: readonly BridgeStep[];
  readonly parts?: readonly Part[];
  readonly period?: string;
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
const LEVEL_H = 3;
const LABEL_GAP = 8;
const CHAR_W = 7;
const ARROW = 6;
/** O check só aceita token escrito por extenso; o slot do dado (COR-3) escolhe a cor por este mapa. */
const SLOT_FILL = {
  1: 'var(--chart-1)',
  2: 'var(--chart-2)',
  3: 'var(--chart-3)',
  4: 'var(--chart-4)',
  5: 'var(--chart-5)',
  6: 'var(--chart-6)',
} as const;

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
function buildBlocks(steps: readonly BridgeStep[], parts: readonly Part[]): readonly Block[] {
  let running = 0;
  return steps.map((step) => {
    const start = step.kind === 'total' ? 0 : running;
    const net = step.kind === 'total' ? step.value : (sumParts(step) ?? 0);
    const end = step.kind === 'total' ? step.value : running + net;
    running = end;
    const low = Math.min(start, end);
    let cursor = low;
    const segments: Segment[] =
      step.kind === 'total'
        ? []
        : step.parts.flatMap((item) => {
            const part = parts.find((candidate) => candidate.id === item.partId);
            if (!part || item.value <= 0) return [];
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
  /** Pixels por oportunidade. */
  readonly unit: number;
}

function Column({ block, cx, next, nextCx, y, unit }: ColumnProps): ReactElement {
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
            <rect fill={SLOT_FILL[segment.part.slot]} height={bottom - top} key={segment.part.id} width={BAR_W} x={left} y={top}>
              <title>{`${segment.part.label}: ${signed(segment.value)} de ${signed(block.net)} em ${block.step.label.toLowerCase()}`}</title>
            </rect>
          );
        })
      )}
      {isTotal ? null : <polygon fill={color} points={arrowPoints(textX - ARROW - 2, labelY - 4, block.net > 0)} />}
      <text className="font-display" fill={color} fontSize={12} fontWeight={isTotal ? 600 : 500} textAnchor="start" x={textX} y={labelY}>
        {text}
      </text>
    </g>
  );
}

export default function StackedBridge({ data = defaultData, parts = defaultParts, period = defaultPeriod, height, className }: StackedBridgeProps) {
  const style = height === undefined ? undefined : { height };
  const blocks = buildBlocks(data, parts);
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
  const delta = last.net - first.net;
  const steps = blocks.filter((block) => block.step.kind === 'segmented');
  const peak = blocks.reduce((max, block) => Math.max(max, block.high), 1);
  // Desvio declarado: o eixo parte do menor nível dos passos (a carteira inicial), e os totais são níveis, não colunas do zero.
  const floor = steps.reduce((min, block) => Math.min(min, block.low), peak);
  const baseline = VIEW_H - AXIS_ROOM;
  const unit = (baseline - LABEL_ROOM) / Math.max(peak - floor, 1);
  const y = (value: number): number => baseline - (value - floor) * unit;
  const band = (VIEW_W - 2 * PAD_X) / blocks.length;
  const centerOf = (index: number): number => PAD_X + band * (index + 0.5);
  const usedParts = parts.filter((part) => steps.some((block) => block.segments.some((segment) => segment.part.id === part.id)));

  const stepText = steps.map((block) => `${block.step.label.toLowerCase()} ${signed(block.net)}`).join(', ');
  const summary =
    `Gráfico de cascata empilhada da carteira de oportunidades: de ${formatInt(first.net)} para ${formatInt(last.net)} abertas em ` +
    `${formatMonthLong(period)}, variação de ${signed(delta)}. Passos: ${stepText}, divididos entre ${formatInt(usedParts.length)} executivos.`;
  const reading =
    first.net === 0
      ? `Carteira de ${formatMonthLong(period)}: ${signed(delta)} oportunidades sem base medida no início do mês`
      : `Carteira de ${formatMonthLong(period)}: de ${formatInt(first.net)} para ${formatInt(last.net)} oportunidades abertas, ` +
        `${signed(delta)} (${delta >= 0 ? '+' : '−'}${formatPercent(Math.abs(delta) / first.net, 0)}) contra o início do mês`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 h-4 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
        {`; eixo parte de ${formatInt(floor)}`}
        {gap !== null && gap !== 0 ? `; os passos não fecham em ${signed(gap)}` : ''}
      </p>
      <ul aria-hidden className="mb-2 flex h-4 shrink-0 gap-x-4 text-xs text-text-secondary">
        {[...usedParts].reverse().map((part) => (
          <li className="flex items-center gap-1.5" key={part.id}>
            <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: SLOT_FILL[part.slot] }} />
            {part.label}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {blocks.map((block, index) => (
            <g key={block.step.id}>
              <Column block={block} cx={centerOf(index)} next={blocks[index + 1]} nextCx={centerOf(index + 1)} unit={unit} y={y} />
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
