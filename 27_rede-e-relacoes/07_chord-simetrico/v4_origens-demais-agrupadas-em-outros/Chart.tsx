import { Filter } from 'lucide-react';
import { useState } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, origins, type Origin, type OriginPair } from './data';

/**
 * Chord simétrico de muitas origens: as seis maiores ficam coloridas, as demais somam em Outros
 * (n=5) e o par que cai abaixo de MIN_RIBBON leads perde a fita, mas segue reservando o ângulo
 * dele no arco, então o total do arco não muda. Origem sem dado de jornada fica fora do círculo e
 * é contada à parte. A matriz é a mesma relação em tabela, a visão acessível e a de leitura exata,
 * e abaixo de 400 px de largura a corda dá lugar à lista ordenada dos pares. Cada par é UMA fita
 * com as duas pontas da mesma largura; cor da fita: a do grupo de índice menor no par.
 */
export interface OriginsChordProps {
  readonly data?: readonly OriginPair[];
  readonly height?: number;
  readonly className?: string;
}

/** Par com menos leads do que isto não ganha fita; a matriz continua mostrando o valor. */
const MIN_RIBBON = 10;
const OUTROS_ID = 'outros';

interface CircleGroup {
  readonly id: string;
  readonly label: string;
  readonly plain: string;
  readonly slot: Origin['slot'];
}

type View = 'chord' | 'matrix';
const VIEWS: readonly { readonly id: View; readonly label: string }[] = [
  { id: 'chord', label: 'Corda' },
  { id: 'matrix', label: 'Matriz' },
];

/** Junta as origens fora do top 6 em Outros, descarta o par interno e separa quem não tem jornada. */
function aggregate(list: readonly Origin[], pairs: readonly OriginPair[]) {
  const inCircle = list.filter((o) => o.hasJourney);
  const groupOf = new Map<string, string>(inCircle.map((o) => [o.id, o.slot === null ? OUTROS_ID : o.id]));
  const colored: CircleGroup[] = inCircle
    .filter((o) => o.slot !== null)
    .map((o) => ({ id: o.id, label: o.label, plain: o.plain, slot: o.slot }));
  const restCount = inCircle.length - colored.length;
  const circle: CircleGroup[] =
    restCount > 0
      ? [...colored, { id: OUTROS_ID, label: `Outros (n=${String(restCount)})`, plain: 'outros', slot: null }]
      : colored;

  const merged = new Map<string, OriginPair>();
  for (const p of pairs) {
    const x = groupOf.get(p.a);
    const y = groupOf.get(p.b);
    if (!x || !y || x === y) continue;
    const [a, b] = x < y ? [x, y] : [y, x];
    const key = `${a}|${b}`;
    merged.set(key, { a, b, count: (merged.get(key)?.count ?? 0) + p.count });
  }
  return { circle, pairs: [...merged.values()], apart: list.filter((o) => !o.hasJourney) };
}

const VIEW_BOX = 200;
const CENTER = VIEW_BOX / 2;
const TWO_PI = Math.PI * 2;
/** Vão angular entre grupos vizinhos, em radianos (cerca de 2,9 graus). */
const PAD_ANGLE = 0.05;
/** Giro da roda em radianos: tira o grupo pequeno do topo, onde o rótulo bateria no vizinho. */
const START_ANGLE = 0.6;
const R_OUTER = 62;
const ARC_THICKNESS = 9;
const R_INNER = R_OUTER - ARC_THICKNESS;
/** Âncora do rótulo, logo fora do arco (ROT-2: nome fora da marca, sem cortar). */
const R_LABEL = R_OUTER + 7;
const SURFACE_STROKE = 'var(--surface-raised)';
const STROKE_WIDTH = 1;
/** Neutro de Outros: mede 5,2:1 contra o cartão; var(--line-strong) some como marca. */
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
function pairValue(pairs: readonly OriginPair[], x: string, y: string): number {
  return pairs
    .filter((p) => (p.a === x && p.b === y) || (p.a === y && p.b === x))
    .reduce((sum, p) => sum + p.count, 0);
}

interface Layout {
  readonly spans: ReadonlyMap<string, Arc>;
  readonly subArcs: ReadonlyMap<string, ReadonlyMap<string, Arc>>;
  readonly totals: ReadonlyMap<string, number>;
  readonly pairTotal: number;
}

