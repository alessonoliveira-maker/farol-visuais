import { ArrowDownRight, ArrowUpRight, Filter, Minus } from 'lucide-react';
import type { ReactElement } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, useChartHeight, useChartWidth, ZIndexLayer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ReferralQuarterTick } from './data';

/**
 * Pizza de fração única com um tique radial do período anterior. A fatia acesa é o trimestre
 * corrente; o traço no contorno é onde a mesma fração estava no trimestre passado, e a diferença
 * entre os dois sai escrita em pontos percentuais, com a base nomeada, porque comparar dois
 * ângulos a olho não é leitura. O tique nasce do mesmo centro e do mesmo raio do `Pie`: a conta de
 * ângulo é a convenção do Recharts (graus, anti-horário positivo), refeita em TypeScript aqui.
 */
export interface ReferralQuarterTickCardProps {
  readonly data?: ReferralQuarterTick;
  readonly height?: number;
  readonly className?: string;
}

/** Ângulo inicial às 12 horas, sentido horário: mesma convenção da família Pizza. */
const START_ANGLE = 90;
const END_ANGLE = -270;
/**
 * Margem do `PieChart` declarada, e assimétrica de propósito: os 56 px da direita abrem a faixa em
 * que o rótulo do tique cabe fora do disco sem passar da caixa do glifo (ESP-3).
 */
const MARGIN = { top: 4, right: 56, bottom: 4, left: 4 } as const;
/** Camada do tique, acima do Pie (que pinta em 100 no portal do Recharts): a ordem no JSX não decide (REC-13). */
const TICK_Z = 600;
/** Quanto o tique avança para dentro e para fora do contorno, em pixels. */
const TICK_REACH = 6;
/** Respiro entre a ponta do tique e a tinta do rótulo dele. */
const TICK_LABEL_GAP = 6;
/** A partir de 10 pontos percentuais a casa decimal não muda a decisão (NUM-1). */
const WHOLE_POINTS_FROM = 10;
/** Abaixo de 0,05 ponto percentual a fração é lida como estável, não como alta nem queda. */
const FLAT_POINTS = 0.05;
/** Faixa em que o cosseno do ângulo não decide lado: ali o rótulo fica centrado. */
const ANCHOR_DEAD_ZONE = 0.1;

