import { Filter } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BRASIL_OUTLINE, type CityLeads, data as defaultData, GEO_BOUNDS, type LeadsByPlace } from './data';

/**
 * Mapa de pontos dos leads com município, ao lado do card dos leads sem município. Lead sem município nunca vira
 * ponto, nem no centroide da UF, porque o centroide criaria um aglomerado que o dado não tem: ele fica fora do
 * mapa e entra como número escrito, com as UFs que mais o produzem. A frase acessível soma as duas metades.
 */
export interface MissingCityMapProps {
  readonly data?: LeadsByPlace;
  readonly height?: number;
  readonly className?: string;
}

type Point = readonly [number, number];

/** Pixels por grau: o mapa tem escala 1 no viewBox, e por isso o texto de 11 px chega com 11 px (GEO-18). */
const DEG_PX = 5.8;
const MAP_W = Math.round((GEO_BOUNDS.lonMax - GEO_BOUNDS.lonMin) * DEG_PX);
const MAP_H = Math.round((GEO_BOUNDS.latMax - GEO_BOUNDS.latMin) * DEG_PX);
const LEADS_PER_DOT = 20;
const DOT_R = 1.7;
/** Distância entre centros no cacho: o diâmetro do ponto mais o contorno e um respiro, então nenhum ponto cobre outro. */
const CLUSTER_STEP = 4;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const CLUSTER_GAP = 1.5;
const RELAX_ROUNDS = 160;
/** Atração fraca de volta à coordenada da cidade, para o afastamento entre cachos não desmanchar a geografia. */
const PULL = 0.03;
/** 0,80 fica acima da opacidade mínima de --chart-1 (0,66) nos dois temas (ACE-5). */
const FILL_OPACITY = 0.8;
const TOP_UFS = 3;

function project(lon: number, lat: number): Point {
  return [(lon - GEO_BOUNDS.lonMin) * DEG_PX, (GEO_BOUNDS.latMax - lat) * DEG_PX];
}

const OUTLINE_POINTS = BRASIL_OUTLINE.map(([lon, lat]) => {
  const [x, y] = project(lon, lat);
  return `${String(Math.round(x * 10) / 10)},${String(Math.round(y * 10) / 10)}`;
}).join(' ');

/** Soma de uma lista de contagens, ou null quando a lista está vazia. */
function sumCounts(values: readonly number[]): number | null {
  let total: number | null = null;
  for (const value of values) total = (total ?? 0) + value;
  return total;
}

interface Cluster {
  readonly id: string;
  readonly count: number;
  readonly radius: number;
  readonly originX: number;
  readonly originY: number;
  x: number;
  y: number;
}

/**
 * Um ponto a cada LEADS_PER_DOT leads. Cada cidade vira um cacho em espiral de girassol, com distância fixa entre
 * centros, então a área do cacho cresce com a contagem e nenhum ponto cobre outro. Cachos vizinhos se afastam por
 * relaxamento de ordem fixa, com uma atração fraca de volta à cidade: a posição em volta da cidade é ilustrativa.
 */
function placeDots(cities: readonly CityLeads[]): readonly { readonly id: string; readonly x: number; readonly y: number }[] {
  const clusters: Cluster[] = cities.map((city) => {
    const count = Math.round(city.leads / LEADS_PER_DOT);
    const [originX, originY] = project(city.lon, city.lat);
    return { id: city.id, count, radius: CLUSTER_STEP * Math.sqrt(count) + DOT_R + 0.5, originX, originY, x: originX, y: originY };
  });
  for (let round = 0; round < RELAX_ROUNDS; round += 1) {
    clusters.forEach((a, indexA) => {
      a.x += (a.originX - a.x) * PULL;
      a.y += (a.originY - a.y) * PULL;
      clusters.slice(indexA + 1).forEach((b, offset) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const wanted = a.radius + b.radius + CLUSTER_GAP;
        if (distance >= wanted) return;
        const angle = distance > 0.001 ? Math.atan2(dy, dx) : (indexA + offset) * GOLDEN_ANGLE;
        const push = (wanted - distance) / 2;
        a.x -= Math.cos(angle) * push;
        a.y -= Math.sin(angle) * push;
        b.x += Math.cos(angle) * push;
        b.y += Math.sin(angle) * push;
      });
    });
    for (const cluster of clusters) {
      cluster.x = Math.min(MAP_W - cluster.radius, Math.max(cluster.radius, cluster.x));
      cluster.y = Math.min(MAP_H - cluster.radius, Math.max(cluster.radius, cluster.y));
    }
  }
  return clusters.flatMap((cluster) =>
    Array.from({ length: cluster.count }, (_, index) => ({
      id: `${cluster.id}-${String(index)}`,
      x: cluster.x + CLUSTER_STEP * Math.sqrt(index + 0.5) * Math.cos(index * GOLDEN_ANGLE),
      y: cluster.y + CLUSTER_STEP * Math.sqrt(index + 0.5) * Math.sin(index * GOLDEN_ANGLE),
    })),
  );
}

