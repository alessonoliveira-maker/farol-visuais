import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  BRASIL_OUTLINE,
  data as defaultData,
  GEO_BOUNDS,
  REGION_LABEL,
  REGION_COLOR,
  UF_CENTROIDS,
  UF_REGION,
  type Region,
  type UfCode,
  type UfRevenueYears,
} from './data';

/**
 * Cartograma de Dorling em dois painéis (2025 e 2026): um círculo por UF com área proporcional à receita,
 * saindo do centroide e se afastando dos vizinhos por relaxação determinística. A escala de raio é a mesma
 * nos dois painéis, então o tamanho é comparável de um ano para o outro. A cor é da macrorregião e o
 * contorno marca as UFs do perímetro. O contorno cinza do país é a referência de posição real.
 */
export interface DorlingPanelsProps {
  readonly data?: readonly UfRevenueYears[];
  readonly height?: number;
  readonly className?: string;
}

type YearKey = 'y2025' | 'y2026';

const YEARS: readonly { readonly key: YearKey; readonly label: string }[] = [
  { key: 'y2025', label: '2025' },
  { key: 'y2026', label: '2026' },
];

/** Escala 1 no viewBox (5 px por grau): o texto de 11 px chega com 11 px (GEO-18). */
const DEG_PX = 5;
const MAP_W = Math.round((GEO_BOUNDS.lonMax - GEO_BOUNDS.lonMin) * DEG_PX);
const PANEL_W = 360;
/** Altura com folga no pé: o sul se espalha para baixo quando SP, SC e PR disputam o mesmo canto. */
const PANEL_H = Math.round((GEO_BOUNDS.latMax - GEO_BOUNDS.latMin) * DEG_PX) + 40;
const MAP_OFFSET_X = Math.round((PANEL_W - MAP_W) / 2);
const MAP_OFFSET_Y = 4;
const LEGEND_W = 150;
/** Colunas de margem do painel para a sigla que não cabe ao lado do círculo, com linha de chamada. */
const LABEL_COLUMNS = { west: 22, east: PANEL_W - 24 } as const;
/** Raio do maior círculo dos dois anos, em px. */
const R_MAX = 32;
/** Dorling: 120 passos; em cada um o círculo volta 2% do caminho à origem e depois os pares sobrepostos se afastam. */
const ITERATIONS = 300;
const RETURN_FACTOR = 0.02;
const CIRCLE_GAP = 12;
const LABEL_GAP = 3;
/** Largura estimada por caractere de 11 px, para reservar a caixa do rótulo antes de desenhar. */
const LABEL_CHAR_W = 8;
/** Dentro deste raio cabe a sigla de 11 px; abaixo dele a sigla sobe para cima do círculo. */
const INSIDE_LABEL_MIN_R = 10;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 3 } as const;
/** Referências redondas da legenda de tamanho; o último degrau é o máximo observado (ROT-5b). */
const LEGEND_REFERENCES = [500_000, 2_000_000] as const;
const REGIONS: readonly Region[] = ['norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul'];

interface Placed {
  readonly uf: UfCode;
  readonly r: number;
  readonly x: number;
  readonly y: number;
}

function originOf(uf: UfCode): { readonly x: number; readonly y: number } {
  const point = UF_CENTROIDS[uf];
  return {
    x: MAP_OFFSET_X + (point.lon - GEO_BOUNDS.lonMin) * DEG_PX,
    y: MAP_OFFSET_Y + (GEO_BOUNDS.latMax - point.lat) * DEG_PX,
  };
}

/** O chamador garante `max` positivo. */
function radiusOf(value: number, max: number): number {
  return R_MAX * Math.sqrt(value / max);
}

/**
 * Relaxação de Dorling. Parte sempre do centroide, sem sorteio, então a mesma entrada dá a mesma saída.
 * Cada par sobreposto se afasta em proporção inversa à área (o grande quase não se move), e o último
 * passo de cada rodada é o afastamento, para o desenho final não terminar com sobreposição de volta.
 */
