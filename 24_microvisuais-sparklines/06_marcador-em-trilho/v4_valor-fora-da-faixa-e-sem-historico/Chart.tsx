import { ChevronLeft, ChevronRight, Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginCpl, type OriginCplData } from './data';

/**
 * Marcador em trilho nos casos de borda: valor acima do máximo ou abaixo do mínimo dos meses
 * anteriores (marcador preso na borda, chevron para fora e a distância escrita), origem sem
 * história suficiente (sem trilho, só o texto) e origem sem o valor do mês (indisponível, sem
 * marcador no zero). Mínimo e máximo saem só dos meses anteriores, nunca do valor atual.
 */
export interface OriginRailsProps {
  readonly data?: OriginCplData;
  readonly className?: string;
}

/** Abaixo deste número de meses medidos a faixa não é confiável e o trilho não se desenha. */
const MIN_HISTORY_MONTHS = 6;
/** Diâmetro do marcador, em px: metade dele centra o marcador sobre o ponto (classe `size-3`). */
const MARKER_RADIUS = 6;
/** Largura reservada ao valor escrito sobre o marcador dentro da faixa, em px. */
const VALUE_LABEL_WIDTH = 56;
const NAME_COL = 'w-36';
const RANGE_COL = 'w-32';

type Row =
  | { readonly kind: 'unavailable'; readonly origin: OriginCpl }
  | { readonly kind: 'no-history'; readonly origin: OriginCpl; readonly value: number; readonly months: number }
  | {
      readonly kind: 'inside' | 'above' | 'below';
      readonly origin: OriginCpl;
      readonly value: number;
      readonly min: number;
      readonly max: number;
      /** Distância ao extremo rompido, em fração dele; 0 dentro da faixa. */
      readonly distance: number;
    };

/** Menor e maior valor dos meses anteriores; `null` para lista vazia (EST-1b). */
function extremesOf(values: readonly number[]): { readonly min: number; readonly max: number } | null {
  return values.length === 0 ? null : { min: Math.min(...values), max: Math.max(...values) };
}

function rowOf(origin: OriginCpl): Row {
  const { current, history } = origin;
  if (current === null) return { kind: 'unavailable', origin };
  const extremes = history.length < MIN_HISTORY_MONTHS ? null : extremesOf(history);
  if (extremes === null) return { kind: 'no-history', origin, value: current, months: history.length };
  const { min, max } = extremes;
  if (current > max) return { kind: 'above', origin, value: current, min, max, distance: (current - max) / max };
  if (current < min) return { kind: 'below', origin, value: current, min, max, distance: (min - current) / min };
  return { kind: 'inside', origin, value: current, min, max, distance: 0 };
}

const joinNames = (rows: readonly Row[]) => rows.map((row) => row.origin.name).join(' e ');

export default function OriginRails({ data = defaultData, className }: OriginRailsProps) {
  const rows = data.origins.map(rowOf);

  if (rows.length === 0) {
    return (
      <div
        aria-label="Lista de origens vazia: o recorte não tem origens com CPL para posicionar na faixa."
        className={cn('flex h-full w-full min-w-0 items-center justify-center', className)}
        role="status"
      >
        <p className="inline-flex items-center gap-2 text-xs text-text-muted">
          <Filter aria-hidden className="size-4" />O recorte não tem origens, então não há trilho a desenhar.
        </p>
      </div>
    );
  }

  const monthLabel = formatMonthShort(data.month);
  const above = rows.filter((row) => row.kind === 'above');
  const below = rows.filter((row) => row.kind === 'below');
  const outside = [...above, ...below];
  const noHistory = rows.filter((row) => row.kind === 'no-history');
  const unavailable = rows.filter((row) => row.kind === 'unavailable');

  const summary = [
    `Marcador em trilho do CPL de ${monthLabel} em ${formatInt(rows.length)} origens: ${formatInt(above.length)} acima do máximo, ${formatInt(below.length)} abaixo do mínimo, `,
    `${formatInt(noHistory.length)} sem história de ${formatInt(MIN_HISTORY_MONTHS)} meses e ${formatInt(unavailable.length)} sem CPL medido.`,
    outside.length === 0 ? '' : ` Fora da faixa: ${joinNames(outside)}.`,
    ` Mínimo e máximo calculados sem o valor de ${monthLabel}.`,
  ].join('');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-1', className)} role="img">
      <p aria-hidden className="text-xs text-text-secondary tabular-nums">
        <span className="font-semibold text-text-primary">
          {formatInt(outside.length)} de {formatInt(rows.length)}
        </span>{' '}
        origens fora da faixa dos meses anteriores
      </p>

      <div aria-hidden className="mt-1 flex min-w-0 flex-1 flex-col text-xs">
        <div className="flex h-5 min-w-0 items-center gap-3 text-[0.6875rem] text-text-muted">
          <span className={cn('shrink-0', NAME_COL)}>Origem, CPL de {monthLabel}</span>
          <span className="min-w-0 flex-1">Posição na faixa</span>
          <span className={cn('shrink-0 text-right', RANGE_COL)}>Mín. e máx.</span>
        </div>

        {rows.map((row) => (
          <div className="flex h-8 min-w-0 items-center gap-3 tabular-nums" key={row.origin.id}>
            <span className={cn('shrink-0 text-text-secondary', NAME_COL, row.kind !== 'inside' && row.kind !== 'no-history' && row.kind !== 'unavailable' && 'font-semibold text-text-primary')}>
              {row.origin.name}
            </span>
            <RailCell row={row} />
            <span className={cn('shrink-0 text-right text-[0.6875rem] text-text-muted', RANGE_COL)}>
              {row.kind === 'no-history'
                ? `${formatInt(row.months)} meses medidos`
                : row.kind === 'unavailable'
                  ? ''
                  : `${formatCurrencyCompact(row.min)} a ${formatCurrencyCompact(row.max)}`}
            </span>
          </div>
        ))}
      </div>

      <p aria-hidden className="text-[0.6875rem] text-text-muted tabular-nums">
        Faixa dos meses anteriores, sem {monthLabel}; com menos de {formatInt(MIN_HISTORY_MONTHS)} meses não há faixa.
      </p>
    </div>
  );
}

