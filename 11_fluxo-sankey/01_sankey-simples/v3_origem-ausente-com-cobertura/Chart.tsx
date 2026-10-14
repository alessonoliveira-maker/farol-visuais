import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Sankey, type SankeyLinkProps, type SankeyNodeProps } from 'recharts';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CoverageFlowData, type FlowNode } from './data';

/**
 * Sankey de duas colunas em que a AUSÊNCIA de origem é um nó, e não um descarte silencioso: os
 * leads que chegaram sem origem registrada seguem no diagrama, com desfecho e tudo, e a
 * cobertura do campo fica escrita na linha de leitura. É a DAD-2 aplicada a um eixo categórico:
 * ausência não vira zero, e também não vira "Outros".
 *
 * TRÊS DECISÕES DE TOKEN, MEDIDAS, porque nenhuma delas se resolve por gosto.
 *
 * 1. O nó de ausência não tem preenchimento: quem carrega a marca é um contorno `--text-muted`
 *    de 1,5 px. É o segundo canal que a ACE-2 pede (forma vazada mais a palavra escrita), e o
 *    par que a ACE-8 aprova para contorno de ausência.
 *
 * 2. As faixas que saem da ausência e os nós de desfecho ficam em `--text-muted`, que mede
 *    5,21:1 no escuro e 5,37:1 no claro contra `--surface-raised`, e NÃO em `--line-strong`, o
 *    neutro que a seção 17.2 nomeia para marca não destacada: ele mede 1,79:1 e 1,83:1, abaixo
 *    do piso de 3:1 da ACE-3, e aqui carregaria 174 leads mais os quatro nós de desfecho, isto
 *    é, o destino de toda a população. Marca desse peso abaixo do piso lê como dado faltando.
 *
 * 3. Toda faixa leva contorno `--surface-raised` de 1 px, que é a saída da COR-5 e da TOK-4:
 *    as categóricas são calibradas contra o cartão e não umas contra as outras, então no
 *    cruzamento duas faixas de cores diferentes se fundiriam (o pior par mede 1,03:1 no claro).
 *    O contorno separa sem mexer no contraste do preenchimento, que é o que a opacidade faria.
 */
export interface OriginCoverageSankeyProps {
  readonly data?: CoverageFlowData;
  readonly height?: number;
  readonly className?: string;
}

const NODE_WIDTH = 14;
const NODE_PADDING = 16;
/** Margem lateral reservada para nome e contagem fora do nó; a esquerda cabe "Sem origem registrada". */
const MARGIN = { top: 10, right: 90, bottom: 10, left: 150 } as const;
const LABEL_GAP = 10;
const LABEL_LINE_HEIGHT = 13;
const NEUTRAL_FILL = 'var(--text-muted)';
const ABSENCE_STROKE = 'var(--text-muted)';
const ABSENCE_STROKE_WIDTH = 1.5;
const EDGE_STROKE = 'var(--surface-raised)';
const EDGE_STROKE_WIDTH = 1;

/** Cor da origem pelo slot fixo do dado (COR-3), nunca pelo índice da lista ordenada. */
function fillForNode(node: FlowNode | undefined): string {
  if (node === undefined || node.kind !== 'origin' || node.slot === undefined) return NEUTRAL_FILL;
  return CHART_SERIES_COLORS[node.slot - 1] ?? NEUTRAL_FILL;
}

/** Soma dos leads de uma lista de ligações. Semente 0 é a definição de soma vazia, não ausência. */
function totalOf(links: readonly { readonly value: number }[]): number {
  return links.reduce((sum, link) => sum + link.value, 0);
}

/**
 * Fração de um valor sobre a base, ou `null` quando a base não existe. Devolver 0 aqui diria
 * "cobertura de zero por cento" para um recorte sem lead nenhum, que é medida inventada (EST-1b).
 */
function shareOf(part: number, base: number): number | null {
  return base > 0 ? part / base : null;
}

/** Um `<text>` de várias linhas, centrado no nó, com as linhas distribuídas em volta do centro. */
function renderLabelLines(
  lines: readonly { readonly text: string; readonly fill: string; readonly size: number; readonly display: boolean }[],
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
          fontWeight={line.display ? 400 : 500}
          key={line.text}
          x={x}
        >
          {line.text}
        </tspan>
      ))}
    </text>
  );
}

