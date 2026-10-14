import { Filter, Unplug } from 'lucide-react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, YAxis, type DotItemDotProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadsByOrigin, type OriginSeries } from './data';

/**
 * Tabela de origens de lead: uma área por linha, todas na mesma escala (0 ao maior valor da
 * tabela). Mês sem coleta é `null` e quebra o traço e a área; zero medido fica colado na base.
 * Origem com poucos meses medidos não ganha traço e escreve indisponível.
 */
export interface OriginAreaTableProps {
  readonly data?: LeadsByOrigin;
  readonly className?: string;
}

const MARGIN = { top: 2, right: 2, bottom: 2, left: 2 } as const;
/** Série com menos meses medidos que isto fica sem traço (série curta). */
const MIN_MEASURED = 8;
/** Piso da ACE-5 para --chart-1: abaixo de 0,66 a área composta cai de 3:1 contra o cartão no tema claro. */
const FILL_OPACITY = 0.66;
const COLUMNS = 'grid grid-cols-[9rem_minmax(0,1fr)_4rem_8rem] items-center gap-x-3';

interface RowModel {
  readonly origin: OriginSeries;
  readonly points: readonly { readonly month: string; readonly value: number | null }[];
  readonly measured: number;
  readonly gaps: number;
  readonly total: number | null;
  readonly isShort: boolean;
}

function monthAt(startMonth: string, offset: number): string {
  const index = Number(startMonth.slice(0, 4)) * 12 + Number(startMonth.slice(5, 7)) - 1 + offset;
  return `${String(Math.floor(index / 12))}-${String((index % 12) + 1).padStart(2, '0')}`;
}

/** Soma dos meses medidos; `null` quando nenhum mês foi medido (EST-1b). */
function sumMeasured(values: readonly (number | null)[]): number | null {
  const measured = values.flatMap((value) => (value === null ? [] : [value]));
  return measured.length === 0 ? null : measured.reduce((sum, value) => sum + value, 0);
}

function buildRow(origin: OriginSeries, startMonth: string): RowModel {
  const measured = origin.leads.filter((value) => value !== null).length;
  const isShort = measured < MIN_MEASURED;
  return {
    origin,
    points: origin.leads.map((value, index) => ({ month: monthAt(startMonth, index), value })),
    measured,
    // Em série curta os meses vazios são história que não existia, não coleta que falhou.
    gaps: isShort ? 0 : origin.leads.length - measured,
    total: isShort ? null : sumMeasured(origin.leads),
    isShort,
  };
}

