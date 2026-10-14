import { Filter } from 'lucide-react';

import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BRASIL_OUTLINE, data as defaultData, type EventCity, GEO_BOUNDS, REGIONS } from './data';

/**
 * Mapa de pontos dos eventos presenciais: um ponto por evento, na cidade onde ele aconteceu, sobre o contorno
 * neutro do país. A leitura é a distribuição e a lacuna (o Norte sem nenhum ponto); a contagem exata por
 * macrorregião vem escrita abaixo do mapa, e a cidade acompanhada que não recebeu evento é anel pontilhado.
 */
export interface EventMapProps {
  readonly data?: readonly EventCity[];
  readonly height?: number;
  readonly className?: string;
}

/** Pixels por grau: o mapa tem escala 1 no viewBox, e por isso o texto de 11 px chega com 11 px (GEO-18). */
const DEG_PX = 4.6;
/** Folga nos quatro lados: maior raio de anel (5,1) mais raio do ponto e contorno, para nenhum ponto sair cortado (ESP-3). */
const MARGIN = 10;
const MAP_W = Math.round((GEO_BOUNDS.lonMax - GEO_BOUNDS.lonMin) * DEG_PX) + 2 * MARGIN;
const MAP_H = Math.round((GEO_BOUNDS.latMax - GEO_BOUNDS.latMin) * DEG_PX) + 2 * MARGIN;
/** Raio fixo do ponto, em px: todo evento pesa igual e a área nunca codifica valor. */
const DOT_R = 2.6;
/** 0,80 fica acima da opacidade mínima de --chart-1 (0,66) nos dois temas (ACE-5). */
const FILL_OPACITY = 0.8;
const RING_R = 3.4;
/** Distância entre centros de pontos da mesma cidade: o diâmetro do ponto mais o contorno e um respiro. */
const DOT_STEP = 6.4;
const TOP_CITIES = 5;
/** Onde o texto "nenhum evento" se ancora no mapa: sobre o Amazonas, longe de qualquer ponto. */
const NOTE_LON = -61.5;
const NOTE_LAT = 2.4;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-sunken)', strokeWidth: 3 } as const;

function project(lon: number, lat: number): { readonly x: number; readonly y: number } {
  return { x: (lon - GEO_BOUNDS.lonMin) * DEG_PX + MARGIN, y: (GEO_BOUNDS.latMax - lat) * DEG_PX + MARGIN };
}

const OUTLINE_POINTS = BRASIL_OUTLINE.map(([lon, lat]) => {
  const { x, y } = project(lon, lat);
  return `${String(Math.round(x * 10) / 10)},${String(Math.round(y * 10) / 10)}`;
}).join(' ');

/** Soma dos eventos, ou null quando a lista está vazia. */
function sumEvents(rows: readonly EventCity[]): number | null {
  let total: number | null = null;
  for (const row of rows) total = (total ?? 0) + row.events;
  return total;
}

/**
 * Um centro por evento. Uma cidade com vários eventos abre os pontos num anel em volta da coordenada, em
 * ordem fixa, para a contagem ser legível sem empilhar tudo num ponto só; o anel é só desempilhamento.
 */
function eventOffsets(count: number): readonly { readonly dx: number; readonly dy: number }[] {
  if (count <= 1) return count === 1 ? [{ dx: 0, dy: 0 }] : [];
  const radius = Math.max(RING_R, (count * DOT_STEP) / (2 * Math.PI));
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
  });
}

function DotSample() {
  return (
    <svg aria-hidden className="shrink-0" height={12} width={12}>
      <circle cx={6} cy={6} fill="var(--chart-1)" fillOpacity={FILL_OPACITY} r={DOT_R} stroke="var(--surface-raised)" strokeWidth={1} />
    </svg>
  );
}

function RingSample() {
  return (
    <svg aria-hidden className="shrink-0" height={12} width={12}>
      <circle cx={6} cy={6} fill="none" r={RING_R} stroke="var(--text-muted)" strokeDasharray="2 2" strokeWidth={1.5} />
    </svg>
  );
}

