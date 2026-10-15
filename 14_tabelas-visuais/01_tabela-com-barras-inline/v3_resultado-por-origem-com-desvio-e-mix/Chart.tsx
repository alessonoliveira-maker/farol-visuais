import { ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, mixOrder, type OriginResult } from './data';

/**
 * Tabela com três marcas por origem: volume (barra simples), saldo de receita menos custo
 * (barra divergente a partir do zero) e o mix de status dos leads (barra 100%). Cada coluna
 * declara o domínio próprio no cabeçalho; o mix usa a mesma ordem de categoria em toda linha.
 */
export interface OriginResultTableProps {
  readonly data?: readonly OriginResult[];
  readonly height?: number;
  readonly className?: string;
}

/** ROT-10: o segmento recebe o percentual quando o número cabe nele (texto de 11 px, cerca de 20 px com folga). */
const LABEL_MIN_PX = 20;
/** Largura mínima estimada da coluna do mix no cartão; o teste de caber usa este piso, não um limiar de participação. */
const MIX_WIDTH_ESTIMATE = 320;
/** Ordem de slot categórico (COR-8): --chart-2 e --chart-4 ficam de fora das quatro categorias. */
const SLOT_ORDER = [1, 3, 6, 5] as const;
const TRACK_HEIGHT = 14;
/** ESP-2: mix com rótulo dentro, texto de 11 px mais 6 px. */
const MIX_HEIGHT = 17;

function volumeOf(row: OriginResult): number {
  return row.mix.novo + row.mix.emCadencia + row.mix.agendado + row.mix.descartado;
}

function slotColor(index: number): string {
  const slot = SLOT_ORDER[index] ?? 1;
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** NUM-2: percentual inteiro por linha somando 100, pelo maior resto (não por arredondamento solto). */
function largestRemainder(values: readonly number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const shares = raw.map((value) => Math.floor(value));
  let missing = 100 - shares.reduce((sum, value) => sum + value, 0);
  const bySurplus = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of bySurplus) {
    if (missing <= 0) break;
    shares[index] = (shares[index] ?? 0) + 1;
    missing -= 1;
  }
  return shares;
}