export default function OriginCoverageSankey({ data = defaultData, height, className }: OriginCoverageSankeyProps) {
  const style = height === undefined ? undefined : { height };

  if (data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve lead com desfecho de qualificação registrado no período.</span>
      </div>
    );
  }

  const total = totalOf(data.links);
  const absenceIndexes = new Set(
    data.nodes.map((node, index) => (node.kind === 'absence' ? index : -1)).filter((index) => index >= 0),
  );
  const absenceTotal = totalOf(data.links.filter((link) => absenceIndexes.has(link.source)));
  const withOrigin = total - absenceTotal;
  const coverage = shareOf(withOrigin, total);
  const originCount = data.nodes.filter((node) => node.kind === 'origin').length;
  const outcomeCount = data.nodes.filter((node) => node.kind === 'outcome').length;

  const summary =
    coverage === null
      ? `Diagrama de Sankey ligando ${String(originCount)} origens de leads a ${String(outcomeCount)} desfechos de qualificação, com um nó neutro e vazado para quem chegou sem origem registrada. Sem lead no recorte, a cobertura do campo de origem fica sem base para ser calculada.`
      : `Diagrama de Sankey ligando ${String(originCount)} origens de leads a ${String(outcomeCount)} desfechos de qualificação. De ${formatInt(total)} leads, ${formatInt(withOrigin)} chegaram com origem registrada, ou ${formatPercent(coverage, 0)}; os outros ${formatInt(absenceTotal)} seguem no diagrama como nó neutro e vazado, por último na coluna.`;

  function renderNode({ x, y, width, height: nodeHeight, payload, index }: SankeyNodeProps): ReactElement {
    const node = data.nodes[index];
    const isSource = node?.kind === 'origin' || node?.kind === 'absence';
    const isAbsence = node?.kind === 'absence';
    const labelX = isSource ? x - LABEL_GAP : x + width + LABEL_GAP;
    const lines = [
      { text: payload.name, fill: 'var(--text-secondary)', size: 12, display: false },
      { text: `${formatInt(Number(payload.value))} leads`, fill: 'var(--text-muted)', size: 11, display: true },
    ];
    return (
      <g key={`node-${String(index)}`}>
        <rect
          // O nó de ausência é vazado de propósito: o contorno é a marca, e o vazio é a leitura.
          fill={isAbsence ? 'none' : fillForNode(node)}
          height={nodeHeight}
          rx={2}
          stroke={isAbsence ? ABSENCE_STROKE : 'none'}
          strokeWidth={isAbsence ? ABSENCE_STROKE_WIDTH : 0}
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
    const half = linkWidth / 2;
    // Faixa PREENCHIDA, e não traço grosso: só a forma fechada aceita contorno próprio.
    const path = [
      `M${String(sourceX)},${String(sourceY - half)}`,
      `C${String(sourceControlX)},${String(sourceY - half)} ${String(targetControlX)},${String(targetY - half)} ${String(targetX)},${String(targetY - half)}`,
      `L${String(targetX)},${String(targetY + half)}`,
      `C${String(targetControlX)},${String(targetY + half)} ${String(sourceControlX)},${String(sourceY + half)} ${String(sourceX)},${String(sourceY + half)}`,
      'Z',
    ].join(' ');
    return (
      <path
        d={path}
        // A cor herda da ORIGEM da ligação, resolvida pelo índice do próprio dado: o nome do nó
        // computado serviria, mas índice não depende de dois rótulos nunca colidirem.
        fill={fillForNode(data.nodes[data.links[index]?.source ?? -1])}
        key={`link-${String(index)}`}
        stroke={EDGE_STROKE}
        strokeWidth={EDGE_STROKE_WIDTH}
      />
    );
  }

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 h-5 shrink-0 text-xs text-text-secondary">
        {coverage === null ? (
          <span>Sem lead no recorte: a cobertura do campo de origem fica sem base para ser calculada.</span>
        ) : (
          <span>
            De <span className="kpi-number font-medium text-text-primary">{formatInt(total)}</span> leads,{' '}
            <span className="kpi-number font-semibold text-text-primary">{formatInt(withOrigin)}</span> chegaram com origem
            registrada, ou <span className="kpi-number font-semibold text-text-primary">{formatPercent(coverage, 0)}</span>;
            os outros <span className="kpi-number font-medium text-text-primary">{formatInt(absenceTotal)}</span> seguem no
            diagrama como nó vazado.
          </span>
        )}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Sankey
            accessibilityLayer={false}
            align="justify"
            data={{ nodes: [...data.nodes], links: [...data.links] }}
            iterations={32}
            link={renderLink}
            margin={MARGIN}
            node={renderNode}
            nodePadding={NODE_PADDING}
            nodeWidth={NODE_WIDTH}
            // Sem isto o Recharts reordena o nó pela posição relaxada, e o nó de ausência subiria
            // na coluna pelo tamanho. Com sort={false} a ordem vertical é a ordem do dado, e a
            // ausência fica onde a DAD-2 manda: visível, nomeada e por último.
            sort={false}
            verticalAlign="justify"
          />
        </ResponsiveContainer>
      </div>
    </div>
  );
}
