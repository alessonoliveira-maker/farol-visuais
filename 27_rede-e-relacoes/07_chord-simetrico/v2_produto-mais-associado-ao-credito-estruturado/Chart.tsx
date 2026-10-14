import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, groups, highlightId as defaultHighlightId, type ProductGroup, type ProductPair } from './data';

/**
 * Chord simétrico com um produto em foco: as fitas dele vão em var(--chart-1) e o resto da roda
 * recua para o neutro. Geometria como a da v1 (cada par de produtos vira UMA fita com as duas pontas da mesma
 * largura, porque a relação não tem sentido (A com B é B com A). O ângulo do grupo é proporcional
 * ao total dos seus pares, descontado o vão entre grupos, e dentro do arco os parceiros ficam
 * ordenados pelo peso, do maior para o menor, para reduzir cruzamentos. Cor da fita: a do grupo
 * de índice menor no par (a mesma convenção do chord direcional da família 11).
 * A lista ao lado escreve os pares do produto em foco, do maior ao menor, com o percentual sobre o total dele.
 */
export interface ProductChordProps {
  readonly data?: readonly ProductPair[];
  /** Produto em foco; id que não existe em `groups` devolve o bloco de vazio. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const VIEW = 200;
const CENTER = VIEW / 2;
const TWO_PI = Math.PI * 2;
/** Vão angular entre grupos vizinhos, em radianos (cerca de 2,9 graus). */
const PAD_ANGLE = 0.05;
/** Giro da roda em radianos: tira o grupo pequeno do topo, onde o rótulo bateria no vizinho. */
const START_ANGLE = 0.6;
const R_OUTER = 56;
const ARC_THICKNESS = 9;
const R_INNER = R_OUTER - ARC_THICKNESS;
/** Âncora do rótulo, logo fora do arco (ROT-2: nome fora da marca, sem cortar). */
const R_LABEL = R_OUTER + 7;
const SURFACE_STROKE = 'var(--surface-raised)';
const STROKE_WIDTH = 1;
/**
 * Piso da fita: largura nominal da ponta, em unidades do viewBox. Par abaixo dele não leva fita
 * (mantém o ângulo no arco) e a linha do painel diz "sem fita" (COR-5, GEO-16).
 */
const MIN_TIP = 1.6;
/** Neutro do que está fora do foco: mede 5,2:1 contra o cartão; var(--line-strong) some como marca. */
const NEUTRAL = 'var(--text-muted)';
const FOCUS = 'var(--chart-1)';

interface Arc {
  readonly start: number;
  readonly end: number;
}

/** Ângulo 0 no topo, crescendo no sentido horário. */
function polar(radius: number, angle: number): { x: number; y: number } {
  return { x: CENTER + radius * Math.sin(angle), y: CENTER - radius * Math.cos(angle) };
}

function fmt(value: number): string {
  return value.toFixed(2);
}

/** A flag de arco grande do SVG liga quando o ângulo do trecho passa de π. */
function largeArcFlag(arc: Arc): 0 | 1 {
  return arc.end - arc.start > Math.PI ? 1 : 0;
}

/** Peso do par, em qualquer ordem dos dois ids. */
function pairValue(pairs: readonly ProductPair[], x: string, y: string): number {
  return pairs
    .filter((p) => (p.a === x && p.b === y) || (p.a === y && p.b === x))
    .reduce((sum, p) => sum + p.count, 0);
}

interface Layout {
  readonly spans: ReadonlyMap<string, Arc>;
  readonly subArcs: ReadonlyMap<string, ReadonlyMap<string, Arc>>;
  readonly totals: ReadonlyMap<string, number>;
  readonly pairTotal: number;
  readonly anglePerUnit: number;
}

function computeLayout(list: readonly ProductGroup[], pairs: readonly ProductPair[]): Layout | null {
  const totals = new Map<string, number>(list.map((g) => [g.id, 0]));
  for (const p of pairs) {
    totals.set(p.a, (totals.get(p.a) ?? 0) + p.count);
    totals.set(p.b, (totals.get(p.b) ?? 0) + p.count);
  }
  const sum = [...totals.values()].reduce((acc, value) => acc + value, 0);
  if (sum <= 0) return null;

  const anglePerUnit = (TWO_PI - list.length * PAD_ANGLE) / sum;
  const spans = new Map<string, Arc>();
  let cursor = START_ANGLE;
  for (const g of list) {
    const span = (totals.get(g.id) ?? 0) * anglePerUnit;
    spans.set(g.id, { start: cursor, end: cursor + span });
    cursor += span + PAD_ANGLE;
  }

  // Parceiros do maior para o menor peso; o sort é estável, então o empate segue a ordem de `groups`.
  const subArcs = new Map<string, Map<string, Arc>>();
  for (const g of list) {
    const own = spans.get(g.id);
    if (!own) continue;
    const partners = list
      .filter((other) => other.id !== g.id)
      .map((other) => ({ id: other.id, count: pairValue(pairs, g.id, other.id) }))
      .filter((partner) => partner.count > 0)
      .sort((x, y) => y.count - x.count);
    const inner = new Map<string, Arc>();
    let sub = own.start;
    for (const partner of partners) {
      const width = partner.count * anglePerUnit;
      inner.set(partner.id, { start: sub, end: sub + width });
      sub += width;
    }
    subArcs.set(g.id, inner);
  }
  return { spans, subArcs, totals, pairTotal: sum / 2, anglePerUnit };
}

/** Arco na borda de a, curva quadrática pelo centro até a borda de b, arco em b, e volta ao início. */
function ribbonPath(a: Arc, b: Arc): string {
  const p1 = polar(R_INNER, a.start);
  const p2 = polar(R_INNER, a.end);
  const p3 = polar(R_INNER, b.start);
  const p4 = polar(R_INNER, b.end);
  return [
    `M ${fmt(p1.x)},${fmt(p1.y)}`,
    `A ${String(R_INNER)},${String(R_INNER)} 0 ${String(largeArcFlag(a))} 1 ${fmt(p2.x)},${fmt(p2.y)}`,
    `Q ${String(CENTER)},${String(CENTER)} ${fmt(p3.x)},${fmt(p3.y)}`,
    `A ${String(R_INNER)},${String(R_INNER)} 0 ${String(largeArcFlag(b))} 1 ${fmt(p4.x)},${fmt(p4.y)}`,
    `Q ${String(CENTER)},${String(CENTER)} ${fmt(p1.x)},${fmt(p1.y)}`,
    'Z',
  ].join(' ');
}

/** Arco externo (rosca) do grupo, entre R_INNER e R_OUTER. */
function groupArcPath(span: Arc): string {
  const o1 = polar(R_OUTER, span.start);
  const o2 = polar(R_OUTER, span.end);
  const i1 = polar(R_INNER, span.start);
  const i2 = polar(R_INNER, span.end);
  const large = largeArcFlag(span);
  return [
    `M ${fmt(o1.x)},${fmt(o1.y)}`,
    `A ${String(R_OUTER)},${String(R_OUTER)} 0 ${String(large)} 1 ${fmt(o2.x)},${fmt(o2.y)}`,
    `L ${fmt(i2.x)},${fmt(i2.y)}`,
    `A ${String(R_INNER)},${String(R_INNER)} 0 ${String(large)} 0 ${fmt(i1.x)},${fmt(i1.y)}`,
    'Z',
  ].join(' ');
}

/** Três posições por eixo, como um relógio: o rótulo nunca fica sobre o arco. */
function labelOffset(dx: number, dy: number): { x: string; y: string; align: string } {
  const y = dy > 2 ? '0%' : dy < -2 ? '-100%' : '-50%';
  if (dx > 2) return { x: '0%', y, align: 'items-start text-left' };
  if (dx < -2) return { x: '-100%', y, align: 'items-end text-right' };
  return { x: '-50%', y: dy < 0 ? '-100%' : '0%', align: 'items-center text-center' };
}

/** Partilha em inteiros que soma 100, pelo maior resto (NUM-2). */
function largestRemainder(values: readonly number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const shares = raw.map((value) => Math.floor(value));
  let missing = 100 - shares.reduce((sum, value) => sum + value, 0);
  const bySurplus = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of bySurplus) {
    if (missing <= 0) break;
    shares[index] = (shares[index] ?? 0) + 1;
    missing -= 1;
  }
  return shares;
}

