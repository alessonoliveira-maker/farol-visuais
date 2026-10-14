import { Filter } from 'lucide-react';
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { campaigns as defaultCampaigns, data as defaultData, type CampaignFunnelStage, type CampaignMeta } from './data';

/**
 * Cada etapa do funil é uma barra horizontal dividida por campanha: as maiores em volume de
 * entrada ganham nome e cor própria, a cauda inteira vira uma única fatia "Outras campanhas" e
 * quem chegou sem UTM fica em "Sem campanha", sempre separado e nunca somado à cauda. O
 * agrupamento é recalculado do array recebido, pelo volume da primeira etapa; a dica nomeia
 * quem compõe a fatia da cauda, porque o rótulo sozinho não diz quais campanhas somaram ali.
 */
export interface CampaignFunnelBarsProps {
  readonly data?: readonly CampaignFunnelStage[];
  readonly campaigns?: readonly CampaignMeta[];
  readonly height?: number;
  readonly className?: string;
}

interface ChartRow {
  readonly stage: string;
  readonly rank0: number;
  readonly rank1: number;
  readonly rank2: number;
  readonly rank3: number;
  readonly rank4: number;
  readonly other: number;
  readonly noCampaign: number;
}

const RANK_KEYS = ['rank0', 'rank1', 'rank2', 'rank3', 'rank4'] as const;
/** Quantas campanhas ganham nome e cor própria; o resto vira a fatia da cauda (COR-4: até 6 cores, uma delas é a cauda). */
const NAMED_COUNT = RANK_KEYS.length;
/** Slots categóricos na ordem 1, 3, 6, 5, 2 (COR-8) para as 5 nomeadas; a cauda fecha a ordem em 4. */
const RANK_FILL: Record<(typeof RANK_KEYS)[number], string> = {
  rank0: 'var(--chart-1)',
  rank1: 'var(--chart-3)',
  rank2: 'var(--chart-6)',
  rank3: 'var(--chart-5)',
  rank4: 'var(--chart-2)',
};
const OTHER_FILL = 'var(--chart-4)';
const NO_CAMPAIGN_STROKE = 'var(--text-muted)';
const NO_CAMPAIGN_LABEL = 'Sem campanha';
const OTHER_LABEL_BASE = 'Outras campanhas';
const MARGIN = { top: 8, right: 68, bottom: 0, left: 0 } as const;
const STAGE_AXIS_WIDTH = 96;
const ROW_STEP = 48;
const BAR_CATEGORY_GAP = '34%';
const VALUE_LABEL_GAP = 8;

function totalOf(row: CampaignFunnelStage): number {
  return Object.values(row.campaigns).reduce((sum, value) => sum + value, 0) + row.noCampaign;
}

export default function CampaignFunnelBars({
  data = defaultData,
  campaigns = defaultCampaigns,
  height,
  className,
}: CampaignFunnelBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma etapa neste recorte: não houve lead no funil do período.</span>
      </div>
    );
  }

  const source = [...data];
  const first = source[0];
  const last = source[source.length - 1];

  const rankedIds = first
    ? [...campaigns].map((item) => item.id).sort((a, b) => (first.campaigns[b] ?? 0) - (first.campaigns[a] ?? 0))
    : [];
  const topIds = rankedIds.slice(0, NAMED_COUNT);
  const otherIds = rankedIds.slice(NAMED_COUNT);
  const nameOf = (id: string) => campaigns.find((item) => item.id === id)?.name ?? id;
  const otherName = otherIds.length > 0 ? `${OTHER_LABEL_BASE} (${otherIds.join(', ')})` : OTHER_LABEL_BASE;
  const topSumOf = (row: CampaignFunnelStage) => topIds.reduce((sum, id) => sum + (row.campaigns[id] ?? 0), 0);
  const otherSumOf = (row: CampaignFunnelStage) => otherIds.reduce((sum, id) => sum + (row.campaigns[id] ?? 0), 0);

  const rows: ChartRow[] = source.map((row) => {
    const ranked = topIds.map((id) => row.campaigns[id] ?? 0);
    return {
      stage: row.stage,
      rank0: ranked[0] ?? 0,
      rank1: ranked[1] ?? 0,
      rank2: ranked[2] ?? 0,
      rank3: ranked[3] ?? 0,
      rank4: ranked[4] ?? 0,
      other: otherSumOf(row),
      noCampaign: row.noCampaign,
    };
  });

  const summary =
    first && last
      ? `Barras horizontais empilhadas com o volume por campanha em ${String(rows.length)} etapas, de ${first.stage} a ${last.stage}. ` +
        `Na entrada, ${String(topIds.length)} campanhas nomeadas somam ${formatInt(topSumOf(first))} de ${formatInt(totalOf(first))} leads; ` +
        `as demais somam ${formatInt(otherSumOf(first))} e sem campanha, ${formatInt(first.noCampaign)}.`
      : 'Barras horizontais empilhadas com o volume por campanha em cada etapa do funil.';

  const reading =
    first && last
      ? `${String(topIds.length)} campanhas nomeadas: ${formatInt(topSumOf(first))} de ${formatInt(totalOf(first))} leads na entrada, ${formatInt(topSumOf(last))} de ${formatInt(totalOf(last))} no ganho.`
      : null;

  const renderTotal = ({ x, y, width, height: barHeight, index }: LabelProps) => {
    const row = index === undefined ? undefined : source[index];
    if (!row) return null;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={700}
        x={Number(x) + Number(width) + VALUE_LABEL_GAP}
        y={Number(y) + Number(barHeight) / 2}
      >
        {formatInt(totalOf(row))}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">{reading}</p> : null}
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {topIds.map((id, i) => {
          const key = RANK_KEYS[i];
          if (!key) return null;
          return (
            <li className="flex items-center gap-1.5 text-xs leading-4" key={id}>
              <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: RANK_FILL[key] }} />
              <span className="text-text-secondary">{nameOf(id)}</span>
            </li>
          );
        })}
        <li className="flex items-center gap-1.5 text-xs leading-4">
          <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: OTHER_FILL }} />
          <span className="text-text-secondary">{OTHER_LABEL_BASE}</span>
        </li>
        <li className="flex items-center gap-1.5 text-xs leading-4">
          <span aria-hidden className="size-2 shrink-0 rounded-sm border-[1.5px] border-text-muted" />
          <span className="text-text-secondary">{NO_CAMPAIGN_LABEL}</span>
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis {...AXIS_PROPS} domain={[0, 'dataMax']} hide type="number" />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="stage"
              interval={0}
              tickLine={false}
              type="category"
              width={STAGE_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="text" valueFormat="int" />}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            {RANK_KEYS.map((key, i) => {
              const id = topIds[i];
              return (
                <Bar
                  dataKey={key}
                  fill={RANK_FILL[key]}
                  isAnimationActive={animate}
                  key={key}
                  maxBarSize={ROW_STEP}
                  name={id ? nameOf(id) : ''}
                  stackId="mix"
                />
              );
            })}
            <Bar dataKey="other" fill={OTHER_FILL} isAnimationActive={animate} maxBarSize={ROW_STEP} name={otherName} stackId="mix" />
            <Bar
              dataKey="noCampaign"
              fill="none"
              isAnimationActive={animate}
              maxBarSize={ROW_STEP}
              name={NO_CAMPAIGN_LABEL}
              radius={[0, 3, 3, 0]}
              stackId="mix"
              stroke={NO_CAMPAIGN_STROKE}
              strokeWidth={1}
            >
              <LabelList content={renderTotal} dataKey="noCampaign" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