function relax(items: readonly { readonly uf: UfCode; readonly r: number }[]): readonly Placed[] {
  const origins = items.map((item) => originOf(item.uf));
  const xs = origins.map((point) => point.x);
  const ys = origins.map((point) => point.y);
  for (let step = 0; step < ITERATIONS; step += 1) {
    for (let i = 0; i < items.length; i += 1) {
      xs[i] = (xs[i] ?? 0) + ((origins[i]?.x ?? 0) - (xs[i] ?? 0)) * RETURN_FACTOR;
      ys[i] = (ys[i] ?? 0) + ((origins[i]?.y ?? 0) - (ys[i] ?? 0)) * RETURN_FACTOR;
    }
    for (let i = 0; i < items.length; i += 1) {
      for (let j = i + 1; j < items.length; j += 1) {
        const ri = items[i]?.r ?? 0;
        const rj = items[j]?.r ?? 0;
        let dx = (xs[j] ?? 0) - (xs[i] ?? 0);
        let dy = (ys[j] ?? 0) - (ys[i] ?? 0);
        let dist = Math.hypot(dx, dy);
        const wanted = ri + rj + CIRCLE_GAP;
        if (dist >= wanted) continue;
        if (dist < 0.001) {
          // Centros coincidentes: direção fixa pelo índice, nunca aleatória.
          dx = Math.cos(i + j);
          dy = Math.sin(i + j);
          dist = 1;
        }
        const overlap = wanted - dist;
        const areaI = ri * ri;
        const areaJ = rj * rj;
        const shareI = areaJ / (areaI + areaJ);
        xs[i] = (xs[i] ?? 0) - (dx / dist) * overlap * shareI;
        ys[i] = (ys[i] ?? 0) - (dy / dist) * overlap * shareI;
        xs[j] = (xs[j] ?? 0) + (dx / dist) * overlap * (1 - shareI);
        ys[j] = (ys[j] ?? 0) + (dy / dist) * overlap * (1 - shareI);
      }
    }
    // O limite do painel entra DENTRO do laço: um grampo só no fim desfaria a relaxação e empilharia círculos (SC sobre SP).
    for (let i = 0; i < items.length; i += 1) {
      const r = items[i]?.r ?? 0;
      xs[i] = Math.min(PANEL_W - r - 1, Math.max(r + 1, xs[i] ?? 0));
      ys[i] = Math.min(PANEL_H - r - 1, Math.max(r + 1, ys[i] ?? 0));
    }
  }
  return items.map((item, index) => ({ uf: item.uf, r: item.r, x: xs[index] ?? 0, y: ys[index] ?? 0 }));
}

/** Soma, ou null quando a lista é vazia. */
function totalOf(rows: readonly UfRevenueYears[], key: YearKey): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((sum, row) => sum + row[key], 0);
}

interface LabelCircle {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}

interface LabelRequest {
  readonly id: string;
  readonly width: number;
  readonly preferRight: boolean;
}

interface LabelSpot {
  readonly x: number;
  readonly y: number;
  readonly anchor: 'start' | 'middle' | 'end';
  /** Linha de chamada do círculo até o rótulo, só quando o rótulo foi para a coluna da margem. */
  readonly leader: { readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number } | null;
  readonly free: boolean;
}

interface LabelBox {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

/** Deslocamentos verticais tentados ao lado do círculo, do menor ao maior. */
const LABEL_SHIFTS = [0, -8, 8, -14, 14] as const;
/** Deslocamentos tentados na coluna da margem, onde a linha de chamada faz o vínculo e o rótulo pode andar mais. */
const COLUMN_SHIFTS = [0, -10, 10, -20, 20, -30, 30, -40, 40, -50, 50, -60, 60, -70, 70, -85, 85, -100, 100, -120, 120, -140, 140] as const;
/** Tinta de 11 px: 9 px acima da linha de base e 3 abaixo, mais 2 px do halo. */
const LABEL_ASCENT = 11;
const LABEL_DESCENT = 5;

function boxHitsCircle(box: LabelBox, circle: LabelCircle): boolean {
  const nearX = Math.max(box.x0, Math.min(circle.cx, box.x1));
  const nearY = Math.max(box.y0, Math.min(circle.cy, box.y1));
  return Math.hypot(circle.cx - nearX, circle.cy - nearY) < circle.r + 1;
}

/** Dois rótulos contam como colados a menos de 4 px um do outro (piso de COLISAO-TEXTO), não só quando se tocam. */
const LABEL_MARGIN = 4;
/** Folga mínima entre a linha de chamada e o contorno de qualquer círculo que não é o dono. */
const LEADER_CLEARANCE = 3;
/** Desvios do ponto de saída da linha de chamada em relação à direção do rótulo, em radianos, do menor ao maior. */
const START_OFFSETS = [0, 0.26, -0.26, 0.52, -0.52, 0.79, -0.79, 1.05, -1.05, 1.57, -1.57, 2.09, -2.09] as const;

type LabelLeader = { readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number };

/** O segmento passa dentro da caixa (amostrado de 1 em 1 px, com 2 px de folga). */
function segmentHitsBox(segment: LabelLeader, box: LabelBox): boolean {
  const steps = Math.max(1, Math.ceil(Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1)));
  for (let step = 0; step <= steps; step += 1) {
    const x = segment.x1 + ((segment.x2 - segment.x1) * step) / steps;
    const y = segment.y1 + ((segment.y2 - segment.y1) * step) / steps;
    if (x > box.x0 - 2 && x < box.x1 + 2 && y > box.y0 - 2 && y < box.y1 + 2) return true;
  }
  return false;
}

