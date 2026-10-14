import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, Rectangle, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  otherCampaignsCount as defaultOtherCount,
  otherCampaignsLeads as defaultOtherLeads,
  type CampaignLeads,
} from './data';

/**
 * Ranking em barras horizontais de leads por campanha: as 15 de maior volume, do maior para o
 * menor, mais uma barra final agregando a cauda. O nome mora dentro da barra quando cabe e sai
 * para depois da ponta quando não cabe, sem nunca cortar; a contagem sempre vai na ponta.
 */
export interface CampaignLeadsBarsProps {
  readonly data?: readonly CampaignLeads[];
  readonly otherCount?: number;
  readonly otherLeads?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Row {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly isOther: boolean;
}

const TOP_FILL = 'var(--chart-1)';
const OTHER_FILL = 'var(--line-strong)';
const INSIDE_TEXT = 'var(--accent-cyan-contrast)';
const OUTSIDE_TEXT = 'var(--text-secondary)';
const MARGIN = { top: 4, right: 84, bottom: 4, left: 4 } as const;
/** Passo alto o bastante para a barra medir 20 px de espessura (ver BAR_MAX): com o nome em
 * Manrope 12 px desenhado dentro da barra, uma espessura próxima da estimativa antiga de 9 px
 * deixava o texto vazar para o cartão por trás (checklist 15 e 20). */
const ROW_STEP = 50;
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX = 20;
const BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const INSIDE_PADDING = 8;
const OUTSIDE_GAP = 8;
const NAME_COUNT_GAP = 10;
/** Estimativa de largura por caractere em Manrope 12 px, com folga proposital. */
const CHAR_WIDTH = 6.6;
const LOCALE = 'pt-BR';

function plotHeight(count: number): number {
  return MARGIN.top + MARGIN.bottom + count * ROW_STEP;
}

function estimateWidth(text: string): number {
  return text.length * CHAR_WIDTH;
}

function leadsLabel(value: number): string {
  return `${formatInt(value)} ${value === 1 ? 'lead' : 'leads'}`;
}

/** Top 15 do maior para o menor; a cauda agregada entra depois, fixa, fora da ordenação. */
function buildRows(data: readonly CampaignLeads[], otherCount: number, otherLeads: number): Row[] {
  const top = [...data]
    .sort((a, b) => b.leads - a.leads || a.name.localeCompare(b.name, LOCALE))
    .map((item) => ({ ...item, isOther: false }));
  if (otherCount <= 0) return top;
  return [...top, { id: 'outras-campanhas', name: `Outras ${String(otherCount)} campanhas`, leads: otherLeads, isOther: true }];
}

export default function CampaignLeadsBars({
  data = defaultData,
  otherCount = defaultOtherCount,
  otherLeads = defaultOtherLeads,
  height,
  className,
}: CampaignLeadsBarsProps) {
  const animate = useAnimateOnce();
  const rows = buildRows(data, otherCount, otherLeads);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte: não houve lead atribuído a campanha no período.</span>
      </div>
    );
  }

  const leader = rows.find((row) => !row.isOther);
  const tail = rows.find((row) => row.isOther);

  const renderBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[index];
    return (
      <Rectangle
        fill={row?.isOther ? OTHER_FILL : TOP_FILL}
        height={Number(barHeight)}
        radius={BAR_RADIUS}
        width={Number(width)}
        x={Number(x)}
        y={Number(y)}
      />
    );
  };

  const renderRowLabel = ({ x, y, width, height: barHeight }: LabelProps, row: Row | undefined): ReactElement | null => {
    if (!row) return null;
    const barX = Number(x);
    const barW = Number(width);
    const centerY = Number(y) + Number(barHeight) / 2;
    const nameWidth = estimateWidth(row.name);
    const fitsInside = !row.isOther && barW - INSIDE_PADDING * 2 >= nameWidth;
    if (fitsInside) {
      return (
        <g>
          <text className="font-sans" dominantBaseline="central" fill={INSIDE_TEXT} fontSize={12} fontWeight={500} x={barX + INSIDE_PADDING} y={centerY}>
            {row.name}
          </text>
          <text className="font-display" dominantBaseline="central" fill={OUTSIDE_TEXT} fontSize={12} fontWeight={500} x={barX + barW + OUTSIDE_GAP} y={centerY}>
            {leadsLabel(row.leads)}
          </text>
        </g>
      );
    }
    const nameX = barX + barW + OUTSIDE_GAP;
    return (
      <g>
        <text className="font-sans" dominantBaseline="central" fill={OUTSIDE_TEXT} fontSize={12} fontWeight={500} x={nameX} y={centerY}>
          {row.name}
        </text>
        <text
          className="font-display"
          dominantBaseline="central"
          fill={OUTSIDE_TEXT}
          fontSize={12}
          fontWeight={500}
          x={nameX + nameWidth + NAME_COUNT_GAP}
          y={centerY}
        >
          {leadsLabel(row.leads)}
        </text>
      </g>
    );
  };

  const summary = [
    `Gráfico de barras horizontais com leads por campanha, as 15 de maior volume do mês mais uma barra com a cauda agregada.`,
    leader ? `Lidera ${leader.name}, com ${leadsLabel(leader.leads)}.` : '',
    tail ? `${tail.name} somam ${leadsLabel(tail.leads)}, fora da ordenação, na última posição.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="shrink-0" style={{ height: plotHeight(rows.length) }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis dataKey="leads" domain={[0, 'dataMax']} hide type="number" />
            <YAxis dataKey="id" hide type="category" />
            <Bar dataKey="leads" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar}>
              <LabelList
                content={(props: LabelProps) => renderRowLabel(props, props.index === undefined ? undefined : rows[props.index])}
                dataKey="leads"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
