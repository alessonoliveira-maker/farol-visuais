import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginLink, type OriginNetwork, type OriginNode } from './data';

/**
 * Arc diagram em SVG puro: as origens ficam num eixo único, em ordem de volume, e cada par que
 * aparece na mesma jornada vira um semicírculo sobre o eixo. A espessura segue a raiz dos leads
 * em comum e o raio do nó segue a raiz do número de pares. Responde quais origens andam juntas,
 * e com que força.
 */
export interface OriginArcDiagramProps {
  readonly data?: OriginNetwork;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo medido do cartão, para a escala sair 1 e os 11 px valerem na tela (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 226;
/** Recuo do primeiro e do último nó: meia largura do maior rótulo mais a folga da borda. */
const AXIS_MARGIN = 44;
const ARC_TOP = 6;
/** Altura reservada aos arcos: o semicírculo mais longo do dado, de 4 passos de 81 px, pede 162 px. */
const ARC_MAX_HEIGHT = 164;
const AXIS_Y = ARC_TOP + ARC_MAX_HEIGHT;
const ARC_MAX_WIDTH = 6;
/** Piso de espessura: o par mais fraco continua um traço que se vê, e não um fio. */
const ARC_MIN_WIDTH = 1.5;
/** Revestimento na cor do cartão por baixo de cada arco, 1 px de cada lado (TOK-4). */
const CASING = 2;
/** Raio do nó de grau 1; o raio cresce com a raiz do grau, então a área segue o grau (GEO-3). */
const NODE_UNIT = 3.5;
const NODE_STROKE = 1.5;
/** Linhas de base do rótulo: duas para o nome, alinhado por baixo, e uma para o volume. */
const NAME_BASELINES = [AXIS_Y + 24, AXIS_Y + 38] as const;
const VOLUME_BASELINE = AXIS_Y + 52;
/** Largura média do caractere em Manrope 500 de 12 px e folga entre rótulos vizinhos (ROT-9). */
const NAME_CHAR_WIDTH = 6.4;
const LABEL_PAD = 8;
/** Caixa de tinta do valor em 11 px (7,92 acima e 1,10 abaixo da linha de base) e largura por caractere. */
const VALUE_CHAR_WIDTH = 5.8;
const VALUE_INK_UP = 8;
const VALUE_INK_DOWN = 2;
const VALUE_CLEARANCE = 1.5;
/** Onde o valor do par tenta ficar: dentro do arco, junto do eixo, ou logo acima do topo dele. */
const VALUE_INSIDE_OFFSET = 12;
const VALUE_ABOVE_GAP = 5;
const SAMPLE_STEP = 3;
/** ACE-6: o arco é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const ARC_STROKE = 'var(--text-muted)';
/** ACE-5: fora do destaque o arco baixa para 0,76, que composto mede 3,58:1 e 3,28:1 (piso em 0,72). */
const DIM_OPACITY = 0.76;
const HIGHLIGHT = 'var(--chart-1)';
const NODE_FILL = 'var(--text-secondary)';
const SURFACE = 'var(--surface-raised)';

/** EST-1b: lista vazia não tem extremos, e a função devolve null em vez de zero. */
function extentOf(values: readonly number[]): readonly [number, number] | null {
  const first = values[0];
  if (first === undefined) return null;
  return values.reduce<readonly [number, number]>(
    ([low, high], value) => [Math.min(low, value), Math.max(high, value)],
    [first, first],
  );
}

/** Espessura pela raiz do peso: quatro vezes mais leads em comum dobram o traço, não o quadruplicam. */
function arcWidth(weight: number, maxWeight: number): number {
  return Math.max(ARC_MAX_WIDTH * Math.sqrt(weight / maxWeight), ARC_MIN_WIDTH);
}

function nodeRadius(degree: number): number {
  return NODE_UNIT * Math.sqrt(degree);
}

/** Meio arco de elipse da esquerda para a direita, no sentido horário: passa por cima do eixo. */
function arcPath(x0: number, x1: number, ry: number): string {
  const rx = (x1 - x0) / 2;
  return `M ${String(x0)},${String(AXIS_Y)} A ${String(rx)},${String(ry)} 0 0 1 ${String(x1)},${String(AXIS_Y)}`;
}

/** Quebra o nome em duas linhas, no espaço mais perto do meio, quando ele passa da largura do passo. */
function wrapLabel(label: string, maxChars: number): readonly string[] {
  if (label.length <= maxChars) return [label];
  const middle = label.length / 2;
  let cut = -1;
  for (let index = 0; index < label.length; index += 1) {
    if (label[index] === ' ' && (cut === -1 || Math.abs(index - middle) < Math.abs(cut - middle))) cut = index;
  }
  return cut === -1 ? [label] : [label.slice(0, cut), label.slice(cut + 1)];
}

/** Um par com as duas pontas já na ordem do eixo. */
interface Pair {
  readonly link: OriginLink;
  readonly left: OriginNode;
  readonly right: OriginNode;
  readonly x0: number;
  readonly x1: number;
}

interface DrawnArc {
  readonly key: string;
  readonly x0: number;
  readonly x1: number;
  readonly ry: number;
  readonly width: number;
  readonly lit: boolean;
  readonly d: string;
  readonly title: string;
}

interface ValueSpot {
  readonly x: number;
  readonly baseline: number;
  readonly halfWidth: number;
}

/** O arco passa pela caixa do texto? Amostra a elipse a cada 3 px e engorda a caixa pela meia espessura. */
function hitsArc(spot: ValueSpot, arc: DrawnArc): boolean {
  const rx = (arc.x1 - arc.x0) / 2;
  const reach = arc.width / 2 + VALUE_CLEARANCE;
  const samples = Math.ceil((Math.PI * Math.max(rx, arc.ry)) / SAMPLE_STEP);
  for (let index = 0; index <= samples; index += 1) {
    const angle = (Math.PI * index) / samples;
    const x = arc.x0 + rx - rx * Math.cos(angle);
    const y = AXIS_Y - arc.ry * Math.sin(angle);
    const insideX = x > spot.x - spot.halfWidth - reach && x < spot.x + spot.halfWidth + reach;
    const insideY = y > spot.baseline - VALUE_INK_UP - reach && y < spot.baseline + VALUE_INK_DOWN + reach;
    if (insideX && insideY) return true;
  }
  return false;
}

/**
 * GEO-4: em marca fina quem sai do lugar é o texto, e ele não leva halo. O valor tenta ficar por
 * dentro do arco e depois acima do topo; sem lugar livre, fica só na linha de leitura.
 */
function placeValue(text: string, arc: DrawnArc, arcs: readonly DrawnArc[]): ValueSpot | null {
  const x = (arc.x0 + arc.x1) / 2;
  const halfWidth = (text.length * VALUE_CHAR_WIDTH) / 2;
  const candidates = [AXIS_Y - VALUE_INSIDE_OFFSET, AXIS_Y - arc.ry - arc.width / 2 - VALUE_ABOVE_GAP];
  for (const baseline of candidates) {
    const spot = { x, baseline, halfWidth };
    if (baseline - VALUE_INK_UP >= 0 && !arcs.some((other) => hitsArc(spot, other))) return spot;
  }
  return null;
}

export default function OriginArcDiagram({ data = defaultData, height, className }: OriginArcDiagramProps) {
  const style = height === undefined ? undefined : { height };
  // A ordem do eixo é do componente: volume, do maior para o menor; empate mantém a ordem do dado.
  const ordered = [...data.nodes].sort((a, b) => b.volume - a.volume);
  const leader = ordered[0];
  const step = ordered.length > 1 ? (VIEW_WIDTH - 2 * AXIS_MARGIN) / (ordered.length - 1) : 0;
  const xOf = new Map(ordered.map((node, index) => [node.id, AXIS_MARGIN + index * step]));
  const byId = new Map(ordered.map((node) => [node.id, node]));
  // Cada par vira esquerda e direita pela posição no eixo; ligação com id desconhecido fica fora.
  const pairs: Pair[] = data.links.flatMap((link) => {
    const xa = xOf.get(link.source);
    const xb = xOf.get(link.target);
    const a = byId.get(link.source);
    const b = byId.get(link.target);
    if (xa === undefined || xb === undefined || !a || !b || xa === xb) return [];
    return [xa < xb ? { link, left: a, right: b, x0: xa, x1: xb } : { link, left: b, right: a, x0: xb, x1: xa }];
  });
  const strongest = pairs.reduce<Pair | null>(
    (top, pair) => (top === null || pair.link.weight > top.link.weight ? pair : top),
    null,
  );
  const weightExtent = extentOf(pairs.map((pair) => pair.link.weight));
  const radiusExtent = extentOf(pairs.map((pair) => (pair.x1 - pair.x0) / 2));

  if (strongest === null || leader === undefined || weightExtent === null || radiusExtent === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum par neste recorte: nenhuma origem apareceu junto de outra na jornada dos leads.</span>
      </div>
    );
  }

  const [minWeight, maxWeight] = weightExtent;
  // Um fator só para todos os arcos: elipses semelhantes aninhadas nunca se cruzam. Com o dado
  // padrão o maior raio cabe na altura, o fator sai 1 e todo arco é semicírculo.
  const flatten = Math.min(1, ARC_MAX_HEIGHT / radiusExtent[1]);
  const degree = new Map<string, number>();
  for (const pair of pairs) {
    for (const id of [pair.left.id, pair.right.id]) degree.set(id, (degree.get(id) ?? 0) + 1);
  }
  const degreeExtent = extentOf([...degree.values()]);
  const period = formatMonthShort(data.month);

  // Os finos primeiro: o mais forte é desenhado por último, e o revestimento dele abre passagem.
  const arcs: DrawnArc[] = [...pairs]
    .sort((a, b) => a.link.weight - b.link.weight)
    .map((pair) => {
      const ry = ((pair.x1 - pair.x0) / 2) * flatten;
      return {
        key: `${pair.left.id}+${pair.right.id}`,
        x0: pair.x0,
        x1: pair.x1,
        ry,
        width: arcWidth(pair.link.weight, maxWeight),
        lit: pair === strongest,
        d: arcPath(pair.x0, pair.x1, ry),
        title: `${pair.left.label} com ${pair.right.inSentence}: ${formatInt(pair.link.weight)} leads com as duas origens`,
      };
    });
  const litArc = arcs.find((arc) => arc.lit);
  const valueText = `${formatInt(strongest.link.weight)} leads`;
  const valueSpot = litArc ? placeValue(valueText, litArc, arcs) : null;

  const maxChars = Math.floor((step - LABEL_PAD) / NAME_CHAR_WIDTH);
  const nodes = ordered.map((node) => {
    const count = degree.get(node.id) ?? 0;
    const lines = wrapLabel(node.label, maxChars);
    return {
      node,
      count,
      lines,
      x: xOf.get(node.id) ?? AXIS_MARGIN,
      lit: node.id === strongest.left.id || node.id === strongest.right.id,
      // Nome alinhado por baixo: o de uma linha fica junto do volume, e a fileira de volumes não dança.
      firstLine: NAME_BASELINES.length - lines.length,
      title: `${node.label}: ${formatInt(node.volume)} leads, em par com ${formatInt(count)} ${count === 1 ? 'origem' : 'origens'}`,
    };
  });

  const pairText = `${strongest.left.inSentence} com ${strongest.right.inSentence}`;
  const summary = `Diagrama de arcos com ${formatInt(ordered.length)} origens de lead em ordem de volume e ${formatInt(arcs.length)} pares na mesma jornada em ${period}. Par mais forte: ${pairText}, ${formatInt(strongest.link.weight)} leads. Maior volume: ${leader.inSentence}, ${formatInt(leader.volume)} leads.`;
  const weightSteps = minWeight === maxWeight ? [maxWeight] : [minWeight, maxWeight];
  const degreeSteps = degreeExtent === null ? [] : degreeExtent[0] === degreeExtent[1] ? [degreeExtent[1]] : [...degreeExtent];

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        Par mais forte: <span className="font-semibold text-text-primary">{pairText}</span>,{' '}
        <span className="font-semibold tabular-nums text-text-primary">{formatInt(strongest.link.weight)}</span> leads com as
        duas origens na jornada de {period}.
      </p>
      <div className="mb-2 flex shrink-0 flex-col text-[0.6875rem] leading-4 text-text-muted">
        <span>Ordem do eixo: volume de leads em {period}, do maior para o menor.</span>
        <div className="flex items-center gap-x-1.5">
          <span>Arco, leads com as duas origens:</span>
          {weightSteps.map((weight) => (
            <span className="flex items-center gap-1" key={weight}>
              <span
                aria-hidden
                className="w-4 shrink-0 rounded-full"
                style={{ height: arcWidth(weight, maxWeight), backgroundColor: ARC_STROKE }}
              />
              <span className="tabular-nums">{formatInt(weight)}</span>
            </span>
          ))}
          <span className="ml-auto">Nó, origens com que faz par:</span>
          {degreeSteps.map((count) => (
            <span className="flex items-center gap-1" key={count}>
              <span
                aria-hidden
                className="shrink-0 rounded-full"
                style={{ width: 2 * nodeRadius(count), height: 2 * nodeRadius(count), backgroundColor: NODE_FILL }}
              />
              <span className="tabular-nums">{formatInt(count)}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {/* xMidYMin: sobrando altura no cartão, o desenho fica colado ao que vem acima, e a escala segue 1. */}
        <svg
          aria-hidden
          className="h-full w-full"
          preserveAspectRatio="xMidYMin meet"
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
        >
          <line
            stroke="var(--line-subtle)"
            strokeWidth={1}
            x1={AXIS_MARGIN}
            x2={VIEW_WIDTH - AXIS_MARGIN}
            y1={AXIS_Y}
            y2={AXIS_Y}
          />
          {arcs.map((arc) => (
            <g key={arc.key}>
              <title>{arc.title}</title>
              <path d={arc.d} fill="none" stroke={SURFACE} strokeWidth={arc.width + CASING} />
              <path
                d={arc.d}
                fill="none"
                stroke={arc.lit ? HIGHLIGHT : ARC_STROKE}
                strokeOpacity={arc.lit ? undefined : DIM_OPACITY}
                strokeWidth={arc.width}
              />
            </g>
          ))}
          {nodes.map(({ node, count, lines, x, lit, firstLine, title }) => (
            <g key={node.id}>
              <title>{title}</title>
              {count > 0 ? (
                <circle cx={x} cy={AXIS_Y} fill={lit ? HIGHLIGHT : NODE_FILL} r={nodeRadius(count)} />
              ) : (
                // Origem sem nenhum par: contorno vazado no raio do grau 1, para o zero não sumir do eixo.
                <circle
                  cx={x}
                  cy={AXIS_Y}
                  fill={SURFACE}
                  r={NODE_UNIT - NODE_STROKE / 2}
                  stroke="var(--text-muted)"
                  strokeWidth={NODE_STROKE}
                />
              )}
              {lines.map((line, index) => (
                <text
                  className="font-sans"
                  fill={lit ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={12}
                  fontWeight={lit ? 600 : 500}
                  key={line}
                  textAnchor="middle"
                  x={x}
                  y={NAME_BASELINES[firstLine + index]}
                >
                  {line}
                </text>
              ))}
              <text
                className="font-display"
                fill="var(--text-muted)"
                fontSize={11}
                fontWeight={500}
                textAnchor="middle"
                x={x}
                y={VOLUME_BASELINE}
              >
                {`${formatInt(node.volume)} leads`}
              </text>
            </g>
          ))}
          {valueSpot ? (
            // TIP-3: o único peso 700 do desenho é o valor do par em destaque.
            <text
              className="font-display"
              fill="var(--text-primary)"
              fontSize={11}
              fontWeight={700}
              textAnchor="middle"
              x={valueSpot.x}
              y={valueSpot.baseline}
            >
              {valueText}
            </text>
          ) : null}
        </svg>
      </div>
    </figure>
  );
}
