import type { ReactElement } from 'react';

import { formatCurrencyAxis, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, parts as defaultParts, period as defaultPeriod, type CostStep, type Part } from './data';

/** Cascata do custo da área: passos inteiros e passos divididos em componentes, cada divisão com a própria legenda. */
export interface StackedCostBridgeProps {
  readonly data?: readonly CostStep[];
  readonly parts?: readonly Part[];
  readonly period?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas `largo`, corpo 894 x 281,5 px (seção 13). Descontados a linha de leitura e o respiro
 * (24 px), o SVG tem 894 x 257 px: o viewBox é do tamanho dele, então a escala é 1 (GEO-18).
 * Cinco colunas em 878 px dão banda de 175,6 px; sobram 67 px de cada lado da barra de 40 px, e a
 * legenda do passo mora ali, abaixo do conector que sai pelo topo.
 */
const VIEW_W = 894;
const VIEW_H = 257;
const PAD_X = 8;
const LABEL_ROOM = 28;
const AXIS_ROOM = 28;
const BAR_W = 40;
const SEPARATOR = 1.5;
const LABEL_GAP = 8;
const LEGEND_GAP = 8;
const LEGEND_ROW = 14;
const SWATCH = 10;
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
  readonly step: CostStep;
  readonly net: number;
  readonly end: number;
  readonly low: number;
  readonly high: number;
  readonly segments: readonly Segment[];
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedMoney(value: number): string {
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatCurrencyAxis(Math.abs(value))}`;
}

function sumParts(step: CostStep): number | null {
  if (step.kind !== 'segmented' || step.parts.length === 0) return null;
  return step.parts.reduce((acc, item) => acc + item.value, 0);
}

/** Cada passo nasce onde o anterior terminou; a pilha cresce da base do passo para cima. */
function buildBlocks(steps: readonly CostStep[], parts: readonly Part[]): readonly Block[] {
  let running = 0;
  return steps.map((step) => {
    const start = step.kind === 'total' ? 0 : running;
    const net = step.kind === 'segmented' ? (sumParts(step) ?? 0) : step.value;
    const end = step.kind === 'total' ? step.value : running + net;
    running = end;
    let cursor = start;
    const segments: Segment[] =
      step.kind !== 'segmented'
        ? []
        : step.parts.flatMap((item) => {
            const part = parts.find((candidate) => candidate.id === item.partId);
            if (!part || item.value <= 0) return [];
            const segment = { part, value: item.value, low: cursor, high: cursor + item.value };
            cursor += item.value;
            return [segment];
          });
    return { step, net, end, low: Math.min(start, end), high: Math.max(start, end), segments };
  });
}

/** Diferença entre o total declarado e a soma dos passos; `null` sem total ou sem passo. */
function closureGap(blocks: readonly Block[]): number | null {
  const total = blocks.find((block) => block.step.kind === 'total');
  const steps = blocks.filter((block) => block.step.kind !== 'total');
  if (!total || steps.length === 0) return null;
  return total.net - steps.reduce((acc, block) => acc + block.net, 0);
}

interface ColumnProps {
  readonly block: Block;
  readonly cx: number;
  readonly next: Block | undefined;
  readonly nextCx: number;
  readonly y: (value: number) => number;
}

function Column({ block, cx, next, nextCx, y }: ColumnProps): ReactElement {
  const kind = block.step.kind;
  const left = cx - BAR_W / 2;
  const levelY = y(block.end);
  const text = kind === 'total' ? formatCurrencyAxis(block.net) : signedMoney(block.net);
  const legendX = left + BAR_W + LEGEND_GAP;
  return (
    <g>
      {next ? <line stroke="var(--line-strong)" strokeWidth={1} x1={left + BAR_W} x2={nextCx - BAR_W / 2} y1={levelY} y2={levelY} /> : null}
      {kind === 'segmented' ? (
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
            <title>{`${segment.part.label}: ${formatCurrencyAxis(segment.value)} de ${formatCurrencyAxis(block.net)} em ${block.step.label.toLowerCase()}`}</title>
          </rect>
        ))
      ) : (
        <rect fill={kind === 'total' ? 'var(--text-secondary)' : 'var(--text-muted)'} height={y(block.low) - y(block.high)} width={BAR_W} x={left} y={y(block.high)}>
          <title>{`${block.step.label}: ${formatCurrencyAxis(block.net)}`}</title>
        </rect>
      )}
      <text
        className="font-display"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={kind === 'total' ? 600 : 500}
        textAnchor="middle"
        x={cx}
        y={y(block.high) - LABEL_GAP}
      >
        {text}
      </text>
      {[...block.segments].reverse().map((segment, row) => {
        const rowY = y(block.high) + LEGEND_GAP + row * LEGEND_ROW;
        return (
          <g key={segment.part.id}>
            <rect fill={SLOT_FILL[segment.part.slot]} height={SWATCH} width={SWATCH} x={legendX} y={rowY} />
            <text fill="var(--text-secondary)" fontSize={11} x={legendX + SWATCH + 6} y={rowY + SWATCH - 1}>
              {segment.part.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function StackedCostBridge({ data = defaultData, parts = defaultParts, period = defaultPeriod, height, className }: StackedCostBridgeProps) {
  const style = height === undefined ? undefined : { height };
  const blocks = buildBlocks(data, parts);
  const total = blocks.find((block) => block.step.kind === 'total');

  if (!total) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum custo neste recorte: não há total medido para montar a cascata.
      </div>
    );
  }

  const steps = blocks.filter((block) => block.step.kind !== 'total');
  const biggest = steps.reduce<Block | undefined>((max, block) => (max === undefined || block.net > max.net ? block : max), undefined);
  const gap = closureGap(blocks);
  const peak = blocks.reduce((max, block) => Math.max(max, block.high), 1);
  const baseline = VIEW_H - AXIS_ROOM;
  const y = (value: number): number => baseline - (value / peak) * (baseline - LABEL_ROOM);
  const band = (VIEW_W - 2 * PAD_X) / blocks.length;
  const centerOf = (index: number): number => PAD_X + band * (index + 0.5);

  const stepText = steps.map((block) => `${block.step.label.toLowerCase()} ${formatCurrencyAxis(block.net)}`).join(', ');
  const summary =
    `Gráfico de cascata empilhada do custo da área em ${formatMonthLong(period)}: ${formatCurrencyAxis(total.net)} ` +
    `em ${String(steps.length)} passos (${stepText}), com mídia por plataforma e ferramentas por contrato.`;
  const reading =
    biggest === undefined || total.net <= 0
      ? `Custo da área em ${formatMonthLong(period)}: ${formatCurrencyAxis(total.net)}`
      : `Custo da área em ${formatMonthLong(period)}: ${formatCurrencyAxis(total.net)}; o maior passo é ${biggest.step.label.toLowerCase()}, ` +
        `${formatCurrencyAxis(biggest.net)} (${formatPercent(biggest.net / total.net, 0)} do total)`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 h-4 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
        {gap !== null && gap !== 0 ? `; os passos não fecham em ${signedMoney(gap)}` : ''}
      </p>
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
    </div>
  );
}
