import { Filter } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';

import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { MAX_ATTEMPTS, REVIEW_ABOVE, data as defaultData, type WorkedLead } from './data';

/**
 * Dot plot empilhado de uma pilha por número de tentativas, de 1 a 12: a métrica é discreta, então
 * não há faixa artificial. Cada ponto é um lead. Ponto cheio é lead com agenda; ponto vazado é lead
 * que esgotou as tentativas sem agendar, de modo que a forma carrega a diferença além da cor. As
 * pilhas acima de `REVIEW_ABOVE` tentativas ficam sobre um fundo de destaque, a fila de revisão.
 *
 * A pilha alta quebra em linhas dentro da própria coluna: o ponto é o maior que ainda deixa a
 * maior pilha caber na altura medida do corpo, e a geometria só existe depois da medição.
 */
export interface AttemptsDotPlotProps {
  readonly data?: readonly WorkedLead[];
  readonly reviewAbove?: number;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 26, right: 8, bottom: 26, left: 8 } as const;
/** Tamanho antes da primeira medição real do corpo; o desenho final vem do ResizeObserver. */
const FALLBACK_SIZE = { width: 894, height: 200 } as const;
const COLUMN_GAP = 8;
const DOT_MAX = 24;
const DOT_MIN = 7;
const DOT_STEP = 0.5;
const FILLED_FILL = 'var(--chart-1)';
const FILLED_STROKE = 'var(--surface-raised)';
const FILLED_STROKE_WIDTH = 1;
/** Ponto vazado: contorno em texto neutro (5,2:1 no escuro, 5,4:1 no claro), mais grosso que o do cheio. */
const HOLLOW_STROKE = 'var(--text-muted)';
const HOLLOW_STROKE_WIDTH = 1.5;
const BAND_FILL = 'var(--surface-sunken)';
const AXIS_STROKE = 'var(--line-strong)';
const LABEL_FONT_SIZE = 11;

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

/**
 * Maior diâmetro que deixa a maior pilha caber: o ponto desce de meio em meio pixel e, a cada
 * tentativa, a coluna ganha as linhas que a largura interna pede. Piso de `DOT_MIN`.
 */
function fitDiameter(tallest: number, innerWidth: number, plotHeight: number): number {
  for (let d = Math.min(DOT_MAX, innerWidth); d > DOT_MIN; d -= DOT_STEP) {
    const perRow = Math.max(1, Math.floor(innerWidth / d));
    if (Math.ceil(tallest / perRow) * d <= plotHeight) return d;
  }
  return DOT_MIN;
}

function leadTitle(lead: WorkedLead): string {
  const tries = `${formatInt(lead.attempts)} ${lead.attempts === 1 ? 'tentativa' : 'tentativas'}`;
  return `${lead.code}: ${tries}, ${lead.scheduled ? 'com agenda' : 'sem agenda'}`;
}

