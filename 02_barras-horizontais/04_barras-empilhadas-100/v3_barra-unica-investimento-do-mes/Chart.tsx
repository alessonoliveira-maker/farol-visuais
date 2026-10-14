import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyInvestment, type PlatformSpend } from './data';

/**
 * Barra única de composição: uma faixa larga dividida em segmentos pelo investimento de mídia do
 * mês, com percentual dentro das três maiores plataformas e o restante agregado em "outras".
 * HTML com Tailwind, sem Recharts: a largura de cada segmento é `style={{ width: '<pct>%' }}`
 * com um vão fixo entre eles. O resto do arredondamento fecha no último segmento, para a soma
 * nunca passar de 100% nem deixar um vão na ponta (CONTRATO, NUM-2).
 */
export interface PlatformSpendBarProps {
  readonly data?: MonthlyInvestment;
  readonly className?: string;
}

/** Só as três maiores plataformas ganham fatia própria; da quarta em diante viram "outras". */
const TOP_N = 3;
/** Vão entre segmentos vizinhos, em px (COR-5): as categóricas não contrastam entre si. */
const SEGMENT_GAP = 2;
/** Abaixo deste percentual o segmento não comporta o rótulo sem apertar. */
const MIN_LABEL_SHARE = 10;

interface Segment {
  readonly id: string;
  readonly label: string;
  /** null: agregado neutro ("outras"), sem cor de série. */
  readonly color: string | null;
  readonly share: number;
  readonly showLabel: boolean;
}

interface SegmentGroup {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly color: string | null;
}

/** O seletor: top N com cor própria, o resto agregado, e o percentual calculado antes do desenho. */
function toSegments(platforms: readonly PlatformSpend[]): { segments: readonly Segment[]; total: number } {
  const sorted = [...platforms].sort((a, b) => b.spend - a.spend);
  const total = sorted.reduce((sum, platform) => sum + platform.spend, 0);
  if (total <= 0) return { segments: [], total: 0 };

  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);
  const named: SegmentGroup[] = top.map((platform) => ({
    id: platform.id,
    label: platform.label,
    value: platform.spend,
    color: CHART_SERIES_COLORS[platform.slot - 1] ?? 'var(--chart-1)',
  }));
  const groups: readonly SegmentGroup[] =
    rest.length > 0
      ? [...named, { id: 'outras', label: `Outras (${String(rest.length)})`, value: rest.reduce((sum, p) => sum + p.spend, 0), color: null }]
      : named;

  let assigned = 0;
  return {
    total,
    segments: groups.map((group, index) => {
      const isLast = index === groups.length - 1;
      const share = isLast ? 100 - assigned : Math.floor((group.value / total) * 100);
      assigned += share;
      return { id: group.id, label: group.label, color: group.color, share, showLabel: index < TOP_N && share >= MIN_LABEL_SHARE };
    }),
  };
}

export default function PlatformSpendBar({ data = defaultData, className }: PlatformSpendBarProps) {
  const { segments, total } = toSegments(data.platforms);
  const month = formatMonthLong(data.month);

  if (segments.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum investimento medido em {month}: não há composição de plataforma para mostrar.</span>
      </div>
    );
  }

  const leader = segments[0];
  const summary = leader
    ? `Barra de composição com o investimento de ${formatCurrencyCompact(total)} em mídia paga em ${month}, dividido em ${String(data.platforms.length)} plataformas. ${leader.label} lidera com ${formatPercent(leader.share / 100, 0)}.`
    : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-3', className)} role="img">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">Investimento em mídia paga, {month}</p>
        <p className="kpi-number shrink-0 text-sm font-semibold text-text-primary">{formatCurrencyCompact(total)}</p>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full" role="presentation">
        {segments.map((segment, index) => (
          <div
            className={cn('flex h-full items-center justify-center', segment.color === null && 'border border-dashed border-line-strong')}
            key={segment.id}
            style={{ backgroundColor: segment.color ?? undefined, marginLeft: index > 0 ? SEGMENT_GAP : undefined, width: `${String(segment.share)}%` }}
          >
            {segment.showLabel ? (
              <span className="font-display text-[11px] font-medium" style={{ color: segment.color ? 'var(--accent-cyan-contrast)' : 'var(--text-muted)' }}>
                {formatPercent(segment.share / 100, 0)}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <li className="flex items-center gap-2 text-xs" key={segment.id}>
            <span
              aria-hidden
              className={cn('size-2.5 shrink-0 rounded-[2px]', segment.color === null && 'border-[1.5px] border-line-strong')}
              style={segment.color ? { backgroundColor: segment.color } : undefined}
            />
            <span className="text-text-secondary">{segment.label}</span>
            <span className="font-display text-text-muted">{formatPercent(segment.share / 100, 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
