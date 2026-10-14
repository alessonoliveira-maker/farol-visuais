import { Filter, Grid3x3 } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  collapsedId,
  collapsedTeams,
  data as defaultData,
  groups,
  internalCount,
  type FlowCell,
  type FlowGroup,
} from './data';

/**
 * Chord direcional de catorze equipes, que não cabem na roda: as seis maiores ficam com o próprio
 * arco e as oito menores viram um grupo agregado, com a contagem no nome (COR-4).
 *
 * TRÊS COISAS QUE O AGRUPAMENTO OBRIGA A ESCREVER, e as três estão no desenho parado.
 *
 * 1. QUANTAS EQUIPES entraram no agregado, no próprio rótulo, na forma "Outras (n=8)". Sem o número
 *    o grupo parece uma equipe como as outras e a roda mente sobre quantas entidades existem.
 * 2. A TROCA INTERNA do agregado, que um chord não desenha: fita de uma entidade para si mesma não
 *    existe, então esses repasses vão ESCRITOS na legenda, nunca somados ao arco, que mede só o que
 *    sai do grupo. O total do trimestre é por isso maior que a soma das fitas.
 * 3. A SAÍDA PARA A MATRIZ, que é a alternativa de consulta quando a roda satura. O botão chama a
 *    prop `onShowMatrix`; a matriz de adjacência é OUTRO modelo do catálogo, e uma versão nunca
 *    importa arquivo de outra versão, então quem cola decide qual visual entra no lugar.
 *
 * A fita é REGIÃO FECHADA (dois arcos e duas quadráticas), nunca traço grosso, que engordaria para
 * os dois lados e não deixaria medir a espessura, que aqui é o próprio dado.
 */
export interface ManyTeamsChordProps {
  readonly data?: readonly FlowCell[];
  /** Chamada pelo botão "ver como matriz"; quem cola decide o que entra no lugar da roda. */
  readonly onShowMatrix?: () => void;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas declarado por número no `meta.json` (960 x 600) e `viewBox` igual ao CORPO medido dessa
 * moldura, 894 x 481,5 px, para a escala do SVG sair 1: os 11 px declarados são 11 px na tela.
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 481.5;
const CX = 447;
const CY = 243;
const R_OUTER = 180;
const ARC_THICKNESS = 10;
const R_INNER = R_OUTER - ARC_THICKNESS;
/**
 * Âncora do rótulo, fora do arco, e os dois números saíram de MEDIÇÃO, não de estética. O bloco de
 * rótulo tem duas linhas e desce 15,4 px abaixo da âncora, então uma âncora que está fora do arco
 * ainda joga o canto de baixo do texto DE VOLTA para dentro do disco, porque a borda é curva: com
 * `R_OUTER + 10` a CONTRASTE-TEXTO mediu 1% da tinta do rótulo de Outras sobre o próprio arco
 * dela, a 1,00:1, que é texto invisível. O afastamento radial de 18 px mais o recuo horizontal de
 * 6 px deixam a caixa mais próxima a 8,2 px do arco, conferido caixa a caixa pela soma POR GLIFO.
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
const LEGEND_BASELINE = VIEW_HEIGHT - 4;
const LEGEND_SWATCH_WIDTH = 14;
const LEGEND_SWATCH_HEIGHT = 8;
const LEGEND_TEXT_X = 20;
const ANNOTATION_X = 260;
/** COR-5: contorno na cor do cartão separa arco de fita sem mexer no contraste do preenchimento. */
const SEPARATION_STROKE = 'var(--surface-raised)';
const SEPARATION_WIDTH = 1.5;
/** Neutro do grupo agregado, que fica fora do teto de seis cores; mede 5,2:1 e 5,4:1 no cartão. */
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

/** O grupo agregado não tem slot de cor: vai no neutro, com a contagem escrita no rótulo. */
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
    // Sub-fatias na ordem fixa de `groups`, nunca na ordem do valor: layout determinístico.
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
  return { arcs, total };
}

interface Ribbon {
  readonly key: string;
  readonly d: string;
  readonly fill: string;
}

