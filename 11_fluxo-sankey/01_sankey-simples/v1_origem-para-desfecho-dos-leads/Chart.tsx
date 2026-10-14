import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Sankey, type SankeyLinkProps, type SankeyNodeProps } from 'recharts';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SankeyFlowData } from './data';

/**
 * Sankey de duas colunas: de onde vêm os leads e em qual desfecho terminam, com a largura de
 * cada faixa proporcional ao volume. Cada origem tem uma cor fixa, herdada por suas ligações;
 * os desfechos ficam em neutro, porque recebem faixas de mais de uma cor.
 */
export interface SankeyOriginToOutcomeProps {
  readonly data?: SankeyFlowData;
  readonly height?: number;
  readonly className?: string;
}

const NODE_WIDTH = 14;
const NODE_PADDING = 20;
/** Margem lateral reservada para nome e contagem fora do nó, dos dois lados. */
const MARGIN = { top: 12, right: 140, bottom: 12, left: 140 } as const;
const LABEL_GAP = 10;
const NEUTRAL_FILL = 'var(--line-strong)';
/** Slots categóricos na ordem 1, 3, 6, 5, 2 (seção 17.2, COR-8), um por origem. */
const ORIGIN_COLOR_BY_NAME: Readonly<Record<string, string>> = {
  'Mídia social': 'var(--chart-1)',
  'Busca paga': 'var(--chart-3)',
  'Rede profissional': 'var(--chart-6)',
  Orgânico: 'var(--chart-5)',
  Evento: 'var(--chart-2)',
};

function colorForOrigin(name: string): string {
  return ORIGIN_COLOR_BY_NAME[name] ?? NEUTRAL_FILL;
}

function renderNode({ x, y, width, height: nodeHeight, payload, index }: SankeyNodeProps): ReactElement {
  const isOrigin = payload.depth === 0;
  const fill = isOrigin ? colorForOrigin(payload.name) : NEUTRAL_FILL;
  const labelX = isOrigin ? x - LABEL_GAP : x + width + LABEL_GAP;
  const textAnchor = isOrigin ? 'end' : 'start';
  const midY = y + nodeHeight / 2;
  return (
    <g key={`node-${String(index)}`}>
      <rect fill={fill} height={nodeHeight} rx={2} width={width} x={x} y={y} />
      <text dominantBaseline="central" textAnchor={textAnchor} x={labelX} y={midY}>
        <tspan className="font-sans" dy={-6} fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={labelX}>
          {payload.name}
        </tspan>
        <tspan className="font-display" dy={14} fill="var(--text-muted)" fontSize={11} x={labelX}>
          {`${formatInt(Number(payload.value))} leads`}
        </tspan>
      </text>
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
  payload,
  index,
}: SankeyLinkProps): ReactElement {
  const path = `M${String(sourceX)},${String(sourceY)} C${String(sourceControlX)},${String(sourceY)} ${String(targetControlX)},${String(targetY)} ${String(targetX)},${String(targetY)}`;
  return <path d={path} fill="none" key={`link-${String(index)}`} stroke={colorForOrigin(payload.source.name)} strokeWidth={linkWidth} />;
}

export default function SankeyOriginToOutcome({
  data = defaultData,
  height,
  className,
}: SankeyOriginToOutcomeProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve lead com origem e desfecho registrados no período.</span>
      </div>
    );
  }

  const totalLeads = data.links.reduce((sum, link) => sum + link.value, 0);
  const sourceIndexes = new Set(data.links.map((link) => link.source));
  const targetIndexes = new Set(data.links.map((link) => link.target));
  const originCount = [...sourceIndexes].filter((index) => !targetIndexes.has(index)).length;
  const outcomeCount = [...targetIndexes].filter((index) => !sourceIndexes.has(index)).length;

  const totalsByTarget = new Map<number, number>();
  for (const link of data.links) {
    totalsByTarget.set(link.target, (totalsByTarget.get(link.target) ?? 0) + link.value);
  }
  let topTarget: { readonly index: number; readonly value: number } | undefined;
  for (const [index, value] of totalsByTarget) {
    if (topTarget === undefined || value > topTarget.value) topTarget = { index, value };
  }
  const topName = topTarget === undefined ? '' : (data.nodes[topTarget.index]?.name ?? '');
  const topValue = topTarget?.value ?? 0;
  const topShare = totalLeads === 0 ? 0 : topValue / totalLeads;

  const readingText =
    topTarget === undefined
      ? ''
      : `${topName} concentra ${formatInt(topValue)} dos ${formatInt(totalLeads)} leads (${formatPercent(topShare, 0)}), a maior parcela entre os desfechos.`;

  const summary = `Diagrama de Sankey ligando ${String(originCount)} origens de leads a ${String(outcomeCount)} desfechos de qualificação, com a largura de cada faixa proporcional ao volume. ${readingText}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {topTarget === undefined ? null : (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{topName}</span> concentra{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(topValue)}</span> dos{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(totalLeads)}</span> leads (
          <span className="kpi-number font-medium text-text-primary">{formatPercent(topShare, 0)}</span>), a maior
          parcela entre os desfechos.
        </p>
      )}
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
            sort
            verticalAlign="justify"
          />
        </ResponsiveContainer>
      </div>
    </div>
  );
}
