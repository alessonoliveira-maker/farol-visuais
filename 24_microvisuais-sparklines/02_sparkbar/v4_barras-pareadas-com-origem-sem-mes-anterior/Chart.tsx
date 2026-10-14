import { ArrowDownRight, ArrowRight, ArrowUpRight, Filter } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginComparison } from './data';

/**
 * Barras pareadas mini: por origem, o mês atual em cima (--chart-1) e o mês anterior embaixo
 * (--line-strong), as duas na mesma escala, do zero ao maior valor das duas séries de todas as
 * linhas. Origem sem mês anterior medido não ganha barra de referência: o texto diz isso.
 */
export interface OriginPairedBarsProps {
  readonly data?: OriginComparison;
  readonly className?: string;
}

const CELL_HEIGHT = 24;
const ROW_GAP = 8;
const BAR_SIZE = 9;
const PAIR_GAP = 4;
const COLUMNS = '11.5rem minmax(0, 1fr) 3.5rem 4.5rem';
/** Variação abaixo disto (0,5%) é lida como estável: nem verde nem vermelho. */
const FLAT_THRESHOLD = 0.005;
/** A partir de 10% de variação, a casa decimal não muda a decisão. */
const WHOLE_PERCENT_FROM = 0.1;

function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  const digits = absolute >= WHOLE_PERCENT_FROM ? 0 : 1;
  // Sinal de menos tipográfico (U+2212), não hífen.
  return `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, digits)}`;
}

/** Variação contra a base; `null` quando não há base medida ou ela é zero. */
function variationOf(current: number, previous: number | null): number | null {
  return previous === null || previous === 0 ? null : (current - previous) / previous;
}

export default function OriginPairedBars({ data = defaultData, className }: OriginPairedBarsProps) {
  const animate = useAnimateOnce();

  if (data.rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não houve lead registrado no período.</span>
      </div>
    );
  }

  const rows = [...data.rows].sort((a, b) => b.current - a.current);
  // Escala comum: o máximo olha o atual e o anterior de todas as linhas (EIX-9).
  const scaleMax = rows.reduce((top, row) => Math.max(top, row.current, row.previous ?? 0), 0);
  const month = formatMonthShort(data.month);
  const previousMonth = formatMonthShort(data.previousMonth);
  const variations = rows.map((row) => variationOf(row.current, row.previous));
  const grew = variations.filter((value) => value !== null && value > FLAT_THRESHOLD).length;
  const fell = variations.filter((value) => value !== null && value < -FLAT_THRESHOLD).length;
  const withoutBase = rows.filter((row) => row.previous === null).length;
  const leader = rows.at(0);

  const summary = leader
    ? `Barras pareadas com os leads de ${formatInt(rows.length)} origens em ${month} contra ${previousMonth}, na mesma escala. ${formatInt(grew)} cresceram, ${formatInt(fell)} caíram e ${formatInt(withoutBase)} ${withoutBase === 1 ? 'não tem' : 'não têm'} mês anterior medido. ${leader.name} lidera, com ${formatInt(leader.current)} leads.`
    : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img">
      <div
        aria-hidden
        className="grid items-baseline gap-x-3 text-[0.6875rem] leading-none text-text-muted"
        style={{ gridTemplateColumns: COLUMNS }}
      >
        <span>Origem</span>
        <span>
          em cima {month}, embaixo {previousMonth}
        </span>
        <span className="text-right">Leads</span>
        <span className="text-right">Variação</span>
      </div>

      <ul aria-hidden className="mt-3 flex min-h-0 flex-1 flex-col" style={{ gap: ROW_GAP }}>
        {rows.map((row) => {
          const variation = variationOf(row.current, row.previous);
          const isFlat = variation !== null && Math.abs(variation) <= FLAT_THRESHOLD;
          const Icon = isFlat ? ArrowRight : variation !== null && variation < 0 ? ArrowDownRight : ArrowUpRight;
          return (
            <li className="grid items-center gap-x-3" key={row.id} style={{ gridTemplateColumns: COLUMNS, height: CELL_HEIGHT }}>
              <span className="min-w-0 text-xs text-text-secondary">{row.name}</span>
              <div className="relative h-full min-w-0">
                <ResponsiveContainer height="100%" width="100%">
                  {/* Layout vertical: a categoria corre em Y e o valor em X; a ordem dos Bar é de cima para baixo. */}
                  <BarChart accessibilityLayer={false} barCategoryGap={0} barGap={PAIR_GAP} data={[row]} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis domain={[0, scaleMax]} hide type="number" />
                    <YAxis dataKey="name" hide type="category" />
                    <Bar barSize={BAR_SIZE} dataKey="current" fill="var(--chart-1)" isAnimationActive={animate} radius={[0, 2, 2, 0]} />
                    {/* null no anterior: o pacote não desenha a barra, que é a ausência certa (nunca zero). */}
                    <Bar barSize={BAR_SIZE} dataKey="previous" fill="var(--line-strong)" isAnimationActive={animate} radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {row.previous === null ? (
                  <span className="absolute bottom-0 left-0 text-[0.6875rem] leading-3 text-text-muted">sem mês anterior medido para comparar</span>
                ) : null}
              </div>
              <span className="text-right">
                <span className="kpi-number block text-xs leading-3 font-semibold text-text-primary">{formatInt(row.current)}</span>
                <span className="kpi-number block text-[0.6875rem] leading-3 text-text-muted">{row.previous === null ? '' : formatInt(row.previous)}</span>
              </span>
              <span className="flex justify-end">
                {variation === null ? null : (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-xs font-semibold',
                      isFlat ? 'text-text-secondary' : variation > 0 ? 'text-positive' : 'text-negative',
                    )}
                  >
                    <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
                    <span className="kpi-number">{isFlat ? 'estável' : signedPercent(variation)}</span>
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