export default function MissingCityMap({ data = defaultData, height, className }: MissingCityMapProps) {
  const style = height === undefined ? undefined : { height };
  const located = sumCounts(data.cities.map((city) => city.leads));
  const missing = sumCounts(data.withoutCity.map((row) => row.leads)) ?? 0;
  const dots = placeDots(data.cities);

  if (located === null || located <= 0 || dots.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>
          {missing > 0
            ? `Nenhum lead com município neste recorte: os ${formatInt(missing)} leads sem município não viram ponto.`
            : 'Nenhum lead neste recorte: o mapa não tem ponto para desenhar.'}
        </span>
      </div>
    );
  }

  const total = located + missing;
  const missingShare = missing / total;
  const topUfs = [...data.withoutCity].sort((a, b) => b.leads - a.leads || a.name.localeCompare(b.name, 'pt-BR')).slice(0, TOP_UFS);

  const summary =
    `Mapa de pontos com ${formatInt(dots.length)} pontos, um a cada ${formatInt(LEADS_PER_DOT)} leads, para ${formatInt(located)} leads com município. ` +
    `Outros ${formatInt(missing)} leads (${formatPercent(missingShare, 1)} dos ${formatInt(total)}) não têm município e ficam fora do mapa.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <div className="flex min-h-0 flex-1 items-start gap-5">
        <svg aria-hidden className="shrink-0" height={MAP_H} viewBox={`0 0 ${String(MAP_W)} ${String(MAP_H)}`} width={MAP_W}>
          <polygon fill="var(--surface-sunken)" points={OUTLINE_POINTS} stroke="var(--line-subtle)" strokeLinejoin="round" strokeWidth={1} />
          {dots.map((dot) => (
            <circle cx={dot.x} cy={dot.y} fill="var(--chart-1)" fillOpacity={FILL_OPACITY} key={dot.id} r={DOT_R} stroke="var(--surface-raised)" strokeWidth={0.5} />
          ))}
        </svg>

        <div aria-hidden className="flex min-w-0 flex-1 flex-col gap-2 text-[0.6875rem] leading-4 text-text-muted">
          <div className="flex flex-col gap-0.5 rounded-md bg-surface-sunken px-3 py-2">
            <span className="kpi-number text-2xl font-semibold leading-8 text-text-primary">{formatInt(missing)}</span>
            <span className="text-xs leading-4 text-text-secondary">leads sem município, fora do mapa</span>
            <span>{`${formatPercent(missingShare, 1)} dos ${formatInt(total)} leads`}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span>UFs com mais leads sem município</span>
            {topUfs.map((row) => (
              <span className="flex items-baseline justify-between gap-3 text-text-secondary" key={row.uf}>
                <span className="truncate">{row.name}</span>
                <span className="font-display tabular-nums">{formatInt(row.leads)}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5">
              <svg className="shrink-0" height={12} width={12}>
                <circle cx={6} cy={6} fill="var(--chart-1)" fillOpacity={FILL_OPACITY} r={DOT_R + 1} stroke="var(--surface-raised)" strokeWidth={0.5} />
              </svg>
              <span>{`${formatInt(1)} ponto = ${formatInt(LEADS_PER_DOT)} leads com município`}</span>
            </span>
            <span>Lead sem município não vira ponto, nem no centroide da UF. O cacho cresce com a contagem; a posição em volta da cidade é ilustrativa.</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
