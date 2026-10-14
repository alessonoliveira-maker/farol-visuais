import { Filter } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BRASIL_OUTLINE, data as defaultData, GEO_BOUNDS, ORIGINS, type Origin, type UfBounds, type UfLeads } from './data';

/**
 * Mapa de pontos com um ponto a cada 5 leads, em pequenos múltiplos: um mapa por origem, todos na mesma escala,
 * para nenhuma origem ficar por cima de outra. Cada ponto cai num lugar sorteado dentro da UF, por gerador de
 * semente fixa e teste de ponto dentro do polígono (ray casting), e os pontos de uma origem saem num único path
 * com subcaminhos de círculo, sem contorno. A origem é lida pelo nome sobre o mapa e não só pela cor. O mapa lê
 * densidade, nunca a posição exata de um lead, e por isso diz na tela que a posição dentro da UF é ilustrativa.
 */
export interface LeadDotMapProps {
  readonly data?: readonly UfLeads[];
  readonly height?: number;
  readonly className?: string;
}

type Point = readonly [number, number];

/** Pixels por grau: o mapa tem escala 1 no viewBox, e por isso o texto de 11 px chega com 11 px (GEO-18). */
const DEG_PX = 3.7;
const MAP_W = Math.round((GEO_BOUNDS.lonMax - GEO_BOUNDS.lonMin) * DEG_PX);
const MAP_H = Math.round((GEO_BOUNDS.latMax - GEO_BOUNDS.latMin) * DEG_PX);
/** Quantos leads cada ponto representa. */
const LEADS_PER_DOT = 5;
const DOT_R = 1.1;
/** Distância mínima entre centros da mesma origem, enquanto a UF tiver lugar; depois disso o ponto se sobrepõe e a saturação é dita na tela. */
const MIN_GAP = 2.5;
const GAP_ATTEMPTS = 160;
/** 0,80 fica acima da opacidade mínima de todas as cores categóricas usadas (a maior é 0,71) nos dois temas (ACE-5). */
const FILL_OPACITY = 0.8;
/** Cantos cortados do polígono aproximado da UF, como fração do menor lado da caixa. */
const CHAMFER = 0.28;
const MAX_ATTEMPTS = 400;
const LEGEND_DOT_R = 4;
/** Cor por posição da paleta, em literal para o check enxergar cada token. */
const SLOT_COLOR = { 1: 'var(--chart-1)', 2: 'var(--chart-2)', 3: 'var(--chart-3)', 5: 'var(--chart-5)', 6: 'var(--chart-6)' } as const;

function project(lon: number, lat: number): Point {
  return [(lon - GEO_BOUNDS.lonMin) * DEG_PX, (GEO_BOUNDS.latMax - lat) * DEG_PX];
}

