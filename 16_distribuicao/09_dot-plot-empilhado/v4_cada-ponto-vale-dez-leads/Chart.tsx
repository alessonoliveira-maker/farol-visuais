import { Filter } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PREFERRED_UNIT, data as defaultData, type ScoreBand } from './data';

/**
 * Dot plot em que cada ponto vale vários leads: quando um ponto por lead não cabe na altura do
 * cartão, a unidade sobe e passa a ser escrita na legenda. O resto de cada pilha, o que não completa
 * um ponto, entra como ponto parcial de área proporcional ao resto, com o número escrito ao lado:
 * nada é arredondado em silêncio.
 *
 * A unidade não é escolhida às cegas: parte de `unit` e só sobe quando a pilha mais alta, medida
 * contra a altura útil do corpo, deixaria o ponto menor que `DOT_MIN`. Quando a contagem é a
 * própria mensagem, o pictograma da família 22 de unidades serve melhor que este gráfico.
 */
export interface ScoreDotPlotProps {
  readonly data?: readonly ScoreBand[];
  readonly unit?: number;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 6, right: 8, bottom: 24, left: 8 } as const;
/** Tamanho antes da primeira medição real do corpo; o desenho final vem do ResizeObserver. */
const FALLBACK_SIZE = { width: 574, height: 150 } as const;
const DOT_MAX = 22;
const DOT_MIN = 10;
/** Degraus de unidade que a conferência de altura pode escolher, do menor ao maior. */
const UNIT_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500] as const;
const DOT_FILL = 'var(--chart-1)';
const DOT_STROKE = 'var(--surface-raised)';
const DOT_STROKE_WIDTH = 1;
const AXIS_STROKE = 'var(--line-strong)';
const LABEL_FONT_SIZE = 11;
const REMAINDER_GAP = 3;
/** Número da família de unidades e waffle, para onde a nota de ponte aponta. */
const BRIDGE_FAMILY = 22;

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

/** Diâmetro do ponto para uma unidade: cabe na faixa, no teto de `DOT_MAX` e na altura útil. */
function diameterFor(unit: number, tallest: number, binWidth: number, plotHeight: number): number {
  const slots = Math.max(1, Math.ceil(tallest / unit));
  return Math.min(DOT_MAX, binWidth - 4, plotHeight / slots);
}

/** A menor unidade, a partir da pedida, em que a pilha mais alta ainda deixa o ponto legível. */
function chooseUnit(preferred: number, tallest: number, binWidth: number, plotHeight: number): number {
  const candidates = UNIT_STEPS.filter((step) => step >= preferred);
  const fit = candidates.find((step) => diameterFor(step, tallest, binWidth, plotHeight) >= DOT_MIN);
  return fit ?? candidates[candidates.length - 1] ?? preferred;
}

export default function ScoreDotPlot({ data = defaultData, unit = PREFERRED_UNIT, height, className }: ScoreDotPlotProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const size = useMeasuredSize(bodyRef);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há pilha para desenhar.</span>
      </div>
    );
  }

  const total = data.reduce((sum, band) => sum + band.count, 0);
  const tallest = Math.max(...data.map((band) => band.count));
  const biggest = data.find((band) => band.count === tallest);

  const plotWidth = size.width - MARGIN.left - MARGIN.right;
  const plotHeight = size.height - MARGIN.top - MARGIN.bottom;
  const binWidth = plotWidth / data.length;
  const used = chooseUnit(unit, tallest, binWidth, plotHeight);
  const diameter = diameterFor(used, tallest, binWidth, plotHeight);
  const baseY = MARGIN.top + plotHeight;
  const raised = used !== unit;

  const summary =
    `Gráfico de pontos empilhados com ${formatInt(total)} leads do mês em ${formatInt(data.length)} faixas de pontuação, cada ponto valendo ${formatInt(used)} leads. ` +
    (biggest === undefined ? '' : `A faixa de ${formatInt(biggest.from)} a ${formatInt(biggest.to)} pontos é a maior, com ${formatInt(biggest.count)}.`);

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p aria-hidden className="shrink-0 text-xs text-text-secondary">
        {biggest === undefined
          ? ''
          : `Faixa de ${formatInt(biggest.from)} a ${formatInt(biggest.to)} pontos: ${formatInt(biggest.count)} de ${formatInt(total)} leads, ${formatPercent(biggest.count / total, 0)} do mês.`}
      </p>
      <div className="min-h-0 flex-1" ref={bodyRef}>
        <svg aria-hidden height={size.height} viewBox={`0 0 ${String(size.width)} ${String(size.height)}`} width={size.width}>
          {data.map((band, index) => {
            const cx = MARGIN.left + (index + 0.5) * binWidth;
            const whole = Math.floor(band.count / used);
            const rest = band.count - whole * used;
            /** Área proporcional ao resto (GEO-3): o raio do ponto parcial é a raiz da fração, e nunca um piso. */
            const restRadius = (diameter / 2) * Math.sqrt(rest / used);
            return (
              <g key={band.id}>
                {Array.from({ length: whole }, (_, level) => (
                  <circle
                    cx={cx}
                    cy={baseY - (level + 0.5) * diameter}
                    fill={DOT_FILL}
                    key={`${band.id}-${String(level)}`}
                    r={diameter / 2}
                    stroke={DOT_STROKE}
                    strokeWidth={DOT_STROKE_WIDTH}
                  >
                    <title>{`${formatInt(used)} leads`}</title>
                  </circle>
                ))}
                {rest === 0 ? null : (
                  <>
                    <circle cx={cx} cy={baseY - (whole + 0.5) * diameter} fill={DOT_FILL} r={restRadius} stroke={DOT_STROKE} strokeWidth={DOT_STROKE_WIDTH}>
                      <title>{`resto de ${formatInt(rest)} leads`}</title>
                    </circle>
                    <text
                      className="tabular-nums"
                      dominantBaseline="central"
                      fill="var(--text-secondary)"
                      fontSize={LABEL_FONT_SIZE}
                      x={cx + diameter / 2 + REMAINDER_GAP}
                      y={baseY - (whole + 0.5) * diameter}
                    >
                      {`+${formatInt(rest)}`}
                    </text>
                  </>
                )}
                {/* Faixa com zero lead mede zero e escreve 0 na base: não é faixa sem coleta. */}
                {band.count === 0 ? (
                  <text className="tabular-nums" fill="var(--text-secondary)" fontSize={LABEL_FONT_SIZE} textAnchor="middle" x={cx} y={baseY - 5}>
                    {formatInt(0)}
                  </text>
                ) : null}
                <text className="tabular-nums" fill="var(--text-muted)" fontSize={LABEL_FONT_SIZE} textAnchor="middle" x={cx} y={baseY + 16}>
                  {`${formatInt(band.from)} a ${formatInt(band.to)}`}
                </text>
              </g>
            );
          })}
          <line stroke={AXIS_STROKE} x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={baseY} y2={baseY} />
        </svg>
      </div>
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`pontuação de qualificação, n ${formatInt(total)} leads do mês`}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-chart-1" />
          <span className="tabular-nums">{`cada ponto vale ${formatInt(used)} leads`}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-chart-1" />
          <span>ponto menor é o resto da pilha, com o número escrito ao lado</span>
        </span>
        {raised ? (
          <span className="tabular-nums">{`unidade subiu de ${formatInt(unit)} para ${formatInt(used)}: a pilha mais alta não cabe na altura`}</span>
        ) : null}
        <span className="tabular-nums">{`se a contagem for a mensagem, o pictograma da família ${formatInt(BRIDGE_FAMILY)} serve melhor`}</span>
      </div>
    </figure>
  );
}
