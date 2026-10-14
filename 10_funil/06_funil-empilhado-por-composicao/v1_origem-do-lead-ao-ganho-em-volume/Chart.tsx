import { Filter } from 'lucide-react';
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FunnelOriginStage } from './data';

/**
 * Cada etapa do funil é uma barra horizontal dividida pelas origens do lead: o comprimento
 * total mostra o volume da etapa e cada segmento mostra quanto daquele volume veio de onde.
 * "Sem origem" fica sempre no fim da pilha, em contorno neutro, porque é cobertura de dado e
 * não uma origem de verdade. O total absoluto de cada etapa vai escrito na ponta da barra, e o
 * valor absoluto de cada origem sai na dica, para a leitura nunca depender só do comprimento.
 */
export interface FunnelOriginBarsProps {
  readonly data?: readonly FunnelOriginStage[];
  readonly height?: number;
  readonly className?: string;
}

type OriginKey = Exclude<keyof FunnelOriginStage, 'stage'>;

/** Ordem de pilha e de legenda, esquerda para direita; "noOrigin" some da lista e vai por último. */
const COLOR_KEYS = [
  'referral',
  'socialMedia',
  'paidSearch',
  'professionalNetwork',
  'organic',
  'event',
] as const satisfies readonly OriginKey[];

/** Slots categóricos na ordem 1, 3, 6, 5, 2, 4 (COR-8): a cor é da categoria, nunca da posição no valor. */
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
const MARGIN = { top: 8, right: 68, bottom: 0, left: 0 } as const;
const STAGE_AXIS_WIDTH = 96;
/** Passo (corpo ÷ 5 etapas) vezes o vão de 34%: 48 × (1 − 2 × 0,34) ≈ 15 px de espessura por barra. */
const ROW_STEP = 48;
const BAR_CATEGORY_GAP = '34%';
const VALUE_LABEL_GAP = 8;

function totalOf(row: FunnelOriginStage): number {
  return COLOR_KEYS.reduce((sum, key) => sum + row[key], 0) + row.noOrigin;
}

function leaderOf(row: FunnelOriginStage): (typeof COLOR_KEYS)[number] {
  return [...COLOR_KEYS].sort((a, b) => row[b] - row[a])[0] ?? 'referral';
}

export default function FunnelOriginBars({ data = defaultData, height, className }: FunnelOriginBarsProps) {
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

  const summary =
    first && last
      ? `Barras horizontais empilhadas com a composição por origem em ${String(rows.length)} etapas do funil, de ${first.stage} a ${last.stage}. ` +
        `${first.stage}: ${formatInt(totalOf(first))} leads, liderado por ${ORIGIN_LABEL[leaderOf(first)]} com ${formatInt(first[leaderOf(first)])}. ` +
        `${last.stage}: ${formatInt(totalOf(last))}, liderado por ${ORIGIN_LABEL[leaderOf(last)]} com ${formatInt(last[leaderOf(last)])}.`
      : 'Barras horizontais empilhadas com a composição por origem em cada etapa do funil.';

  const renderTotal = ({ x, y, width, height: barHeight, index }: LabelProps) => {
    const row = index === undefined ? undefined : rows[index];
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
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {COLOR_KEYS.map((key) => (
          <li className="flex items-center gap-1.5 text-xs leading-4" key={key}>
            <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: ORIGIN_FILL[key] }} />
            <span className="text-text-secondary">{ORIGIN_LABEL[key]}</span>
          </li>
        ))}
        <li className="flex items-center gap-1.5 text-xs leading-4">
          <span aria-hidden className="size-2 shrink-0 rounded-sm border-[1.5px] border-text-muted" />
          <span className="text-text-secondary">{ORIGIN_LABEL.noOrigin}</span>
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
            {COLOR_KEYS.map((key) => (
              <Bar
                dataKey={key}
                fill={ORIGIN_FILL[key]}
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
    </div>
  );
}
