import { Filter } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightKey as defaultHighlightKey, type FunnelOriginStage } from './data';

/**
 * O mesmo funil de origem em 100%: cada etapa vira uma pilha inteira, e a leitura passa a ser
 * "que mistura" em vez de "quanto". A origem em destaque fica em cor cheia; as demais atenuam
 * para não competir. A dica continua trazendo o valor absoluto de cada origem, porque o eixo em
 * percentual esconde a queda de volume entre etapas, e o total de leads da etapa vai escrito na
 * ponta de cada barra para essa queda não passar despercebida.
 */
export interface FunnelOriginShareBarsProps {
  readonly data?: readonly FunnelOriginStage[];
  readonly highlightKey?: Exclude<keyof FunnelOriginStage, 'stage'>;
  readonly height?: number;
  readonly className?: string;
}

type OriginKey = Exclude<keyof FunnelOriginStage, 'stage'>;

const COLOR_KEYS = [
  'referral',
  'socialMedia',
  'paidSearch',
  'professionalNetwork',
  'organic',
  'event',
] as const satisfies readonly OriginKey[];

const ALL_KEYS = [...COLOR_KEYS, 'noOrigin'] as const satisfies readonly OriginKey[];

/** Slots categóricos na ordem 1, 3, 6, 5, 2, 4 (COR-8). */
const ORIGIN_FILL: Record<(typeof COLOR_KEYS)[number], string> = {
  referral: 'var(--chart-1)',
  socialMedia: 'var(--chart-3)',
  paidSearch: 'var(--chart-6)',
  professionalNetwork: 'var(--chart-5)',
  organic: 'var(--chart-2)',
  event: 'var(--chart-4)',
};

const ORIGIN_LABEL: Record<OriginKey, string> = {
  referral: 'Indicação',
  socialMedia: 'Mídia social',
  paidSearch: 'Busca paga',
  professionalNetwork: 'Rede profissional',
  organic: 'Orgânico',
  event: 'Evento',
  noOrigin: 'Sem origem declarada',
};

const NO_ORIGIN_STROKE = 'var(--text-muted)';
const FADED_OPACITY = 0.35;
const PERCENT_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
/** `right` reserva o rótulo mais longo do dado fixo ("1.240 leads") mais o respiro; 68 px cortava o texto na borda do corpo (ESP-3). */
const MARGIN = { top: 26, right: 100, bottom: 0, left: 0 } as const;
const STAGE_AXIS_WIDTH = 96;
const ROW_STEP = 48;
const BAR_CATEGORY_GAP = '34%';
const VALUE_LABEL_GAP = 8;

/** Percentual inteiro por categoria, somando 100 pelo maior resto (NUM-2): não é o arredondamento simples de cada fração. */
function percentSharesOf(row: FunnelOriginStage): Record<(typeof ALL_KEYS)[number], number> {
  const total = ALL_KEYS.reduce((sum, key) => sum + row[key], 0);
  const parts = ALL_KEYS.map((key) => {
    const exact = total > 0 ? (row[key] / total) * 100 : 0;
    return { key, floor: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let remaining = 100 - parts.reduce((sum, part) => sum + part.floor, 0);
  const bumped = new Set<(typeof ALL_KEYS)[number]>();
  for (const part of [...parts].sort((a, b) => b.remainder - a.remainder)) {
    if (remaining <= 0) break;
    bumped.add(part.key);
    remaining -= 1;
  }
  const result = {} as Record<(typeof ALL_KEYS)[number], number>;
  for (const part of parts) result[part.key] = part.floor + (bumped.has(part.key) ? 1 : 0);
  return result;
}

function totalOf(row: FunnelOriginStage): number {
  return ALL_KEYS.reduce((sum, key) => sum + row[key], 0);
}

export default function FunnelOriginShareBars({
  data = defaultData,
  highlightKey = defaultHighlightKey,
  height,
  className,
}: FunnelOriginShareBarsProps) {
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

  const rows = [...data];
  const first = rows[0];
  const last = rows[rows.length - 1];
  const lastShares = last ? percentSharesOf(last) : undefined;
  const highlightLabel = ORIGIN_LABEL[highlightKey];

  const summary =
    first && last
      ? `Barras horizontais empilhadas em 100% com o mix de origem em ${String(rows.length)} etapas, de ${first.stage} a ${last.stage}. ` +
        `${highlightLabel} sobe de ${formatPercent(first[highlightKey] / totalOf(first), 0)} para ${formatPercent(last[highlightKey] / totalOf(last), 0)}; ` +
        `mídia social cai de ${formatPercent(first.socialMedia / totalOf(first), 0)} para ${formatPercent(last.socialMedia / totalOf(last), 0)}.`
      : 'Barras horizontais empilhadas em 100% com o mix de origem em cada etapa do funil.';

  const reading =
    first && last
      ? `${highlightLabel}: ${formatRateWithVolume(first[highlightKey], totalOf(first))} nas entradas evolui para ${formatRateWithVolume(last[highlightKey], totalOf(last))} nos ganhos.`
      : null;

  const renderTotal = ({ x, y, width, height: barHeight, index }: LabelProps) => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize={11}
        x={Number(x) + Number(width) + VALUE_LABEL_GAP}
        y={Number(y) + Number(barHeight) / 2}
      >
        {formatInt(totalOf(row))} leads
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">{reading}</p> : null}
      <div className="flex min-h-0 flex-1 gap-6">
        <div className="min-w-0 flex-1">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN} stackOffset="expand">
              <CartesianGrid horizontal={false} stroke="var(--line-subtle)" strokeDasharray="3 3" />
              <XAxis
                {...AXIS_PROPS}
                axisLine={false}
                domain={[0, 1]}
                tickFormatter={(value: number) => formatPercent(value, 0)}
                ticks={[...PERCENT_TICKS]}
                type="number"
              />
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
              {COLOR_KEYS.map((key) => (
                <Bar
                  dataKey={key}
                  fill={ORIGIN_FILL[key]}
                  fillOpacity={key === highlightKey ? 1 : FADED_OPACITY}
                  isAnimationActive={animate}
                  key={key}
                  maxBarSize={ROW_STEP}
                  name={ORIGIN_LABEL[key]}
                  stackId="mix"
                />
              ))}
              <Bar
                dataKey="noOrigin"
                fill="none"
                isAnimationActive={animate}
                maxBarSize={ROW_STEP}
                name={ORIGIN_LABEL.noOrigin}
                radius={[0, 3, 3, 0]}
                stackId="mix"
                stroke={NO_ORIGIN_STROKE}
                strokeWidth={1}
              >
                <LabelList content={renderTotal} dataKey="noOrigin" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul className="w-64 shrink-0 space-y-2.5 self-center">
          {ALL_KEYS.map((key) => (
            <li className="flex items-center gap-2.5 text-xs leading-4" key={key}>
              {key === 'noOrigin' ? (
                <span aria-hidden className="size-2 shrink-0 rounded-sm border-[1.5px] border-text-muted" />
              ) : (
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: ORIGIN_FILL[key], opacity: key === highlightKey ? 1 : FADED_OPACITY }}
                />
              )}
              <span className="flex-1 whitespace-nowrap text-text-secondary">{ORIGIN_LABEL[key]}</span>
              <span className="kpi-number w-8 shrink-0 text-right font-medium text-text-primary">
                {lastShares ? formatPercent(lastShares[key] / 100, 0) : '—'}
              </span>
              <span className="w-6 shrink-0 text-right text-text-muted">{last ? formatInt(last[key]) : ''}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
