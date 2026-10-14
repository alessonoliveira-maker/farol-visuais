import { Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveGrid, type ExecutiveWeekly } from './data';

/**
 * Grade de scorecards: a mesma métrica, receita semanal, repetida por executivo, todos no mesmo
 * domínio de eixo (EIX-9), com uma mediana tracejada na mesma posição em cada cartão e a ordem
 * declarada uma vez no cabeçalho. HTML com Tailwind; a polyline é SVG puro em geometria própria.
 */
export interface ExecutiveGridChartProps {
  readonly data?: ExecutiveGrid;
  readonly height?: number;
  readonly className?: string;
}

/** A escala comum aos cartões começa no zero (EIX-1); o cabeçalho escreve este mesmo número. */
const DOMAIN_MIN = 0;
const VIEW_WIDTH = 120;
const VIEW_HEIGHT = 40;
const VIEW_PAD = 3;

function polylinePoints(series: readonly number[], domainMax: number): string {
  const step = VIEW_WIDTH / (series.length - 1);
  return series
    .map((value, index) => {
      const x = (index * step).toFixed(2);
      const y = (VIEW_PAD + (1 - Math.min(value, domainMax) / domainMax) * (VIEW_HEIGHT - VIEW_PAD * 2)).toFixed(2);
      return `${x},${y}`;
    })
    .join(' ');
}

function total(executive: ExecutiveWeekly): number {
  return executive.weeklyRevenue.reduce((sum, value) => sum + value, 0);
}

/**
 * Mediana, ou `null` quando não há amostra. Devolver `0` para lista vazia escreveria "mediana
 * tracejada em R$ 0" e plantaria o traço na base de todos os cartões, que é zero medido no lugar
 * de ausência: nunca trocar por `?? 0` no chamador (mesma forma da
 * `13_progresso-meta-e-gauge/01_barra-de-progresso-linear/v3` e da `v4` deste modelo).
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle] ?? 0;
  const lower = sorted[middle - 1] ?? upper;
  return sorted.length % 2 === 0 ? (upper + lower) / 2 : upper;
}

export default function ExecutiveGridChart({ data = defaultData, height, className }: ExecutiveGridChartProps) {
  /** Recorte sem ninguém substitui a grade inteira (EST-1): sem cartão, sem escala e sem líder,
   * que é o caminho em que a leitura do primeiro colocado não existe. */
  if (data.executives.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4" />
        <span>Nenhum executivo neste recorte: a grade fica vazia até o filtro devolver pessoas.</span>
      </div>
    );
  }

  const ranked = [...data.executives].sort((a, b) => total(b) - total(a));
  /** A guarda de vazio da mediana é a própria lista de semanas, não `data.executives`: há executivo
   * no recorte e ainda assim pode não haver nenhuma semana medida. */
  const weeklyPool = data.executives.flatMap((executive) => executive.weeklyRevenue);
  const medianWeekly = median(weeklyPool);
  const medianY =
    medianWeekly === null ? null : (VIEW_PAD + (1 - medianWeekly / data.domainMax) * (VIEW_HEIGHT - VIEW_PAD * 2)).toFixed(2);
  const leader = ranked[0];
  const highlight = data.executives.find((executive) => executive.id === data.highlightId);
  const highlightRank = ranked.findIndex((executive) => executive.id === data.highlightId) + 1;

  const summary = [
    `Grade de ${String(data.executives.length)} executivos com receita semanal do ${data.periodLabel}, mesma escala de R$ 0 a ${formatCurrencyCompact(data.domainMax)}.`,
    leader ? `${leader.name} lidera com ${formatCurrencyCompact(total(leader))} no trimestre.` : '',
    highlight ? `${highlight.name} está em ${String(highlightRank)}º de ${String(data.executives.length)}, com ${formatCurrencyCompact(total(highlight))}.` : '',
    medianWeekly === null
      ? `Mediana semanal ${formatUnavailable()}: nenhuma semana medida, sem traço nos cartões.`
      : `Mediana semanal de ${formatCurrencyCompact(medianWeekly)} em todos os cartões.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <p className="text-[0.6875rem] text-text-muted">
        Ordenado por receita, escala semanal de <span className="kpi-number">{formatCurrencyCompact(DOMAIN_MIN)}</span> a{' '}
        <span className="kpi-number">{formatCurrencyCompact(data.domainMax)}</span>,{' '}
        {medianWeekly === null ? (
          <span className="inline-flex items-center gap-1 align-[-2px]">
            mediana semanal <Unplug aria-hidden className="size-3.5" />
            {formatUnavailable()}
          </span>
        ) : (
          <>
            mediana tracejada em <span className="kpi-number">{formatCurrencyCompact(medianWeekly)}</span>
          </>
        )}
      </p>

      <div className="mt-2 grid min-h-0 flex-1 grid-cols-3 items-stretch gap-2 @sm:grid-cols-4 @lg:grid-cols-6">
        {ranked.map((executive, index) => {
          const isHighlighted = executive.id === data.highlightId;
          return (
            <div className="flex h-full flex-col rounded-lg border border-line-subtle bg-surface-raised p-3" key={executive.id}>
              <p
                className={cn(
                  'min-h-8 text-xs leading-4',
                  isHighlighted ? 'font-bold text-text-primary' : 'font-medium text-text-secondary',
                )}
              >
                {executive.name}
              </p>
              <p className="mt-0.5 text-[0.6875rem] text-text-muted tabular-nums">
                {formatInt(index + 1)}º de {formatInt(data.executives.length)}
              </p>
              <p className="kpi-number mt-1 text-sm font-semibold text-text-primary">{formatCurrencyCompact(total(executive))}</p>
              <div aria-hidden className="mt-1 min-h-6 flex-1">
                <svg className="block h-full w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
                  {/* Sem mediana não há traço: desenhá-lo em `medianY` de `?? 0` colaria a linha na
                      base de todo cartão e ela se leria como mediana de R$ 0. */}
                  {medianY === null ? null : (
                    <line
                      stroke="var(--text-muted)"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                      x1={0}
                      x2={VIEW_WIDTH}
                      y1={medianY}
                      y2={medianY}
                    />
                  )}
                  <polyline
                    fill="none"
                    points={polylinePoints(executive.weeklyRevenue, data.domainMax)}
                    stroke={isHighlighted ? 'var(--chart-1)' : 'var(--line-strong)'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
