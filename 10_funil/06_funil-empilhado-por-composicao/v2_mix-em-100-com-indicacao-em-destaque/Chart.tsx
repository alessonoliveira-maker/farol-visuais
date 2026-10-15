import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatPercentFromScale100, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightKey as defaultHighlightKey, type FunnelOriginStage } from './data';

/**
 * O mesmo funil de origem em 100%: cada etapa vira uma pilha inteira, e a leitura passa a ser
 * "que mistura" em vez de "quanto". A origem em destaque fica em cor cheia; as demais atenuam
 * para não competir. Cada etapa escreve à direita da barra os sete percentuais pelo maior resto, em colunas na ordem da pilha, com a amostra de cor no cabeçalho da primeira linha. A dica continua trazendo o valor absoluto de cada origem, porque o eixo em
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
/** Mínimo de 0,71 para 3:1 contra o cartão nos dois temas (ACE-5): o pior token é --chart-6 no claro. */
const FADED_OPACITY = 0.72;
const PERCENT_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const TOTAL_COL_W = 72;
const COL_STEP = 32;
/** `right` reserva o total ("1.240 leads"), as sete colunas de percentual e o respiro (ESP-3). */
const MARGIN = { top: 26, right: 8 + TOTAL_COL_W + COL_STEP * 7 + 4, bottom: 0, left: 0 } as const;
const STAGE_AXIS_WIDTH = 96;
const ROW_STEP = 48;
const BAR_CATEGORY_GAP = '24%';
const VALUE_LABEL_GAP = 8;

/** Percentual inteiro por categoria, somando 100 pelo maior resto (NUM-2): não é o arredondamento simples de cada fração. */
function percentSharesOf(row: FunnelOriginStage): Record<(typeof ALL_KEYS)[number], number> | null {
  const total = ALL_KEYS.reduce((sum, key) => sum + row[key], 0);
  if (total <= 0) return null;
  const parts = ALL_KEYS.map((key) => {
    const exact = (row[key] / total) * 100;
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

/** Fração de uma origem na etapa; `null` quando a etapa não tem lead (EST-1b). */
function shareOf(row: FunnelOriginStage, key: OriginKey): number | null {
  const total = totalOf(row);
  return total > 0 ? row[key] / total : null;
}

function shareText(value: number | null): string {
  return value === null ? formatUnavailable() : formatPercent(value, 0);
}

function trend(from: number | null, to: number | null): string {
  if (from === null || to === null) return 'não se compara';
  const a = Math.round(from * 100);
  const b = Math.round(to * 100);
  if (a === b) return 'fica em';
  return b > a ? 'sobe de' : 'cai de';
}

function rateText(row: FunnelOriginStage, key: OriginKey): string {
  return totalOf(row) > 0 ? formatRateWithVolume(row[key], totalOf(row)) : formatUnavailable();
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
  const highlightLabel = ORIGIN_LABEL[highlightKey];

  const describe = (label: string, key: OriginKey): string => {
    if (!first || !last) return '';
    const from = shareOf(first, key);
    const to = shareOf(last, key);
    const verb = trend(from, to);
    if (from === null || to === null) return `${label}: ${shareText(from)} em ${first.stage} e ${shareText(to)} em ${last.stage}`;
    return verb === 'fica em' ? `${label} fica em ${shareText(from)}` : `${label} ${verb} ${shareText(from)} para ${shareText(to)}`;
  };

  const summary =
    first && last
      ? `Barras horizontais empilhadas em 100% com o mix de origem em ${String(rows.length)} etapas, de ${first.stage} a ${last.stage}, com os sete percentuais de cada etapa escritos à direita. ` +
        `${describe(highlightLabel, highlightKey)}; ${describe('mídia social', 'socialMedia')}.`
      : 'Barras horizontais empilhadas em 100% com o mix de origem em cada etapa do funil.';

  const reading =
    first && last
      ? `${highlightLabel}: ${rateText(first, highlightKey)} nas entradas evolui para ${rateText(last, highlightKey)} nos ganhos.`
      : null;

  /** Forma própria na lacuna: com ela o Recharts não descarta a barra de largura zero, e o total e os percentuais continuam na ponta (REC-11). */
  const renderGap = ({ x, y, width, height: barHeight }: BarShapeProps): ReactElement => (
    <Rectangle
      fill="none"
      height={Number(barHeight)}
      radius={[0, 3, 3, 0]}
      stroke={Number(width) > 0 ? NO_ORIGIN_STROKE : 'none'}
      strokeWidth={1}
      width={Number(width)}
      x={Number(x)}
      y={Number(y)}
    />
  );

  const renderTotal = ({ x, y, width, height: barHeight, index }: LabelProps) => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const tipX = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const cy = Number(y) + Number(barHeight) / 2;
    const colsX = tipX + TOTAL_COL_W;
    const shares = percentSharesOf(row);
    return (
      <g>
        <text className="font-display tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={tipX} y={cy}>
          {formatInt(totalOf(row))} leads
        </text>
        {shares ? (
          ALL_KEYS.map((key, i) => (
            <text
              className="font-display tabular-nums"
              dominantBaseline="central"
              fill={key === highlightKey ? 'var(--text-primary)' : 'var(--text-secondary)'}
              fontSize={11}
              fontWeight={key === highlightKey ? 600 : 400}
              key={key}
              textAnchor="end"
              x={colsX + i * COL_STEP + COL_STEP - 4}
              y={cy}
            >
              {formatPercentFromScale100(shares[key], 0)}
            </text>
          ))
        ) : (
          <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={colsX} y={cy}>
            sem lead nesta etapa
          </text>
        )}
        {index === 0
          ? ALL_KEYS.map((key, i) => (
              <rect
                fill={key === 'noOrigin' ? 'none' : ORIGIN_FILL[key]}
                fillOpacity={key === highlightKey ? 1 : FADED_OPACITY}
                height={8}
                key={key}
                stroke={key === 'noOrigin' ? 'var(--text-muted)' : 'none'}
                strokeWidth={1}
                width={8}
                x={colsX + i * COL_STEP + COL_STEP - 14}
                y={Number(y) - 14}
              />
            ))
          : null}
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">{reading}</p> : null}
      <ul className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1">
        {ALL_KEYS.map((key) => (
          <li className="flex items-center gap-1.5 text-xs leading-4 text-text-secondary" key={key}>
            {key === 'noOrigin' ? (
              <span aria-hidden className="size-2 shrink-0 rounded-[2px] border-[1.5px] border-text-muted" />
            ) : (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: ORIGIN_FILL[key], opacity: key === highlightKey ? 1 : FADED_OPACITY }}
              />
            )}
            <span className="whitespace-nowrap">{ORIGIN_LABEL[key]}</span>
          </li>
        ))}
      </ul>
      <div className="flex min-h-0 flex-1">
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
                shape={renderGap}
                stackId="mix"
              >
                <LabelList content={renderTotal} dataKey="noOrigin" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
