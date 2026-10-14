import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, groups, type FlowCell, type FlowGroup } from './data';

/**
 * Chord direcional no TETO do modelo: oito entidades, que é onde a roda começa a se fechar. Três
 * coisas seguram a legibilidade aqui, e todas as três são medidas, não gosto.
 *
 * 1. ORDEM POR VOLUME. `groups` já vem em ordem decrescente do que cada executivo envia, então
 *    vizinho tem tamanho parecido e a fita grossa viaja menos: menos cruzamento pelo centro.
 * 2. TETO DE SEIS CORES (COR-4). Só os seis primeiros slots recebem cor categórica; do sétimo em
 *    diante o arco vai no neutro e quem o identifica é o NOME escrito ao lado dele. Por isso o nome
 *    é obrigatório em todo arco nesta versão: sem ele os dois últimos ficariam indistinguíveis.
 * 3. FITA FRACA FORA DO DESENHO. Par cuja soma dos dois sentidos fica abaixo de `MIN_PAIR` não vira
 *    fita, porque abaixo disso a forma tem menos de 9 px no pé e só polui o centro. O ângulo do
 *    arco continua somando essas reatribuições, e uma anotação declara quantos pares saíram: arco
 *    maior que a soma das fitas visíveis é fato do desenho, e fato do desenho se escreve.
 *
 * A fita é REGIÃO FECHADA (dois arcos e duas quadráticas), nunca traço grosso, que engordaria para
 * os dois lados e não deixaria medir a espessura, que aqui é o próprio dado.
 */
