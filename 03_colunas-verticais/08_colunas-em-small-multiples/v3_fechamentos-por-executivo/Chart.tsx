import { AlertTriangle, Filter } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, winRateFloor as defaultWinRateFloor, type ExecutiveCloses } from './data';

/**
 * Doze painéis de fechamento mensal, um por executivo, ordenados por win rate e não por nome, na
 * mesma escala de coluna. O win rate com o volume fica sob o nome de cada painel; quem está abaixo
 * do piso esperado leva ícone e a palavra em negative, sem borda em volta do cartão. A escala e o
 * piso são ditos uma vez, no topo da grade, para não repetir a mesma anotação doze vezes.
 */
export interface ExecutiveSmallMultiplesProps {
  readonly data?: readonly ExecutiveCloses[];
  readonly winRateFloor?: number;
  readonly height?: number;
  readonly className?: string;
}

const GRID_COLS = 3;
const BAR_MAX = 16;
const BAR_CATEGORY_GAP = '32%';
const BAR_FILL = 'var(--line-strong)';
const FLAG_FILL = 'var(--negative)';
const DOMAIN_STEP = 2;
/* ESP (checklist 15): 40 nao sobra pras 3 linhas do painel marcado (nome, taxa com volume,
   aviso); medido nos dois temas, 3 linhas de 11 a 12px com o gap-0.5 entre elas pedem uns 53px,
   e o texto cortado comia a virgula do percentual e a descendente de nomes como "Thiago R.".
   56 e o mesmo espaco pros 12 paineis, com ou sem aviso, pra manter o corpo do grafico alinhado. */
const HEADER_H = 56;

function winRate(row: ExecutiveCloses): number {
  return row.deals === 0 ? 0 : row.wins / row.deals;
}

function niceCeil(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step);
}

export default function ExecutiveSmallMultiples({
  data = defaultData,
  winRateFloor = defaultWinRateFloor,
  height,
  className,
}: ExecutiveSmallMultiplesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data].sort((a, b) => winRate(b) - winRate(a));

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não houve negócio trabalhado no período.</span>
      </div>
    );
  }

  const maxValue = Math.max(...rows.flatMap((row) => row.monthly.map((point) => point.value)));
  const domainMax = niceCeil(maxValue, DOMAIN_STEP);
  const rowCount = Math.max(1, Math.ceil(rows.length / GRID_COLS));
  const bottomRowStart = (rowCount - 1) * GRID_COLS;
  const belowFloor = rows.filter((row) => winRate(row) < winRateFloor);

  const summary = [
    `Pequenos múltiplos de colunas com fechamentos mensais de ${String(rows.length)} executivos, ordenados por win rate, na mesma escala.`,
    `Piso esperado de ${formatPercent(winRateFloor, 0)}.`,
    belowFloor.length > 0 ? `Abaixo do piso: ${belowFloor.map((row) => row.name).join(', ')}.` : 'Nenhum executivo abaixo do piso.',
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-muted tabular-nums">
        Escala comum de 0 a {String(domainMax)} fechamentos por mês; piso esperado de win rate em {formatPercent(winRateFloor, 0)}.
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-4 gap-2">
        {rows.map((row, index) => {
          const showAxis = index >= bottomRowStart;
          const flagged = winRate(row) < winRateFloor;
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={row.id}>
              <div className="flex shrink-0 flex-col justify-start gap-0.5" style={{ height: HEADER_H }}>
                <p className="truncate text-xs font-medium text-text-secondary">{row.name}</p>
                <p className="kpi-number truncate text-[0.6875rem] font-medium text-text-muted">
                  {formatRateWithVolume(row.wins, row.deals)}
                </p>
                {flagged ? (
                  <p className="flex items-center gap-1 truncate text-[0.6875rem] font-medium text-negative">
                    <AlertTriangle aria-hidden className="size-2.5 shrink-0" />
                    <span>abaixo do piso</span>
                  </p>
                ) : null}
              </div>
              <div className="min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    accessibilityLayer={false}
                    barCategoryGap={BAR_CATEGORY_GAP}
                    data={[...row.monthly]}
                    /* Margem lateral igual nos doze painéis, mesmo nos que escondem o eixo: assim as
                       colunas caem no mesmo x em toda a grade, e o rótulo de mês da última linha tem
                       os 18px que o texto de 11px precisa para não vazar para fora do corpo. */
                    margin={{ top: 2, right: 18, bottom: 0, left: 18 }}
                  >
                    <XAxis
                      axisLine={false}
                      dataKey="month"
                      /* EIX-9: nunca `hide`, o Recharts so reserva altura de eixo pros que nao
                         estao escondidos, o que fazia o corpo dos paineis de cima crescer mais que
                         o dos de baixo na mesma escala (medido: 22px por fechamento contra 12px).
                         O eixo fica sempre presente e so o tique some (`tick={false}`), que zera o
                         texto sem zerar o espaco reservado. */
                      /* Painel estreito: seis rótulos de mês colidem entre si (TIP-5 autoriza reduzir
                         tiques quando não cabem). preserveStartEnd mede o texto e mantém só os que
                         não se tocam, sempre com o primeiro e o último mês da janela. */
                      interval="preserveStartEnd"
                      tick={showAxis ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                      tickFormatter={formatMonthShort}
                      tickLine={false}
                      tickMargin={4}
                    />
                    <YAxis allowDecimals={false} domain={[0, domainMax]} hide />
                    <Tooltip
                      content={<ChartTooltip labelFormat="month" valueFormat="int" />}
                      cursor={{ fill: 'var(--line-subtle)' }}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="value"
                      fill={flagged ? FLAG_FILL : BAR_FILL}
                      isAnimationActive={animate}
                      maxBarSize={BAR_MAX}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