function computeLayout(list: readonly CircleGroup[], pairs: readonly OriginPair[]): Layout | null {
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
  return { spans, subArcs, totals, pairTotal: sum / 2 };
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

function colorOf(group: CircleGroup): string {
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
}

export default function OriginsChord({ data = defaultData, height, className }: OriginsChordProps) {
  const [view, setView] = useState<View>('chord');
  const { circle, pairs, apart } = aggregate(origins, data);
  const layout = computeLayout(circle, pairs);

  if (!layout) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma jornada com duas origens neste recorte: não há par para desenhar.</span>
      </div>
    );
  }

  const { spans, subArcs, totals, pairTotal } = layout;
  const ranked = [...pairs].sort((x, y) => y.count - x.count);
  const visible = ranked.filter((p) => p.count >= MIN_RIBBON);
  const hiddenCount = ranked.length - visible.length;
  const top = ranked[0];
  const nameOf = (id: string): CircleGroup | undefined => circle.find((g) => g.id === id);
  const topA = nameOf(top?.a ?? '');
  const topB = nameOf(top?.b ?? '');
  const apartLeads = apart.reduce((sum, o) => sum + o.leads, 0);

  const ribbons: RibbonDrawn[] = [];
  for (const p of visible) {
    const first = circle.findIndex((g) => g.id === p.a);
    const second = circle.findIndex((g) => g.id === p.b);
    const owner = circle[Math.min(first, second)];
    const arcA = subArcs.get(p.a)?.get(p.b);
    const arcB = subArcs.get(p.b)?.get(p.a);
    if (!owner || !arcA || !arcB) continue;
    ribbons.push({ id: `${p.a}__${p.b}`, d: ribbonPath(arcA, arcB), color: colorOf(owner) });
  }

  const summary = `Diagrama de corda simétrico com ${String(circle.length)} grupos de origens e ${formatInt(pairTotal)} leads em pares. O par mais forte é ${topA?.plain ?? ''} com ${topB?.plain ?? ''}, ${formatInt(top?.count ?? 0)} leads; ${String(hiddenCount)} pares pequenos ficam sem fita. A matriz traz todos os valores.`;

  return (
    <div
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div className="mb-2 flex shrink-0 items-start justify-between gap-3">
        <p className="text-xs leading-5 text-text-secondary">
          <span className="font-semibold text-text-primary">{topA?.label}</span> com{' '}
          <span className="font-semibold text-text-primary">{topB?.plain}</span> é o par mais forte:{' '}
          <span className="kpi-number">{formatInt(top?.count ?? 0)}</span> leads nas duas origens.
        </p>
        <div aria-label="Visão do cartão" className="flex shrink-0 gap-0.5 rounded-md bg-surface-sunken p-0.5" role="group">
          {VIEWS.map((option) => (
            <button
              aria-pressed={view === option.id}
              className={cn(
                'rounded px-2 py-1 text-xs',
                view === option.id ? 'bg-surface-raised font-semibold text-text-primary' : 'font-medium text-text-muted',
              )}
              key={option.id}
              onClick={() => {
                setView(option.id);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        {view === 'matrix' ? (
          <table aria-label="Matriz de leads por par de origens" className="w-full table-fixed border-separate border-spacing-0.5 text-xs">
            <thead>
              <tr>
                <th className="w-24" />
                {circle.map((g) => (
                  <th className="px-0.5 pb-1 text-[0.6875rem] font-medium leading-tight text-text-muted" key={g.id} scope="col">
                    {g.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {circle.map((row) => (
                <tr key={row.id}>
                  <th className="pr-2 text-left text-xs font-medium leading-tight text-text-secondary" scope="row">
                    {row.label}
                  </th>
                  {circle.map((col) => {
                    if (row.id === col.id) return <td className="rounded-sm bg-surface-sunken" key={col.id} />;
                    const value = pairValue(pairs, row.id, col.id);
                    const strongest = value === top?.count;
                    return (
                      <td
                        className={cn(
                          'kpi-number rounded-sm py-1.5 text-center',
                          strongest ? 'font-semibold text-text-primary' : value >= MIN_RIBBON ? 'text-text-primary' : 'text-text-muted',
                        )}
                        key={col.id}
                      >
                        {formatInt(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>
            <div className="hidden h-full w-full items-center justify-center @[25rem]:flex">
              <div className="relative aspect-square h-full w-auto max-w-full">
                <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 ${String(VIEW_BOX)} ${String(VIEW_BOX)}`}>
                  {ribbons.map((ribbon) => (
                    <path d={ribbon.d} fill={ribbon.color} key={ribbon.id} stroke={SURFACE_STROKE} strokeWidth={STROKE_WIDTH} />
                  ))}
                  {circle.map((group) => {
                    const span = spans.get(group.id);
                    return span ? (
                      <path d={groupArcPath(span)} fill={colorOf(group)} key={group.id} stroke={SURFACE_STROKE} strokeWidth={STROKE_WIDTH} />
                    ) : null;
                  })}
                </svg>
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  {circle.map((group) => {
                    const span = spans.get(group.id);
                    if (!span) return null;
                    const point = polar(R_LABEL, (span.start + span.end) / 2);
                    const offset = labelOffset(point.x - CENTER, point.y - CENTER);
                    return (
                      <span
                        className={cn('absolute flex w-max max-w-[6rem] flex-col leading-tight', offset.align)}
                        key={group.id}
                        style={{
                          left: `${String((point.x / VIEW_BOX) * 100)}%`,
                          top: `${String((point.y / VIEW_BOX) * 100)}%`,
                          transform: `translate(${offset.x}, ${offset.y})`,
                        }}
                      >
                        <span className="text-xs font-medium text-text-secondary">{group.label}</span>
                        <span className="kpi-number text-[0.6875rem] text-text-muted">{formatInt(totals.get(group.id) ?? 0)} leads</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            <ol className="flex w-full flex-col gap-1 @[25rem]:hidden">
              {ranked.map((p) => (
                <li className="flex items-baseline justify-between gap-3 text-xs text-text-secondary" key={`${p.a}|${p.b}`}>
                  <span>
                    {nameOf(p.a)?.label} com {nameOf(p.b)?.plain}
                  </span>
                  <span className="kpi-number shrink-0 text-text-primary">{formatInt(p.count)}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      <div className="mt-2 flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted">
        {hiddenCount > 0 ? (
          <p>
            {String(hiddenCount)} pares abaixo de {String(MIN_RIBBON)} leads ficam sem fita; o valor está na matriz.
          </p>
        ) : null}
        {apart.length > 0 ? (
          <p>
            {apart.map((o) => o.label).join(', ')}: <span className="kpi-number">{formatInt(apartLeads)}</span> leads sem dado de jornada, fora do círculo.
          </p>
        ) : null}
        <p>Como ler: fita mais larga, mais leads nas duas origens. Com muitas fitas finas, a matriz lê melhor.</p>
      </div>
    </div>
  );
}
