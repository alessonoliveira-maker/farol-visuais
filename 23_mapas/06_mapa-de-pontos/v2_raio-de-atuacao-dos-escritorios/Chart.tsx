import { Building2, Filter } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BRASIL_OUTLINE, type ClientCity, data as defaultData, GEO_WINDOW, type Office, offices as defaultOffices, RADIUS_KM } from './data';

/**
 * Raio de atuação dos escritórios: cada cliente é um ponto, cheio quando está a até 100 km de um escritório e
 * vazado quando está fora. O raio é uma elipse em graus (rx corrigido pelo cosseno da latitude) e a distância
 * que classifica o cliente é a de haversine. A posição de cada cliente
 * dentro da cidade é espalhada por gerador de semente fixa, só como desenho: a classe de cada cliente vem da
 * coordenada da cidade no dado, e o ponto só é aceito do lado certo da elipse. A legenda diz que o raio é aproximado.
 */
export interface OfficeReachProps {
  readonly data?: readonly ClientCity[];
  readonly offices?: readonly Office[];
  readonly height?: number;
  readonly className?: string;
}

/** Pixels por grau: o mapa tem escala 1 no viewBox, e por isso o texto de 11 px chega com 11 px (GEO-18). */
const DEG_PX = 21;
const MAP_W = (GEO_WINDOW.lonMax - GEO_WINDOW.lonMin) * DEG_PX;
const MAP_H = (GEO_WINDOW.latMax - GEO_WINDOW.latMin) * DEG_PX;
const EARTH_RADIUS_KM = 6371;
const KM_PER_DEGREE_LAT = (Math.PI / 180) * EARTH_RADIUS_KM;
/** Raio do ponto de cliente, em px, e a distância mínima entre centros (diâmetro mais contorno e respiro). */
const DOT_R = 2;
const MIN_GAP = 5.4;
/** Folga entre o ponto e a borda do raio: dentro fica dentro, fora fica fora, nunca sobre o traço. */
const EDGE_CLEAR = 3.6;
const OFFICE_BADGE_R = 8;
const BADGE_CLEAR = OFFICE_BADGE_R + DOT_R + 2;
const WINDOW_PAD = 5;
const MAX_ATTEMPTS = 900;
/** Espaçamento mínimo que ainda separa os contornos (diâmetro 4 mais 0,5 de contorno), e a varredura de anéis. */
const MIN_GAP_FLOOR = 4.5;
const SCAN_STEP = 1;
const SCAN_MAX = 60;
const FILL_OPACITY = 0.85;
const ICON_SIZE = 12;
/** Largura estimada por caractere de 11 px, para testar a caixa do nome do escritório contra os pontos. */
const LABEL_CHAR_W = 6.6;
const LABEL_H = 12;
const LABEL_CLEAR = 3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-sunken)', strokeWidth: 3 } as const;

interface Client {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  /** Classe medida na coordenada da cidade (a que está no dado), nunca no ponto espalhado. */
  readonly inside: boolean;
  readonly nearest: string | null;
}

interface Reach {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly rx: number;
  readonly ry: number;
}

