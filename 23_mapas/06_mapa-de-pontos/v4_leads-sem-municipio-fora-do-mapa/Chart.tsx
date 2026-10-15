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
/** Passo da malha hexagonal: o diâmetro do ponto mais o contorno e um respiro, então nenhum ponto cobre outro. */
const GRID_STEP = 3.9;
/** Folga mínima entre o centro do ponto e o traço do contorno, para o ponto ficar inteiro dentro do país. */
const EDGE_CLEAR = DOT_R + 1;
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

/** Ray casting: o ponto está dentro do polígono. */
function inside(poly: readonly Point[], x: number, y: number): boolean {
  let result = false;
  poly.forEach(([x1, y1], i) => {
    const [x0, y0] = poly[(i + poly.length - 1) % poly.length] ?? [x1, y1];
    if (y1 > y !== y0 > y && x < ((x0 - x1) * (y - y1)) / (y0 - y1) + x1) result = !result;
  });
  return result;
}

/** Menor distância do ponto ao traço do polígono. */
function edgeDistance(poly: readonly Point[], x: number, y: number): number {
  let best = Infinity;
  poly.forEach(([x1, y1], i) => {
    const [x0, y0] = poly[(i + poly.length - 1) % poly.length] ?? [x1, y1];
    const len2 = (x1 - x0) ** 2 + (y1 - y0) ** 2;
    const t = len2 === 0 ? 0 : Math.min(1, Math.max(0, ((x - x0) * (x1 - x0) + (y - y0) * (y1 - y0)) / len2));
    best = Math.min(best, Math.hypot(x - (x0 + t * (x1 - x0)), y - (y0 + t * (y1 - y0))));
  });
  return best;
}

const OUTLINE: readonly Point[] = BRASIL_OUTLINE.map(([lon, lat]) => project(lon, lat));

/** Nós da malha hexagonal que cabem inteiros dentro do país, em ordem fixa. */
const GRID: readonly Point[] = (() => {
  const nodes: Point[] = [];
  const rowH = (GRID_STEP * Math.sqrt(3)) / 2;
  for (let row = 0; row * rowH <= MAP_H; row += 1) {
    for (let col = 0; col * GRID_STEP <= MAP_W; col += 1) {
      const x = col * GRID_STEP + (row % 2) * (GRID_STEP / 2);
      const y = row * rowH;
      if (inside(OUTLINE, x, y) && edgeDistance(OUTLINE, x, y) >= EDGE_CLEAR) nodes.push([x, y]);
    }
  }
  return nodes;
})();

/**
 * Um ponto a cada LEADS_PER_DOT leads. Todo ponto ocupa um nó livre da malha hexagonal, que só tem nós dentro do
 * contorno do país. Os pontos são distribuídos em rodadas entre as cidades (um por cidade a cada rodada) e cada um
 * toma o nó livre mais próximo da coordenada da cidade, então o cacho fica compacto, cresce com a contagem, nunca
 * sai do país e nenhum ponto cobre outro. Cidade litorânea empurra o cacho para o interior: a posição em volta
 * da cidade é ilustrativa.
 */
function placeDots(cities: readonly CityLeads[]): readonly { readonly id: string; readonly x: number; readonly y: number }[] {
  const taken = new Set<number>();
  const wanted = cities.map((city) => ({ city, count: Math.round(city.leads / LEADS_PER_DOT), origin: project(city.lon, city.lat) }));
  const dots: { id: string; x: number; y: number }[] = [];
  const rounds = Math.max(0, ...wanted.map((w) => w.count));
  for (let round = 0; round < rounds; round += 1) {
    for (const { city, count, origin } of wanted) {
      if (round >= count) continue;
      let best = -1;
      let bestDistance = Infinity;
      GRID.forEach(([x, y], index) => {
        if (taken.has(index)) return;
        const distance = Math.hypot(x - origin[0], y - origin[1]);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      if (best < 0) continue;
      taken.add(best);
      dots.push({ id: `${city.id}-${String(round)}`, x: GRID[best]?.[0] ?? 0, y: GRID[best]?.[1] ?? 0 });
    }
  }
  return dots;
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
            <span>Lead sem município não vira ponto, nem no centroide da UF. O cacho cresce com a contagem; a posição em volta da cidade é ilustrativa e nunca sai do país.</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