export default function AttemptsDotPlot({ data = defaultData, reviewAbove = REVIEW_ABOVE, height, className }: AttemptsDotPlotProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const size = useMeasuredSize(bodyRef);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead trabalhado neste recorte: não há pilha de tentativas para desenhar.</span>
      </div>
    );
  }

  /** Pilha por tentativa, com os leads que agendaram embaixo e os sem agenda por cima. */
  const stacks = Array.from({ length: MAX_ATTEMPTS }, (_, index) => {
    const leads = data.filter((lead) => lead.attempts === index + 1);
    return {
      attempts: index + 1,
      leads: [...leads.filter((lead) => lead.scheduled), ...leads.filter((lead) => !lead.scheduled)],
    };
  });
  const placed = stacks.reduce((sum, stack) => sum + stack.leads.length, 0);
  const outside = data.length - placed;
  const tallest = Math.max(1, ...stacks.map((stack) => stack.leads.length));
  const review = data.filter((lead) => lead.attempts > reviewAbove);
  const reviewOpen = review.filter((lead) => !lead.scheduled).length;
  const open = data.filter((lead) => !lead.scheduled).length;

  const plotWidth = size.width - MARGIN.left - MARGIN.right;
  const plotHeight = size.height - MARGIN.top - MARGIN.bottom;
  const columnWidth = plotWidth / MAX_ATTEMPTS;
  const innerWidth = columnWidth - COLUMN_GAP;
  const diameter = fitDiameter(tallest, innerWidth, plotHeight);
  const perRow = Math.max(1, Math.floor(innerWidth / diameter));
  const baseY = MARGIN.top + plotHeight;
  const bandX = MARGIN.left + reviewAbove * columnWidth;

  const summary =
    `Gráfico de pontos empilhados com ${formatInt(data.length)} leads por número de tentativas, de 1 a ${formatInt(MAX_ATTEMPTS)}. ` +
    `${formatInt(review.length)} leads passaram de ${formatInt(reviewAbove)} tentativas e ${formatInt(reviewOpen)} deles não agendaram. ` +
    `Ponto vazado é lead sem agenda.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p aria-hidden className="shrink-0 text-xs text-text-secondary">
        {`${formatRateWithVolume(review.length, data.length)} dos leads precisaram de mais de ${formatInt(reviewAbove)} tentativas, e ${formatInt(reviewOpen)} desses não agendaram.`}
      </p>
      <div className="min-h-0 flex-1" ref={bodyRef}>
        <svg aria-hidden height={size.height} viewBox={`0 0 ${String(size.width)} ${String(size.height)}`} width={size.width}>
          <rect fill={BAND_FILL} height={baseY - 2} rx={4} width={size.width - MARGIN.right - bandX} x={bandX} y={2} />
          <text className="tabular-nums" fill="var(--text-secondary)" fontSize={LABEL_FONT_SIZE} x={bandX + 8} y={16}>
            {`fila de revisão: ${formatInt(review.length)} leads, ${formatInt(reviewOpen)} sem agenda`}
          </text>
          {stacks.map((stack, index) => {
            const center = MARGIN.left + (index + 0.5) * columnWidth;
            const count = stack.leads.length;
            const blockWidth = Math.min(count, perRow) * diameter;
            const topY = baseY - Math.ceil(count / perRow) * diameter;
            return (
              <g key={`stack-${String(stack.attempts)}`}>
                {stack.leads.map((lead, position) => {
                  const row = Math.floor(position / perRow);
                  const col = position % perRow;
                  const cx = center - blockWidth / 2 + (col + 0.5) * diameter;
                  const cy = baseY - (row + 0.5) * diameter;
                  return lead.scheduled ? (
                    <circle cx={cx} cy={cy} fill={FILLED_FILL} key={lead.code} r={diameter / 2} stroke={FILLED_STROKE} strokeWidth={FILLED_STROKE_WIDTH}>
                      <title>{leadTitle(lead)}</title>
                    </circle>
                  ) : (
                    <circle
                      cx={cx}
                      cy={cy}
                      fill="none"
                      key={lead.code}
                      r={diameter / 2 - HOLLOW_STROKE_WIDTH / 2}
                      stroke={HOLLOW_STROKE}
                      strokeWidth={HOLLOW_STROKE_WIDTH}
                    >
                      <title>{leadTitle(lead)}</title>
                    </circle>
                  );
                })}
                {/* Pilha vazia tem topo na base e escreve 0: zero medido é zero, e não coluna sem coleta. */}
                <text className="tabular-nums" fill="var(--text-secondary)" fontSize={LABEL_FONT_SIZE} textAnchor="middle" x={center} y={topY - 5}>
                  {formatInt(count)}
                </text>
                <text className="tabular-nums" fill="var(--text-muted)" fontSize={LABEL_FONT_SIZE} textAnchor="middle" x={center} y={baseY + 16}>
                  {formatInt(stack.attempts)}
                </text>
              </g>
            );
          })}
          <line stroke={AXIS_STROKE} x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={baseY} y2={baseY} />
        </svg>
      </div>
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`tentativas de contato até a agenda, n ${formatInt(data.length)} leads, um ponto por lead`}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-chart-1" />
          <span className="tabular-nums">{`com agenda, ${formatInt(data.length - open)}`}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full border-[1.5px] border-text-muted" />
          <span className="tabular-nums">{`sem agenda, ${formatInt(open)}`}</span>
        </span>
        <span>o número sobre cada pilha é a contagem de leads dela</span>
        {outside === 0 ? null : (
          <span className="tabular-nums">{`${formatInt(outside)} leads passaram de ${formatInt(MAX_ATTEMPTS)} tentativas e ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
