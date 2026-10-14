import { Filter, RefreshCw } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DependencyGraph, type IndicatorNode } from './data';

/**
 * Arc diagram dirigido em SVG puro: os indicadores ficam num eixo único e cada dependência de
 * cálculo é um arco lido no sentido horário. Acima do eixo, o indicador da esquerda usa o da
 * direita; abaixo, é usado por ele. Responde quem depende de quem, e onde a dependência fecha ciclo.
 */
export interface IndicatorDependencyArcsProps {
  readonly data?: DependencyGraph;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo medido do cartão, para a escala sair 1 e os 11 px valerem na tela (GEO-18). */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 252;
/** Margem esquerda: abriga a legenda dos dois sentidos, encostada no eixo. */
const LEGEND_WIDTH = 150;
const FIRST_NODE_X = LEGEND_WIDTH + 16;
/** O rótulo corre para a direita do nó, então o último nó guarda a largura de um rótulo. */
const RIGHT_MARGIN = 72;
const TOP_PAD = 6;
const BOTTOM_PAD = 4;
/** Do eixo à saída dos arcos de baixo: a faixa onde moram a haste do nó e o rótulo curto. */
const BAND = 28;
const LABEL_DX = 7;
const LABEL_DY = 18;
/** Passo das linhas da legenda: a tinta de 11 px mede 9 px, e com 14 px sobram 5 px entre linhas (ROT-9). */
const LEGEND_LINE = 14;
/** Piso de altura de cada lado do eixo: as três linhas da legenda daquele lado. */
const LEGEND_BLOCK = 48;
/** Raio do nó de grau 1; o raio cresce com a raiz do grau, então a área segue o grau (GEO-3). */
const NODE_UNIT = 3.5;
const NODE_STROKE = 1.5;
const PORT_RADIUS = 2;
const ARC_WIDTH = 1.5;
const CYCLE_ARC_WIDTH = 2.5;
/** Revestimento na cor do cartão por baixo de cada arco, 1 px de cada lado (TOK-4). */
const CASING = 2;
const ICON_SIZE = 12;
const ICON_GAP = 4;
/** ACE-6: o arco é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const ARC_STROKE = 'var(--text-muted)';
/** ACE-5: fora do destaque o arco baixa para 0,76, que composto mede 3,58:1 e 3,28:1 (piso em 0,72). */
const DIM_OPACITY = 0.76;
const CYCLE_COLOR = 'var(--warning)';
const NODE_FILL = 'var(--text-secondary)';
const SURFACE = 'var(--surface-raised)';

/** EST-1b: lado do eixo sem arco não tem raio maior, e a função devolve null em vez de zero. */
function maxOf(values: readonly number[]): number | null {
  const first = values[0];
  if (first === undefined) return null;
  return values.reduce((top, value) => Math.max(top, value), first);
}

function nodeRadius(degree: number): number {
  return NODE_UNIT * Math.sqrt(degree);
}

/**
 * Altura acima do eixo e fator de achatamento, pelo arco mais longo de cada lado. O fator é um só
 * para todos os arcos: elipses semelhantes aninhadas nunca se cruzam. Lado sem arco, ou de arco
 * baixo, fica com o piso da legenda, e o outro lado achata para caber no que sobra.
 */
function sideHeights(
  above: number | null,
  below: number | null,
  available: number,
): { readonly flatten: number; readonly above: number } {
  // Lado sem arco não pede altura de arco: o raio nulo conta como nada a desenhar, não como medida.
  const up = above === null ? 0 : above;
  const down = below === null ? 0 : below;
  const base = Math.min(1, available / (up + down));
  let flatten = base;
  if (up * base < LEGEND_BLOCK) flatten = Math.min(1, (available - LEGEND_BLOCK) / down);
  else if (down * base < LEGEND_BLOCK) flatten = Math.min(1, (available - LEGEND_BLOCK) / up);
  return { flatten, above: Math.max(up * flatten, LEGEND_BLOCK) };
}

/**
 * Meia elipse no sentido horário, de quem usa para quem é usado. Da esquerda para a direita ela
 * passa por cima do eixo; da direita para a esquerda, por baixo, saindo do pé da haste.
 */
function arcPath(fromX: number, toX: number, axisY: number, lowerY: number, flatten: number): string {
  const y = fromX < toX ? axisY : lowerY;
  const rx = Math.abs(toX - fromX) / 2;
  return `M ${String(fromX)},${String(y)} A ${String(rx)},${String(rx * flatten)} 0 0 1 ${String(toX)},${String(y)}`;
}

/** Existe caminho dirigido de `from` até `to`? Busca em largura sobre a lista de quem cada um usa. */
function reaches(from: string, to: string, uses: ReadonlyMap<string, readonly string[]>): boolean {
  const seen = new Set([from]);
  const queue = [from];
  for (let index = 0; index < queue.length; index += 1) {
    for (const target of uses.get(queue[index] ?? '') ?? []) {
      if (target === to) return true;
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return false;
}

/** Devolve um ciclo dirigido como lista de ids, na ordem em que um usa o outro, ou null se não houver. */
function findCycle(ids: readonly string[], uses: ReadonlyMap<string, readonly string[]>): readonly string[] | null {
  const state = new Map<string, 'open' | 'done'>();
  const path: string[] = [];
  const visit = (id: string): readonly string[] | null => {
    state.set(id, 'open');
    path.push(id);
    for (const target of uses.get(id) ?? []) {
      if (state.get(target) === 'open') return path.slice(path.indexOf(target));
      if (!state.has(target)) {
        const found = visit(target);
        if (found !== null) return found;
      }
    }
    path.pop();
    state.set(id, 'done');
    return null;
  };
  for (const id of ids) {
    if (!state.has(id)) {
      const found = visit(id);
      if (found !== null) return found;
    }
  }
  return null;
}

/** "a previsão usa a meta, que usa a previsão": o ciclo escrito na ordem em que ele se fecha. */
function cycleSentence(cycle: readonly string[], byId: ReadonlyMap<string, IndicatorNode>): string {
  const names = [...cycle, cycle[0] ?? ''].map((id) => byId.get(id)?.inSentence ?? id);
  return names.reduce((text, name, index) => (index === 0 ? name : `${text}${index === 1 ? ' usa ' : ', que usa '}${name}`), '');
}

export default function IndicatorDependencyArcs({ data = defaultData, height, className }: IndicatorDependencyArcsProps) {
  const style = height === undefined ? undefined : { height };
  // A ordem do eixo é a do dado. O passo é derivado: a largura livre dividida pelos vãos entre nós.
  const step = data.nodes.length > 1 ? (VIEW_WIDTH - FIRST_NODE_X - RIGHT_MARGIN) / (data.nodes.length - 1) : 0;
  const xOf = new Map(data.nodes.map((node, index) => [node.id, FIRST_NODE_X + index * step]));
  const byId = new Map(data.nodes.map((node) => [node.id, node]));
  const links = data.links.flatMap((link) => {
    const from = byId.get(link.from);
    const to = byId.get(link.to);
    const fromX = xOf.get(link.from);
    const toX = xOf.get(link.to);
    if (!from || !to || fromX === undefined || toX === undefined || fromX === toX) return [];
    return [{ from, to, fromX, toX, above: fromX < toX, radius: Math.abs(toX - fromX) / 2 }];
  });

  if (links.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma dependência neste recorte: nenhum indicador usa outro indicador no cálculo.</span>
      </div>
    );
  }

  // Altura de cada lado pelo arco mais longo daquele lado: o eixo não fica no meio por padrão.
  const sides = sideHeights(
    maxOf(links.filter((link) => link.above).map((link) => link.radius)),
    maxOf(links.filter((link) => !link.above).map((link) => link.radius)),
    VIEW_HEIGHT - TOP_PAD - BOTTOM_PAD - BAND,
  );
  const axisY = TOP_PAD + sides.above;
  const lowerY = axisY + BAND;

  const uses = new Map<string, string[]>();
  const usedBy = new Map<string, number>();
  for (const link of links) {
    uses.set(link.from.id, [...(uses.get(link.from.id) ?? []), link.to.id]);
    usedBy.set(link.to.id, (usedBy.get(link.to.id) ?? 0) + 1);
  }
  const cycle = findCycle(data.nodes.map((node) => node.id), uses);
  // Toda ligação de onde se volta ao ponto de partida faz parte de um ciclo, e as pontas dela também.
  const isCircular = (link: (typeof links)[number]): boolean => reaches(link.to.id, link.from.id, uses);
  const circularIds = new Set(links.filter(isCircular).flatMap((link) => [link.from.id, link.to.id]));
  const hasCycle = circularIds.size > 0;

  // Os neutros primeiro: os arcos do ciclo são desenhados por último, com o revestimento por cima.
  const arcs = links
    .map((link) => ({
      key: `${link.from.id}>${link.to.id}`,
      circular: isCircular(link),
      d: arcPath(link.fromX, link.toX, axisY, lowerY, sides.flatten),
      text: `${link.from.name} usa ${link.to.inSentence}`,
    }))
    .sort((a, b) => Number(a.circular) - Number(b.circular));
  const circularCount = arcs.filter((arc) => arc.circular).length;
  const otherCount = arcs.length - circularCount;

  const nodes = data.nodes.map((node) => {
    const out = uses.get(node.id)?.length ?? 0;
    const into = usedBy.get(node.id) ?? 0;
    return {
      node,
      x: xOf.get(node.id) ?? FIRST_NODE_X,
      degree: out + into,
      circular: circularIds.has(node.id),
      // A haste desce até a saída dos arcos de baixo só em quem tem arco de baixo.
      hasLower: links.some((link) => !link.above && (link.from.id === node.id || link.to.id === node.id)),
      title: `${node.name}: usa ${formatInt(out)} e entra no cálculo de ${formatInt(into)}`,
    };
  });

  const cycleText = cycle === null ? '' : cycleSentence(cycle, byId);
  const summary = `Diagrama de arcos com ${formatInt(data.nodes.length)} indicadores e ${formatInt(arcs.length)} dependências de cálculo. Arco acima: o da esquerda usa o da direita; abaixo, é usado por ele. ${cycle === null ? 'Nenhuma dependência circular.' : `Dependência circular: ${cycleText}.`}`;
  const legendText = { className: 'font-sans', fontSize: 11, x: 0 } as const;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {/* GEO-17: o ícone fica num contêiner flex, fora do fluxo de texto, para a linha não engordar no preview. */}
      <p aria-hidden className="mb-2 flex shrink-0 items-center gap-1.5 text-xs leading-5 text-text-secondary">
        {cycle === null ? null : <RefreshCw aria-hidden className="size-3.5 shrink-0 text-warning" />}
        {cycle === null ? (
          <span>
            Nenhuma dependência circular: as <span className="tabular-nums">{formatInt(arcs.length)}</span> dependências entre{' '}
            <span className="tabular-nums">{formatInt(data.nodes.length)}</span> indicadores não fecham ciclo.
          </span>
        ) : (
          <span>
            Dependência circular: <span className="font-semibold text-text-primary">{cycleText}</span>
            {otherCount === 0 ? null : otherCount === 1 ? (
              '; a outra dependência não fecha ciclo'
            ) : (
              <>
                ; as outras <span className="tabular-nums">{formatInt(otherCount)}</span> dependências não fecham ciclo
              </>
            )}
            .
          </span>
        )}
      </p>
      <div className="min-h-0 flex-1">
        {/* A lista acessível de ligações mora no próprio SVG: cada arco é um item, com os nomes completos. */}
        <svg
          aria-label="Dependências entre indicadores, com os nomes completos"
          className="h-full w-full"
          preserveAspectRatio="xMidYMin meet"
          role="list"
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
        >
          <g aria-hidden>
            <line stroke="var(--line-subtle)" strokeWidth={1} x1={0} x2={VIEW_WIDTH} y1={axisY} y2={axisY} />
            {/* Legenda dos dois sentidos junto do eixo: cada bloco fica do lado que ele explica. */}
            <text {...legendText} fill="var(--text-secondary)" fontWeight={600} y={axisY - 6 - 2 * LEGEND_LINE}>
              Arco acima do eixo:
            </text>
            <text {...legendText} fill="var(--text-muted)" fontWeight={500} y={axisY - 6 - LEGEND_LINE}>
              o indicador da esquerda
            </text>
            <text {...legendText} fill="var(--text-muted)" fontWeight={500} y={axisY - 6}>
              usa o da direita
            </text>
            <text {...legendText} fill="var(--text-muted)" fontWeight={500} y={axisY + LABEL_DY}>
              {`Ordem: ${data.orderLabel}`}
            </text>
            <text {...legendText} fill="var(--text-secondary)" fontWeight={600} y={lowerY + LEGEND_LINE + 1}>
              Arco abaixo do eixo:
            </text>
            <text {...legendText} fill="var(--text-muted)" fontWeight={500} y={lowerY + 2 * LEGEND_LINE + 1}>
              o indicador da esquerda
            </text>
            <text {...legendText} fill="var(--text-muted)" fontWeight={500} y={lowerY + 3 * LEGEND_LINE + 1}>
              é usado pelo da direita
            </text>
          </g>
          {arcs.map((arc) => (
            <g aria-label={arc.text} key={arc.key} role="listitem">
              <title>{arc.text}</title>
              <path d={arc.d} fill="none" stroke={SURFACE} strokeWidth={(arc.circular ? CYCLE_ARC_WIDTH : ARC_WIDTH) + CASING} />
              <path
                d={arc.d}
                fill="none"
                stroke={arc.circular ? CYCLE_COLOR : ARC_STROKE}
                strokeOpacity={hasCycle && !arc.circular ? DIM_OPACITY : undefined}
                strokeWidth={arc.circular ? CYCLE_ARC_WIDTH : ARC_WIDTH}
              />
            </g>
          ))}
          <g aria-hidden>
            {nodes.map(({ node, x, degree, circular, hasLower, title }) => (
              <g key={node.id}>
                <title>{title}</title>
                {hasLower ? (
                  <>
                    <line stroke={circular ? CYCLE_COLOR : NODE_FILL} strokeWidth={NODE_STROKE} x1={x} x2={x} y1={axisY} y2={lowerY} />
                    <circle cx={x} cy={lowerY} fill={circular ? CYCLE_COLOR : NODE_FILL} r={PORT_RADIUS} />
                  </>
                ) : null}
                {degree > 0 ? (
                  <circle cx={x} cy={axisY} fill={circular ? CYCLE_COLOR : NODE_FILL} r={nodeRadius(degree)} />
                ) : (
                  // Indicador sem nenhuma dependência: contorno vazado, para ele não sumir do eixo.
                  <circle
                    cx={x}
                    cy={axisY}
                    fill={SURFACE}
                    r={NODE_UNIT - NODE_STROKE / 2}
                    stroke="var(--text-muted)"
                    strokeWidth={NODE_STROKE}
                  />
                )}
                {/* ACE-2: o ciclo não depende só da cor. O nó em ciclo leva o ícone e o rótulo em peso 600. */}
                {circular ? (
                  <RefreshCw
                    aria-hidden
                    color={CYCLE_COLOR}
                    size={ICON_SIZE}
                    x={x - ICON_GAP - ICON_SIZE}
                    y={axisY + LABEL_DY - ICON_SIZE + 2}
                  />
                ) : null}
                <text
                  className="font-sans"
                  fill={circular ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={12}
                  fontWeight={circular ? 600 : 500}
                  x={x + LABEL_DX}
                  y={axisY + LABEL_DY}
                >
                  {node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </figure>
  );
}