export default function EventMap({ data = defaultData, height, className }: EventMapProps) {
  const style = height === undefined ? undefined : { height };
  const total = sumEvents(data);

  if (total === null || total <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum evento presencial neste recorte: o mapa não tem o que posicionar.</span>
      </div>
    );
  }

  const withEvents = data.filter((row) => row.events > 0);
  const withoutEvents = data.filter((row) => row.events === 0);
  const byRegion = REGIONS.map((region) => ({ ...region, events: sumEvents(data.filter((row) => row.region === region.id)) }));
  const leaderRegion = [...byRegion].sort((a, b) => (b.events ?? 0) - (a.events ?? 0))[0];
  const emptyRegions = byRegion.filter((region) => region.events === 0).map((region) => region.name);
  const topCities = [...withEvents].sort((a, b) => b.events - a.events || a.city.localeCompare(b.city, 'pt-BR')).slice(0, TOP_CITIES);
  const note = project(NOTE_LON, NOTE_LAT);
  const leaderShare = (leaderRegion?.events ?? 0) / total;
  const emptyText = emptyRegions.length > 0 ? `sem nenhum evento: ${emptyRegions.join(', ')}` : '';

  const summary =
    `Mapa de pontos com ${formatInt(total)} eventos presenciais de 2026 em ${formatInt(withEvents.length)} cidades, um ponto por evento. ` +
    `${leaderRegion?.name ?? ''} lidera, com ${formatInt(leaderRegion?.events ?? 0)} eventos (${formatPercent(leaderShare, 0)})` +
    (emptyText === '' ? '.' : `; ${emptyText}.`);

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <div className="flex min-h-0 flex-1 items-start gap-5">
        <svg aria-hidden className="shrink-0" height={MAP_H} viewBox={`0 0 ${String(MAP_W)} ${String(MAP_H)}`} width={MAP_W}>
          <polygon fill="var(--surface-sunken)" points={OUTLINE_POINTS} stroke="var(--line-subtle)" strokeLinejoin="round" strokeWidth={1} />
          {withoutEvents.map((row) => {
            const { x, y } = project(row.lon, row.lat);
            return (
              <g key={row.id}>
                <title>{`${row.city}: nenhum evento`}</title>
                <circle cx={x} cy={y} fill="none" r={RING_R} stroke="var(--text-muted)" strokeDasharray="2 2" strokeWidth={1.5} />
              </g>
            );
          })}
          {withEvents.map((row) => {
            const { x, y } = project(row.lon, row.lat);
            return (
              <g key={row.id}>
                <title>{`${row.city}: ${formatInt(row.events)} ${row.events === 1 ? 'evento' : 'eventos'}`}</title>
                {eventOffsets(row.events).map((offset) => (
                  <circle
                    cx={x + offset.dx}
                    cy={y + offset.dy}
                    fill="var(--chart-1)"
                    fillOpacity={FILL_OPACITY}
                    key={`${row.id}-${String(offset.dx)}-${String(offset.dy)}`}
                    r={DOT_R}
                    stroke="var(--surface-raised)"
                    strokeWidth={1}
                  />
                ))}
              </g>
            );
          })}
          {emptyRegions.length > 0 ? (
            <text fill="var(--text-secondary)" fontSize={11} style={HALO} textAnchor="middle" x={note.x} y={note.y}>
              <tspan x={note.x}>nenhum evento</tspan>
              <tspan dy={13} x={note.x}>{`no ${emptyRegions[0] ?? ''}`}</tspan>
            </text>
          ) : null}
        </svg>

        <div className="flex min-w-0 flex-1 flex-col gap-3 text-[0.6875rem] leading-4 text-text-muted">
          <p aria-hidden className="m-0 text-xs leading-4 text-text-secondary">
            {`${leaderRegion?.name ?? ''} concentra ${formatPercent(leaderShare, 0)} dos eventos${emptyText === '' ? '' : `; ${emptyText}`}.`}
          </p>
          <div aria-hidden className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5">
              <DotSample />
              <span>{`${formatInt(1)} ponto = ${formatInt(1)} evento`}</span>
            </span>
            {withoutEvents.length > 0 ? (
              <span className="flex items-center gap-1.5">
                <RingSample />
                <span>{`Anel pontilhado: ${withoutEvents.map((row) => row.city).join(', ')}, sem evento`}</span>
              </span>
            ) : null}
          </div>
          <div aria-hidden className="flex flex-col gap-0.5">
            <span>Cidades com mais eventos</span>
            {topCities.map((row) => (
              <span className="flex items-baseline justify-between gap-3 text-text-secondary" key={row.id}>
                <span className="truncate">{row.city}</span>
                <span className="font-display tabular-nums">{formatInt(row.events)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <ul aria-hidden className="m-0 flex shrink-0 list-none flex-wrap items-center gap-x-5 gap-y-1 p-0 text-[0.6875rem] leading-4">
        {byRegion.map((region) => (
          <li className="flex items-center gap-1.5" key={region.id}>
            {region.events === null ? null : region.events === 0 ? <RingSample /> : <DotSample />}
            <span className="text-text-secondary">{region.name}</span>
            {region.events === null ? (
              <span className="text-text-muted">{formatUnavailable()}</span>
            ) : (
              <span className="font-display font-semibold tabular-nums text-text-primary">{formatInt(region.events)}</span>
            )}
          </li>
        ))}
      </ul>
    </figure>
  );
}
