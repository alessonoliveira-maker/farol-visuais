import type { CSSProperties, ReactElement } from 'react';
import { Filter } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyAgendaOutcomes } from './data';

/**
 * Grade de pizzas do mesmo diâmetro, uma por semana, com o desfecho das agendas comerciais.
 * A ordem dos desfechos é fixa entre as pizzas (nunca ordenada por valor dentro de cada semana),
 * a cor segue a categoria pela mesma legenda única no topo, e o total de agendas fica escrito
 * sob cada pizza. Destaque de uma categoria, matriz de completude e amostra pequena vivem em
 * outras versões deste modelo.
 */
export interface WeeklyAgendaResultPiesProps {
  readonly data?: readonly WeeklyAgendaOutcomes[];
  readonly height?: number;
  readonly className?: string;
}

/** Cor por categoria, na ordem fixa do dado (Realizada, Remarcada, Não compareceu), slots 1, 3, 6 (COR-8). */
const CATEGORY_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2], CHART_SERIES_COLORS[5]] as const;
/** Abaixo de 18 graus (5% do círculo) o rótulo interno não cabe (base de hoje não exercita o caso). */
const MIN_LABEL_FRACTION = 0.05;
/**
 * Diâmetro fixo em pixels, igual em toda pizza (anatomia 1, 3): o corpo do canvas em faixa é
 * baixo (por volta de 140 px de altura), então o diâmetro é calculado pela altura disponível, não
 * pela largura da célula da grade, e nunca por `aspect-square` sobre `w-full`.
 */
const PIE_DIAMETER = 80;
const OUTER_RADIUS = '92%';
const LABEL_RADIUS_FRACTION = 0.7;
const RADIAN = Math.PI / 180;
/** Halo na cor do cartão: o percentual precisa de contraste sobre qualquer uma das três cores. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 3 } as const;

/** Percentual inteiro pelo maior resto, sempre somando 100 por pizza (NUM-2). */
function integerPercents(values: readonly number[]): readonly number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  let missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  for (const { index } of order) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly percent?: number;
  readonly index?: number;
}

export default function WeeklyAgendaResultPies({ data = defaultData, height, className }: WeeklyAgendaResultPiesProps) {
  const animate = useAnimateOnce();
  const rootStyle: CSSProperties | undefined = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={rootStyle}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não houve agenda registrada no período.</span>
      </div>
    );
  }

  const totalAll = data.reduce((sum, week) => sum + week.outcomes.reduce((s, o) => s + o.count, 0), 0);
  const realizadaShares = data.map((week) => {
    const total = week.outcomes.reduce((sum, o) => sum + o.count, 0);
    const realizada = week.outcomes.find((o) => o.id === 'realizada')?.count ?? 0;
    return total > 0 ? realizada / total : 0;
  });
  const minRealizadaShare = Math.min(...realizadaShares);
  const first = data[0];
  const last = data[data.length - 1];

  const reading =
    first && last
      ? `${String(data.length)} semanas entre ${formatDate(first.startDate)} e ${formatDate(last.startDate)}: realizada nunca fica abaixo de ${formatPercent(minRealizadaShare, 0)} das agendas da semana; ${formatInt(totalAll)} agendas no total.`
      : null;

  const summary = [
    `Grade de ${String(data.length)} pizzas com o resultado das agendas comerciais em cada semana, entre realizada, remarcada e não compareceu.`,
    reading ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const categoryNames = data[0]?.outcomes.map((outcome) => outcome.name) ?? [];

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={rootStyle}>
      {/* A conclusão (ANO-5) vai só na frase acessível da raiz: com 4 semanas e 3 categorias, uma
          linha de leitura visível a mais não caberia no corpo baixo do canvas em faixa sem afinar
          a pizza abaixo do ponto em que os rótulos internos se encostam (COLISAO-TEXTO). */}
      {/* Legenda única no topo, na ordem angular fixa das categorias (ROT-1, ROT-4): rotular cada
          pizza repetiria a mesma legenda quatro vezes. */}
      <ul aria-hidden className="mb-1 flex shrink-0 flex-wrap gap-x-4 gap-y-1">
        {categoryNames.map((name, index) => (
          <li className="flex items-center gap-1.5 text-xs text-text-secondary" key={name}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[index] ?? CATEGORY_COLORS[0] }} />
            <span>{name}</span>
          </li>
        ))}
      </ul>
      <div className="grid shrink-0 gap-3" style={{ gridTemplateColumns: `repeat(${String(data.length)}, minmax(0, 1fr))` }}>
        {data.map((week) => {
          const total = week.outcomes.reduce((sum, o) => sum + o.count, 0);
          const percents = integerPercents(week.outcomes.map((o) => o.count));
          const renderLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius: sliceOuter = 0, percent = 0, index = -1 }: SliceLabelProps): ReactElement | null => {
            if (percent < MIN_LABEL_FRACTION) return null;
            const pct = percents[index];
            if (pct === undefined) return null;
            const radius = innerRadius + (sliceOuter - innerRadius) * LABEL_RADIUS_FRACTION;
            const angle = -midAngle * RADIAN;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            return (
              <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={500} style={HALO} textAnchor="middle" x={x} y={y}>
                {formatPercent(pct / 100, 0)}
              </text>
            );
          };
          return (
            <div className="flex min-w-0 flex-col items-center" key={week.weekId}>
              <p className="mb-1 shrink-0 text-xs font-medium text-text-secondary">{week.weekLabel}</p>
              <div className="shrink-0" style={{ height: PIE_DIAMETER, width: PIE_DIAMETER }}>
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart accessibilityLayer={false}>
                    <Tooltip content={<ChartTooltip valueFormat="int" />} isAnimationActive={false} />
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={week.outcomes}
                      dataKey="count"
                      endAngle={-270}
                      isAnimationActive={animate}
                      label={renderLabel}
                      labelLine={false}
                      nameKey="name"
                      outerRadius={OUTER_RADIUS}
                      startAngle={90}
                      stroke="var(--surface-raised)"
                      strokeWidth={2}
                    >
                      {week.outcomes.map((outcome, index) => (
                        <Cell fill={CATEGORY_COLORS[index] ?? CATEGORY_COLORS[0]} key={outcome.id} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">{formatInt(total)} agendas</p>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