export interface ExecutiveReassignmentChordProps {
  readonly data?: readonly FlowCell[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas declarado por número no `meta.json` (960 x 560) e `viewBox` igual ao CORPO medido dessa
 * moldura, 894 x 441,5 px, para a escala do SVG sair 1: os 11 px declarados são 11 px na tela.
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 441.5;
const CX = 447;
const CY = 220;
const R_OUTER = 168;
const ARC_THICKNESS = 10;
const R_INNER = R_OUTER - ARC_THICKNESS;
/**
 * Âncora do rótulo, fora do arco, e os dois números saíram de MEDIÇÃO, não de estética. O bloco de
 * rótulo tem duas linhas e desce 15,4 px abaixo da âncora, então uma âncora que está fora do arco
 * ainda joga o canto de baixo do texto DE VOLTA para dentro do disco, porque a borda é curva: com
 * `R_OUTER + 10` a CONTRASTE-TEXTO mediu 2% da tinta do rótulo do Executivo H sobre o próprio arco
 * dele, a 1,00:1, que é texto invisível. O afastamento radial de 18 px mais o recuo horizontal de
 * 6 px deixam a caixa mais próxima a 4,5 px do arco, conferido caixa a caixa pela soma POR GLIFO.
 */
const R_LABEL = R_OUTER + 18;
const LABEL_GAP = 6;
const TWO_PI = Math.PI * 2;
/** Vão angular entre grupos vizinhos, em radianos (cerca de 2,9 graus). */
const PAD_ANGLE = 0.05;
const READING_BASELINE = 13;
const READING_SIZE = 12;
const TEXT_SIZE = 11;
const NAME_DY = -3;
const COUNT_DY = 13;
const ANNOTATION_BASELINE = VIEW_HEIGHT - 4;
/** Soma dos dois sentidos abaixo da qual o par não vira fita e fica só no arco. */
const MIN_PAIR = 3;
/** COR-5: contorno na cor do cartão separa arco de fita sem mexer no contraste do preenchimento. */
const SEPARATION_STROKE = 'var(--surface-raised)';
const SEPARATION_WIDTH = 1.5;
/** Neutro dos grupos fora do teto de seis cores; mede 5,2:1 e 5,4:1 contra o cartão. */
const NEUTRAL_FILL = 'var(--text-muted)';

interface Arc {
  readonly start: number;
  readonly end: number;
}

/** Ângulo 0 no topo, crescendo no sentido horário (convenção comum de roda e rosca). */
function polar(radius: number, angle: number): { x: number; y: number } {
  return { x: CX + radius * Math.sin(angle), y: CY - radius * Math.cos(angle) };
}

function fmt(value: number): string {
  return value.toFixed(2);
}

/** A flag de arco grande do SVG liga quando o ângulo do trecho passa de π, seja fita ou arco. */
function largeArcFlag(arc: Arc): 0 | 1 {
  return arc.end - arc.start > Math.PI ? 1 : 0;
}

/** Arco na borda de i, quadrática pelo centro até a borda de j, arco na borda de j, e volta. */
function ribbonPath(a: Arc, b: Arc): string {
  const p1 = polar(R_INNER, a.start);
  const p2 = polar(R_INNER, a.end);
  const p3 = polar(R_INNER, b.start);
  const p4 = polar(R_INNER, b.end);
  return [
    `M ${fmt(p1.x)},${fmt(p1.y)}`,
    `A ${String(R_INNER)},${String(R_INNER)} 0 ${String(largeArcFlag(a))} 1 ${fmt(p2.x)},${fmt(p2.y)}`,
    `Q ${String(CX)},${String(CY)} ${fmt(p3.x)},${fmt(p3.y)}`,
    `A ${String(R_INNER)},${String(R_INNER)} 0 ${String(largeArcFlag(b))} 1 ${fmt(p4.x)},${fmt(p4.y)}`,
    `Q ${String(CX)},${String(CY)} ${fmt(p1.x)},${fmt(p1.y)}`,
    'Z',
  ].join(' ');
}

/** Arco externo do grupo, entre R_INNER e R_OUTER, numa cor sólida só. */
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

/** COR-4: do sétimo grupo em diante não há slot, e o arco vai no neutro com o nome escrito. */
function colorOf(group: FlowGroup): string {
  if (group.slot === null) return NEUTRAL_FILL;
  return CHART_SERIES_COLORS[group.slot - 1] ?? 'var(--chart-1)';
}

interface GroupArc {
  readonly group: FlowGroup;
  readonly span: Arc;
  readonly sent: number;
  readonly d: string;
  readonly sub: ReadonlyMap<string, Arc>;
}

interface Layout {
  readonly arcs: readonly GroupArc[];
  readonly counts: ReadonlyMap<string, number>;
  readonly total: number;
}

function cellKey(from: string, to: string): string {
  return `${from}__${to}`;
}

/** Ângulo do grupo pela soma da linha (o que ele envia), descontado o padAngle entre grupos. */
function computeLayout(list: readonly FlowGroup[], flows: readonly FlowCell[]): Layout | null {
  const counts = new Map<string, number>();
  for (const flow of flows) counts.set(cellKey(flow.from, flow.to), flow.count);

  const sent = new Map<string, number>(list.map((group) => [group.id, 0]));
  for (const flow of flows) sent.set(flow.from, (sent.get(flow.from) ?? 0) + flow.count);
  const total = list.reduce((sum, group) => sum + (sent.get(group.id) ?? 0), 0);
  if (total <= 0) return null;

  const anglePerUnit = (TWO_PI - list.length * PAD_ANGLE) / total;
  const arcs: GroupArc[] = [];
  let cursor = 0;
  for (const group of list) {
    const own = (sent.get(group.id) ?? 0) * anglePerUnit;
    const span: Arc = { start: cursor, end: cursor + own };
    cursor += own + PAD_ANGLE;
    // A sub-fatia do par cortado continua RESERVADA, na ordem fixa de `groups`: o arco mede o que o
    // executivo enviou, fita ou não, e por isso ele fica maior que a soma das fitas desenhadas.
    const sub = new Map<string, Arc>();
    let inner = span.start;
    for (const other of list) {
      if (other.id === group.id) continue;
      const width = (counts.get(cellKey(group.id, other.id)) ?? 0) * anglePerUnit;
      sub.set(other.id, { start: inner, end: inner + width });
      inner += width;
    }
    arcs.push({ group, span, sent: sent.get(group.id) ?? 0, d: groupArcPath(span), sub });
  }
  return { arcs, counts, total };
}

interface Ribbon {
  readonly key: string;
  readonly d: string;
  readonly fill: string;
}

interface Pair {
  readonly leaderLabel: string;
  readonly otherLabel: string;
  readonly both: number;
  readonly net: number;
}

export default function ExecutiveReassignmentChord({
  data = defaultData,
  height,
  className,
}: ExecutiveReassignmentChordProps) {
  const layout = computeLayout(groups, data);
  if (layout === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma reatribuição neste recorte: nenhuma oportunidade trocou de dono.</span>
      </div>
    );
  }

  const { arcs, counts, total } = layout;

  const ribbons: Ribbon[] = [];
  const pairs: Pair[] = [];
  let hiddenPairs = 0;
  for (let i = 0; i < arcs.length; i += 1) {
    const a = arcs[i];
    if (a === undefined) continue;
    for (let j = i + 1; j < arcs.length; j += 1) {
      const b = arcs[j];
      if (b === undefined) continue;
      const outbound = counts.get(cellKey(a.group.id, b.group.id)) ?? 0;
      const inbound = counts.get(cellKey(b.group.id, a.group.id)) ?? 0;
      const both = outbound + inbound;
      if (both <= 0) continue;
      pairs.push(
        outbound >= inbound
          ? { leaderLabel: a.group.label, otherLabel: b.group.label, both, net: outbound - inbound }
          : { leaderLabel: b.group.label, otherLabel: a.group.label, both, net: inbound - outbound },
      );
      if (both < MIN_PAIR) {
        hiddenPairs += 1;
        continue;
      }
      const arcA = a.sub.get(b.group.id);
      const arcB = b.sub.get(a.group.id);
      if (arcA === undefined || arcB === undefined) continue;
      // Cor do grupo de índice MENOR no par, a origem canônica da leitura (convenção do modelo).
      ribbons.push({ key: `${a.group.id}__${b.group.id}`, d: ribbonPath(arcA, arcB), fill: colorOf(a.group) });
    }
  }

  const ordered = [...pairs].sort((x, y) => y.both - x.both);
  const topPair = ordered[0];
  const pairPhrase =
    topPair === undefined
      ? ''
      : `A maior troca é entre ${topPair.leaderLabel} e ${topPair.otherLabel}, ${formatInt(topPair.both)} no par, com saldo de ${formatInt(topPair.net)} para ${topPair.leaderLabel}.`;
  const hiddenPhrase =
    hiddenPairs === 0 ? '' : `${formatInt(hiddenPairs)} pares abaixo de ${formatInt(MIN_PAIR)} ficam só no arco.`;
  const summary = [
    `Diagrama de corda direcional com ${formatInt(arcs.length)} executivos e ${formatInt(total)} reatribuições no terceiro trimestre de 2026.`,
    pairPhrase,
    hiddenPhrase,
  ]
    .filter((part) => part.length > 0)
    .join(' ');

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        {ribbons.map((ribbon) => (
          <path
            d={ribbon.d}
            fill={ribbon.fill}
            key={ribbon.key}
            stroke={SEPARATION_STROKE}
            strokeWidth={SEPARATION_WIDTH}
          />
        ))}

        {arcs.map((arc) => (
          <path
            d={arc.d}
            fill={colorOf(arc.group)}
            key={arc.group.id}
            stroke={SEPARATION_STROKE}
            strokeWidth={SEPARATION_WIDTH}
          />
        ))}

        {/* O nome sai em TODO arco, e não só nos dois sem cor: é o canal que a ACE-2 pede. */}
        {arcs.map((arc) => {
          const mid = (arc.span.start + arc.span.end) / 2;
          const point = polar(R_LABEL, mid);
          const side = point.x - CX;
          const anchor = side > 2 ? 'start' : side < -2 ? 'end' : 'middle';
          const labelX = side > 2 ? point.x + LABEL_GAP : side < -2 ? point.x - LABEL_GAP : point.x;
          return (
            <text fontSize={TEXT_SIZE} key={arc.group.id} textAnchor={anchor}>
              <tspan className="font-medium" fill="var(--text-secondary)" x={fmt(labelX)} y={fmt(point.y + NAME_DY)}>
                {arc.group.label}
              </tspan>
              <tspan className="tabular-nums" fill="var(--text-muted)" x={fmt(labelX)} y={fmt(point.y + COUNT_DY)}>
                {`${formatInt(arc.sent)} reatribuições enviadas`}
              </tspan>
            </text>
          );
        })}

        {/* Linha de leitura (ANO-5): o par de maior troca e o saldo líquido dele. */}
        {topPair === undefined ? null : (
          <text fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
            <tspan className="font-semibold" fill="var(--text-primary)">
              {topPair.leaderLabel}
            </tspan>
            <tspan fill="var(--text-secondary)">{' e '}</tspan>
            <tspan className="font-semibold" fill="var(--text-primary)">
              {topPair.otherLabel}
            </tspan>
            <tspan fill="var(--text-secondary)">{' trocam '}</tspan>
            <tspan className="tabular-nums font-bold" fill="var(--text-primary)">
              {formatInt(topPair.both)}
            </tspan>
            <tspan fill="var(--text-secondary)">{' reatribuições, com saldo de '}</tspan>
            <tspan className="tabular-nums font-bold" fill="var(--text-primary)">
              {formatInt(topPair.net)}
            </tspan>
            <tspan fill="var(--text-secondary)">{` para ${topPair.leaderLabel}.`}</tspan>
          </text>
        )}

        {/* Anotação única (ANO-1 e ANO-2): quantos pares saíram do desenho e para onde eles foram. */}
        {hiddenPairs === 0 ? null : (
          <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={0} y={ANNOTATION_BASELINE}>
            {`${formatInt(hiddenPairs)} pares abaixo de ${formatInt(MIN_PAIR)} trocas: só no arco, sem fita`}
          </text>
        )}
      </svg>
    </div>
  );
}
