import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, groups, type FlowCell, type FlowGroup } from './data';

/**
 * Chord direcional em SVG puro: a geometria vem da matriz de fluxos de `data`, sem biblioteca.
 * O ângulo de cada grupo é proporcional à soma da linha, o que ele ENVIA no total, dividido numa
 * sub-fatia por par de destino. Cada par (i, j) vira UMA fita: a borda de i reserva `m[i][j]`
 * (o que i manda para j) e a borda de j reserva `m[j][i]` (o que j manda para i), então a mesma
 * fita mostra os dois sentidos com larguras diferentes em cada ponta. A cor da fita é do grupo de
 * índice MENOR em `groups`, tratado como origem canônica do par (convenção do Farol; o ECharts
 * colore pela fita do destino, ver README, Referências).
 */
export interface FunctionRepassesChordProps {
  readonly data?: readonly FlowCell[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW = 200;
const CENTER = VIEW / 2;
const TWO_PI = Math.PI * 2;
/** Vão angular entre grupos vizinhos, em radianos (cerca de 2,9 graus). */
const PAD_ANGLE = 0.05;
const R_OUTER = 42;
const ARC_THICKNESS = 9;
const R_INNER = R_OUTER - ARC_THICKNESS;
/** Âncora do rótulo, logo fora do arco (seção 17.4, ROT-2: nome fora da marca, sem cortar). */
const R_LABEL = R_OUTER + 8;
const RIBBON_STROKE = 'var(--surface-raised)';
const RIBBON_STROKE_WIDTH = 1;

interface Arc {
  readonly start: number;
  readonly end: number;
}

/** Ângulo 0 no topo, crescendo no sentido horário (convenção comum de roda e rosca). */
function polar(radius: number, angle: number): { x: number; y: number } {
  return { x: CENTER + radius * Math.sin(angle), y: CENTER - radius * Math.cos(angle) };
}

function fmt(value: number): string {
  return value.toFixed(2);
}

/** EIX-3/seção 17.3: a flag de arco grande do SVG liga quando o ângulo do trecho passa de π. */
function largeArcFlag(arc: Arc): 0 | 1 {
  return arc.end - arc.start > Math.PI ? 1 : 0;
}

interface Layout {
  readonly spans: ReadonlyMap<string, Arc>;
  readonly subArcs: ReadonlyMap<string, ReadonlyMap<string, Arc>>;
  readonly rowTotal: ReadonlyMap<string, number>;
  readonly total: number;
}

/** Ângulo do grupo pela soma da linha (o que ele manda no total), descontado o padAngle entre grupos. */
function computeLayout(list: readonly FlowGroup[], flows: readonly FlowCell[]): Layout | null {
  const rowTotal = new Map<string, number>(list.map((g) => [g.id, 0]));
  for (const flow of flows) rowTotal.set(flow.from, (rowTotal.get(flow.from) ?? 0) + flow.count);
  const total = [...rowTotal.values()].reduce((sum, value) => sum + value, 0);
  if (total <= 0) return null;

  const anglePerUnit = (TWO_PI - list.length * PAD_ANGLE) / total;
  const spans = new Map<string, Arc>();
  let cursor = 0;
  for (const g of list) {
    const span = (rowTotal.get(g.id) ?? 0) * anglePerUnit;
    spans.set(g.id, { start: cursor, end: cursor + span });
    cursor += span + PAD_ANGLE;
  }

  // Ordem fixa dos slots de destino dentro do arco do grupo: a mesma ordem de `groups`, nunca a
  // do valor, para o layout ser determinístico e reproduzível entre renders (seção 10).
  const subArcs = new Map<string, Map<string, Arc>>();
  for (const g of list) {
    const own = spans.get(g.id);
    if (!own) continue;
    const inner = new Map<string, Arc>();
    let sub = own.start;
    for (const other of list) {
      if (other.id === g.id) continue;
      const count = flows.find((f) => f.from === g.id && f.to === other.id)?.count ?? 0;
      const width = count * anglePerUnit;
      inner.set(other.id, { start: sub, end: sub + width });
      sub += width;
    }
    subArcs.set(g.id, inner);
  }
  return { spans, subArcs, rowTotal, total };
}

/** Arco na borda de i, curva quadrática pelo centro até a borda de j, arco na borda de j, e volta ao início. */
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

/** Arco externo (donut) do grupo, entre R_INNER e R_OUTER, numa cor sólida só. */
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

function colorOf(group: FlowGroup): string {
  return CHART_SERIES_COLORS[group.slot - 1] ?? 'var(--chart-1)';
}

/** Três posições por eixo (início, meio, fim), como um relógio: o rótulo nunca fica sobre o arco. */
function labelOffset(dx: number, dy: number): { x: string; y: string; align: string } {
  if (dx > 2) return { x: '0%', y: dy > 2 ? '0%' : dy < -2 ? '-100%' : '-50%', align: 'items-start text-left' };
  if (dx < -2) return { x: '-100%', y: dy > 2 ? '0%' : dy < -2 ? '-100%' : '-50%', align: 'items-end text-right' };
  return { x: '-50%', y: dy < 0 ? '-100%' : '0%', align: 'items-center text-center' };
}

interface RibbonDrawn {
  readonly id: string;
  readonly d: string;
  readonly color: string;
}

interface GroupArcDrawn {
  readonly group: FlowGroup;
  readonly span: Arc;
  readonly d: string;
}

export default function FunctionRepassesChord({ data = defaultData, height, className }: FunctionRepassesChordProps) {
  const layout = computeLayout(groups, data);

  if (!layout) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum repasse neste recorte: não há fluxo entre funções para desenhar.</span>
      </div>
    );
  }

