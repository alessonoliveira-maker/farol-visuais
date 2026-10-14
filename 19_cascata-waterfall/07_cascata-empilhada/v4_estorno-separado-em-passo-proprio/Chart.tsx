import type { ReactElement } from 'react';

import { formatCurrencyAxis, formatMonthLong } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, parts as defaultParts, period as defaultPeriod, type MediaStep, type Part } from './data';

/** Cascata da mídia do mês: o investido se divide por plataforma e o estorno, de sinal oposto, vira passo próprio. */
export interface StackedMediaBridgeProps {
  readonly data?: readonly MediaStep[];
  readonly parts?: readonly Part[];
  readonly period?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas `card`, corpo 574 x 241,5 px com o caso de uso em uma linha (seção 13). Descontados a
 * linha de leitura, a legenda e a nota (3 x 24 px), o SVG tem 574 x 169 px: o viewBox é do
 * tamanho dele, então a escala é 1 e o texto escreve nos 11 e 12 px declarados (GEO-18).
 * Três colunas em 558 px dão banda de 186 px.
 */
const VIEW_W = 574;
const VIEW_H = 169;
const PAD_X = 8;
const LABEL_ROOM = 28;
const AXIS_ROOM = 28;
const BAR_W = 40;
const SEPARATOR = 1.5;
const LABEL_GAP = 8;
const CHAR_W = 7.2;
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
  readonly step: MediaStep;
  readonly net: number;
  readonly end: number;
  readonly low: number;
  readonly high: number;
  readonly segments: readonly Segment[];
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signed(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyAxis(Math.abs(value))}`;
}

function sumParts(step: MediaStep): number | null {
  if (step.kind !== 'segmented' || step.parts.length === 0) return null;
  return step.sign * step.parts.reduce((acc, item) => acc + item.value, 0);
}

/** Cada passo nasce onde o anterior terminou; a pilha cresce da base (o menor valor do passo) para cima. */
function buildBlocks(steps: readonly MediaStep[], parts: readonly Part[]): readonly Block[] {
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

/** Diferença entre a mídia líquida declarada e a soma dos passos com sinal; `null` sem total ou sem passo. */
function closureGap(blocks: readonly Block[]): number | null {
  const total = blocks.find((block) => block.step.kind === 'total');
  const steps = blocks.filter((block) => block.step.kind === 'segmented');
  if (!total || steps.length === 0) return null;
  return total.net - steps.reduce((acc, block) => acc + block.net, 0);
}

/** Mídia é custo (COR-6): o investido sobe o custo e sai em negativo; o estorno desce e sai em positivo. */
function polarityColor(net: number): string {
  return net > 0 ? 'var(--negative)' : net < 0 ? 'var(--positive)' : 'var(--text-muted)';
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
}

function Column({ block, cx, next, nextCx, y }: ColumnProps): ReactElement {
  const isTotal = block.step.kind === 'total';
  const left = cx - BAR_W / 2;
  const levelY = y(block.end);
  const text = isTotal ? formatCurrencyAxis(block.net) : signed(block.net);
  const width = text.length * CHAR_W + (isTotal ? 0 : ARROW * 2 + 4);
  const labelY = y(block.high) - LABEL_GAP;
  const textX = isTotal ? cx - width / 2 : cx - width / 2 + ARROW * 2 + 4;
  const color = isTotal ? 'var(--text-primary)' : polarityColor(block.net);
  return (
    <g>
      {next ? <line stroke="var(--line-strong)" strokeWidth={1} x1={left + BAR_W} x2={nextCx - BAR_W / 2} y1={levelY} y2={levelY} /> : null}
      {isTotal ? (
        <rect fill="var(--text-secondary)" height={y(0) - y(block.high)} width={BAR_W} x={left} y={y(block.high)}>
          <title>{`${block.step.label}: ${formatCurrencyAxis(block.net)}`}</title>
        </rect>
      ) : (
        block.segments.map((segment) => (
          <rect
            fill={SLOT_FILL[segment.part.slot]}
            height={y(segment.low) - y(segment.high)}
            key={segment.part.id}
            stroke="var(--surface-raised)"
            strokeWidth={SEPARATOR}
            width={BAR_W}
            x={left}
            y={y(segment.high)}
          >
            <title>{`${segment.part.label}: ${signed(segment.value)} de ${signed(block.net)} em ${block.step.label.toLowerCase()}`}</title>
          </rect>
        ))
      )}
      {isTotal ? null : <polygon fill={color} points={arrowPoints(textX - ARROW - 2, labelY - 4, block.net > 0)} />}
      <text className="font-display" fill={color} fontSize={12} fontWeight={isTotal ? 600 : 500} textAnchor="start" x={textX} y={labelY}>
        {text}
      </text>
    </g>
  );
}

export default function StackedMediaBridge({ data = defaultData, parts = defaultParts, period = defaultPeriod, height, className }: StackedMediaBridgeProps) {
  const style = height === undefined ? undefined : { height };
  const blocks = buildBlocks(data, parts);
  const total = blocks.find((block) => block.step.kind === 'total');
  const steps = blocks.filter((block) => block.step.kind === 'segmented');
  const added = steps.find((block) => block.net > 0);
  const refunded = steps.find((block) => block.net < 0);

  if (!total || !added) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhuma mídia neste recorte: não há investimento medido para montar a cascata.
      </div>
    );
  }

  const gap = closureGap(blocks);
  const peak = blocks.reduce((max, block) => Math.max(max, block.high), 1);
  const baseline = VIEW_H - AXIS_ROOM;
  const y = (value: number): number => baseline - (value / peak) * (baseline - LABEL_ROOM);
  const band = (VIEW_W - 2 * PAD_X) / blocks.length;
  const centerOf = (index: number): number => PAD_X + band * (index + 0.5);
  const usedParts = parts.filter((part) => steps.some((block) => block.segments.some((segment) => segment.part.id === part.id)));
  const refundedText = refunded ? formatCurrencyAxis(Math.abs(refunded.net)) : null;

  const summary =
    `Gráfico de cascata empilhada da mídia de ${formatMonthLong(period)}: ${formatCurrencyAxis(added.net)} investidos em ` +
    `${String(usedParts.length)} plataformas${refundedText === null ? '' : `, menos ${refundedText} de estorno em passo próprio`}, ` +
    `e mídia líquida de ${formatCurrencyAxis(total.net)}.`;
  const reading =
    `Mídia líquida de ${formatCurrencyAxis(total.net)}: ${formatCurrencyAxis(added.net)} investidos` +
    `${refundedText === null ? '' : ` menos ${refundedText} estornados`}` +
    `${gap !== null && gap !== 0 ? `; os passos não fecham em ${signed(gap)}` : ''}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 h-4 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
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
          <line stroke="var(--line-strong)" strokeWidth={1} x1={PAD_X} x2={VIEW_W - PAD_X} y1={baseline} y2={baseline} />
          {blocks.map((block, index) => (
            <g key={block.step.id}>
              <Column block={block} cx={centerOf(index)} next={blocks[index + 1]} nextCx={centerOf(index + 1)} y={y} />
              <text fill="var(--text-muted)" fontSize={12} textAnchor="middle" x={centerOf(index)} y={baseline + 18}>
                {block.step.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {refunded ? (
        <p aria-hidden className="mt-2 h-4 shrink-0 text-[11px] text-text-muted">
          Estorno separado em passo próprio: sinal oposto ao do investido, então não se empilha com ele.
        </p>
      ) : null}
    </div>
  );
}
