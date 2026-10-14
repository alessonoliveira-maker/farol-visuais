import { CircleAlert, Filter, Unplug } from 'lucide-react';

import { formatDate, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ResponseTimeData } from './data';

/**
 * Marcador em trilho com faixa aceitável: o trilho vai do menor ao maior tempo de primeira
 * resposta já visto, a faixa do SLA é um bloco rebaixado sobre ele e o marcador é a mediana da
 * semana. O julgamento sai da posição contra a faixa e da palavra, nunca de pintar o trilho de
 * verde ou de vermelho.
 */
export interface ResponseRailProps {
  readonly data?: ResponseTimeData;
  readonly className?: string;
}

/** Diâmetro do marcador, em px: metade dele centra o marcador sobre o ponto (classe `size-3`). */
const MARKER_RADIUS = 6;
/** Largura reservada a cada texto sobre o trilho, em px (cabe "138 min" em 11 e em 14 px). */
const LABEL_WIDTH = 56;
/** Largura nominal do trilho, em px, só para decidir quais rótulos de limite cabem sem colidir. */
const NOMINAL_RAIL_PX = 280;
/** Respiro mínimo entre dois rótulos de limite, em px. */
const LABEL_BREATH = 8;

/** Minutos com a unidade, pelo formatador de inteiro do Farol (não há formatador de minutos). */
function formatMinutes(minutes: number): string {
  return `${formatInt(Math.round(minutes))} min`;
}

/** Menor e maior valor medido; `null` sem nenhuma medição (EST-1b). */
function extremesOf(values: readonly (number | null)[]): { readonly min: number; readonly max: number } | null {
  const measured = values.filter((value): value is number => value !== null);
  return measured.length === 0 ? null : { min: Math.min(...measured), max: Math.max(...measured) };
}

/** `left` de um texto centrado no ponto, sem passar das pontas do trilho. */
function centeredLeft(ratio: number): string {
  return `clamp(0px, calc(${String(ratio * 100)}% - ${String(LABEL_WIDTH / 2)}px), calc(100% - ${String(LABEL_WIDTH)}px))`;
}

