import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_MONTH, highlightId as defaultHighlightId, type ExecutiveMonths, type Outcome } from './data';

/**
 * Tabela de win/loss: uma linha por executivo, 12 blocos de largura e altura fixas por linha,
 * ordenada pelos meses com meta batida e com a contagem à direita. Os meses ficam só no cabeçalho,
 * no início de cada trimestre, alinhados à grade de blocos.
 */
export interface TargetTableProps {
  readonly data?: readonly ExecutiveMonths[];
  readonly highlightId?: string;
  readonly className?: string;
}

const CELL = 14;
const GAP = 2;
const COLUMNS = 12;
const VIEW_W = COLUMNS * CELL + (COLUMNS - 1) * GAP;
const VIEW_H = 24;
const MID = VIEW_H / 2;
const BLOCK = 10;
const CENTER_GAP = 2;
/** Um rótulo de mês a cada trimestre: 3 colunas de 14 px mais 2 vãos, 48 px por rótulo. */
const LABEL_EVERY = 3;

interface Ranked {
  readonly row: ExecutiveMonths;
  readonly wins: number;
  readonly measured: number;
  readonly lossRun: number;
}

/** Mês `offset` meses depois do primeiro, em texto `YYYY-MM`. */
function monthAt(offset: number): string {
  const [year, month] = FIRST_MONTH.split('-').map(Number);
  const index = (year ?? 0) * 12 + ((month ?? 1) - 1) + offset;
  return `${String(Math.floor(index / 12))}-${String((index % 12) + 1).padStart(2, '0')}`;
}

/** Quantos meses seguidos, até o último, ficaram sem a meta. */
function trailingLosses(months: readonly Outcome[]): number {
  let length = 0;
  for (let index = months.length - 1; index >= 0 && months[index] === 'loss'; index -= 1) length += 1;
  return length;
}

/** Ordena por meses batidos, do maior ao menor; em empate vale a ordem do dado. */
function rank(rows: readonly ExecutiveMonths[]): Ranked[] {
  return rows
    .map((row) => {
      const wins = row.months.filter((outcome) => outcome === 'win').length;
      const losses = row.months.filter((outcome) => outcome === 'loss').length;
      return { row, wins, measured: wins + losses, lossRun: trailingLosses(row.months) };
    })
    .sort((a, b) => b.wins - a.wins);
}

export default function TargetTable({ data = defaultData, highlightId = defaultHighlightId, className }: TargetTableProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2 text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4" />
        <p className="text-xs">O recorte não tem executivos com meta, então não há tabela para desenhar.</p>
      </div>
    );
  }

  const ranked = rank(data);
  const top = ranked[0];
  const worst = ranked.reduce<Ranked | null>((best, item) => (item.lossRun > (best?.lossRun ?? 0) ? item : best), null);
  const monthCount = top?.row.months.length ?? 0;
  const lastMonth = formatMonthShort(monthAt(monthCount - 1));
  const labels = Array.from({ length: Math.ceil(monthCount / LABEL_EVERY) }, (_, group) => monthAt(group * LABEL_EVERY));

  const summary =
    `Win/loss da meta mensal de ${formatInt(data.length)} executivos em ${formatInt(monthCount)} meses, até ${lastMonth}. ` +
    (top ? `${top.row.name} é o mais regular, com ${formatInt(top.wins)} de ${formatInt(top.measured)} meses. ` : '') +
    (worst
      ? `A maior sequência recente de falhas é de ${worst.row.name}, ${formatInt(worst.lossRun)} meses seguidos.`
      : 'Nenhum executivo fechou o período em falha.');

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-center gap-3', className)} role="figure">
      <div aria-hidden>
        <p className="text-xs text-text-secondary">
          <span className="font-display text-sm font-semibold text-text-primary tabular-nums">
            {top ? `${formatInt(top.wins)} de ${formatInt(top.measured)}` : ''}
          </span>
          {top ? ` meses com meta batida no melhor executivo; a ordem segue os meses batidos` : null}
        </p>
        <p className="mt-1 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          {worst ? `${worst.row.name} fechou ${formatInt(worst.lossRun)} meses seguidos sem a meta, até ${lastMonth}` : ''}
        </p>
      </div>

      <div aria-hidden className="flex flex-col gap-2">
        <div className="flex items-end gap-3 text-[0.6875rem] leading-4 text-text-muted">
          <span className="min-w-0 flex-1">executivo</span>
          <div className="grid shrink-0 tabular-nums" style={{ gridTemplateColumns: `repeat(${String(COLUMNS)}, ${String(CELL)}px)`, columnGap: GAP, width: VIEW_W }}>
            {labels.map((month) => (
              <span className="col-span-3 whitespace-nowrap" key={month}>
                {formatMonthShort(month)}
              </span>
            ))}
          </div>
          <span className="w-16 shrink-0 text-right">batidos</span>
        </div>

        {ranked.map(({ row, wins, measured }) => {
          const isHighlight = row.id === highlightId;
          return (
            <div className="flex h-6 items-center gap-3" key={row.id}>
              <span className={cn('min-w-0 flex-1 text-xs leading-4', isHighlight ? 'font-bold text-text-primary' : 'text-text-secondary')}>{row.name}</span>
              <svg className="block shrink-0" height={VIEW_H} viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`} width={VIEW_W}>
                <line stroke="var(--line-subtle)" strokeWidth={1} x1={0} x2={VIEW_W} y1={MID} y2={MID} />
                {row.months.map((outcome, index) => {
                  if (outcome !== 'win' && outcome !== 'loss') return null;
                  const isWin = outcome === 'win';
                  return (
                    <rect
                      fill={isWin ? 'var(--positive)' : 'var(--negative)'}
                      height={BLOCK}
                      key={monthAt(index)}
                      width={CELL}
                      x={index * (CELL + GAP)}
                      y={isWin ? MID - CENTER_GAP - BLOCK : MID + CENTER_GAP}
                    />
                  );
                })}
              </svg>
              <span className={cn('w-16 shrink-0 text-right text-xs tabular-nums', isHighlight ? 'font-display font-bold text-text-primary' : 'text-text-secondary')}>
                {`${formatInt(wins)} de ${formatInt(measured)}`}
              </span>
            </div>
          );
        })}
      </div>

      <div aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 bg-positive" />
          meta batida, acima da linha
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 bg-negative" />
          meta não batida, abaixo da linha
        </span>
      </div>
    </figure>
  );
}
