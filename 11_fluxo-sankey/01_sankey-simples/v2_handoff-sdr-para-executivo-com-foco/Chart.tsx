import { Filter } from 'lucide-react';
import { type ReactElement, useState } from 'react';
import { ResponsiveContainer, Sankey, type SankeyElementType, type SankeyLinkProps, type SankeyNodeProps } from 'recharts';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type FlowLink, type HandoffFlowData } from './data';

/**
 * Sankey de duas colunas com um nó aceso: para quais executivos cada SDR entregou as agendas do
 * mês. A largura da faixa é o valor, e as faixas que saem do nó em foco recebem cor cheia
 * enquanto todo o resto fica numa massa neutra.
 *
 * DUAS COLISÕES ENTRE A ESPECIFICAÇÃO DA VERSÃO E O CONTRATO, resolvidas pelo contrato.
 *
 * 1. A especificação pede as faixas fora de foco "a 15%". A ACE-5 mede o que a opacidade faz:
 *    `fillOpacity` compõe a cor da marca com a do cartão, e o resultado precisa continuar acima
 *    de 3:1 pela WCAG 1.4.11. A 15% sobra algo entre 1,0 e 1,2:1, isto é, a faixa deixa de
 *    existir na tela, e aqui isso apagaria 140 das 187 agendas, ou 75% da população. O
 *    apagamento é feito por TOKEN: `--text-muted`, que mede 5,21:1 no escuro e 5,37:1 no claro
 *    contra `--surface-raised`, acima do piso. Não se usa `--line-strong`, o neutro que a seção
 *    17.2 nomeia para marca não destacada, porque ele mede 1,79:1 e 1,83:1, e três quartos da
 *    população abaixo do piso leriam como dado faltando.
 *
 * 2. A especificação pede "nome do nó em foco em peso 700". A TIP-3 dá 700 a no máximo dois
 *    elementos, o nome e o valor do destaque: é exatamente o que este arquivo gasta, no nome e
 *    na contagem do SDR aceso. A linha de leitura fica em 600.
 *
 * POR QUE O CONTORNO DE SUPERFÍCIE NAS FAIXAS ACESAS, e não só estética: medido nesta peça,
 * `--chart-1` contra `--text-muted` dá 1,82:1 no escuro e 1,12:1 no claro. É a armadilha TOK-4,
 * marca contra marca, e no cruzamento a faixa acesa se fundiria na massa neutra no tema claro.
 * O contorno `--surface-raised` mede 9,50:1 e 6,00:1 contra `--chart-1` e devolve a borda sem
 * mexer no contraste do preenchimento, que é a saída que a COR-5 autoriza.
 */
export interface SdrHandoffSankeyProps {
  readonly data?: HandoffFlowData;
  /** Nome do nó aceso. Vazio deixa tudo em neutro, que é a leitura honesta de "nada em foco". */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const NODE_WIDTH = 14;
const NODE_PADDING = 12;
/**
 * Margem lateral reservada para nome, contagem e anotação fora do nó. Os dois números saíram de
 * MEDIÇÃO no primeiro render, não de conta: a estimativa por avanço médio de caractere deu 57 px
 * para "42 agendas" e a tinta real mede 62,6 px, cerca de 9% mais, e a primeira tentativa com 70
 * e 150 px fez o render acusar conteúdo fora do corpo nos dois lados.
 */
const MARGIN = { top: 10, right: 170, bottom: 10, left: 80 } as const;
const LABEL_GAP = 10;
const LABEL_LINE_HEIGHT = 13;
/** Piso de agendas por ligação. Abaixo dele a faixa vira fio, e o modelo manda agregar. */
const SMALL_LINK_FLOOR = 3;
const OTHERS_NAME = 'Outros executivos';
const FOCUS_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--text-muted)';
/** Contorno na cor do cartão: separa faixas coladas e faixa de nó sem tocar no preenchimento. */
const EDGE_STROKE = 'var(--surface-raised)';
const EDGE_STROKE_WIDTH = 1;