function boxesHit(a: LabelBox, b: LabelBox): boolean {
  return a.x0 < b.x1 + LABEL_MARGIN && b.x0 < a.x1 + LABEL_MARGIN && a.y0 < b.y1 + LABEL_MARGIN && b.y0 < a.y1 + LABEL_MARGIN;
}

/** O segmento passa a menos de `r + 1` do centro do círculo. */
function segmentHitsCircle(x1: number, y1: number, x2: number, y2: number, circle: LabelCircle, margin = 1): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((circle.cx - x1) * dx + (circle.cy - y1) * dy) / lengthSquared));
  return Math.hypot(circle.cx - (x1 + t * dx), circle.cy - (y1 + t * dy)) < circle.r + margin;
}

/**
 * Posiciona cada rótulo no primeiro lugar livre, na ordem pedida. Primeiro ao lado do círculo (lado
 * preferido, lado oposto, em cima, embaixo); se o entorno está cheio e há colunas de margem, o rótulo vai
 * para a coluna, com uma linha de chamada que não cruza outro círculo. Livre quer dizer sem tocar círculo
 * nem outro rótulo e dentro do desenho. Determinístico: a mesma entrada dá o mesmo lugar. Sem lugar livre,
 * o rótulo cai no primeiro candidato e `free` fica falso.
 */
function placeLabels(
  requests: readonly LabelRequest[],
  circles: readonly LabelCircle[],
  bounds: { readonly width: number; readonly height: number },
  columns?: { readonly west: number; readonly east: number },
): ReadonlyMap<string, LabelSpot> {
  const placed: LabelBox[] = [];
  const placedLeaders: LabelLeader[] = [];
  const result = new Map<string, LabelSpot>();
  for (const request of requests) {
    const own = circles.find((circle) => circle.id === request.id);
    if (own === undefined) continue;
    const others = circles.filter((circle) => circle.id !== request.id);
    const sides: readonly (1 | -1)[] = request.preferRight ? [1, -1] : [-1, 1];
    const candidates: LabelSpot[] = [];
    for (const side of sides) {
      for (const shift of LABEL_SHIFTS) {
        candidates.push({
          anchor: side === 1 ? 'start' : 'end',
          free: true,
          leader: null,
          x: own.cx + side * (own.r + LABEL_GAP),
          y: own.cy + 4 + shift,
        });
      }
    }
    candidates.push({ anchor: 'middle', free: true, leader: null, x: own.cx, y: own.cy - own.r - LABEL_GAP });
    candidates.push({ anchor: 'middle', free: true, leader: null, x: own.cx, y: own.cy + own.r + LABEL_GAP + 9 });
    if (columns !== undefined) {
      for (const side of sides) {
        const columnX = side === 1 ? columns.east : columns.west;
        const targetX = side === 1 ? columnX - 3 : columnX + 3;
        for (const shift of COLUMN_SHIFTS) {
          const y = own.cy + 4 + shift;
          const direct = Math.atan2(y - 4 - own.cy, targetX - own.cx);
          // A linha sai do ponto do contorno mais próximo da direção do rótulo que esteja livre de vizinho; círculo coberto por outro ancora em parte livre.
          for (const offset of START_OFFSETS) {
            const angle = direct + offset;
            candidates.push({
              anchor: side === 1 ? 'start' : 'end',
              free: true,
              leader: {
                x1: own.cx + Math.cos(angle) * own.r,
                y1: own.cy + Math.sin(angle) * own.r,
                x2: targetX,
                y2: y - 4,
              },
              x: columnX,
              y,
            });
          }
        }
      }
    }
    let chosen: LabelSpot | undefined;
    let chosenBox: LabelBox | undefined;
    for (const spot of candidates) {
      const x0 = spot.anchor === 'start' ? spot.x : spot.anchor === 'end' ? spot.x - request.width : spot.x - request.width / 2;
      const box: LabelBox = { x0, x1: x0 + request.width, y0: spot.y - LABEL_ASCENT, y1: spot.y + LABEL_DESCENT };
      const inside = box.x0 >= 0 && box.x1 <= bounds.width && box.y0 >= 0 && box.y1 <= bounds.height;
      const leader = spot.leader;
      if (
        inside &&
        !circles.some((circle) => boxHitsCircle(box, circle)) &&
        !placed.some((other) => boxesHit(box, other)) &&
        !placedLeaders.some((line) => segmentHitsBox(line, box)) &&
        (leader === null || !placed.some((other) => segmentHitsBox(leader, other))) &&
        (leader === null ||
          // Linha de chamada: nem a ponta de saída nem o trajeto podem tocar outro círculo, nem chegar a menos de 3 px do contorno dele.
          !others.some((circle) => segmentHitsCircle(leader.x1, leader.y1, leader.x2, leader.y2, circle, LEADER_CLEARANCE)))
      ) {
        chosen = spot;
        chosenBox = box;
        break;
      }
    }
    const first = candidates[0];
    if (chosen !== undefined && chosenBox !== undefined) {
      placed.push(chosenBox);
      if (chosen.leader !== null) placedLeaders.push(chosen.leader);
      result.set(request.id, chosen);
    } else if (first !== undefined) {
      result.set(request.id, { ...first, free: false });
    }
  }
  return result;
}

