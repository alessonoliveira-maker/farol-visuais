import { ArrowDown, ArrowUp, Filter, Minus } from 'lucide-react';

import { formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, mesAnterior, mesAtual, type RankingRow } from './data';

/** Domínio comum da trajetória: 1 a 6, o mesmo número de executivos acompanhados. */
const TRACK_MIN_POS = 1;
const TRACK_MAX_POS = 6;
const TRACK_WIDTH = 64;
const TRACK_HEIGHT = 24;
const TRACK_PAD = 3;
const TRACK_PAD_X = 3;

export interface RankingTresVariacoesProps {
  readonly data?: readonly RankingRow[];
  readonly highlightId?: string;
  readonly className?: string;
}

function DirectionIcon({ delta }: { readonly delta: number }) {
  if (delta > 0) return <ArrowUp aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
  if (delta < 0) return <ArrowDown aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
  return <Minus aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
}

function trackY(pos: number): number {
  const span = TRACK_MAX_POS - TRACK_MIN_POS || 1;
  return TRACK_PAD + ((pos - TRACK_MIN_POS) / span) * (TRACK_HEIGHT - TRACK_PAD * 2);
}

function TrackSparkline({ row, isHighlight }: { readonly row: RankingRow; readonly isHighlight: boolean }) {
  const step = (TRACK_WIDTH - TRACK_PAD_X * 2) / (row.positions.length - 1);
  const path = row.positions.map((pos, index) => `${index === 0 ? 'M' : 'L'}${String(TRACK_PAD_X + index * step)} ${String(trackY(pos))}`).join(' ');
  const lastY = trackY(row.positions[5]);
  const color = isHighlight ? 'var(--chart-1)' : 'var(--text-muted)';
  return (
    <svg aria-hidden className="h-6 w-16" viewBox={`0 0 ${String(TRACK_WIDTH)} ${String(TRACK_HEIGHT)}`}>
      <path d={path} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle cx={TRACK_WIDTH - TRACK_PAD_X} cy={lastY} fill={color} r={2} />
    </svg>
  );
}

export default function RankingTresVariacoes({ data = defaultData, highlightId = defaultHighlightId, className }: RankingTresVariacoesProps) {
  const rows = [...data].sort((a, b) => a.positions[5] - b.positions[5]);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve receita reconhecida no período.</span>
      </div>
    );
  }

  const domainMax = Math.max(...rows.map((row) => row.value));
  const highlighted = rows.find((row) => row.id === highlightId);
  const leader = rows[0];
  if (!leader) return null;

  const summary = [
    `Tabela de ranking com posição, receita e trajetória de 6 meses de ${String(rows.length)} executivos em ${formatMonthShort(mesAtual)}.`,
    `Lidera ${leader.name}, com ${formatCurrencyCompact(leader.value)}.`,
    highlighted
      ? (() => {
          const deltaPos = highlighted.positions[4] - highlighted.positions[5];
          const deltaValue = (highlighted.value - highlighted.valueAnterior) / highlighted.valueAnterior;
          return `Em destaque, ${highlighted.name} está em ${String(highlighted.positions[5])}º, ${deltaPos === 0 ? 'manteve a posição' : `${deltaPos > 0 ? 'subiu' : 'caiu'} ${String(Math.abs(deltaPos))}`} e ${deltaValue >= 0 ? 'cresceu' : 'caiu'} ${formatPercent(Math.abs(deltaValue))} contra ${formatMonthShort(mesAnterior)}.`;
        })()
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('h-full w-full min-w-0 overflow-auto', className)}>
      <table aria-label={summary} className="w-full min-w-[720px] border-collapse text-xs" role="table">
        <thead>
          <tr className="border-b border-line-subtle text-text-muted">
            <th className="w-9 py-2 pr-2 text-left font-medium" scope="col">#</th>
            <th className="py-2 pr-3 text-left font-medium" scope="col">{`Δ posição desde ${formatMonthShort(mesAnterior)}`}</th>
            <th className="py-2 pr-3 text-left font-medium" scope="col">Executivo</th>
            <th className="py-2 pr-3 text-right font-medium" scope="col">{`Receita ${formatMonthShort(mesAtual)}`}</th>
            <th className="py-2 pr-3 text-right font-medium" scope="col">Δ R$</th>
            <th className="py-2 pr-3 text-right font-medium" scope="col">Δ %</th>
            <th className="py-2 text-left font-medium tabular-nums" scope="col">Trajetória, 6 meses</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pos = row.positions[5];
            const posAnterior = row.positions[4];
            const deltaPos = posAnterior - pos;
            const deltaValue = (row.value - row.valueAnterior) / row.valueAnterior;
            const isHighlight = row.id === highlightId;
            const widthPct = domainMax === 0 ? 0 : (row.value / domainMax) * 100;
            return (
              <tr className="border-b border-line-subtle last:border-0" key={row.id}>
                <td className="py-2 pr-2 font-display text-text-secondary tabular-nums">{`${String(pos)}º`}</td>
                <td className="py-2 pr-3">
                  <span className={cn('inline-flex items-center gap-1', deltaPos === 0 ? 'text-text-secondary' : 'text-text-primary')}>
                    <DirectionIcon delta={deltaPos} />
                    <span className="font-display tabular-nums">
                      {deltaPos === 0 ? 'manteve' : `${deltaPos > 0 ? 'subiu' : 'caiu'} ${String(Math.abs(deltaPos))}`}
                    </span>
                  </span>
                </td>
                <td className={cn('py-2 pr-3', isHighlight ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                  {row.name}
                </td>
                <td className="py-2 pr-3 text-right">
                  <div className={cn('font-display tabular-nums', isHighlight ? 'font-bold text-text-primary' : 'text-text-primary')}>
                    {formatCurrencyCompact(row.value)}
                  </div>
                  <div className="mt-1 h-1.5 w-24 rounded-full bg-surface-sunken">
                    <div
                      className={cn('h-1.5 rounded-full', isHighlight ? 'bg-chart-1' : 'bg-line-strong')}
                      style={{ width: `${String(widthPct)}%` }}
                    />
                  </div>
                </td>
                <td className="py-2 pr-3 text-right">
                  <div
                    className={cn(
                      'font-display tabular-nums',
                      deltaValue > 0 ? 'text-positive' : deltaValue < 0 ? 'text-negative' : 'text-text-secondary',
                    )}
                  >
                    {`${deltaValue > 0 ? '+' : deltaValue < 0 ? '−' : ''}${formatCurrencyCompact(Math.abs(row.value - row.valueAnterior))}`}
                  </div>
                  <div className="text-[0.6875rem] text-text-muted tabular-nums">{`contra ${formatCurrencyCompact(row.valueAnterior)}`}</div>
                </td>
                <td className="py-2 pr-3 text-right">
                  <span
                    className={cn(
                      'font-display tabular-nums',
                      deltaValue > 0 ? 'text-positive' : deltaValue < 0 ? 'text-negative' : 'text-text-secondary',
                    )}
                  >
                    {deltaValue === 0 ? 'estável' : `${deltaValue > 0 ? '+' : '−'}${formatPercent(Math.abs(deltaValue))}`}
                  </span>
                </td>
                <td className="py-2">
                  <TrackSparkline isHighlight={isHighlight} row={row} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