function project(lon: number, lat: number): { readonly x: number; readonly y: number } {
  return { x: (lon - GEO_WINDOW.lonMin) * DEG_PX, y: (GEO_WINDOW.latMax - lat) * DEG_PX };
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

/** Distância de haversine em quilômetros entre dois pontos em graus. */
function haversineKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Escritório mais próximo e a distância até ele, ou null quando não há escritório. */
function nearestOffice(lon: number, lat: number, offices: readonly Office[]): { readonly id: string; readonly km: number } | null {
  let best: { readonly id: string; readonly km: number } | null = null;
  for (const office of offices) {
    const km = haversineKm(lon, lat, office.lon, office.lat);
    if (best === null || km < best.km) best = { id: office.id, km };
  }
  return best;
}

/** Elipse do raio de cada escritório em px: ry fixo pelo raio em km e rx corrigido pelo cosseno da latitude. */
function reachOf(offices: readonly Office[]): readonly Reach[] {
  const ryDeg = RADIUS_KM / KM_PER_DEGREE_LAT;
  return offices.map((office) => ({
    id: office.id,
    ...project(office.lon, office.lat),
    rx: (ryDeg / Math.cos((office.lat * Math.PI) / 180)) * DEG_PX,
    ry: ryDeg * DEG_PX,
  }));
}

/** Posição normalizada na elipse: menor que 1 é dentro, maior que 1 é fora. */
function ellipseLevel(x: number, y: number, reach: Reach): number {
  return Math.hypot((x - reach.x) / reach.rx, (y - reach.y) / reach.ry);
}

/** Contagens do dado, independentes do posicionador: cada linha vale `clients` clientes, na classe da coordenada da cidade. */
function tally(rows: readonly ClientCity[], offices: readonly Office[]): { total: number; inside: number; byOffice: ReadonlyMap<string, number> } {
  const byOffice = new Map<string, number>();
  let total = 0;
  let inside = 0;
  for (const row of rows) {
    total += row.clients;
    const near = nearestOffice(row.lon, row.lat, offices);
    if (near !== null && near.km <= RADIUS_KM) {
      inside += row.clients;
      byOffice.set(near.id, (byOffice.get(near.id) ?? 0) + row.clients);
    }
  }
  return { total, inside, byOffice };
}

/**
 * Posiciona os clientes. A classe (dentro ou fora do raio) sai da coordenada da cidade, que está no dado. O
 * espalhamento em volta da cidade é só desenho: cada ponto é aceito apenas do lado certo da elipse, com folga da
 * borda, longe do selo e a uma distância mínima dos pontos já postos, então a contagem na tela é a do dado.
 */
function placeClients(rows: readonly ClientCity[], offices: readonly Office[]): readonly Client[] {
  const reaches = reachOf(offices);
  const classified = rows.map((row, rowIndex) => {
    const near = nearestOffice(row.lon, row.lat, offices);
    return { row, rowIndex, nearest: near?.id ?? null, inside: near !== null && near.km <= RADIUS_KM };
  });
  const ordered = [...classified.filter((item) => item.inside), ...classified.filter((item) => !item.inside)];
  const placed: Client[] = [];
  for (const item of ordered) {
    const next = seeded(1000 + item.rowIndex * 97);
    const origin = project(item.row.lon, item.row.lat);
    const own = reaches.find((reach) => reach.id === item.nearest);
    for (let index = 0; index < item.row.clients; index += 1) {
      const fits = (x: number, y: number, gap: number): boolean => {
        if (x < WINDOW_PAD || x > MAP_W - WINDOW_PAD || y < WINDOW_PAD || y > MAP_H - WINDOW_PAD) return false;
        if (reaches.some((reach) => Math.hypot(x - reach.x, y - reach.y) < BADGE_CLEAR)) return false;
        if (placed.some((other) => Math.hypot(x - other.x, y - other.y) < gap)) return false;
        return item.inside
          ? own !== undefined && ellipseLevel(x, y, own) <= 1 - EDGE_CLEAR / Math.min(own.rx, own.ry)
          : reaches.every((reach) => ellipseLevel(x, y, reach) >= 1 + EDGE_CLEAR / Math.min(reach.rx, reach.ry));
      };
      let chosen: { x: number; y: number } | null = null;
      for (let attempt = 0; attempt < MAX_ATTEMPTS && chosen === null; attempt += 1) {
        const angle = next() * 2 * Math.PI;
        const radius = Math.sqrt(next()) * (5 + attempt * 0.1);
        const x = origin.x + Math.cos(angle) * radius;
        const y = origin.y + Math.sin(angle) * radius;
        if (fits(x, y, MIN_GAP)) chosen = { x, y };
      }
      /* Busca determinística: varre em anéis crescentes em volta da cidade e só aceita posição válida, com o
         espaçamento cheio e depois o mínimo que ainda separa os contornos. Nunca cai na coordenada sem teste. */
      for (const gap of [MIN_GAP, MIN_GAP_FLOOR]) {
        for (let radius = 0; radius <= SCAN_MAX && chosen === null; radius += SCAN_STEP) {
          const steps = Math.max(1, Math.ceil((2 * Math.PI * radius) / SCAN_STEP));
          for (let k = 0; k < steps && chosen === null; k += 1) {
            const angle = (2 * Math.PI * k) / steps;
            const x = origin.x + Math.cos(angle) * radius;
            const y = origin.y + Math.sin(angle) * radius;
            if (fits(x, y, gap)) chosen = { x, y };
          }
        }
      }
      if (chosen === null) continue;
      placed.push({ id: `${item.row.id}-${String(index)}`, ...chosen, inside: item.inside, nearest: item.nearest });
    }
  }
  return placed;
}

interface LabelSpot {
  readonly x: number;
  readonly y: number;
  readonly anchor: 'start' | 'end' | 'middle';
}

/** Escolhe o lado do nome (direita, esquerda, acima, abaixo) em que nenhum ponto cai na caixa do texto mais a folga. */
function labelSpot(reach: Reach, city: string, clients: readonly Client[], taken: readonly { x0: number; x1: number; y0: number; y1: number }[]): { spot: LabelSpot; box: { x0: number; x1: number; y0: number; y1: number } } {
  const width = city.length * LABEL_CHAR_W;
  const candidates: readonly LabelSpot[] = [
    { x: reach.x + reach.rx + 5, y: reach.y + 4, anchor: 'start' },
    { x: reach.x - reach.rx - 5, y: reach.y + 4, anchor: 'end' },
    { x: reach.x, y: reach.y - reach.ry - 6, anchor: 'middle' },
    { x: reach.x, y: reach.y + reach.ry + 15, anchor: 'middle' },
  ];
  const boxOf = (spot: LabelSpot) => {
    const x0 = spot.anchor === 'start' ? spot.x : spot.anchor === 'end' ? spot.x - width : spot.x - width / 2;
    return { x0, x1: x0 + width, y0: spot.y - LABEL_H + 3, y1: spot.y + 3 };
  };
  const score = (spot: LabelSpot) => {
    const box = boxOf(spot);
    let hits = clients.filter((client) => client.x > box.x0 - LABEL_CLEAR - DOT_R && client.x < box.x1 + LABEL_CLEAR + DOT_R && client.y > box.y0 - LABEL_CLEAR - DOT_R && client.y < box.y1 + LABEL_CLEAR + DOT_R).length;
    hits += taken.filter((other) => box.x0 < other.x1 && box.x1 > other.x0 && box.y0 < other.y1 && box.y1 > other.y0).length;
    if (box.x0 < 2 || box.x1 > MAP_W - 2 || box.y0 < 2 || box.y1 > MAP_H - 2) hits += 1000;
    return hits;
  };
  const fallback = candidates[0] as LabelSpot;
  const best = candidates.reduce((acc, spot) => (score(spot) < score(acc) ? spot : acc), fallback);
  return { spot: best, box: boxOf(best) };
}

/** Recorta o contorno pela janela, um lado por vez (Sutherland e Hodgman), para o polígono não passar da área do mapa. */
function clipToWindow(ring: readonly (readonly [number, number])[]): readonly (readonly [number, number])[] {
  const edges = [
    { inside: (p: readonly [number, number]) => p[0] >= GEO_WINDOW.lonMin, cut: (a: readonly [number, number], b: readonly [number, number]): readonly [number, number] => [GEO_WINDOW.lonMin, a[1] + ((b[1] - a[1]) * (GEO_WINDOW.lonMin - a[0])) / (b[0] - a[0])] },
    { inside: (p: readonly [number, number]) => p[0] <= GEO_WINDOW.lonMax, cut: (a: readonly [number, number], b: readonly [number, number]): readonly [number, number] => [GEO_WINDOW.lonMax, a[1] + ((b[1] - a[1]) * (GEO_WINDOW.lonMax - a[0])) / (b[0] - a[0])] },
    { inside: (p: readonly [number, number]) => p[1] >= GEO_WINDOW.latMin, cut: (a: readonly [number, number], b: readonly [number, number]): readonly [number, number] => [a[0] + ((b[0] - a[0]) * (GEO_WINDOW.latMin - a[1])) / (b[1] - a[1]), GEO_WINDOW.latMin] },
    { inside: (p: readonly [number, number]) => p[1] <= GEO_WINDOW.latMax, cut: (a: readonly [number, number], b: readonly [number, number]): readonly [number, number] => [a[0] + ((b[0] - a[0]) * (GEO_WINDOW.latMax - a[1])) / (b[1] - a[1]), GEO_WINDOW.latMax] },
  ];
  let current = ring;
  for (const edge of edges) {
    const next: (readonly [number, number])[] = [];
    current.forEach((point, index) => {
      const previous = current[(index + current.length - 1) % current.length];
      if (previous === undefined) return;
      if (edge.inside(point)) {
        if (!edge.inside(previous)) next.push(edge.cut(previous, point));
        next.push(point);
      } else if (edge.inside(previous)) {
        next.push(edge.cut(previous, point));
      }
    });
    current = next;
  }
  return current;
}

const OUTLINE_POINTS = clipToWindow(BRASIL_OUTLINE)
  .map(([lon, lat]) => {
    const { x, y } = project(lon, lat);
    return `${String(Math.round(x * 10) / 10)},${String(Math.round(y * 10) / 10)}`;
  })
  .join(' ');

function DotSample() {
  return (
    <svg aria-hidden className="shrink-0" height={12} width={12}>
      <circle cx={6} cy={6} fill="var(--chart-1)" fillOpacity={FILL_OPACITY} r={DOT_R + 0.6} stroke="var(--surface-raised)" strokeWidth={1} />
    </svg>
  );
}

function RingSample() {
  return (
    <svg aria-hidden className="shrink-0" height={12} width={12}>
      <circle cx={6} cy={6} fill="none" r={DOT_R + 0.6} stroke="var(--text-muted)" strokeWidth={1.5} />
    </svg>
  );
}

export default function OfficeReach({ data = defaultData, offices = defaultOffices, height, className }: OfficeReachProps) {
  const style = height === undefined ? undefined : { height };
  const clients = placeClients(data, offices);

  const counts = tally(data, offices);

  if (counts.total === 0 || offices.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente ou escritório neste recorte: o mapa não tem raio para medir.</span>
      </div>
    );
  }

  const inside = clients.filter((client) => client.inside);
  const outside = clients.filter((client) => !client.inside);
  const insideCount = counts.inside;
  const outsideCount = counts.total - counts.inside;
  const insideShare = insideCount / counts.total;
  const unplaced = counts.total - clients.length;
  const unplacedNote = unplaced > 0 ? ` ${formatInt(unplaced)} ${unplaced === 1 ? 'cliente ficou sem ponto' : 'clientes ficaram sem ponto'} no desenho, por falta de lugar.` : '';
  const reaches = reachOf(offices);
  const labelBoxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const labels = offices.map((office) => {
    const reach = reaches.find((item) => item.id === office.id) as Reach;
    const placedLabel = labelSpot(reach, office.city, clients, labelBoxes);
    labelBoxes.push(placedLabel.box);
    return { office, reach, spot: placedLabel.spot };
  });
  const perOffice = offices.map((office) => ({ ...office, inside: counts.byOffice.get(office.id) ?? 0 }));

  const summary =
    `Mapa de pontos com ${formatInt(counts.total)} clientes e ${formatInt(offices.length)} escritórios, com raio de ${formatInt(RADIUS_KM)} km. ` +
    `${formatInt(insideCount)} clientes (${formatPercent(insideShare, 0)}) ficam dentro do raio de algum escritório e ${formatInt(outsideCount)} ficam fora.${unplacedNote}`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <div className="flex min-h-0 flex-1 items-start gap-5">
        <svg aria-hidden className="shrink-0" height={MAP_H} viewBox={`0 0 ${String(MAP_W)} ${String(MAP_H)}`} width={MAP_W}>
          <polygon fill="var(--surface-sunken)" points={OUTLINE_POINTS} stroke="var(--line-subtle)" strokeLinejoin="round" strokeWidth={1} />
          {reaches.map((reach) => (
            <ellipse cx={reach.x} cy={reach.y} fill="none" key={reach.id} rx={reach.rx} ry={reach.ry} stroke="var(--chart-1)" strokeDasharray="4 3" strokeWidth={1.5} />
          ))}
          {outside.map((client) => (
            <circle cx={client.x} cy={client.y} fill="none" key={client.id} r={DOT_R} stroke="var(--text-muted)" strokeWidth={1.25} />
          ))}
          {inside.map((client) => (
            <circle cx={client.x} cy={client.y} fill="var(--chart-1)" fillOpacity={FILL_OPACITY} key={client.id} r={DOT_R} stroke="var(--surface-raised)" strokeWidth={1} />
          ))}
          {labels.map(({ office, reach, spot }) => (
            <g key={office.id}>
              <title>{`Escritório de ${office.city}`}</title>
              <circle cx={reach.x} cy={reach.y} fill="var(--surface-raised)" r={OFFICE_BADGE_R} stroke="var(--chart-1)" strokeWidth={1.5} />
              <Building2 aria-hidden className="text-text-primary" height={ICON_SIZE} width={ICON_SIZE} x={reach.x - ICON_SIZE / 2} y={reach.y - ICON_SIZE / 2} />
              <text fill="var(--text-primary)" fontSize={11} fontWeight={600} style={HALO} textAnchor={spot.anchor} x={spot.x} y={spot.y}>
                {office.city}
              </text>
            </g>
          ))}
        </svg>

        <div className="flex min-w-0 flex-1 flex-col gap-3 text-[0.6875rem] leading-4 text-text-muted">
          <p aria-hidden className="m-0 text-xs leading-4 text-text-secondary">
            {`${formatPercent(insideShare, 0)} dos clientes ficam a até ${formatInt(RADIUS_KM)} km de um escritório; ${formatInt(outsideCount)} ficam fora do alcance.`}
          </p>
          <div aria-hidden className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5">
              <DotSample />
              <span className="text-text-secondary">{`Dentro do raio: ${formatInt(insideCount)} clientes`}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <RingSample />
              <span className="text-text-secondary">{`Fora do raio: ${formatInt(outsideCount)} clientes`}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="shrink-0" height={12} width={12}>
                <ellipse cx={6} cy={6} fill="none" rx={5} ry={4} stroke="var(--chart-1)" strokeDasharray="3 2" strokeWidth={1.5} />
              </svg>
              <span>{`Raio de ${formatInt(RADIUS_KM)} km, aproximado: elipse em graus`}</span>
            </span>
          </div>
          <div aria-hidden className="flex flex-col gap-0.5">
            <span>Clientes dentro do raio, por escritório</span>
            {perOffice.map((office) => (
              <span className="flex items-baseline justify-between gap-3 text-text-secondary" key={office.id}>
                <span className="truncate">{office.city}</span>
                <span className="font-display tabular-nums">{formatInt(office.inside)}</span>
              </span>
            ))}
          </div>
          {unplaced > 0 ? (
            <span aria-hidden className="text-text-secondary">
              {`${formatInt(unplaced)} ${unplaced === 1 ? 'cliente ficou sem ponto' : 'clientes ficaram sem ponto'} no mapa, por falta de lugar; a contagem acima é a do dado.`}
            </span>
          ) : null}
          <span aria-hidden>Recorte do Sudeste, do Centro-Oeste e do norte do Paraná. Posição dentro da cidade é ilustrativa.</span>
        </div>
      </div>
    </figure>
  );
}
