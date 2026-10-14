import { ArrowDownRight, ArrowRight, ArrowUpRight, Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type RevenueChangeBreakdown } from './data';

/**
 * Cartão de KPI com contribuições de sinais opostos: a variação da receita entre dois períodos e quem
 * a puxou, com sinal tipográfico e ícone, ordenado pelo módulo. O cartão recusa a barra de largura
 * quando há altas e quedas juntas (largura não carrega sinal), escreve "sem base" no lugar da
 * participação quando ela não tem base e nomeia o resíduo quando os itens não fecham a variação.
 */
export interface RevenueChangeCardProps {
  readonly data?: RevenueChangeBreakdown;
  readonly className?: string;
}

/** Diferença abaixo de R$ 1 é arredondamento: nem resíduo, nem sinal. */
const TOLERANCE = 1;
const RESIDUAL_ID = 'residual';
const RESIDUAL_LABEL = 'Demais produtos e ajustes';
/** Percentual a partir de 10% vai inteiro; abaixo disso, com uma casa (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;
const COLLATION_LOCALE = 'pt-BR';
/** Sinal de menos tipográfico (U+2212), nunca hífen. */
const MINUS = '−';

type Direction = 'up' | 'down' | 'flat';

interface ChangeRow {
  readonly id: string;
  readonly name: string;
  readonly change: number;
  readonly isResidual: boolean;
  readonly direction: Direction;
  /** Fração da variação total, ou `null` quando a participação não tem base. */
  readonly share: number | null;
}

interface ChangeReading {
  readonly change: number;
  readonly base: number;
  readonly rows: readonly ChangeRow[];
  readonly gains: number;
  readonly losses: number;
  /** Altas e quedas juntas: a barra de largura é recusada. */
  readonly mixedSigns: boolean;
}

const ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight } as const;

function directionOf(value: number): Direction {
  if (value >= TOLERANCE) return 'up';
  if (value <= -TOLERANCE) return 'down';
  return 'flat';
}

function signedCurrency(value: number): string {
  const direction = directionOf(value);
  if (direction === 'flat') return formatCurrencyCompact(0);
  return `${direction === 'up' ? '+' : MINUS}${formatCurrencyCompact(Math.abs(value))}`;
}

/**
 * Participação com sinal à mão sobre o valor absoluto (NUM-3); zero sai sem sinal.
 *
 * O teste é sobre o **texto impresso**, não sobre a fração: `fraction > 0 ? '+' : MINUS` mandava o
 * zero para o ramo negativo e imprimia "−0,0%", e um `=== 0` cru não bastaria, porque a
 * participação minúscula que arredonda para 0,0% imprimiria "−0,0%" do mesmo jeito. Zero não tem
 * sinal, e o que o leitor vê é o arredondamento.
 */
function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  const digits = absolute >= WHOLE_PERCENT_FROM ? 0 : 1;
  const text = formatPercent(absolute, digits);
  if (text === formatPercent(0, digits)) return text;
  return `${fraction > 0 ? '+' : MINUS}${text}`;
}

/** Cor pela polaridade da métrica, nunca pelo sinal sozinho (COR-6). */
function toneOf(direction: Direction, goodDirection: RevenueChangeBreakdown['goodDirection']): string {
  if (direction === 'flat') return 'text-text-secondary';
  return direction === goodDirection ? 'text-positive' : 'text-negative';
}

/** Ordena pelo módulo, acrescenta o resíduo nomeado e decide se participação e barra têm base. */
function readChange(data: RevenueChangeBreakdown): ChangeReading | null {
  if (data.current === null || data.base === null || data.items.length === 0) return null;
  const change = data.current - data.base;
  const residual = change - data.items.reduce((sum, item) => sum + item.change, 0);
  const sorted = [...data.items].sort(
    (a, b) => Math.abs(b.change) - Math.abs(a.change) || a.name.localeCompare(b.name, COLLATION_LOCALE),
  );
  const entries = sorted.map((item) => ({ id: item.id, name: item.name, change: item.change, isResidual: false }));
  if (Math.abs(residual) >= TOLERANCE) entries.push({ id: RESIDUAL_ID, name: RESIDUAL_LABEL, change: residual, isResidual: true });
  const gains = entries.reduce((sum, entry) => sum + Math.max(entry.change, 0), 0);
  const losses = entries.reduce((sum, entry) => sum + Math.min(entry.change, 0), 0);
  const mixedSigns = gains >= TOLERANCE && losses <= -TOLERANCE;
  const hasShareBase = directionOf(change) !== 'flat' && !mixedSigns;
  const rows = entries.map((entry) => ({
    ...entry,
    direction: directionOf(entry.change),
    share: hasShareBase ? entry.change / change : null,
  }));
  return { change, base: data.base, rows, gains, losses, mixedSigns };
}