function Row({ row, max, animate }: { readonly row: RowModel; readonly max: number; readonly animate: boolean }) {
  const { origin, points, gaps, total, isShort, measured } = row;
  return (
    <div className={cn(COLUMNS, 'h-9')}>
      <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{origin.name}</p>
      {isShort ? (
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
          <Unplug aria-hidden className="size-4 shrink-0" />
          <span className="min-w-0 truncate">
            {formatUnavailable()}: série curta
          </span>
        </p>
      ) : (
        <div aria-hidden className="h-7 min-w-0">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart accessibilityLayer={false} data={[...points]} margin={MARGIN}>
              <YAxis domain={[0, max]} hide />
              {/* Base do mês sem coleta: só este fio. O zero medido sobe para a base com traço, a falha não desenha nada. */}
              <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-subtle)" strokeWidth={1} y={0} zIndex={50} />
              <Area
                connectNulls={false}
                dataKey="value"
                dot={({ cx, cy, index }: DotItemDotProps) => {
                  // Mês medido entre dois meses sem coleta não forma segmento: sem este ponto ele sumiria.
                  const before = points[index - 1]?.value ?? null;
                  const after = points[index + 1]?.value ?? null;
                  if (cx === undefined || cy === undefined || points[index]?.value === null || before !== null || after !== null) return null;
                  return <circle cx={cx} cy={cy} fill="var(--chart-1)" key={`lone-${String(index)}`} r={2} />;
                }}
                fill="var(--chart-1)"
                fillOpacity={FILL_OPACITY}
                isAnimationActive={animate}
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                type="linear"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="kpi-number text-right text-xs text-text-primary">{total === null ? '' : formatInt(total)}</p>
      <p className={cn('flex min-w-0 items-center gap-1 text-xs', gaps > 0 ? 'font-semibold text-text-secondary' : 'text-text-muted')}>
        {gaps > 0 ? (
          <>
            <Unplug aria-hidden className="size-3.5 shrink-0" />
            <span className="min-w-0 truncate tabular-nums">
              falhou em {formatInt(gaps)}
            </span>
          </>
        ) : isShort ? (
          <span className="min-w-0 truncate tabular-nums">
            {formatInt(measured)} de {formatInt(origin.leads.length)} medidos
          </span>
        ) : (
          'completa'
        )}
      </p>
    </div>
  );
}

export default function OriginAreaTable({ data = defaultData, className }: OriginAreaTableProps) {
  const animate = useAnimateOnce();
  const rows = data.origins.map((origin) => buildRow(origin, data.startMonth));

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem de lead neste recorte: sem tabela para desenhar.</span>
      </div>
    );
  }

  // Origens com traço por volume decrescente; as de série curta vão por último (ausência não some nem lidera).
  const sorted = [...rows].sort((a, b) => Number(a.isShort) - Number(b.isShort) || (b.total ?? 0) - (a.total ?? 0));
  const drawn = rows.filter((row) => !row.isShort);
  const max = Math.max(1, ...drawn.flatMap((row) => row.origin.leads.flatMap((value) => (value === null ? [] : [value]))));
  const grandTotal = drawn.reduce((sum, row) => sum + (row.total ?? 0), 0);
  const topTwo = sorted.filter((row) => !row.isShort).slice(0, 2);
  const topShare = grandTotal > 0 ? topTwo.reduce((sum, row) => sum + (row.total ?? 0), 0) / grandTotal : null;
  const withGaps = drawn.filter((row) => row.gaps > 0);
  const shortRows = rows.filter((row) => row.isShort);
  const months = data.origins[0]?.leads.length ?? 0;
  const firstMonth = formatMonthShort(data.startMonth);
  const lastMonth = formatMonthShort(monthAt(data.startMonth, Math.max(months - 1, 0)));

  const headline =
    topShare === null
      ? ''
      : `${topTwo.map((row, index) => (index === 0 ? row.origin.name : row.origin.name.toLowerCase())).join(' e ')} somam ${formatPercent(topShare, 0)} dos leads em ${formatInt(months)} meses`;
  const summary = [
    `Tabela de leads por origem em ${formatInt(months)} meses, escala comum.`,
    topTwo[0] ? `Maior: ${topTwo[0].origin.name}.` : '',
    withGaps.length > 0 ? `Sem coleta: ${withGaps.map((row) => `${row.origin.name} ${formatInt(row.gaps)}`).join(', ')} meses.` : '',
    shortRows.length > 0
      ? `${shortRows.map((row) => `${row.origin.name}: série curta, ${formatInt(row.measured)} de ${formatInt(row.origin.leads.length)} meses, sem traço`).join('; ')}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2 rounded-lg border border-line-subtle bg-surface-raised p-3', className)} role="group">
      <p aria-hidden className="text-xs font-medium text-text-secondary">
        {headline}
      </p>
      <div aria-hidden className={cn(COLUMNS, 'text-[0.6875rem] leading-none text-text-muted')}>
        <span>Origem</span>
        <span className="min-w-0 truncate tabular-nums">
          Leads/mês, escala comum 0 a {formatInt(max)}
        </span>
        <span className="text-right">Total</span>
        <span>Coleta (meses)</span>
      </div>
      <div aria-hidden className="flex flex-col">
        {sorted.map((row) => (
          <Row animate={animate} key={row.origin.id} max={max} row={row} />
        ))}
      </div>
      <p aria-hidden className="text-[0.6875rem] leading-snug text-text-muted">
        Janela de {firstMonth} a {lastMonth}. Traço colado na base: zero medido. Vazio: mês sem coleta, nunca zero. Total soma só os meses medidos.
      </p>
    </div>
  );
}
