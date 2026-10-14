import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BRASIL_OUTLINE, data as defaultData, GEO_BOUNDS, UF_CENTROIDS, type UfCode, type UfFlow } from './data';

/**
 * Símbolos proporcionais com saldo: o tamanho é o valor absoluto do saldo de clientes (entradas menos
 * saídas) e a cor é o sinal, --positive para quem cresceu e --negative para quem encolheu. O sinal também
 * vai escrito no rótulo. Saldo zero é um anel vazado com a sigla, para a UF não desaparecer do mapa.
 */
export interface BalanceSymbolsProps {
  readonly data?: readonly UfFlow[];
  readonly height?: number;
  readonly className?: string;
}

/** Escala 1 no viewBox (5 px por grau): o texto de 11 px chega com 11 px (GEO-18). */
const DEG_PX = 5;
const MAP_W = Math.round((GEO_BOUNDS.lonMax - GEO_BOUNDS.lonMin) * DEG_PX);
const MAP_H = Math.round((GEO_BOUNDS.latMax - GEO_BOUNDS.latMin) * DEG_PX);
const PAD_LEFT = 40;
const PAD_RIGHT = 62;
const SVG_W = MAP_W + PAD_LEFT + PAD_RIGHT;
/** Colunas de margem para o rótulo que não cabe ao lado do círculo: a oeste alinhado à direita, a leste à esquerda. */
const COLUMNS = { west: PAD_LEFT + 60, east: PAD_LEFT + MAP_W + 6 } as const;
const R_MAX = 22;
/** Anel do saldo zero: maior que o círculo de saldo 1 (3,1 px) para o zero medido nunca parecer o menor saldo. */
const R_ZERO = 4;
/** 0,80 fica acima da opacidade mínima de --positive (0,70) e de --negative (0,66) nos dois temas (ACE-5). */
const FILL_OPACITY = 0.8;
const LABELED_COUNT = 5;
const LABEL_SIDE_LON = -46;
const LABEL_GAP = 4;
/** Largura estimada por caractere de 11 px, para reservar a caixa do rótulo antes de desenhar. */
const LABEL_CHAR_W = 6.6;
const LEGEND_REFERENCES = [10, 25] as const;
/** A partir deste raio cabe o glifo de mais ou de menos dentro do círculo. */
const GLYPH_MIN_R = 7;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 3 } as const;

interface Balance {
  readonly uf: UfCode;
  readonly name: string;
  readonly entries: number;
  readonly exits: number;
  readonly balance: number;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}

function project(uf: UfCode): { readonly x: number; readonly y: number } {
  const point = UF_CENTROIDS[uf];
  return { x: PAD_LEFT + (point.lon - GEO_BOUNDS.lonMin) * DEG_PX, y: (GEO_BOUNDS.latMax - point.lat) * DEG_PX };
}

/** Sinal à mão sobre o valor absoluto (NUM-3): + e − tipográfico, e o zero sem sinal. */
function signed(value: number): string {
  if (value === 0) return formatInt(0);
  return `${value > 0 ? '+' : '−'}${formatInt(Math.abs(value))}`;
}

function colorOf(balance: number): string {
  return balance > 0 ? 'var(--positive)' : 'var(--negative)';
}

/** Maior valor absoluto de saldo, ou null quando a lista é vazia. */
function maxAbs(rows: readonly { readonly balance: number }[]): number | null {
  let max: number | null = null;
  for (const row of rows) {
    const size = Math.abs(row.balance);
    if (max === null || size > max) max = size;
  }
  return max;
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
const COLUMN_SHIFTS = [0, -10, 10, -20, 20, -30, 30, -40, 40, -50, 50, -60, 60, -70, 70] as const;
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
  const x = PAD_LEFT + (lon - GEO_BOUNDS.lonMin) * DEG_PX;
  const y = (GEO_BOUNDS.latMax - lat) * DEG_PX;
  return `${String(Math.round(x * 10) / 10)},${String(Math.round(y * 10) / 10)}`;
}).join(' ');