/** Mesma trigonometria que o Recharts usa por dentro (polarToCartesian). */
function polarPoint(cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } {
  const rad = (-angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

interface PreviousTickProps {
  readonly fraction: number;
  readonly label: string;
  readonly name: string;
}

/**
 * Tique radial na fração do período anterior. Lê a caixa do gráfico pelos hooks do Recharts e
 * refaz a conta do centro e do raio com a mesma margem declarada acima, para o traço cair no
 * contorno do `Pie` e não a alguns pixels dele.
 */
function PreviousTick({ fraction, label, name }: PreviousTickProps): ReactElement | null {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;
  const plotWidth = width - MARGIN.left - MARGIN.right;
  const plotHeight = height - MARGIN.top - MARGIN.bottom;
  const radius = Math.min(plotWidth, plotHeight) / 2;
  if (radius <= 0) return null;
  const cx = MARGIN.left + plotWidth / 2;
  const cy = MARGIN.top + plotHeight / 2;
  const angleDeg = START_ANGLE + fraction * (END_ANGLE - START_ANGLE);
  /* Só por fora, encostando no setor (TOK-10): dentro do setor aceso o traço some. */
  const inner = polarPoint(cx, cy, radius - 1, angleDeg);
  const outer = polarPoint(cx, cy, radius + TICK_REACH, angleDeg);
  const anchorPoint = polarPoint(cx, cy, radius + TICK_REACH + TICK_LABEL_GAP, angleDeg);
  const cosine = Math.cos((-angleDeg * Math.PI) / 180);
  const textAnchor = cosine < -ANCHOR_DEAD_ZONE ? 'end' : cosine > ANCHOR_DEAD_ZONE ? 'start' : 'middle';
  return (
    <ZIndexLayer zIndex={TICK_Z}>
      <g aria-hidden>
        <line stroke="var(--surface-raised)" strokeWidth={5} x1={inner.x} x2={outer.x} y1={inner.y} y2={outer.y} />
        <line stroke="var(--text-muted)" strokeWidth={2} x1={inner.x} x2={outer.x} y1={inner.y} y2={outer.y} />
        <text
          className="font-display"
          fill="var(--text-muted)"
          fontSize={11}
          textAnchor={textAnchor}
          x={anchorPoint.x}
          y={anchorPoint.y}
        >
          <tspan dy="-0.15em" x={anchorPoint.x}>
            {name}
          </tspan>
          <tspan dy="1.15em" x={anchorPoint.x}>
            {label}
          </tspan>
        </text>
      </g>
    </ZIndexLayer>
  );
}

export default function ReferralQuarterTickCard({ data = defaultData, height, className }: ReferralQuarterTickCardProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const { label, current, previous } = data;

  if (current.total <= 0) {
    return (
      <div
        className={cn(
          'flex h-full w-full min-w-0 items-center gap-2 rounded-lg border border-line-subtle bg-surface-raised p-4 text-xs text-text-muted',
          className,
        )}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade ganha neste recorte: sem base para calcular a fração de indicação.</span>
      </div>
    );
  }

  const others = current.total - current.referrals;
  const fraction = current.referrals / current.total;
  const slices = [
    { id: 'indicacao', value: current.referrals },
    { id: 'outras-origens', value: others },
  ] as const;

  /**
   * A fração do período anterior é nula quando não há base medida: recorte novo ou primeira
   * medição. Nunca zero, que seria ler "caiu para nada" onde não houve medição (EST-1b).
   */
  const previousFraction = previous === null || previous.total <= 0 ? null : previous.referrals / previous.total;
  const deltaPoints = previousFraction === null ? null : fraction * 100 - previousFraction * 100;
  const flat = deltaPoints !== null && Math.abs(deltaPoints) < FLAT_POINTS;
  const rose = deltaPoints !== null && deltaPoints > 0;
  /** Pontos percentuais com sinal tipográfico e a unidade escrita, nunca o símbolo de percentual. */
  const pointsText =
    deltaPoints === null
      ? null
      : `${flat ? '' : rose ? '+' : '−'}${formatDecimal(Math.abs(deltaPoints), Math.abs(deltaPoints) >= WHOLE_POINTS_FROM ? 0 : 1)} p.p.`;
  const trendWord = flat ? 'estável' : rose ? 'alta' : 'queda';
  const DeltaIcon = flat ? Minus : rose ? ArrowUpRight : ArrowDownRight;

  /**
   * A frase acessível chama os mesmos formatadores com os mesmos argumentos do corpo visível, e é
   * por isso que quem ouve recebe o número com a mesma casa de quem enxerga (DAD-5).
   */
  const tickSentence =
    previous !== null && previousFraction !== null && pointsText !== null
      ? `Um tique no contorno marca ${formatPercent(previousFraction, 1)} do ${previous.periodLabel}, ${trendWord} de ${pointsText}.`
      : 'Sem trimestre anterior medido para comparar, então nenhum tique é desenhado.';
  const summary = `Pizza de fração única: indicação responde por ${formatPercent(fraction, 1)} (${formatInt(current.referrals)} de ${formatInt(current.total)}) das oportunidades ganhas no ${current.periodLabel}. ${tickSentence}`;

  return (
    <article
      aria-label={summary}
      className={cn(
        'flex h-full w-full min-w-0 flex-col justify-center gap-1.5 rounded-lg border border-line-subtle bg-surface-raised p-4',
        className,
      )}
      role="group"
      style={style}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div aria-hidden className="h-[88px] w-[132px] shrink-0">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false} margin={MARGIN}>
              <Pie
                cx="50%"
                cy="50%"
                data={slices}
                dataKey="value"
                endAngle={END_ANGLE}
                isAnimationActive={animate}
                nameKey="id"
                outerRadius="100%"
                startAngle={START_ANGLE}
                stroke="var(--surface-raised)"
                strokeWidth={2}
              >
                <Cell fill="var(--chart-1)" key="indicacao" />
                {/* Restante é fundo, não categoria: --line-strong, nunca --surface-overlay, que no
                    tema claro é o mesmo branco do cartão e apaga o contorno da fatia. */}
                <Cell fill="var(--line-strong)" key="outras-origens" />
              </Pie>
              {previousFraction === null ? null : (
                <PreviousTick fraction={previousFraction} label={formatPercent(previousFraction, 1)} name="Anterior" />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-none font-medium text-text-secondary">{label}</p>
          <p className="kpi-number mt-1 text-3xl leading-none font-semibold text-text-primary">{formatPercent(fraction, 1)}</p>
          <p className="mt-1 truncate text-[0.6875rem] leading-none text-text-muted tabular-nums">
            {formatRateWithVolume(current.referrals, current.total)}
          </p>
        </div>
      </div>
      {/* NUM-4: a variação nomeia a base na mesma linha, e o tique é a mesma base desenhada. */}
      <p className="flex min-w-0 items-center gap-1 text-[0.6875rem] leading-none tabular-nums">
        {pointsText === null || previous === null || previousFraction === null ? (
          <span className="truncate text-text-secondary">sem trimestre anterior medido para comparar</span>
        ) : (
          <>
            <DeltaIcon aria-hidden className={cn('size-3 shrink-0', flat ? 'text-text-secondary' : rose ? 'text-positive' : 'text-negative')} />
            <span className={cn('shrink-0 font-semibold', flat ? 'text-text-secondary' : rose ? 'text-positive' : 'text-negative')}>{pointsText}</span>
            <span className="truncate text-text-muted">
              contra {formatPercent(previousFraction, 1)} no {previous.periodLabel}
            </span>
          </>
        )}
      </p>
      {/* ROT-10: numa pizza toda parte se nomeia no desenho parado, o trilho neutro inclusive. */}
      <p className="truncate text-[0.6875rem] leading-none text-text-muted tabular-nums">
        Demais {formatInt(others)} ({formatPercent(1 - fraction, 1)}) de outras origens
      </p>
    </article>
  );
}
