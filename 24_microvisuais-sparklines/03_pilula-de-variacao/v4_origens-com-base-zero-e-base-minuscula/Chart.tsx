import { Minus, TrendingDown, TrendingUp, Unplug, type LucideIcon } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthPair, type OriginBoard, type Polarity } from './data';

/**
 * Variação por origem com base frágil: cada medida leva a pílula contra jul/26, mas base zero não
 * vira percentual, base minúscula vira delta absoluto e origem sem coleta escreve a ausência. A
 * cor segue a polaridade da medida (CPL sobe = pior, investimento sem polaridade fica neutro).
 */
export interface OriginVarianceProps {
  readonly data?: OriginBoard;
  readonly className?: string;
}

/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;

type Direction = 'up' | 'down' | 'flat';
type Tone = 'good' | 'bad' | 'neutral';
type Measure = 'leads' | 'cpl' | 'spend';

type Cell =
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'no-base' }
  | { readonly kind: 'move'; readonly direction: Direction; readonly tone: Tone; readonly text: string };

const ICON: Record<Direction, LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TONE_CLASS: Record<Tone, string> = {
  good: 'text-positive',
  bad: 'text-negative',
  neutral: 'text-text-secondary',
};
const MEASURE_LABEL: Record<Measure, string> = { leads: 'Leads', cpl: 'CPL qualificado', spend: 'Investimento' };
/** O nome em meio de frase: a sigla CPL não ganha minúscula. */
const MEASURE_IN_SENTENCE: Record<Measure, string> = { leads: 'leads', cpl: 'CPL qualificado', spend: 'investimento' };
const POLARITY_PHRASE: Record<Polarity, string> = {
  'higher-is-better': 'alta é melhor',
  'lower-is-better': 'alta é pior',
  neutral: 'sem polaridade',
};

function signOf(value: number): string {
  return value > 0 ? '+' : value < 0 ? '−' : '';
}

/** Sinal à mão sobre o valor absoluto: `formatPercent` não escreve o `+` (NUM-3). */
function percentDelta(fraction: number): string {
  const absolute = Math.abs(fraction);
  return `${signOf(fraction)}${formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1)}`;
}

function leadsDelta(delta: number): string {
  return `${signOf(delta)}${formatInt(Math.abs(delta))} ${Math.abs(delta) === 1 ? 'lead' : 'leads'}`;
}

function toneOf(direction: Direction, polarity: Polarity): Tone {
  if (direction === 'flat' || polarity === 'neutral') return 'neutral';
  return (polarity === 'higher-is-better') === (direction === 'up') ? 'good' : 'bad';
}

/** A cor sai da polaridade da medida, nunca do sinal do delta (COR-6). */
function cellOf(pair: MonthPair, measure: Measure, board: OriginBoard): Cell {
  const { current, previous } = pair;
  if (current === null) return { kind: 'unavailable' };
  if (previous === null || previous === 0) return { kind: 'no-base' };
  const polarity = board.polarity[measure];
  if (measure === 'leads' && previous < board.smallBaseBelow) {
    const delta = current - previous;
    const direction: Direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
    return { kind: 'move', direction, tone: toneOf(direction, polarity), text: leadsDelta(delta) };
  }
  const fraction = (current - previous) / previous;
  const direction: Direction = Math.abs(fraction) <= board.flatWithin ? 'flat' : fraction > 0 ? 'up' : 'down';
  return { kind: 'move', direction, tone: toneOf(direction, polarity), text: percentDelta(fraction) };
}

function valueText(measure: Measure, value: number): string {
  return measure === 'leads' ? formatInt(value) : formatCurrencyCompact(value);
}

function CellView({ cell, measure, value }: { cell: Cell; measure: Measure; value: number | null }) {
  if (cell.kind === 'unavailable') {
    return (
      <span className="inline-flex items-center gap-1.5 text-text-muted">
        <Unplug aria-hidden className="size-3.5" />
        {formatUnavailable()}
      </span>
    );
  }
  const Icon = cell.kind === 'move' ? ICON[cell.direction] : Minus;
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className={cn('kpi-number shrink-0 text-right text-sm font-semibold text-text-primary', VALUE_CLASS[measure])}>
        {value === null ? formatUnavailable() : valueText(measure, value)}
      </span>
      <span className={cn('inline-flex items-center gap-1 font-semibold', cell.kind === 'move' ? TONE_CLASS[cell.tone] : 'text-text-secondary')}>
        <Icon aria-hidden className="size-3.5 shrink-0" strokeWidth={2.25} />
        {cell.kind === 'move' ? <span className="kpi-number">{cell.text}</span> : null}
        {cell.kind === 'move' && cell.direction === 'flat' ? <span className="font-medium">estável</span> : null}
        {cell.kind === 'no-base' ? (
          <span className="font-medium text-text-muted">
            {measure === 'leads' ? 'sem mês anterior medido para comparar' : 'sem base'}
          </span>
        ) : null}
      </span>
    </span>
  );
}