function shareNote(reading: ChangeReading): string | null {
  if (reading.rows.every((row) => row.share !== null)) return null;
  return directionOf(reading.change) === 'flat'
    ? 'participação sem base: a variação total é zero'
    : 'participação sem base: altas e quedas passam de 100%';
}

export default function RevenueChangeCard({ data = defaultData, className }: RevenueChangeCardProps) {
  const change = data.current !== null && data.base !== null ? data.current - data.base : null;
  const direction = change === null ? 'flat' : directionOf(change);
  const tone = toneOf(direction, data.goodDirection);
  const DeltaIcon = ICON[direction];
  const reading = readChange(data);
  const note = reading ? shareNote(reading) : null;

  const summary = (() => {
    const head = `Cartão de KPI com contribuições de sinais opostos: ${data.label.toLowerCase()}`;
    if (change === null) {
      const missing = data.current === null ? data.periodLabel : data.basePeriodLabel;
      return `${head}, ${formatUnavailable()} por falta de coleta em ${missing}.`;
    }
    const changeText =
      direction === 'flat'
        ? `ficou estável em ${formatCurrencyCompact(data.current ?? 0)}`
        : `${signedCurrency(change)}, de ${formatCurrencyCompact(data.base ?? 0)} para ${formatCurrencyCompact(data.current ?? 0)}`;
    const base = `${head} entre ${data.basePeriodLabel} e ${data.periodLabel}: ${changeText}.`;
    if (reading === null || reading.rows.length === 0) return base;
    const top = [...reading.rows].sort((a, b) => b.change - a.change)[0];
    const bottom = [...reading.rows].sort((a, b) => a.change - b.change)[0];
    if (!top || !bottom || top.id === bottom.id) return base;
    return `${base} Maior alta ${top.name}, ${signedCurrency(top.change)}; maior queda ${bottom.name}, ${signedCurrency(bottom.change)}.`;
  })();

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4 tabular-nums', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-xs text-text-muted">{data.periodLabel}</p>
      </div>

      {change === null ? (
        <>
          <p className="mt-2 flex items-center gap-2 text-text-muted">
            <Unplug aria-hidden className="size-5 shrink-0" />
            <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
          </p>
          <p className="mt-2 text-xs text-text-muted">
            sem coleta em {data.current === null ? data.periodLabel : data.basePeriodLabel}: a variação também fica de fora
          </p>
        </>
      ) : (
        <>
          <p className={cn('mt-2 flex items-center gap-1.5', tone)}>
            <DeltaIcon aria-hidden className="size-5 shrink-0" strokeWidth={2.5} />
            <span className="kpi-number text-3xl leading-none font-semibold">{signedCurrency(change)}</span>
          </p>
          <p className="mt-2 min-w-0 text-xs text-text-muted">
            de <span className="kpi-number text-text-secondary">{formatCurrencyCompact(data.base ?? 0)}</span> em {data.basePeriodLabel} para{' '}
            <span className="kpi-number text-text-secondary">{formatCurrencyCompact(data.current ?? 0)}</span>
          </p>
        </>
      )}

      {change !== null && reading === null ? (
        <div className="mt-4 flex min-h-0 flex-1 items-center gap-2 text-xs text-text-muted" role="status">
          <Filter aria-hidden className="size-4 shrink-0" />
          <span>Nenhum item de contribuição registrado neste recorte.</span>
        </div>
      ) : null}

      {reading !== null ? (
        <>
          <ul className="mt-auto flex min-w-0 flex-col gap-2 pt-4">
            {reading.rows.map((row) => {
              const RowIcon = ICON[row.direction];
              const rowTone = row.isResidual ? 'text-text-muted' : toneOf(row.direction, data.goodDirection);
              return (
                <li className="flex min-w-0 items-center gap-2 text-xs" key={row.id}>
                  <RowIcon aria-hidden className={cn('size-3.5 shrink-0', rowTone)} strokeWidth={2.5} />
                  <span className={cn('min-w-0 flex-1 leading-4', row.isResidual ? 'text-text-muted' : 'text-text-secondary')}>{row.name}</span>
                  <span className={cn('shrink-0 text-right font-display font-semibold', rowTone)}>{signedCurrency(row.change)}</span>
                  <span className="w-20 shrink-0 text-right text-[0.6875rem] text-text-muted">
                    {row.share === null ? 'sem base' : signedPercent(row.share)}
                  </span>
                </li>
              );
            })}
          </ul>
          {note ? <p className="mt-2 text-[0.6875rem] text-text-muted">{note}</p> : null}
          {reading.mixedSigns ? (
            <p className="mt-1 text-[0.6875rem] text-text-muted">Sinais opostos: a forma passo a passo está na cascata (família 19)</p>
          ) : null}
        </>
      ) : null}
    </article>
  );
}