interface AggregatedFlow {
  readonly nodes: readonly { readonly name: string }[];
  readonly links: readonly FlowLink[];
  /** Quantos nós de destino foram recolhidos no balde, para o balde declarar o que contém. */
  readonly foldedTargets: number;
}

/**
 * Recolhe em "Outros executivos" toda ligação abaixo do piso e descarta o nó de destino que
 * ficou sem nenhuma ligação. A soma total não muda: cada agenda recolhida continua saindo do
 * mesmo SDR e continua chegando à coluna de destino, só muda de nó.
 */
function aggregateSmallFlows(source: HandoffFlowData, floor: number): AggregatedFlow {
  const keptLinks = source.links.filter((link) => link.value >= floor);
  const foldedLinks = source.links.filter((link) => link.value < floor);
  if (foldedLinks.length === 0) {
    return { nodes: [...source.nodes], links: [...source.links], foldedTargets: 0 };
  }

  const survivingTargets = new Set(keptLinks.map((link) => link.target));
  const foldedTargets = new Set(foldedLinks.map((link) => link.target).filter((index) => !survivingTargets.has(index)));

  const nextIndexByOld = new Map<number, number>();
  const nodes: { readonly name: string }[] = [];
  source.nodes.forEach((node, oldIndex) => {
    if (foldedTargets.has(oldIndex)) return;
    nextIndexByOld.set(oldIndex, nodes.length);
    nodes.push(node);
  });
  const othersIndex = nodes.length;
  nodes.push({ name: OTHERS_NAME });

  const links: FlowLink[] = [];
  const bucketBySource = new Map<number, number>();
  for (const link of source.links) {
    const newSource = nextIndexByOld.get(link.source);
    if (newSource === undefined) continue;
    const keptTarget = link.value >= floor ? nextIndexByOld.get(link.target) : undefined;
    if (keptTarget !== undefined) {
      links.push({ source: newSource, target: keptTarget, value: link.value });
      continue;
    }
    bucketBySource.set(newSource, (bucketBySource.get(newSource) ?? 0) + link.value);
  }
  for (const [newSource, value] of bucketBySource) {
    links.push({ source: newSource, target: othersIndex, value });
  }

  return { nodes, links, foldedTargets: foldedTargets.size };
}

/** Soma das agendas de uma lista de ligações. Semente 0 é a definição de soma vazia, não ausência. */
function totalOf(links: readonly FlowLink[]): number {
  return links.reduce((sum, link) => sum + link.value, 0);
}

/**
 * A maior ligação da lista, ou `null` quando a lista está vazia. O `null` não é zelo: sem
 * ligação não existe "maior saída", e devolver a primeira posição ou um valor 0 inventaria uma
 * anotação que o desenho não tem (EST-1b).
 */
function largestLink(links: readonly FlowLink[]): FlowLink | null {
  let best: FlowLink | null = null;
  for (const link of links) {
    if (best === null || link.value > best.value) best = link;
  }
  return best;
}

/** Fração de um valor sobre a base, ou `null` quando a base não existe. Nunca 0. */
function shareOf(part: number, base: number): number | null {
  return base > 0 ? part / base : null;
}

/** Um `<text>` de várias linhas, centrado no nó, com as linhas distribuídas em volta do centro. */
function renderLabelLines(
  lines: readonly { readonly text: string; readonly fill: string; readonly size: number; readonly weight: number; readonly display: boolean }[],
  x: number,
  y: number,
  anchor: 'start' | 'end',
): ReactElement {
  const firstDy = (-(lines.length - 1) * LABEL_LINE_HEIGHT) / 2;
  return (
    <text dominantBaseline="central" textAnchor={anchor} x={x} y={y}>
      {lines.map((line, position) => (
        <tspan
          className={line.display ? 'font-display' : 'font-sans'}
          dy={position === 0 ? firstDy : LABEL_LINE_HEIGHT}
          fill={line.fill}
          fontSize={line.size}
          fontWeight={line.weight}
          key={line.text}
          x={x}
        >
          {line.text}
        </tspan>
      ))}
    </text>
  );
}