const MEASURES: readonly Measure[] = ['leads', 'cpl', 'spend'];
/** Larguras fixas de coluna: a coluna de leads carrega a frase mais longa. */
const COLUMN_CLASS: Record<Measure, string> = { leads: 'w-76', cpl: 'w-36', spend: 'w-40' };
/** Largura do número em cada coluna, para as pílulas começarem no mesmo ponto em todas as linhas. */
const VALUE_CLASS: Record<Measure, string> = { leads: 'w-8', cpl: 'w-14', spend: 'w-20' };

export default function OriginVariance({ data = defaultData, className }: OriginVarianceProps) {
  const rows = data.rows.map((row) => ({ row, cells: { leads: cellOf(row.leads, 'leads', data), cpl: cellOf(row.cpl, 'cpl', data), spend: cellOf(row.spend, 'spend', data) } }));
  const leadsMoves = rows.map(({ cells }) => cells.leads);
  const moving = (direction: Direction) => leadsMoves.filter((cell) => cell.kind === 'move' && cell.direction === direction).length;
  const without = (kind: 'no-base' | 'unavailable') => leadsMoves.filter((cell) => cell.kind === kind).length;
  const compare = `${formatMonthShort(data.month)} contra ${formatMonthShort(data.baseMonth)}`;

  const summary = [
    `Variação de leads por origem em ${compare}, ${formatInt(rows.length)} origens: `,
    `${formatInt(moving('up'))} em alta, ${formatInt(moving('down'))} em queda, ${formatInt(moving('flat'))} estável, `,
    `${formatInt(without('no-base'))} sem base no mês anterior e ${formatInt(without('unavailable'))} sem dado no mês atual.`,
    ' CPL qualificado em alta é pior; o investimento não tem polaridade.',
  ].join('');

  if (rows.length === 0) {
    return (
      <article
        aria-label="Variação por origem vazia: o recorte não tem origens para comparar."
        className={cn('flex h-full w-full min-w-0 items-center justify-center rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
        role="status"
      >
        <p className="text-xs text-text-muted">Nenhuma origem no recorte, então não há variação a comparar.</p>
      </article>
    );
  }

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <p className="text-xs font-medium text-text-secondary">
        Variação de {compare}; neutra dentro de ±{formatPercent(data.flatWithin, 0)}
      </p>
      <p className="mt-0.5 text-[0.6875rem] text-text-muted tabular-nums">
        base de leads abaixo de {formatInt(data.smallBaseBelow)} mostra o delta absoluto; a cor segue a medida:{' '}
        {MEASURES.map((measure) => `${MEASURE_IN_SENTENCE[measure]}, ${POLARITY_PHRASE[data.polarity[measure]]}`).join('; ')}
      </p>

      <div className="mt-3 flex min-w-0 flex-1 flex-col text-xs">
        <div className="flex h-5 min-w-0 items-center gap-4 text-[0.6875rem] text-text-muted">
          <span className="min-w-0 flex-1">Origem</span>
          {MEASURES.map((measure) => (
            <span className={cn('shrink-0', COLUMN_CLASS[measure])} key={measure}>
              {MEASURE_LABEL[measure]}
            </span>
          ))}
        </div>
        {rows.map(({ row, cells }) => (
          <div className="flex h-7 min-w-0 items-center gap-4 tabular-nums" key={row.id}>
            <span className="min-w-0 flex-1 font-medium text-text-secondary">{row.name}</span>
            {MEASURES.map((measure) => (
              <span className={cn('shrink-0', COLUMN_CLASS[measure])} key={measure}>
                <CellView cell={cells[measure]} measure={measure} value={row[measure].current} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}
