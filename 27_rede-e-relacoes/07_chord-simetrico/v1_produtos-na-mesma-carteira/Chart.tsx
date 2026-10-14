import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, groups, type ProductGroup, type ProductPair } from './data';

/**
 * Chord simétrico em SVG puro: cada par de produtos vira UMA fita com as duas pontas da mesma
 * largura, porque a relação não tem sentido (A com B é B com A). O ângulo do grupo é proporcional
 * ao total dos seus pares, descontado o vão entre grupos, e dentro do arco os parceiros ficam
 * ordenados pelo peso, do maior para o menor, para reduzir cruzamentos. Cor da fita: a do grupo
 * de índice menor no par (a mesma convenção do chord direcional da família 11).
 */
export interface ProductChordProps {
  readonly data?: readonly ProductPair[];
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
const R_OUTER = 60;
const ARC_THICKNESS = 9;
const R_INNER = R_OUTER - ARC_THICKNESS;
/** Âncora do rótulo, logo fora do arco (ROT-2: nome fora da marca, sem cortar). */
const R_LABEL = R_OUTER + 7;
const SURFACE_STROKE = 'var(--surface-raised)';
const STROKE_WIDTH = 1;
/**
 * Piso da fita: largura nominal da ponta, em unidades do viewBox (cerca de 2,3 px com a roda de 172 px).
 * Par abaixo dele não leva fita: mantém o ângulo no arco e é contado no rodapé (COR-5, GEO-16).
 */
const MIN_TIP = 1.6;
/** Neutro do agrupamento Outros: mede 5,2:1 contra o cartão; var(--line-strong) some como marca. */
const NEUTRAL = 'var(--text-muted)';

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

function colorOf(group: ProductGroup): string {
  return group.slot === null ? NEUTRAL : (CHART_SERIES_COLORS[group.slot - 1] ?? NEUTRAL);
}

/** Três posições por eixo, como um relógio: o rótulo nunca fica sobre o arco. */
function labelOffset(dx: number, dy: number): { x: string; y: string; align: string } {
  const y = dy > 2 ? '0%' : dy < -2 ? '-100%' : '-50%';
  if (dx > 2) return { x: '0%', y, align: 'items-start text-left' };
  if (dx < -2) return { x: '-100%', y, align: 'items-end text-right' };
  return { x: '-50%', y: dy < 0 ? '-100%' : '0%', align: 'items-center text-center' };
}

interface RibbonDrawn {
  readonly id: string;
  readonly d: string;
  readonly color: string;
  readonly width: number;
}

export default function ProductChord({ data = defaultData, height, className }: ProductChordProps) {
  const layout = computeLayout(groups, data);

  if (!layout) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente com dois produtos neste recorte: não há par para desenhar.</span>
      </div>
    );
  }

  const { spans, subArcs, totals, pairTotal, anglePerUnit } = layout;

  const ribbons: RibbonDrawn[] = [];
  const skipped: { label: string; count: number }[] = [];
  for (let i = 0; i < groups.length; i += 1) {
    const a = groups[i];
    if (!a) continue;
    for (let j = i + 1; j < groups.length; j += 1) {
      const b = groups[j];
      if (!b) continue;
      const arcA = subArcs.get(a.id)?.get(b.id);
      const arcB = subArcs.get(b.id)?.get(a.id);
      if (!arcA || !arcB) continue;
      const count = pairValue(data, a.id, b.id);
      if (anglePerUnit * R_INNER * count < MIN_TIP) {
        skipped.push({ label: `${a.plain} com ${b.plain}`, count });
        continue;
      }
      ribbons.push({ id: `${a.id}__${b.id}`, d: ribbonPath(arcA, arcB), color: colorOf(a), width: count });
    }
  }
  // Fitas largas primeiro e as finas por último, para a fina ficar por cima da vizinha.
  ribbons.sort((x, y) => y.width - x.width);
  skipped.sort((x, y) => y.count - x.count);
  const skippedClients = skipped.reduce((acc, item) => acc + item.count, 0);

  const leader = [...groups].sort((x, y) => (totals.get(y.id) ?? 0) - (totals.get(x.id) ?? 0))[0];
  const topPair = [...data].sort((x, y) => y.count - x.count)[0];
  const topA = groups.find((g) => g.id === topPair?.a);
  const topB = groups.find((g) => g.id === topPair?.b);
  const leaderTotal = leader ? (totals.get(leader.id) ?? 0) : 0;
  const topCount = topPair?.count ?? 0;

  const summary = `Diagrama de corda simétrico com ${String(groups.length)} produtos e ${formatInt(pairTotal)} clientes em pares. O maior total é de ${leader?.plain ?? ''}, com ${formatInt(leaderTotal)}; o par mais forte é ${topA?.plain ?? ''} com ${topB?.plain ?? ''}, ${formatInt(topCount)} clientes.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        <span className="font-semibold text-text-primary">{topA?.label}</span> com{' '}
        <span className="font-semibold text-text-primary">{topB?.plain}</span> é o par mais forte:{' '}
        <span className="kpi-number">{formatInt(topCount)}</span> clientes têm os dois.
      </p>
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="relative aspect-square h-full w-auto max-w-full">
          <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`}>
            {ribbons.map((ribbon) => (
              <path d={ribbon.d} fill={ribbon.color} key={ribbon.id} stroke={SURFACE_STROKE} strokeWidth={STROKE_WIDTH} style={{ paintOrder: 'stroke' }} />
            ))}
            {groups.map((group) => {
              const span = spans.get(group.id);
              return span ? (
                <path d={groupArcPath(span)} fill={colorOf(group)} key={group.id} stroke={SURFACE_STROKE} strokeWidth={STROKE_WIDTH} />
              ) : null;
            })}
          </svg>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {groups.map((group) => {
              const span = spans.get(group.id);
              if (!span) return null;
              const point = polar(R_LABEL, (span.start + span.end) / 2);
              const offset = labelOffset(point.x - CENTER, point.y - CENTER);
              return (
                <span
                  className={cn('absolute flex w-max max-w-[6.5rem] flex-col leading-tight', offset.align)}
                  key={group.id}
                  style={{
                    left: `${String((point.x / VIEW) * 100)}%`,
                    top: `${String((point.y / VIEW) * 100)}%`,
                    transform: `translate(${offset.x}, ${offset.y})`,
                  }}
                >
                  <span className="text-xs font-medium text-text-secondary">{group.label}</span>
                  <span className="kpi-number text-[0.6875rem] text-text-muted">{formatInt(totals.get(group.id) ?? 0)} clientes</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        Como ler: fita mais larga, mais clientes com os dois produtos. O arco soma os pares de cada produto.
        {skipped.length > 0 ? (
          <>
            {' '}
            <span className="kpi-number">{formatInt(skipped.length)}</span> pares finos demais ficam sem fita ({skipped.map((item) => `${item.label}, ${formatInt(item.count)}`).join('; ')}), somando{' '}
            <span className="kpi-number">{formatInt(skippedClients)}</span> clientes.
          </>
        ) : null}
      </p>
    </div>
  );
}