/** Gerador de semente fixa (mulberry32): a mesma semente devolve a mesma sequência em qualquer máquina. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ray casting: conta quantas arestas do anel um raio horizontal cruza; ímpar quer dizer dentro. */
function insideRing(lon: number, lat: number, ring: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const a = ring[i];
    const b = ring[j];
    if (a === undefined || b === undefined) continue;
    if (a[1] > lat !== b[1] > lat && lon < ((b[0] - a[0]) * (lat - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

/** Anel aproximado da UF: a caixa dela com os quatro cantos cortados, que tira os pontos dos vértices vazios. */
function ringOf(bounds: UfBounds): readonly Point[] {
  const chamfer = CHAMFER * Math.min(bounds.lonMax - bounds.lonMin, bounds.latMax - bounds.latMin);
  return [
    [bounds.lonMin + chamfer, bounds.latMin],
    [bounds.lonMax - chamfer, bounds.latMin],
    [bounds.lonMax, bounds.latMin + chamfer],
    [bounds.lonMax, bounds.latMax - chamfer],
    [bounds.lonMax - chamfer, bounds.latMax],
    [bounds.lonMin + chamfer, bounds.latMax],
    [bounds.lonMin, bounds.latMax - chamfer],
    [bounds.lonMin, bounds.latMin + chamfer],
  ];
}

/** Subcaminho de um círculo completo em duas semicircunferências, para o path único de cada origem. */
function circleSubpath(cx: number, cy: number): string {
  const x = Math.round((cx - DOT_R) * 10) / 10;
  const y = Math.round(cy * 10) / 10;
  const diameter = 2 * DOT_R;
  return `M${String(x)} ${String(y)}a${String(DOT_R)} ${String(DOT_R)} 0 1 0 ${String(diameter)} 0a${String(DOT_R)} ${String(DOT_R)} 0 1 0 ${String(-diameter)} 0`;
}

const COUNTRY_RING: readonly Point[] = BRASIL_OUTLINE.map(([lon, lat]) => [lon, lat] as const);
const OUTLINE_POINTS = COUNTRY_RING.map(([lon, lat]) => {
  const [x, y] = project(lon, lat);
  return `${String(Math.round(x * 10) / 10)},${String(Math.round(y * 10) / 10)}`;
}).join(' ');

/** Soma dos leads de uma origem, ou null quando não há UF. */
function sumOrigin(rows: readonly UfLeads[], index: number): number | null {
  let total: number | null = null;
  for (const row of rows) total = (total ?? 0) + (row.leads[index] ?? 0);
  return total;
}

/** Percentuais inteiros que somam 100, pelo maior resto (NUM-2). */
function wholePercents(values: readonly number[]): readonly number[] {
  const sum = values.reduce((acc, value) => acc + value, 0);
  if (sum <= 0) return values.map(() => 0);
  const exact = values.map((value) => (100 * value) / sum);
  const floors = exact.map((value) => Math.floor(value));
  let missing = 100 - floors.reduce((acc, value) => acc + value, 0);
  const order = exact.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of order) {
    if (missing <= 0) break;
    floors[index] = (floors[index] ?? 0) + 1;
    missing -= 1;
  }
  return floors;
}

interface OriginLayer {
  readonly origin: Origin;
  readonly leads: number;
  readonly dots: number;
  readonly path: string;
}

/** Sorteia, UF a UF, os pontos de cada origem dentro do anel da UF e dentro do contorno do país. Ponto sem lugar é descartado, nunca vai ao centroide. */
function buildLayers(rows: readonly UfLeads[]): readonly OriginLayer[] {
  return ORIGINS.map((origin, originIndex) => {
    const parts: string[] = [];
    let dots = 0;
    rows.forEach((row, rowIndex) => {
      const wanted = Math.round((row.leads[originIndex] ?? 0) / LEADS_PER_DOT);
      const ring = ringOf(row.bounds);
      const next = seeded(7919 * (rowIndex + 1) + 104729 * (originIndex + 1));
      const here: Point[] = [];
      for (let placed = 0, attempts = 0; placed < wanted && attempts < MAX_ATTEMPTS; attempts += 1) {
        const lon = row.bounds.lonMin + next() * (row.bounds.lonMax - row.bounds.lonMin);
        const lat = row.bounds.latMin + next() * (row.bounds.latMax - row.bounds.latMin);
        if (!insideRing(lon, lat, ring) || !insideRing(lon, lat, COUNTRY_RING)) continue;
        const [x, y] = project(lon, lat);
        if (attempts < GAP_ATTEMPTS && here.some(([hx, hy]) => Math.hypot(hx - x, hy - y) < MIN_GAP)) continue;
        here.push([x, y]);
        parts.push(circleSubpath(x, y));
        placed += 1;
        dots += 1;
      }
    });
    return { origin, leads: sumOrigin(rows, originIndex) ?? 0, dots, path: parts.join('') };
  });
}

export default function LeadDotMap({ data = defaultData, height, className }: LeadDotMapProps) {
  const style = height === undefined ? undefined : { height };
  const layers = buildLayers(data);
  const total = layers.reduce((acc, layer) => acc + layer.leads, 0);
  const dots = layers.reduce((acc, layer) => acc + layer.dots, 0);

  if (data.length === 0 || total <= 0 || dots === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: o mapa não tem ponto para desenhar.</span>
      </div>
    );
  }

  const percents = wholePercents(layers.map((layer) => layer.leads));
  const ranked = layers.map((layer, index) => ({ ...layer, percent: percents[index] ?? 0 })).sort((a, b) => b.leads - a.leads);
  const leader = ranked[0];
  const last = ranked[ranked.length - 1];

  const summary =
    `Mapa de pontos com ${formatInt(total)} leads de 2026, um ponto a cada ${formatInt(LEADS_PER_DOT)} leads, ${formatInt(dots)} pontos em ${formatInt(data.length)} UFs. ` +
    `${leader?.origin.name ?? ''} lidera, com ${formatPercent((leader?.leads ?? 0) / total, 0)} dos leads. A posição dentro da UF é ilustrativa.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p aria-hidden className="m-0 text-xs leading-4 text-text-secondary">
        {`${leader?.origin.name ?? ''} traz ${formatPercent((leader?.leads ?? 0) / total, 0)} dos leads; ${last?.origin.name ?? ''} é a menor origem, com ${formatPercent((last?.leads ?? 0) / total, 0)}.`}
      </p>
      <div className="flex min-h-0 flex-1 items-start gap-3">
        {layers.map((layer, index) => (
          <div className="flex min-w-0 flex-col gap-1" key={layer.origin.id} style={{ width: MAP_W }}>
            <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold leading-4 text-text-primary">
              <svg aria-hidden className="shrink-0" height={10} width={10}>
                <circle cx={5} cy={5} fill={SLOT_COLOR[layer.origin.slot]} fillOpacity={FILL_OPACITY} r={LEGEND_DOT_R} />
              </svg>
              <span className="min-w-0 truncate">{layer.origin.name}</span>
            </span>
            <span className="font-display text-[0.6875rem] tabular-nums leading-4 text-text-secondary">
              {`${formatInt(layer.leads)} leads, ${formatInt(percents[index] ?? 0)}%`}
            </span>
            <svg aria-hidden className="shrink-0" height={MAP_H} viewBox={`0 0 ${String(MAP_W)} ${String(MAP_H)}`} width={MAP_W}>
              <polygon fill="var(--surface-sunken)" points={OUTLINE_POINTS} stroke="var(--line-subtle)" strokeLinejoin="round" strokeWidth={1} />
              <path d={layer.path} fill={SLOT_COLOR[layer.origin.slot]} fillOpacity={FILL_OPACITY}>
                <title>{`${layer.origin.name}: ${formatInt(layer.leads)} leads, ${formatInt(layer.dots)} pontos`}</title>
              </path>
            </svg>
          </div>
        ))}
      </div>
      <p aria-hidden className="m-0 text-[0.6875rem] leading-4 text-text-muted">
        {`${formatInt(1)} ponto = ${formatInt(LEADS_PER_DOT)} leads. ${formatInt(total)} leads em ${formatInt(dots)} pontos, mesma escala nos cinco mapas. A posição dentro da UF é ilustrativa: sorteada com semente fixa, sem município. Onde a UF é pequena, como o Distrito Federal, os pontos se sobrepõem: leia o total escrito acima do mapa.`}
      </p>
    </figure>
  );
}