const OUTLINE_POINTS = BRASIL_OUTLINE.map(([lon, lat]) => {
  const x = MAP_OFFSET_X + (lon - GEO_BOUNDS.lonMin) * DEG_PX;
  const y = MAP_OFFSET_Y + (GEO_BOUNDS.latMax - lat) * DEG_PX;
  return `${String(Math.round(x * 10) / 10)},${String(Math.round(y * 10) / 10)}`;
}).join(' ');

export default function DorlingPanels({ data = defaultData, height, className }: DorlingPanelsProps) {
  const style = height === undefined ? undefined : { height };
  const max = useMemo(() => Math.max(0, ...data.flatMap((row) => [row.y2025, row.y2026])), [data]);
  const panels = useMemo(
    () =>
      YEARS.map(({ key, label }) => {
        const placed = relax(data.map((row) => ({ uf: row.uf, r: max > 0 ? radiusOf(row[key], max) : 0 })));
        // Só o círculo pequeno demais para a sigla ganha rótulo fora dele, no primeiro lugar livre; sem lugar, fica na dica.
        const spots = placeLabels(
          [...placed]
            .filter((item) => item.r < INSIDE_LABEL_MIN_R)
            .sort((a, b) => b.r - a.r)
            .map((item) => ({ id: item.uf, width: item.uf.length * LABEL_CHAR_W, preferRight: true })),
          placed.map((item) => ({ id: item.uf, cx: item.x, cy: item.y, r: item.r })),
          { width: PANEL_W, height: PANEL_H },
          LABEL_COLUMNS,
        );
        return { key, label, placed, spots, total: totalOf(data, key) };
      }),
    [data, max],
  );

  if (data.length === 0 || max <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com receita reconhecida neste recorte: o cartograma não tem círculo para afastar.</span>
      </div>
    );
  }

  const byUf = new Map(data.map((row) => [row.uf, row]));
  let leader = data[0];
  for (const row of data) {
    if (leader === undefined || row.y2026 > leader.y2026) leader = row;
  }
  const first = panels[0]?.total ?? 0;
  const last = panels[1]?.total ?? 0;
  const legendValues = [...LEGEND_REFERENCES.filter((value) => value < max), max];
  const legendRadii = legendValues.map((value) => radiusOf(value, max));
  /** 8 px a mais no alto para o rótulo do degrau máximo, que nasce na altura do topo do círculo, não ser cortado. */
  const legendBox = Math.ceil(2 * R_MAX) + 10;

  const summary =
    `Cartograma de Dorling com a receita reconhecida de ${formatInt(data.length)} UFs em 2025 e 2026, na mesma escala de área. ` +
    `O total ${last >= first ? 'subiu' : 'caiu'} de ${formatCurrencyCompact(first)} para ${formatCurrencyCompact(last)}; ` +
    `${leader?.name ?? ''} lidera em 2026, com ${formatCurrencyCompact(leader?.y2026 ?? 0)}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <p aria-hidden className="m-0 shrink-0 truncate text-xs leading-4 text-text-secondary">
        Posição aproximada: os círculos se afastam para não se sobrepor. O contorno cinza mostra o lugar real das UFs.
      </p>
      <div className="flex min-h-0 flex-1 items-start gap-3">
        {panels.map((panel) => (
          <div aria-hidden className="flex shrink-0 flex-col gap-1" key={panel.key}>
            <p className="m-0 flex items-baseline justify-between text-xs leading-4 text-text-secondary">
              <span className="font-medium">{panel.label}</span>
              <span className="font-display tabular-nums text-text-muted">{`total ${formatCurrencyCompact(panel.total ?? 0)}${panel.key === 'y2026' && first > 0 ? `, ${last >= first ? '+' : '−'}${formatPercent(Math.abs(last - first) / first, 0)} contra 2025` : ''}`}</span>
            </p>
            <svg height={PANEL_H} viewBox={`0 0 ${String(PANEL_W)} ${String(PANEL_H)}`} width={PANEL_W}>
              <polygon fill="var(--surface-sunken)" points={OUTLINE_POINTS} stroke="var(--line-subtle)" strokeLinejoin="round" strokeWidth={1} />
              {[...panel.placed]
                .sort((a, b) => b.r - a.r)
                .map((item) => {
                  const row = byUf.get(item.uf);
                  if (row === undefined) return null;
                  const inside = item.r >= INSIDE_LABEL_MIN_R;
                  const spot = panel.spots.get(item.uf);
                  return (
                    <g key={item.uf}>
                      <title>{`${row.name}: ${formatCurrencyCompact(row[panel.key])} em ${panel.label}${row.inScope ? '' : ', fora do perímetro'}`}</title>
                      <circle
                        cx={item.x}
                        cy={item.y}
                        fill={REGION_COLOR[UF_REGION[item.uf]]}
                        r={item.r}
                        stroke={row.inScope ? 'var(--text-primary)' : 'var(--surface-raised)'}
                        strokeWidth={row.inScope ? 1.5 : 1}
                      />
                      {inside ? (
                        <text fill="var(--accent-cyan-contrast)" fontSize={11} fontWeight={600} textAnchor="middle" x={item.x} y={item.y + 4}>
                          {item.uf}
                        </text>
                      ) : null}
                      {spot?.free && spot.leader !== null ? (
                        <line stroke="var(--text-muted)" strokeWidth={1} x1={spot.leader.x1} x2={spot.leader.x2} y1={spot.leader.y1} y2={spot.leader.y2} />
                      ) : null}
                      {spot?.free ? (
                        <text fill="var(--text-secondary)" fontSize={11} fontWeight={600} style={HALO} textAnchor={spot.anchor} x={spot.x} y={spot.y}>
                          {item.uf}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
            </svg>
          </div>
        ))}

        <div aria-hidden className="flex shrink-0 flex-col gap-2 text-[0.6875rem] leading-4 text-text-muted" style={{ width: LEGEND_W }}>
          <div className="flex flex-col gap-1">
            <span>Receita, pela área</span>
            <svg height={legendBox} width={LEGEND_W}>
              {legendValues.map((value, index) => {
                const r = legendRadii[index] ?? 0;
                const top = legendBox - 1 - 2 * r;
                return (
                  <g key={value}>
                    <circle cx={R_MAX + 1} cy={legendBox - 1 - r} fill="none" r={r} stroke="var(--text-muted)" strokeWidth={1} />
                    <line stroke="var(--text-muted)" strokeWidth={1} x1={R_MAX + 1} x2={2 * R_MAX + 8} y1={top} y2={top} />
                    <text className="font-display tabular-nums" fill="var(--text-secondary)" fontSize={11} x={2 * R_MAX + 12} y={top + 4}>
                      {formatCurrencyCompact(value)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            {REGIONS.map((region) => (
              <span className="flex items-center gap-1.5" key={region}>
                <svg className="shrink-0" height={10} width={10}>
                  <circle cx={5} cy={5} fill={REGION_COLOR[region]} r={5} />
                </svg>
                <span className="text-text-secondary">{REGION_LABEL[region]}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5">
              <svg className="shrink-0" height={12} width={12}>
                <circle cx={6} cy={6} fill="var(--text-muted)" r={4.5} stroke="var(--text-primary)" strokeWidth={1.5} />
              </svg>
              <span className="text-text-secondary">Com aro: no perímetro</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="shrink-0" height={12} width={12}>
                <circle cx={6} cy={6} fill="var(--text-muted)" r={4.5} stroke="var(--surface-raised)" strokeWidth={1} />
              </svg>
              <span className="text-text-secondary">Sem aro: fora dele</span>
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