export default function SdrHandoffSankey({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: SdrHandoffSankeyProps) {
  /**
   * O índice da ligação sob o cursor. O preview não grava hover (seção 13), então isto não muda
   * o retrato: existe porque no Farol a página precisa saber qual par foi apontado, e o
   * `onMouseEnter` do Sankey entrega nó e ligação no mesmo callback.
   */
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const style = height === undefined ? undefined : { height };

  if (data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve agenda realizada com SDR e executivo registrados no período.</span>
      </div>
    );
  }

  const flow = aggregateSmallFlows(data, SMALL_LINK_FLOOR);
  const total = totalOf(flow.links);
  const focusIndex = flow.nodes.findIndex((node) => node.name === highlightId);
  const focusLinks = flow.links.filter((link) => link.source === focusIndex);
  const focusTotal = totalOf(focusLinks);
  const topLink = largestLink(focusLinks);
  const topShare = topLink === null ? null : shareOf(topLink.value, focusTotal);
  const focusName = flow.nodes[focusIndex]?.name ?? '';
  const topName = topLink === null ? '' : (flow.nodes[topLink.target]?.name ?? '');

  const focusedLinkIndexes = new Set<number>();
  flow.links.forEach((link, index) => {
    if (link.source === focusIndex) focusedLinkIndexes.add(index);
  });

  const sdrCount = new Set(flow.links.map((link) => link.source)).size;
  const targetCount = new Set(flow.links.map((link) => link.target)).size;
  const othersIndex = flow.nodes.findIndex((node) => node.name === OTHERS_NAME);

  const summary =
    topLink === null || topShare === null
      ? `Diagrama de Sankey do handoff de ${formatInt(total)} agendas de ${String(sdrCount)} SDRs para ${String(targetCount)} destinos de executivo, sem nenhum SDR em foco: todas as faixas ficam em neutro.`
      : `Diagrama de Sankey do handoff de ${formatInt(total)} agendas de ${String(sdrCount)} SDRs para ${String(targetCount)} destinos de executivo, com o ${focusName} em foco: ele entregou ${formatInt(focusTotal)} agendas, e ${formatInt(topLink.value)} delas, ${formatPercent(topShare, 0)} do que saiu dele, foram para o ${topName}. As demais faixas ficam em neutro.`;

  // As faixas acesas são pintadas por último (REC-13): o Sankey pinta na ordem do array e
  // reordenar o array mexeria na ordem vertical do dado. Cada ligação acesa registra o caminho
  // aqui, e a última ligação do array desenha todas por cima das neutras.
  const focusedPaths: { readonly index: number; readonly d: string }[] = [];

  function renderNode({ x, y, width, height: nodeHeight, payload, index }: SankeyNodeProps): ReactElement {
    const isSource = payload.depth === 0;
    const isFocus = index === focusIndex;
    const labelX = isSource ? x - LABEL_GAP : x + width + LABEL_GAP;
    const lines = [
      {
        text: payload.name,
        fill: isFocus ? 'var(--text-primary)' : 'var(--text-secondary)',
        size: 12,
        weight: isFocus ? 700 : 500,
        display: false,
      },
      {
        text: `${formatInt(Number(payload.value))} agendas`,
        fill: isFocus ? 'var(--text-primary)' : 'var(--text-muted)',
        size: 11,
        weight: isFocus ? 700 : 400,
        display: true,
      },
    ];
    // Anotação 1: a maior saída do foco, escrita na ponta que a recebe (ANO-1, ROT-11).
    if (topLink !== null && index === topLink.target) {
      lines.push({
        text: `${formatInt(topLink.value)} vieram do ${focusName}`,
        fill: 'var(--text-muted)',
        size: 11,
        weight: 500,
        display: true,
      });
    }
    // Anotação 2: o que o balde contém, porque agregação sem critério declarado é número sem dono.
    if (index === othersIndex && flow.foldedTargets > 0) {
      const noteStyle = { fill: 'var(--text-muted)', size: 11, weight: 500, display: true } as const;
      lines.push({ ...noteStyle, text: `${formatInt(flow.foldedTargets)} execs., menos de ${formatInt(SMALL_LINK_FLOOR)} por SDR` });

    }
    return (
      <g key={`node-${String(index)}`}>
        <rect
          fill={isFocus ? FOCUS_FILL : NEUTRAL_FILL}
          height={nodeHeight}
          rx={2}
          stroke={EDGE_STROKE}
          strokeWidth={EDGE_STROKE_WIDTH}
          width={width}
          x={x}
          y={y}
        />
        {renderLabelLines(lines, labelX, y + nodeHeight / 2, isSource ? 'end' : 'start')}
      </g>
    );
  }

  function renderLink({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    targetControlX,
    linkWidth,
    index,
  }: SankeyLinkProps): ReactElement {
    const isFocused = focusedLinkIndexes.has(index);
    const half = linkWidth / 2;
    // Faixa PREENCHIDA, e não um traço grosso: só a forma fechada aceita contorno próprio, que é
    // o que separa faixa acesa de faixa neutra no cruzamento sem baixar opacidade.
    const path = [
      `M${String(sourceX)},${String(sourceY - half)}`,
      `C${String(sourceControlX)},${String(sourceY - half)} ${String(targetControlX)},${String(targetY - half)} ${String(targetX)},${String(targetY - half)}`,
      `L${String(targetX)},${String(targetY + half)}`,
      `C${String(targetControlX)},${String(targetY + half)} ${String(sourceControlX)},${String(sourceY + half)} ${String(sourceX)},${String(sourceY + half)}`,
      'Z',
    ].join(' ');
    if (isFocused) focusedPaths.push({ index, d: path });
    const isLast = index === flow.links.length - 1;
    const outlined = hoveredLink === index;
    return (
      <g key={`link-${String(index)}`}>
        {isFocused ? null : (
          <path
            d={path}
            fill={NEUTRAL_FILL}
            stroke={outlined ? EDGE_STROKE : 'none'}
            strokeWidth={outlined ? EDGE_STROKE_WIDTH : 0}
          />
        )}
        {isLast
          ? focusedPaths.map((item) => (
              <path
                d={item.d}
                fill={FOCUS_FILL}
                key={`focus-${String(item.index)}`}
                onMouseEnter={() => {
                  setHoveredLink(item.index);
                }}
                stroke={EDGE_STROKE}
                strokeWidth={EDGE_STROKE_WIDTH}
              />
            ))
          : null}
      </g>
    );
  }

  function handleEnter(item: SankeyNodeProps | SankeyLinkProps, type: SankeyElementType): void {
    setHoveredLink(type === 'link' ? item.index : null);
  }

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 h-5 shrink-0 text-xs text-text-secondary">
        {topLink === null || topShare === null ? (
          <span>Nenhum SDR em foco: todas as faixas ficam em neutro.</span>
        ) : (
          <span>
            O <span className="font-semibold text-text-primary">{focusName}</span> entregou{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(focusTotal)}</span> das{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(total)}</span> agendas, e{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(topLink.value)}</span> delas (
            <span className="kpi-number font-medium text-text-primary">{formatPercent(topShare, 0)}</span>) foram para o{' '}
            {topName}.
          </span>
        )}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Sankey
            accessibilityLayer={false}
            align="justify"
            data={{ nodes: [...flow.nodes], links: [...flow.links] }}
            iterations={32}
            link={renderLink}
            margin={MARGIN}
            node={renderNode}
            nodePadding={NODE_PADDING}
            nodeWidth={NODE_WIDTH}
            onMouseEnter={handleEnter}
            onMouseLeave={() => {
              setHoveredLink(null);
            }}
            // A ordem vertical é a ordem do dado: SDR 1 a 5 e Executivo A a F, com o balde por
            // último. Com o sort do Recharts os rótulos sairiam numa ordem que nada no cartão
            // declara, que é a armadilha GEO-12.
            sort={false}
            verticalAlign="justify"
          />
        </ResponsiveContainer>
      </div>
    </div>
  );
}