export default function ResponseRail({ data = defaultData, className }: ResponseRailProps) {
  const { label, weekStart, current, history, sla } = data;
  const rootClass = cn('flex h-full w-full min-w-0 flex-col justify-center gap-2', className);
  const weekLabel = formatDate(weekStart);
  const past = extremesOf(history);

  if (past === null) {
    return (
      <div aria-label={`${label} sem histórico no recorte: não há faixa para posicionar a semana.`} className={cn(rootClass, 'items-center')} role="status">
        <p className="inline-flex items-center gap-2 text-xs text-text-muted">
          <Filter aria-hidden className="size-4" />O recorte não tem semanas anteriores medidas, então não há trilho a desenhar.
        </p>
      </div>
    );
  }

  if (current === null) {
    return (
      <div
        aria-label={`Marcador em trilho da ${label.toLowerCase()} na semana de ${weekLabel}: ${formatUnavailable()}, sem mediana medida na semana.`}
        className={rootClass}
        role="img"
      >
        <p className="text-xs font-medium text-text-secondary">
          {label}, semana de {weekLabel}
        </p>
        <p className="inline-flex items-center gap-2 text-xs text-text-muted">
          <Unplug aria-hidden className="size-4 shrink-0" />
          <span>{formatUnavailable()}: sem mediana medida na semana</span>
        </p>
      </div>
    );
  }

  // O trilho cobre o histórico, a faixa e a semana atual: nenhum deles fica preso numa borda.
  const domainMin = Math.min(past.min, sla.from, current);
  const domainMax = Math.max(past.max, sla.to, current);
  const span = domainMax - domainMin;
  const ratioOf = (value: number) => (value - domainMin) / span;

  const above = current > sla.to;
  const below = current < sla.from;
  const inside = !above && !below;
  const verdict = inside
    ? 'dentro do SLA'
    : above
      ? `fora do SLA, ${formatMinutes(current - sla.to)} acima do teto`
      : `fora do SLA, ${formatMinutes(sla.from - current)} abaixo do piso`;
  const slaText = `faixa aceitável: ${sla.source}, de ${formatMinutes(sla.from)} a ${formatMinutes(sla.to)}`;

  const endLabel = (value: number, side: 'mín.' | 'máx.') => {
    const fromHistory = side === 'mín.' ? value === past.min : value === past.max;
    return `${side} ${fromHistory ? 'histórico' : 'da semana'}`;
  };

  // Limites da faixa entram entre as pontas só quando cabem: a legenda já traz os dois por extenso.
  const minPx = (value: number) => ratioOf(value) * NOMINAL_RAIL_PX;
  const room = (a: number, b: number) => Math.abs(minPx(a) - minPx(b)) >= LABEL_WIDTH + LABEL_BREATH;
  const showFrom = room(sla.from, domainMin) && room(sla.from, domainMax);
  const showTo = room(sla.to, domainMax) && room(sla.to, domainMin) && (!showFrom || room(sla.to, sla.from));

  const summary = `Marcador em trilho do tempo mediano de primeira resposta na semana de ${weekLabel}: ${formatMinutes(current)}, ${verdict}. A faixa aceitável é o ${sla.source}, de ${formatMinutes(sla.from)} a ${formatMinutes(sla.to)}, e o histórico vai de ${formatMinutes(past.min)} a ${formatMinutes(past.max)}.`;

  return (
    <div aria-label={summary} className={rootClass} role="img">
      <p className="truncate text-xs font-medium text-text-secondary tabular-nums">
        {label}, semana de {weekLabel}
      </p>

      <div aria-hidden className="relative h-5">
        <span
          className="kpi-number absolute top-0 text-center text-sm leading-5 font-semibold text-text-primary"
          style={{ left: centeredLeft(ratioOf(current)), width: LABEL_WIDTH }}
        >
          {formatMinutes(current)}
        </span>
      </div>

      <div aria-hidden className="relative h-4 w-full">
        <div
          className="absolute inset-y-0 border-x border-text-muted bg-surface-sunken"
          style={{ left: `${String(ratioOf(sla.from) * 100)}%`, width: `${String((ratioOf(sla.to) - ratioOf(sla.from)) * 100)}%` }}
        />
        <div className="absolute inset-x-0 inset-y-0 m-auto h-1.5 rounded-full bg-line-strong" />
        <div
          className="absolute inset-y-0 my-auto size-3 rounded-full bg-chart-1"
          style={{ left: `calc(${String(ratioOf(current) * 100)}% - ${String(MARKER_RADIUS)}px)` }}
        />
      </div>

      <div aria-hidden className="relative h-8 text-[0.6875rem] text-text-muted tabular-nums">
        <span className="absolute top-0 left-0" style={{ width: 'max-content' }}>
          <span className="kpi-number text-text-secondary">{formatMinutes(domainMin)}</span>
          <br />
          {endLabel(domainMin, 'mín.')}
        </span>
        <span className="absolute top-0 right-0 text-right" style={{ width: 'max-content' }}>
          <span className="kpi-number text-text-secondary">{formatMinutes(domainMax)}</span>
          <br />
          {endLabel(domainMax, 'máx.')}
        </span>
        {showFrom ? (
          <span className="kpi-number absolute top-0 text-center text-text-secondary" style={{ left: centeredLeft(ratioOf(sla.from)), width: LABEL_WIDTH }}>
            {formatMinutes(sla.from)}
          </span>
        ) : null}
        {showTo ? (
          <span className="kpi-number absolute top-0 text-center text-text-secondary" style={{ left: centeredLeft(ratioOf(sla.to)), width: LABEL_WIDTH }}>
            {formatMinutes(sla.to)}
          </span>
        ) : null}
      </div>

      <div aria-hidden className="flex flex-col gap-1">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary tabular-nums">
          {inside ? null : <CircleAlert aria-hidden className="size-3.5 shrink-0" />}
          <span>{verdict}</span>
        </p>
        <p className="text-[0.6875rem] text-text-muted tabular-nums">{slaText}</p>
      </div>
    </div>
  );
}