function RailCell({ row }: { row: Row }) {
  if (row.kind === 'unavailable') {
    return (
      <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-text-muted">
        <Unplug aria-hidden className="size-4 shrink-0" />
        {formatUnavailable()}, sem CPL medido no mês
      </span>
    );
  }
  if (row.kind === 'no-history') {
    return (
      <span className="min-w-0 flex-1 text-text-muted">
        <span className="kpi-number font-semibold text-text-primary">{formatCurrencyCompact(row.value)}</span>, faixa sem histórico suficiente
      </span>
    );
  }

  const { value, min, max, kind } = row;
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const edge = kind === 'above' ? 'máximo' : 'mínimo';
  const sign = kind === 'above' ? '+' : '−';

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="relative h-4">
        {kind === 'inside' ? (
          <span className="absolute inset-y-0 inset-x-6">
            <span
              className="kpi-number absolute top-0 text-center text-xs leading-4 font-semibold text-text-primary"
              style={{
                left: `clamp(0px, calc(${String(ratio * 100)}% - ${String(VALUE_LABEL_WIDTH / 2)}px), calc(100% - ${String(VALUE_LABEL_WIDTH)}px))`,
                width: VALUE_LABEL_WIDTH,
              }}
            >
              {formatCurrencyCompact(value)}
            </span>
          </span>
        ) : (
          <span
            className={cn('absolute top-0 text-xs leading-4 whitespace-nowrap text-text-muted', kind === 'above' ? 'right-0 text-right' : 'left-0 text-left')}
          >
            <span className="kpi-number font-semibold text-text-primary">{formatCurrencyCompact(value)}</span>,{' '}
            <span className="text-[0.6875rem]">
              {sign}
              {formatPercent(row.distance, 0)} {kind === 'above' ? 'sobre' : 'sob'} o {edge} de {formatCurrencyCompact(kind === 'above' ? max : min)}
            </span>
          </span>
        )}
      </div>
      <div className="relative h-3">
        <div className="absolute inset-y-0 inset-x-6">
          <div className="absolute inset-x-0 inset-y-0 m-auto h-1.5 rounded-full bg-line-strong" />
          <div className="absolute inset-y-0 left-0 w-px bg-text-muted" />
          <div className="absolute inset-y-0 right-0 w-px bg-text-muted" />
          <div
            className="absolute inset-y-0 my-auto size-3 rounded-full bg-chart-1"
            style={{ left: `calc(${String(ratio * 100)}% - ${String(MARKER_RADIUS)}px)` }}
          />
          {/* O ícone vai num contêiner posicionado: o lucide absoluto sozinho cai na borda errada do trilho. */}
          {kind === 'above' ? (
            <span className="absolute inset-y-0 -right-6 flex w-4 items-center">
              <ChevronRight aria-hidden className="size-4 text-text-primary" strokeWidth={2.5} />
            </span>
          ) : null}
          {kind === 'below' ? (
            <span className="absolute inset-y-0 -left-6 flex w-4 items-center">
              <ChevronLeft aria-hidden className="size-4 text-text-primary" strokeWidth={2.5} />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