/** Mais (cheio) ou menos (vazado) desenhado dentro do círculo: o segundo canal do sinal. */
function Glyph({ cx, cy, r, up }: { readonly cx: number; readonly cy: number; readonly r: number; readonly up: boolean }) {
  const half = Math.min(r * 0.5, 6);
  const ink = up ? 'var(--surface-raised)' : 'var(--negative)';
  return (
    <g stroke={ink} strokeLinecap="round" strokeWidth={2}>
      <line x1={cx - half} x2={cx + half} y1={cy} y2={cy} />
      {up ? <line x1={cx} x2={cx} y1={cy - half} y2={cy + half} /> : null}
    </g>
  );
}

/** O glifo só vale com a área dele livre de outro círculo; coberto por um vizinho, vira traço solto que se lê como ruído. */
function glyphClear(item: Balance, all: readonly Balance[]): boolean {
  const half = Math.min(item.r * 0.5, 6) + 1.5;
  return all.every(
    (other) => other.uf === item.uf || other.balance === 0 || Math.hypot(item.cx - other.cx, item.cy - other.cy) >= other.r + half,
  );
}

export default function BalanceSymbols({ data = defaultData, height, className }: BalanceSymbolsProps) {
  const style = height === undefined ? undefined : { height };
  const base = data.map((row) => ({ ...row, balance: row.entries - row.exits }));
  const max = maxAbs(base);

  if (max === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com entradas e saídas neste trimestre: o mapa não tem saldo para dimensionar.</span>
      </div>
    );
  }

  // Maior módulo primeiro: o SVG pinta na ordem do array, então os saldos pequenos nascem por cima.
  const symbols: Balance[] = base
    .map((row) => {
      const { x, y } = project(row.uf);
      return { ...row, cx: x, cy: y, r: row.balance === 0 ? 0 : R_MAX * Math.sqrt(Math.abs(row.balance) / max) };
    })
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  const grew = symbols.filter((item) => item.balance > 0);
  const shrank = symbols.filter((item) => item.balance < 0);
  const flat = symbols.filter((item) => item.balance === 0);
  const labeled = [...symbols.slice(0, LABELED_COUNT), ...flat.filter((item) => !symbols.slice(0, LABELED_COUNT).includes(item))];
  const spots = placeLabels(
    labeled.map((item) => ({
      id: item.uf,
      width: (item.uf.length + signed(item.balance).length) * LABEL_CHAR_W + LABEL_GAP,
      preferRight: UF_CENTROIDS[item.uf].lon > LABEL_SIDE_LON,
    })),
    symbols.map((item) => ({ id: item.uf, cx: item.cx, cy: item.cy, r: item.balance === 0 ? R_ZERO : item.r })),
    { width: SVG_W, height: MAP_H },
    COLUMNS,
  );
  const net = symbols.reduce((sum, item) => sum + item.balance, 0);
  const topGain = grew[0];
  const topLoss = [...shrank].sort((a, b) => a.balance - b.balance)[0];
  const legendValues = max > 0 ? [...LEGEND_REFERENCES.filter((value) => value < max), max] : [];
  const legendBox = Math.ceil(2 * R_MAX) + 2;

  const summary =
    `Símbolos proporcionais com o saldo de clientes de ${formatInt(data.length)} UFs no 3º trimestre de 2026, ` +
    `tamanho pelo módulo e cor pelo sinal. ${formatInt(grew.length)} cresceram, ${formatInt(shrank.length)} encolheram ` +
    `e ${formatInt(flat.length)} ficaram em zero` +
    (topGain && topLoss ? `. Maior alta em ${topGain.name}, ${signed(topGain.balance)}; maior queda em ${topLoss.name}, ${signed(topLoss.balance)}.` : '.');

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <p aria-hidden className="m-0 shrink-0 truncate text-xs leading-4 text-text-secondary">
        {`Cresceram ${formatInt(grew.length)} UFs e encolheram ${formatInt(shrank.length)}; o saldo da carteira no trimestre é de ${signed(net)} clientes.`}
      </p>
      <div className="flex min-h-0 flex-1 items-start gap-4">
        <svg aria-hidden className="shrink-0" height={MAP_H} viewBox={`0 0 ${String(SVG_W)} ${String(MAP_H)}`} width={SVG_W}>
          <polygon fill="var(--surface-sunken)" points={OUTLINE_POINTS} stroke="var(--line-subtle)" strokeLinejoin="round" strokeWidth={1} />
          {symbols.map((item) => (
            <g key={item.uf}>
              <title>{`${item.name}: saldo de ${signed(item.balance)} clientes (${formatInt(item.entries)} entradas e ${formatInt(item.exits)} saídas)`}</title>
              {item.balance === 0 ? (
                <circle cx={item.cx} cy={item.cy} fill="none" r={R_ZERO} stroke="var(--text-secondary)" strokeWidth={1.5} />
              ) : (
                <>
                  <circle
                    cx={item.cx}
                    cy={item.cy}
                    fill={item.balance > 0 ? colorOf(item.balance) : 'none'}
                    fillOpacity={item.balance > 0 ? FILL_OPACITY : undefined}
                    r={item.r}
                    stroke={colorOf(item.balance)}
                    strokeWidth={item.balance > 0 ? 1.25 : 2}
                  />
                  {item.r >= GLYPH_MIN_R && glyphClear(item, symbols) ? <Glyph cx={item.cx} cy={item.cy} r={item.r} up={item.balance > 0} /> : null}
                </>
              )}
            </g>
          ))}
          {labeled.map((item) => {
            const spot = spots.get(item.uf);
            if (spot === undefined) return null;
            return (
              <g key={item.uf}>
                {spot.leader === null ? null : (
                  <line stroke="var(--text-muted)" strokeWidth={1} x1={spot.leader.x1} x2={spot.leader.x2} y1={spot.leader.y1} y2={spot.leader.y2} />
                )}
                <text fill="var(--text-primary)" fontSize={11} style={HALO} textAnchor={spot.anchor} x={spot.x} y={spot.y}>
                  <tspan fontWeight={700}>{item.uf}</tspan>
                  <tspan className="font-display tabular-nums" dx={4}>{signed(item.balance)}</tspan>
                </text>
              </g>
            );
          })}
        </svg>

        <div aria-hidden className="flex min-w-0 flex-1 flex-col gap-3 text-[0.6875rem] leading-4 text-text-muted">
          <div className="flex flex-col gap-1">
            <span>Saldo em módulo, pela área</span>
            <div className="flex items-end gap-4">
              {legendValues.map((value) => {
                const r = R_MAX * Math.sqrt(value / max);
                return (
                  <span className="flex items-end gap-1.5" key={value}>
                    <svg height={legendBox} width={Math.ceil(2 * r) + 2}>
                      <circle cx={r + 1} cy={legendBox - r - 1} fill="none" r={r} stroke="var(--text-muted)" strokeWidth={1.25} />
                    </svg>
                    <span className="font-display tabular-nums text-text-secondary">{formatInt(value)}</span>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5">
              <svg className="shrink-0" height={12} width={12}>
                <circle cx={6} cy={6} fill="var(--positive)" fillOpacity={FILL_OPACITY} r={5.5} stroke="var(--positive)" strokeWidth={1.25} />
                <path d="M3.5 6h5M6 3.5v5" stroke="var(--surface-raised)" strokeLinecap="round" strokeWidth={1.5} />
              </svg>
              <span className="text-text-secondary">Cresceu: cheio, com +</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="shrink-0" height={12} width={12}>
                <circle cx={6} cy={6} fill="none" r={5} stroke="var(--negative)" strokeWidth={2} />
                <path d="M3.5 6h5" stroke="var(--negative)" strokeLinecap="round" strokeWidth={1.5} />
              </svg>
              <span className="text-text-secondary">Encolheu: anel vazado, com −</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="shrink-0" height={12} width={12}>
                <circle cx={6} cy={6} fill="none" r={R_ZERO} stroke="var(--text-secondary)" strokeWidth={1.5} />
              </svg>
              <span className="text-text-secondary">Saldo zero, anel vazado</span>
            </span>
          </div>
          <span>Para comparar saldos próximos, setas para cima e para baixo por UF leem melhor que a área.</span>
        </div>
      </div>
    </figure>
  );
}