interface RibbonDrawn {
  readonly id: string;
  readonly d: string;
  readonly color: string;
}

export default function ProductChord({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: ProductChordProps) {
  const layout = computeLayout(groups, data);
  const focus = groups.find((g) => g.id === highlightId);

  if (!layout || !focus) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente com dois produtos neste recorte: não há par para desenhar.</span>
      </div>
    );
  }

  const { spans, subArcs, totals, anglePerUnit } = layout;
  const focusTotal = totals.get(focus.id) ?? 0;

  // Pares do produto em foco, do maior para o menor; o primeiro é o mais associado.
  const partners = groups
    .filter((g) => g.id !== focus.id)
    .map((g) => ({ group: g, count: pairValue(data, focus.id, g.id) }))
    .filter((row) => row.count > 0)
    .sort((x, y) => y.count - x.count);
  const best = partners[0];
  const percents = largestRemainder(partners.map((row) => row.count), focusTotal);
  const noRibbon = new Set(partners.filter((row) => anglePerUnit * R_INNER * row.count < MIN_TIP).map((row) => row.group.id));

  // Fitas fora do foco primeiro e as do foco por último, para o destaque ficar por cima.
  const ribbons: RibbonDrawn[] = [];
  for (const pass of [false, true]) {
    for (let i = 0; i < groups.length; i += 1) {
      const a = groups[i];
      if (!a) continue;
      for (let j = i + 1; j < groups.length; j += 1) {
        const b = groups[j];
        if (!b) continue;
        if ((a.id === focus.id || b.id === focus.id) !== pass) continue;
        const arcA = subArcs.get(a.id)?.get(b.id);
        const arcB = subArcs.get(b.id)?.get(a.id);
        if (!arcA || !arcB) continue;
        if (anglePerUnit * R_INNER * pairValue(data, a.id, b.id) < MIN_TIP) continue;
        ribbons.push({ id: `${a.id}__${b.id}`, d: ribbonPath(arcA, arcB), color: pass ? FOCUS : NEUTRAL });
      }
    }
  }

  const summary = best
    ? `Diagrama de corda simétrico com ${String(groups.length)} produtos, em foco ${focus.plain}, com ${formatInt(focusTotal)} clientes em pares. O mais associado é ${best.group.plain}, com ${formatInt(best.count)} clientes, ${String(percents[0] ?? 0)}% do total do produto.`
    : `Diagrama de corda simétrico com ${String(groups.length)} produtos, em foco ${focus.plain}, sem nenhum cliente que tenha outro produto junto.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 items-center gap-4', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <div className="relative flex h-full min-w-0 flex-1 items-center justify-center pl-6">
        <div className="relative aspect-square h-full w-auto max-w-full">
          <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`}>
            {ribbons.map((ribbon) => (
              <path d={ribbon.d} fill={ribbon.color} key={ribbon.id} stroke={SURFACE_STROKE} strokeWidth={STROKE_WIDTH} style={{ paintOrder: 'stroke' }} />
            ))}
            {groups.map((group) => {
              const span = spans.get(group.id);
              return span ? (
                <path
                  d={groupArcPath(span)}
                  fill={group.id === focus.id ? FOCUS : NEUTRAL}
                  key={group.id}
                  stroke={SURFACE_STROKE}
                  strokeWidth={STROKE_WIDTH}
                />
              ) : null;
            })}
          </svg>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {groups.map((group) => {
              const span = spans.get(group.id);
              if (!span) return null;
              const point = polar(R_LABEL, (span.start + span.end) / 2);
              const offset = labelOffset(point.x - CENTER, point.y - CENTER);
              const isFocus = group.id === focus.id;
              const isBest = group.id === best?.group.id;
              return (
                <span
                  className={cn('absolute flex w-max max-w-[5.5rem] flex-col leading-tight', offset.align)}
                  key={group.id}
                  style={{
                    left: `${String((point.x / VIEW) * 100)}%`,
                    top: `${String((point.y / VIEW) * 100)}%`,
                    transform: `translate(${offset.x}, ${offset.y})`,
                  }}
                >
                  <span className={cn('text-xs', isFocus || isBest ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                    {group.label}
                  </span>
                  {isBest ? (
                    <>
                      <span className="kpi-number text-[0.6875rem] text-text-secondary">{formatInt(best.count)} clientes</span>
                      <span className="text-[0.6875rem] text-text-muted">o mais associado</span>
                    </>
                  ) : null}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div aria-hidden className="flex w-[12.5rem] shrink-0 flex-col">
        <p className="mb-2 text-xs font-semibold text-text-primary">Pares de {focus.plain}</p>
        <ul className="flex flex-col gap-1">
          {partners.map((row, index) => (
            <li className="flex items-baseline justify-between gap-2 text-xs" key={row.group.id}>
              <span className={cn('flex min-w-0 flex-col', index === 0 ? 'font-semibold text-text-primary' : 'text-text-secondary')}>
                {row.group.label}
                {noRibbon.has(row.group.id) ? <span className="text-[0.6875rem] font-normal text-text-muted">sem fita, fina demais</span> : null}
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className={cn('kpi-number w-8 text-right', index === 0 ? 'font-semibold text-text-primary' : 'text-text-secondary')}>
                  {formatInt(row.count)}
                </span>
                <span className="kpi-number w-9 text-right text-[0.6875rem] text-text-muted">{String(percents[index] ?? 0)}%</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[0.6875rem] leading-4 text-text-muted">
          Clientes com os dois produtos; o percentual é sobre os {formatInt(focusTotal)} clientes de {focus.plain} em pares. Fita mais larga, mais clientes.
        </p>
      </div>
    </div>
  );
}
