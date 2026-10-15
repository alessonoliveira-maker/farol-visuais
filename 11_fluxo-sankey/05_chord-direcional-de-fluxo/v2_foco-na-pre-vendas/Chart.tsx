import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, groups, highlightId as defaultHighlightId, type FlowCell, type FlowGroup } from './data';

/**
 * Chord direcional com UM grupo em foco: a geometria sai da matriz de fluxos, sem biblioteca, e o
 * que muda em relação à versão de contexto é o realce. Só as fitas que TOCAM o grupo de
 * `highlightId` ficam acesas; as demais vão para o neutro de marca não destacada da 17.2.
 *
 * TRÊS DECISÕES, e cada uma resolve um defeito medido.
 *
 * 1. O foco NÃO usa opacidade. A especificação da versão pedia baixar as outras fitas para 15%, e
 *    isso reprova na ACE-5: a opacidade mínima medida das cores de papel vai de 0,63 a 0,77, então
 *    15% sai abaixo do piso de 3:1 da WCAG 1.4.11 nos dois temas. O apagado é o token neutro OPACO --text-muted (17.2, neutro sem valor escrito, 5,21:1 e 5,37:1), e a fita acesa ganha contorno em --text-primary como segundo canal (TOK-9).
 * 2. A fita acesa leva a cor do PARCEIRO, não a do grupo em foco. Com a cor da origem, a fita do
 *    foco para o maior parceiro sai no mesmo tom do arco dele, colada nele, e a metade da roda lê
 *    como meio disco cheio. Pela cor do parceiro cada fita acesa diz para onde vai.
 * 3. A fita é REGIÃO FECHADA (dois arcos e duas quadráticas), nunca traço grosso: traço engorda
 *    para os dois lados, não tem borda própria e some com a escala.
 *
 * A ordem dos grupos vem de `groups` e não muda com o foco: o realce troca cor, nunca posição.
 */
export interface FocusedFunctionChordProps {
  readonly data?: readonly FlowCell[];
  /** O grupo em foco. Só as fitas que tocam nele ficam acesas. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas declarado por número no `meta.json` (666 x 520) e `viewBox` igual ao CORPO medido dessa
 * moldura, 600 x 401,5 px, para a escala do SVG sair 1: os 11 px declarados são 11 px na tela.
 */
const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 401.5;
const CX = 300;
const CY = 200;
const R_OUTER = 148;
const ARC_THICKNESS = 10;
const R_INNER = R_OUTER - ARC_THICKNESS;
/**
 * Âncora do rótulo, fora do arco, e os dois números saíram de MEDIÇÃO, não de estética. O bloco de
 * rótulo tem duas linhas e desce 15,4 px abaixo da âncora, então uma âncora que está fora do arco
 * ainda joga o canto de baixo do texto DE VOLTA para dentro do disco, porque a borda é curva: com
 * `R_OUTER + 10` a CONTRASTE-TEXTO mediu 1% da tinta de um rótulo sobre a marca, a 1,13:1. O
 * afastamento radial de 18 px mais o recuo horizontal de 6 px deixam a caixa mais próxima a 7,8 px
 * do arco, conferido caixa a caixa pela soma POR GLIFO.
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
/** COR-5: contorno na cor do cartão separa arco de fita sem mexer no contraste do preenchimento. */
const SEPARATION_STROKE = 'var(--surface-raised)';
const SEPARATION_WIDTH = 1.5;
/** Neutro de dado SEM valor escrito (17.2): a fita apagada carrega contagem, e mede 5,21:1 e 5,37:1. */
const DIMMED_FILL = 'var(--text-muted)';
/**
 * Segundo canal da fita acesa (TOK-9): contra --text-muted o matiz sozinho mede de 1,00:1 a 1,42:1.
 * O contorno em --text-primary, de 1,25 px visíveis por fora do preenchimento (paintOrder 'stroke'),
 * separa acesa de apagada por luminância. As fitas são regiões largas que só se tocam no pé, então
 * o contorno não cobre vizinha fina (a fita mais fina mede 21,4 px).
 */
const LIT_STROKE = 'var(--text-primary)';
const LIT_STROKE_WIDTH = 2.5;

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

function colorOf(group: FlowGroup): string {
  return CHART_SERIES_COLORS[group.slot - 1] ?? 'var(--chart-1)';
}

interface GroupArc {
  readonly group: FlowGroup;
  readonly span: Arc;
  readonly sent: number;
  readonly received: number;
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
  const received = new Map<string, number>(list.map((group) => [group.id, 0]));
  for (const flow of flows) {
    sent.set(flow.from, (sent.get(flow.from) ?? 0) + flow.count);
    received.set(flow.to, (received.get(flow.to) ?? 0) + flow.count);
  }
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
    arcs.push({
      group,
      span,
      sent: sent.get(group.id) ?? 0,
      received: received.get(group.id) ?? 0,
      d: groupArcPath(span),
      sub,
    });
  }
  return { arcs, counts, total };
}

interface Ribbon {
  readonly key: string;
  readonly d: string;
  readonly fill: string;
  readonly lit: boolean;
}