  const { spans, subArcs, rowTotal, total } = layout;

  const groupArcs: GroupArcDrawn[] = groups.flatMap((group) => {
    const span = spans.get(group.id);
    return span ? [{ group, span, d: groupArcPath(span) }] : [];
  });

  // Uma fita por par não ordenado: a borda de a (o de índice menor, a origem canônica) reserva
  // m[a][b] e a borda de b reserva m[b][a] (item 3 da anatomia; ver comentário do topo do arquivo).
  const ribbons: RibbonDrawn[] = [];
  for (let i = 0; i < groups.length; i += 1) {
    const a = groups[i];
    if (!a) continue;
    for (let j = i + 1; j < groups.length; j += 1) {
      const b = groups[j];
      if (!b) continue;
      const arcA = subArcs.get(a.id)?.get(b.id);
      const arcB = subArcs.get(b.id)?.get(a.id);
      if (!arcA || !arcB) continue;
      if (arcA.end - arcA.start <= 0 && arcB.end - arcB.start <= 0) continue;
      ribbons.push({ id: `${a.id}__${b.id}`, d: ribbonPath(arcA, arcB), color: colorOf(a) });
    }
  }

  const leader = [...groups].sort((x, y) => (rowTotal.get(y.id) ?? 0) - (rowTotal.get(x.id) ?? 0))[0];
  const leaderLabel = leader?.label ?? '';
  const leaderTotal = leader ? (rowTotal.get(leader.id) ?? 0) : 0;
  const topFlow = [...data].sort((x, y) => y.count - x.count)[0];
  const topFlowTo = groups.find((g) => g.id === topFlow?.to)?.label ?? '';
  const topFlowCount = topFlow?.count ?? 0;

  const summary = `Diagrama de corda direcional com ${String(groups.length)} funções e ${formatInt(total)} repasses de oportunidades no terceiro trimestre de 2026. ${leaderLabel} concentra o maior envio, ${formatInt(leaderTotal)} repasses, sendo ${formatInt(topFlowCount)} repasses só para ${topFlowTo}.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        <span className="font-semibold text-text-primary">{leaderLabel}</span> lidera o envio com{' '}
        <span className="kpi-number font-semibold text-text-primary">{formatInt(leaderTotal)}</span> repasses;{' '}
        <span className="kpi-number">{formatInt(topFlowCount)}</span> repasses vão só para {topFlowTo}.
      </p>
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="relative aspect-square h-full w-auto max-w-full">
          <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`}>
            {ribbons.map((ribbon) => (
              <path d={ribbon.d} fill={ribbon.color} key={ribbon.id} stroke={RIBBON_STROKE} strokeWidth={RIBBON_STROKE_WIDTH} />
            ))}
            {groupArcs.map(({ group, d }) => (
              <path d={d} fill={colorOf(group)} key={group.id} stroke={RIBBON_STROKE} strokeWidth={RIBBON_STROKE_WIDTH} />
            ))}
          </svg>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {groupArcs.map(({ group, span }) => {
              const mid = (span.start + span.end) / 2;
              const point = polar(R_LABEL, mid);
              const offset = labelOffset(point.x - CENTER, point.y - CENTER);
              return (
                <span
                  className={cn('absolute flex flex-col whitespace-nowrap leading-tight', offset.align)}
                  key={group.id}
                  style={{
                    left: `${String((point.x / VIEW) * 100)}%`,
                    top: `${String((point.y / VIEW) * 100)}%`,
                    transform: `translate(${offset.x}, ${offset.y})`,
                  }}
                >
                  <span className="text-xs font-medium text-text-secondary">{group.label}</span>
                  <span className="kpi-number text-[0.6875rem] text-text-muted">{formatInt(rowTotal.get(group.id) ?? 0)} repasses</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