export default function ManyTeamsChord({ data = defaultData, onShowMatrix, height, className }: ManyTeamsChordProps) {
  const layout = computeLayout(groups, data);
  if (layout === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum repasse neste recorte: não há fluxo entre equipes para desenhar.</span>
      </div>
    );
  }

  const { arcs, total } = layout;

  const ribbons: Ribbon[] = [];
  for (let i = 0; i < arcs.length; i += 1) {
    const a = arcs[i];
    if (a === undefined) continue;
    for (let j = i + 1; j < arcs.length; j += 1) {
      const b = arcs[j];
      if (b === undefined) continue;
      const arcA = a.sub.get(b.group.id);
      const arcB = b.sub.get(a.group.id);
      if (arcA === undefined || arcB === undefined) continue;
      if (arcA.end - arcA.start <= 0 && arcB.end - arcB.start <= 0) continue;
      // Cor do grupo de índice MENOR no par, a origem canônica da leitura (convenção do modelo).
      ribbons.push({ key: `${a.group.id}__${b.group.id}`, d: ribbonPath(arcA, arcB), fill: colorOf(a.group) });
    }
  }

  const collapsed = arcs.find((arc) => arc.group.id === collapsedId);
  const named = arcs.filter((arc) => arc.group.id !== collapsedId);
  const leader = [...arcs].sort((x, y) => y.sent - x.sent)[0];

  // O trimestre inteiro: o que atravessa os arcos mais a troca interna do agregado, que não tem fita.
  const grandTotal = total + internalCount;
  const collapsedSent = collapsed === undefined ? internalCount : collapsed.sent + internalCount;
  const collapsedShare = formatRateWithVolume(collapsedSent, grandTotal);
  const collapsedLabel = `${collapsed === undefined ? 'Outras' : collapsed.group.label} (n=${formatInt(collapsedTeams)})`;

  const leaderPhrase = leader === undefined ? '' : `${leader.group.label} lidera com ${formatInt(leader.sent)} enviados`;
  const summary = [
    `Diagrama de corda direcional com as ${formatInt(named.length)} maiores equipes e o grupo Outras, que reúne ${formatInt(collapsedTeams)} equipes menores, ${collapsedShare} dos repasses.`,
    leaderPhrase.length === 0
      ? `${formatInt(internalCount)} repasses internos a Outras não viram fita.`
      : `${leaderPhrase}, e ${formatInt(internalCount)} repasses internos a Outras não viram fita.`,
  ].join(' ');

  return (
    <div
      aria-label={summary}
      className={cn('relative h-full w-full min-w-0', className)}
      role="figure"
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

        {arcs.map((arc) => {
          const mid = (arc.span.start + arc.span.end) / 2;
          const point = polar(R_LABEL, mid);
          const side = point.x - CX;
          const anchor = side > 2 ? 'start' : side < -2 ? 'end' : 'middle';
          const labelX = side > 2 ? point.x + LABEL_GAP : side < -2 ? point.x - LABEL_GAP : point.x;
          const isCollapsed = arc.group.id === collapsedId;
          return (
            <text fontSize={TEXT_SIZE} key={arc.group.id} textAnchor={anchor}>
              <tspan
                className={isCollapsed ? 'tabular-nums font-semibold' : 'font-medium'}
                fill={isCollapsed ? 'var(--text-primary)' : 'var(--text-secondary)'}
                x={fmt(labelX)}
                y={fmt(point.y + NAME_DY)}
              >
                {isCollapsed ? collapsedLabel : arc.group.label}
              </tspan>
              <tspan className="tabular-nums" fill="var(--text-muted)" x={fmt(labelX)} y={fmt(point.y + COUNT_DY)}>
                {`${formatInt(arc.sent)} repasses enviados`}
              </tspan>
            </text>
          );
        })}

        {/* Linha de leitura (ANO-5): o peso do que foi agrupado, com a taxa e o par de volume. */}
        <text fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
          <tspan fill="var(--text-secondary)">{'As '}</tspan>
          <tspan className="tabular-nums" fill="var(--text-secondary)">
            {formatInt(collapsedTeams)}
          </tspan>
          <tspan fill="var(--text-secondary)">{' equipes menores viram Outras: '}</tspan>
          <tspan className="tabular-nums font-bold" fill="var(--text-primary)">
            {collapsedShare}
          </tspan>
          <tspan fill="var(--text-secondary)">{' dos repasses do trimestre.'}</tspan>
        </text>

        {/* Legenda de uma entrada (ROT-4): a amostra diz qual arco é o agregado, e o texto diz o que ele é. */}
        <rect
          fill={NEUTRAL_FILL}
          height={LEGEND_SWATCH_HEIGHT}
          rx={1}
          width={LEGEND_SWATCH_WIDTH}
          x={0}
          y={LEGEND_BASELINE - LEGEND_SWATCH_HEIGHT}
        />
        <text
          className="tabular-nums"
          fill="var(--text-secondary)"
          fontSize={TEXT_SIZE}
          x={LEGEND_TEXT_X}
          y={LEGEND_BASELINE}
        >
          {`${collapsedLabel} reúne ${formatInt(collapsedTeams)} equipes menores`}
        </text>
        {/* Anotação única (ANO-1 e ANO-2): a troca interna do agregado, que o chord não desenha. */}
        <text
          className="tabular-nums"
          fill="var(--text-muted)"
          fontSize={TEXT_SIZE}
          x={ANNOTATION_X}
          y={LEGEND_BASELINE}
        >
          {`${formatInt(internalCount)} repasses dentro de Outras, sem fita`}
        </text>
      </svg>

      <button
        className="absolute right-0 top-0 flex items-center gap-1.5 border-0 bg-transparent p-0 text-xs font-medium text-text-secondary underline underline-offset-2"
        onClick={onShowMatrix}
        type="button"
      >
        <Grid3x3 aria-hidden className="size-3.5 shrink-0" />
        ver como matriz
      </button>
    </div>
  );
}
