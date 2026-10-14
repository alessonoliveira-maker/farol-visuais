import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveRevenue } from './data';

/**
 * Ranking de receita reconhecida por executivo em barras horizontais, do maior para o menor, com o
 * valor escrito na ponta de cada barra e uma linha de leitura que diz quem lidera e com que folga.
 * Responde "quem está na frente e por quanto" sem tabela ao lado.
 */
export interface RevenueRankingBarsProps {
  /** Linhas do ranking em qualquer ordem: o componente ordena e desempata pelo nome. */
  readonly data?: readonly ExecutiveRevenue[];
  /** Altura da raiz em px, para pai sem altura. O gráfico em si mede ROW_STEP por barra. */
  readonly height?: number;
  readonly className?: string;
}

/** Série única: uma cor só (COR-1). */
const BAR_FILL = 'var(--chart-1)';
const MARGIN = { top: 2, right: 96, bottom: 2, left: 0 } as const;
const NAME_AXIS_WIDTH = 108;
/** Passo fixo por barra: poucas barras não engordam e muitas não somem. */
const ROW_STEP = 24;
const BAR_CATEGORY_GAP = '34%';
const BAR_MAX = 16;
const BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const VALUE_LABEL_GAP = 6;
const LOCALE = 'pt-BR';

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Maior receita primeiro; empate resolvido pelo nome para a ordem não mudar a cada recarga. */
function rankByRevenue(rows: readonly ExecutiveRevenue[]): ExecutiveRevenue[] {
  return [...rows].sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name, LOCALE));
}

/** Altura do gráfico derivada do número de barras. */
function plotHeight(count: number): number {
  return MARGIN.top + MARGIN.bottom + count * ROW_STEP;
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text
      className="font-sans"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={12}
      fontWeight={500}
      x={MARGIN.left}
      y={Number(y)}
    >
      {String(payload?.value ?? '')}
    </text>
  );
}

function ValueLabel({ x, y, width, height, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'number') return null;
  return (
    <text
      className="font-display"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={12}
      fontWeight={500}
      x={Number(x) + Number(width) + VALUE_LABEL_GAP}
      y={Number(y) + Number(height) / 2}
    >
      {formatCurrencyCompact(value)}
    </text>
  );
}

export default function RevenueRankingBars({ data = defaultData, height, className }: RevenueRankingBarsProps) {
  const animate = useAnimateOnce();
  const rows = rankByRevenue(data);
  const style = height === undefined ? undefined : { height };
  const leader = rows[0];

  if (!leader) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não houve receita reconhecida no período.</span>
      </div>
    );
  }

  const runnerUp = rows[1];
  const last = rows[rows.length - 1] ?? leader;
  const lead = runnerUp === undefined ? null : leader.revenue - runnerUp.revenue;
  const leaderValue = formatCurrencyCompact(leader.revenue);

  const leaderSentence =
    runnerUp === undefined || lead === null
      ? `${leader.name} é o único executivo no recorte, com ${leaderValue}.`
      : lead === 0
        ? `${leader.name} e ${runnerUp.name} empatam na liderança, com ${leaderValue} cada.`
        : `Lidera ${leader.name}, com ${leaderValue}, ${formatCurrencyCompact(lead)} à frente de ${runnerUp.name}.`;
  const summary = [
    `Gráfico de barras horizontais com a receita reconhecida de ${String(rows.length)} executivos, do maior para o menor.`,
    leaderSentence,
    rows.length > 2 ? `Menor valor: ${last.name}, com ${formatCurrencyCompact(last.revenue)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const strong = (text: string) => <span className="font-semibold text-text-primary">{text}</span>;
  const amount = (text: string) => <span className="kpi-number font-medium text-text-primary">{text}</span>;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {runnerUp === undefined || lead === null ? (
          <>
            {strong(leader.name)} é o único executivo no recorte, com {amount(leaderValue)}
          </>
        ) : lead === 0 ? (
          <>
            {strong(leader.name)} e {strong(runnerUp.name)} empatam na liderança, com {amount(leaderValue)} cada
          </>
        ) : (
          <>
            {strong(leader.name)} lidera com {amount(leaderValue)}, {amount(formatCurrencyCompact(lead))} à frente de{' '}
            {runnerUp.name}
          </>
        )}
      </p>
      <div className="shrink-0" style={{ height: plotHeight(rows.length) }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis dataKey="revenue" domain={[0, 'dataMax']} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="name"
              interval={0}
              tick={NameTick}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar dataKey="revenue" fill={BAR_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} radius={BAR_RADIUS}>
              <LabelList content={ValueLabel} dataKey="revenue" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