export default function OriginResultTable({ data = defaultData, height, className }: OriginResultTableProps) {
  const rows = useMemo(() => [...data].sort((a, b) => b.balance - a.balance), [data]);
  const style = height === undefined ? undefined : { height };

  // Domínio de cada coluna calculado uma vez sobre todas as linhas do recorte, nunca por linha.
  // Os hooks vêm antes de qualquer retorno condicional (react-hooks/rules-of-hooks); com o
  // recorte vazio o cálculo dá −Infinity sem lançar, e o resultado nem chega a ser usado.
  const { volumeMax, balanceLimit } = useMemo(() => {
    const volumes = rows.map(volumeOf);
    const balances = rows.map((row) => Math.abs(row.balance));
    return { volumeMax: Math.max(...volumes), balanceLimit: Math.max(...balances) };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não há volume, saldo nem mix para comparar.</span>
      </div>
    );
  }

  const best = rows[0];
  const worst = rows[rows.length - 1];
  const summary =
    best && worst
      ? `Tabela com volume, saldo e mix de status de ${String(rows.length)} origens de lead em agosto de 2026, ordenada pelo saldo. ${best.name} lidera com ${formatCurrencyCompact(best.balance)} de saldo; ${worst.name} tem o pior, ${formatCurrencyCompact(worst.balance)}.`
      : 'Tabela sem origens neste recorte.';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <ul className="mb-1 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-0.5">
        {mixOrder.map((category, index) => (
          <li className="flex items-center gap-1.5 text-[0.6875rem] text-text-secondary" key={category.key}>
            <span aria-hidden className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: slotColor(index) }} />
            {category.label}
          </li>
        ))}
      </ul>
      <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-line-subtle">
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-overlay/60">
              <th className="px-2 py-0.5 text-left align-bottom text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Origem
              </th>
              <th className="w-36 px-2 py-0.5 text-left align-bottom" scope="col">
                <span className="block text-[0.6875rem] font-medium text-text-secondary">Volume</span>
                <span className="block text-[0.6875rem] text-text-muted">
                  {formatInt(0)} a {formatInt(volumeMax)} leads
                </span>
              </th>
              <th className="w-44 px-2 py-0.5 text-left align-bottom" scope="col">
                <span className="block text-[0.6875rem] font-medium text-text-secondary">Saldo (receita − custo)</span>
                <span className="block text-[0.6875rem] text-text-muted">± {formatCurrencyCompact(balanceLimit)}</span>
              </th>
              <th className="px-2 py-0.5 text-left align-bottom text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Mix de status (soma de toda a linha)
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const volume = volumeOf(row);
              const volumePct = volumeMax > 0 ? (volume / volumeMax) * 100 : 0;
              const half = balanceLimit > 0 ? (Math.abs(row.balance) / balanceLimit) * 50 : 0;
              const positive = row.balance >= 0;
              const BalanceIcon = positive ? ArrowUpRight : ArrowDownRight;
              return (
                <tr className="border-b border-line-subtle/60 last:border-0" key={row.id}>
                  <td className="px-2 py-0.5 align-middle whitespace-nowrap text-text-secondary">{row.name}</td>
                  <td className="px-2 py-0.5 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="relative h-3.5 min-w-0 flex-1 rounded-full bg-surface-sunken" style={{ height: TRACK_HEIGHT }}>
                        <div className="h-full rounded-full" style={{ backgroundColor: 'var(--text-muted)', width: `${String(volumePct)}%` }} />
                      </div>
                      <span className="w-16 shrink-0 text-right font-display tabular-nums text-text-secondary">{formatInt(volume)}</span>
                    </div>
                  </td>
                  <td className="px-2 py-0.5 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="relative min-w-0 flex-1 rounded-full bg-surface-sunken" style={{ height: TRACK_HEIGHT }}>
                        <div aria-hidden className="absolute inset-y-0 w-px" style={{ backgroundColor: 'var(--line-strong)', left: '50%' }} />
                        <div
                          className={cn('absolute inset-y-0 rounded-full', positive ? 'bg-positive' : 'bg-negative')}
                          style={{ left: positive ? '50%' : `${String(50 - half)}%`, width: `${String(half)}%` }}
                        />
                      </div>
                      <span
                        className={cn('inline-flex w-24 shrink-0 items-center justify-end gap-0.5 font-display tabular-nums', positive ? 'text-positive' : 'text-negative')}
                      >
                        <BalanceIcon aria-hidden className="size-3" strokeWidth={2.5} />
                        {`${positive ? '+' : '−'}${formatCurrencyCompact(Math.abs(row.balance))}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-0.5 align-middle">
                    <div className="flex w-full gap-[1.5px] overflow-hidden rounded-sm" style={{ height: MIX_HEIGHT }}>
                      {(() => {
                        const counts = mixOrder.map((category) => row.mix[category.key]);
                        const shares = largestRemainder(counts, volume);
                        return mixOrder.map((category, index) => {
                          const count = counts[index] ?? 0;
                          const sharePct = shares[index] ?? 0;
                          if (count <= 0) return null;
                          return (
                            <div
                              className="flex h-full items-center justify-center"
                              key={category.key}
                              style={{ backgroundColor: slotColor(index), flexBasis: `${String((count / volume) * 100)}%` }}
                            >
                              {(count / volume) * MIX_WIDTH_ESTIMATE >= LABEL_MIN_PX ? (
                                <span className="font-display text-[0.6875rem] font-medium" style={{ color: 'var(--accent-cyan-contrast)' }}>
                                  {formatPercent(sharePct / 100, 0)}
                                </span>
                              ) : null}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p aria-hidden className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">
        {formatInt(rows.length)} origens. A linha vertical no saldo marca o zero.
      </p>
    </div>
  );
}