function emptyBlock(message: string, className: string | undefined) {
  return (
    <div
      className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
      role="status"
    >
      <Filter aria-hidden className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default function FocusedFunctionChord({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: FocusedFunctionChordProps) {
  const layout = computeLayout(groups, data);
  if (layout === null) {
    return emptyBlock('Nenhum repasse neste recorte: não há fluxo entre funções para desenhar.', className);
  }

  const { arcs, counts, total } = layout;
  const focus = arcs.find((arc) => arc.group.id === highlightId);
  if (focus === undefined) {
    return emptyBlock('A função em foco não aparece neste recorte: nenhuma fita para acender.', className);
  }

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
      const partner = a.group.id === focus.group.id ? b.group : b.group.id === focus.group.id ? a.group : undefined;
      ribbons.push({
        key: `${a.group.id}__${b.group.id}`,
        d: ribbonPath(arcA, arcB),
        fill: partner === undefined ? DIMMED_FILL : colorOf(partner),
        lit: partner !== undefined,
      });
    }
  }

  const netSent = focus.sent - focus.received;
  const partners = arcs
    .filter((arc) => arc.group.id !== focus.group.id)
    .map((arc) => ({
      label: arc.group.label,
      out: counts.get(cellKey(focus.group.id, arc.group.id)) ?? 0,
      back: counts.get(cellKey(arc.group.id, focus.group.id)) ?? 0,
    }))
    .sort((x, y) => y.out + y.back - (x.out + x.back));
  const top = partners[0];

  const pairPhrase =
    top === undefined
      ? ''
      : `Com ${top.label} são ${formatInt(top.out)} num sentido e ${formatInt(top.back)} no outro.`;
  const summary = [
    `Diagrama de corda direcional com ${formatInt(arcs.length)} funções e ${formatInt(total)} repasses no terceiro trimestre de 2026, com só as fitas da ${focus.group.label} acesas. Ela envia ${formatInt(focus.sent)} repasses e recebe ${formatInt(focus.received)}.`,
    pairPhrase,
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
        {/* Apagadas primeiro, acesas depois: a fita em foco nunca fica coberta por vizinha. */}
        {ribbons
          .filter((ribbon) => !ribbon.lit)
          .map((ribbon) => (
            <path
              d={ribbon.d}
              fill={ribbon.fill}
              key={ribbon.key}
              paintOrder="stroke"
              stroke={SEPARATION_STROKE}
              strokeWidth={SEPARATION_WIDTH * 2}
            />
          ))}
        {ribbons
          .filter((ribbon) => ribbon.lit)
          .map((ribbon) => (
            <path
              d={ribbon.d}
              fill={ribbon.fill}
              key={ribbon.key}
              paintOrder="stroke"
              stroke={LIT_STROKE}
              strokeWidth={LIT_STROKE_WIDTH}
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
          const isFocus = arc.group.id === focus.group.id;
          return (
            <text fontSize={TEXT_SIZE} key={arc.group.id} textAnchor={anchor}>
              <tspan
                className={isFocus ? 'font-bold' : 'font-medium'}
                fill={isFocus ? 'var(--text-primary)' : 'var(--text-secondary)'}
                x={fmt(labelX)}
                y={fmt(point.y + NAME_DY)}
              >
                {arc.group.label}
              </tspan>
              <tspan className="tabular-nums" fill="var(--text-muted)" x={fmt(labelX)} y={fmt(point.y + COUNT_DY)}>
                {`${formatInt(arc.sent)} repasses enviados`}
              </tspan>
            </text>
          );
        })}

        {/* Linha de leitura (ANO-5): a conclusão calculada do dado, com as duas pontas do saldo. */}
        <text fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
          <tspan className="font-semibold" fill="var(--text-primary)">
            {focus.group.label}
          </tspan>
          <tspan fill="var(--text-secondary)">{' envia '}</tspan>
          <tspan className="tabular-nums" fill="var(--text-secondary)">
            {formatInt(focus.sent)}
          </tspan>
          <tspan fill="var(--text-secondary)">{' repasses e recebe '}</tspan>
          <tspan className="tabular-nums" fill="var(--text-secondary)">
            {formatInt(focus.received)}
          </tspan>
          <tspan fill="var(--text-secondary)">{netSent >= 0 ? ': entrega ' : ': recebe '}</tspan>
          <tspan className="tabular-nums font-semibold" fill="var(--text-primary)">
            {formatInt(Math.abs(netSent))}
          </tspan>
          <tspan fill="var(--text-secondary)">
            {netSent >= 0 ? ' repasses mais do que recebe.' : ' repasses a mais do que envia.'}
          </tspan>
        </text>

        {/* Anotação de ida e volta do par principal (ANO-1 e ANO-2): uma, com nome e as duas contagens. */}
        {top === undefined ? null : (
          <text
            className="tabular-nums"
            fill="var(--text-muted)"
            fontSize={TEXT_SIZE}
            x={0}
            y={ANNOTATION_BASELINE}
          >
            {`${focus.group.label} e ${top.label}: ${formatInt(top.out)} enviados, ${formatInt(top.back)} de volta`}
          </text>
        )}
      </svg>
    </div>
  );
}
