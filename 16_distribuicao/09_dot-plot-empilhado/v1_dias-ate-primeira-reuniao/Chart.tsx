import { Filter } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';

import { formatDays, formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_DAYS, DOMAIN_DAYS, data as defaultData, type FirstMeeting } from './data';

/**
 * Dot plot empilhado: cada oportunidade é um ponto, empilhado na faixa de dias em que chegou à
 * primeira reunião. A pilha já é a contagem, então não há eixo de valor; o n vai na legenda.
 *
 * A grade é fixa (faixas de 2 dias, régua de 0 a 28), diferente do agrupamento de Wilkinson, que
 * reagrupa a cada amostra: assim a régua não muda quando o filtro muda. O diâmetro do ponto é a
 * largura da faixa em pixels, e por isso a geometria só existe depois de medir o corpo.
 */
export interface FirstMeetingDotPlotProps {
  readonly data?: readonly FirstMeeting[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 8, right: 26, bottom: 28, left: 26 } as const;
/** Tamanho antes da primeira medição real do corpo; o desenho final vem do ResizeObserver. */
const FALLBACK_SIZE = { width: 574, height: 300 } as const;
const DOT_FILL = 'var(--chart-1)';
/** Contorno na cor do cartão: separa dois pontos colados sem compor a marca com o fundo (ACE-5). */
const DOT_STROKE = 'var(--surface-raised)';
const DOT_STROKE_WIDTH = 1;
const AXIS_STROKE = 'var(--line-strong)';
const TICK_LENGTH = 4;
const TICK_LABEL_GAP = 16;
/** Um rótulo a cada duas faixas, isto é, de 4 em 4 dias, para o texto de 11 px não colar no vizinho. */
const TICK_EVERY_BINS = 2;
const TICK_FONT_SIZE = 11;

interface Size {
  readonly width: number;
  readonly height: number;
}

function useMeasuredSize(ref: RefObject<HTMLDivElement | null>): Size {
  const [size, setSize] = useState<Size>(FALLBACK_SIZE);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [ref]);
  return size;
}

/** Mediana, ou `null` para lista vazia: ausência não vira zero (EST-1b). */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? null;
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

/** Dias com a palavra certa, e uma casa quando a mediana cai entre dois inteiros. */
function daysText(days: number): string {
  return Number.isInteger(days) ? formatDays(days) : `${formatDecimal(days, 1)} dias`;
}

/** Quantas oportunidades caem em cada faixa da régua fixa; o que passa do fim da régua fica de fora. */
function countByBin(values: readonly number[], binCount: number): number[] {
  const counts = Array.from({ length: binCount }, () => 0);
  for (const days of values) {
    const index = Math.floor(days / BIN_DAYS);
    if (index >= 0 && index < binCount) counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts;
}

export default function FirstMeetingDotPlot({ data = defaultData, height, className }: FirstMeetingDotPlotProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const size = useMeasuredSize(bodyRef);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade chegou à primeira reunião neste recorte: não há pilha para desenhar.</span>
      </div>
    );
  }

  const binCount = DOMAIN_DAYS / BIN_DAYS;
  const days = data.map((item) => item.days);
  const counts = countByBin(days, binCount);
  const placed = counts.reduce((sum, value) => sum + value, 0);
  const beyond = days.length - placed;
  const tallest = Math.max(1, ...counts);
  const peakIndex = counts.indexOf(tallest);
  const middle = median(days);

  /** Geometria depois da medição: o intervalo mede `binWidth` px e o ponto mede o mesmo. */
  const plotWidth = size.width - MARGIN.left - MARGIN.right;
  const plotHeight = size.height - MARGIN.top - MARGIN.bottom;
  const binWidth = plotWidth / binCount;
  /** Se a pilha mais alta não cabe, o ponto encolhe e a legenda diz; nunca a pilha vaza do corpo. */
  const diameter = Math.min(binWidth, plotHeight / Math.max(tallest, 1));
  const shrunk = diameter < binWidth - 0.5;
  const baseY = MARGIN.top + plotHeight;

  const tickEdges = Array.from({ length: Math.floor(binCount / TICK_EVERY_BINS) + 1 }, (_, index) => index * TICK_EVERY_BINS);

  const summary = [
    `Gráfico de pontos empilhados com ${formatInt(days.length)} oportunidades por faixa de ${formatDays(BIN_DAYS)} até a primeira reunião.`,
    `A faixa mais cheia vai de ${formatInt(peakIndex * BIN_DAYS)} a ${formatInt(peakIndex * BIN_DAYS + BIN_DAYS - 1)} dias, com ${formatInt(tallest)}.`,
    middle === null ? '' : `A mediana é de ${daysText(middle)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p aria-hidden className="shrink-0 text-xs text-text-secondary">
        {`Faixa mais cheia: ${formatInt(peakIndex * BIN_DAYS)} a ${formatInt(peakIndex * BIN_DAYS + BIN_DAYS - 1)} dias, com ${formatInt(tallest)} de ${formatInt(days.length)} oportunidades.`}
        {middle === null ? '' : ` Mediana de ${daysText(middle)}.`}
      </p>
      <div className="min-h-0 flex-1" ref={bodyRef}>
        <svg aria-hidden height={size.height} viewBox={`0 0 ${String(size.width)} ${String(size.height)}`} width={size.width}>
          {counts.flatMap((count, bin) =>
            Array.from({ length: count }, (_, level) => {
              const cx = MARGIN.left + (bin + 0.5) * binWidth;
              const cy = baseY - (level + 0.5) * diameter;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  fill={DOT_FILL}
                  key={`dot-${String(bin)}-${String(level)}`}
                  r={diameter / 2}
                  stroke={DOT_STROKE}
                  strokeWidth={DOT_STROKE_WIDTH}
                />
              );
            }),
          )}
          <line stroke={AXIS_STROKE} x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={baseY} y2={baseY} />
          {tickEdges.map((edge) => {
            const x = MARGIN.left + edge * binWidth;
            return (
              <g key={`tick-${String(edge)}`}>
                <line stroke={AXIS_STROKE} x1={x} x2={x} y1={baseY} y2={baseY + TICK_LENGTH} />
                <text
                  className="tabular-nums"
                  fill="var(--text-muted)"
                  fontSize={TICK_FONT_SIZE}
                  textAnchor="middle"
                  x={x}
                  y={baseY + TICK_LABEL_GAP}
                >
                  {formatDays(edge * BIN_DAYS)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`dias até a primeira reunião, n ${formatInt(days.length)} oportunidades, um ponto por oportunidade`}</span>
        <span>{`grade fixa de ${formatDays(BIN_DAYS)}, diferente do agrupamento de Wilkinson: a régua não muda entre filtros`}</span>
        {beyond === 0 ? null : (
          <span className="tabular-nums">{`${formatInt(beyond)} oportunidades passaram de ${formatDays(DOMAIN_DAYS)} e ficaram fora da régua`}</span>
        )}
        {shrunk ? <span>o ponto encolheu: a pilha mais alta não cabe com o ponto do tamanho da faixa</span> : null}
      </div>
    </figure>
  );
}
