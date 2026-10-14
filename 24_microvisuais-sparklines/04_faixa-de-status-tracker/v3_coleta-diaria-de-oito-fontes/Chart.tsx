import { Filter } from 'lucide-react';

import { formatDate, formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_DAY, NARROW_DAYS, type DayState, type SourceCollection } from './data';

/**
 * Faixa de coleta por fonte: uma fileira por fonte, um bloco por dia, quatro estados. Responde se
 * o painel de hoje tem coleta completa e qual fonte falhou. O percentual à direita conta só os dias
 * com agenda; dia sem agenda é estado próprio, em contorno, e fica fora da conta.
 */
export interface CollectionStripsProps {
  readonly data?: readonly SourceCollection[];
  readonly height?: number;
  readonly className?: string;
}

const MS_DAY = 86_400_000;
/** Contorno por sombra interna: não soma largura ao bloco, então todo dia ocupa a mesma coluna. */
const OFF_STYLE = { boxShadow: 'inset 0 0 0 1px var(--text-muted)' } as const;

/** Altura e cor por estado: a altura é o segundo canal, para não depender só de matiz. */
const STATE_CLASS: Record<DayState, string> = {
  complete: 'h-5 bg-positive',
  partial: 'h-3.5 bg-warning',
  failed: 'h-2.5 bg-negative',
  off: 'h-5',
};

/** Altura da amostra na mesma ordem da fileira: completa 12, parcial 8, falhou 6 e sem agenda 12 px. */
const LEGEND: readonly { readonly state: DayState; readonly label: string; readonly swatch: string }[] = [
  { state: 'complete', label: 'completa', swatch: 'h-3 bg-positive' },
  { state: 'partial', label: 'parcial', swatch: 'h-2 bg-warning' },
  { state: 'failed', label: 'falhou, bloco mais baixo', swatch: 'h-1.5 bg-negative' },
  { state: 'off', label: 'sem agenda', swatch: 'h-3' },
];

function isoAt(offset: number): string {
  const [year, month, day] = FIRST_DAY.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1) + offset * MS_DAY).toISOString().slice(0, 10);
}

function rateText(complete: number, scheduled: number): string {
  return scheduled === 0 ? formatUnavailable() : formatRateWithVolume(complete, scheduled, 0);
}

export default function CollectionStrips({ data = defaultData, height, className }: CollectionStripsProps) {
  const rows = data.map((source) => {
    const days = source.runs.flatMap((run) => Array.from({ length: run.days }, (): DayState => run.state));
    const complete = days.filter((state) => state === 'complete').length;
    const scheduled = days.filter((state) => state !== 'off').length;
    return { source, days, complete, scheduled, share: scheduled === 0 ? null : complete / scheduled };
  });

  if (rows.length === 0 || (rows[0]?.days.length ?? 0) === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2 text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4" />
        <p className="text-xs">O recorte não tem fontes com dias medidos, então não há faixa para desenhar.</p>
      </div>
    );
  }

  /** Da menos completa para a mais completa; fonte sem dia agendado vai por último. */
  const ordered = [...rows].sort((a, b) => (a.share ?? 2) - (b.share ?? 2));
  const worst = ordered[0];
  const total = rows[0]?.days.length ?? 0;
  const firstLabel = formatDate(isoAt(0));
  const lastLabel = formatDate(isoAt(total - 1));
  const narrowFrom = Math.max(0, total - NARROW_DAYS);

  const summary =
    `Coleta diária de ${formatInt(rows.length)} fontes em ${formatInt(total)} dias, de ${firstLabel} a ${lastLabel}. ` +
    (worst === undefined
      ? ''
      : `A menos completa é ${worst.source.label}, com ${rateText(worst.complete, worst.scheduled)} dos dias com agenda. `) +
    'Dias sem agenda ficam fora do percentual.';

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col justify-center gap-3', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden>
        <div className="flex flex-col gap-0.5">
          {ordered.map(({ source, days, complete, scheduled }) => (
            <div
              className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-3 gap-y-0.5 pb-1 @2xl:grid-cols-[9rem_minmax(0,1fr)_7rem] @2xl:pb-0"
              key={source.id}
            >
              <p className="text-xs leading-5 text-text-secondary">{source.label}</p>
              <div className="col-span-2 row-start-2 flex h-5 min-w-0 items-end gap-px @2xl:col-span-1 @2xl:col-start-2 @2xl:row-start-1">
                {days.map((state, index) => (
                  <span
                    className={cn(
                      'min-w-0 flex-1 rounded-sm',
                      STATE_CLASS[state],
                      index < narrowFrom ? 'hidden @2xl:block' : 'block',
                    )}
                    key={isoAt(index)}
                    style={state === 'off' ? OFF_STYLE : undefined}
                  />
                ))}
              </div>
              <p className="text-right text-xs leading-5 text-text-secondary tabular-nums @2xl:col-start-3 @2xl:row-start-1">
                {rateText(complete, scheduled)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-1 gap-x-3 text-[0.6875rem] leading-4 text-text-muted tabular-nums @2xl:grid-cols-[9rem_minmax(0,1fr)_7rem]">
          <span className="flex min-w-0 justify-between gap-4 @2xl:col-start-2">
            <span className="hidden @2xl:inline">{firstLabel}</span>
            <span className="@2xl:hidden">{formatDate(isoAt(narrowFrom))}</span>
            <span>{lastLabel}</span>
          </span>
        </div>
      </div>

      <div aria-hidden className="flex flex-col gap-1 text-[0.6875rem] leading-4 text-text-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {LEGEND.map(({ state, label, swatch }) => (
            <span className="flex items-center gap-1.5" key={state}>
              <span className={cn('w-3 shrink-0 rounded-sm', swatch)} style={state === 'off' ? OFF_STYLE : undefined} />
              {label}
            </span>
          ))}
        </div>
        <p>
          Da fonte menos completa para a mais completa. O percentual conta só os dias com agenda.
          <span className="@2xl:hidden">
            {' Em largura estreita, só os últimos '}
            <span className="tabular-nums">{formatInt(NARROW_DAYS)}</span>
            {' dias aparecem, e o percentual segue sobre todo o período.'}
          </span>
        </p>
      </div>
    </figure>
  );
}
