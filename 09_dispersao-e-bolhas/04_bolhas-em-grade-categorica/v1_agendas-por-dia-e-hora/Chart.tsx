import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ScheduleCell } from './data';

/**
 * Bolhas em grade categórica: os dois eixos são categorias, dia útil e hora cheia, e a área de
 * cada bolha é o número de agendas marcadas naquele cruzamento. A ordem de dia e hora vem da
 * ordem de primeira ocorrência no array de dado, por isso `data.ts` já está ordenado por dia e
 * depois por hora. A área segue a mesma conta de raio da legenda de tamanho, com um piso que
 * mantém o valor 1 visível.
 */
export interface ScheduleBubbleGridProps {
  readonly data?: readonly ScheduleCell[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 24, bottom: 8, left: 8 } as const;
const Y_AXIS_WIDTH = 76;
/** Área em px²: piso para o valor 1 não sumir, teto para o maior valor não estourar a célula. */
const AREA_MIN = 12;
const AREA_MAX = 900;
const BUBBLE_FILL_OPACITY = 0.7;
/**
 * Referências redondas da legenda de tamanho, todas abaixo do máximo. A linha de cima não é
 * constante: é o maior cruzamento do recorte, montado em `legendValues`. Com as três fixas em 5, 15
 * e 30, a régua parava em 30 enquanto o pico tinha 32 agendas, e a maior bolha da tela, que é a que
 * carrega a conclusão, ficava maior que qualquer círculo da legenda e sem valor de referência
 * (conserto de 2026-09-28, na mesma forma de `09_densidade-2d/v1`).
 */
const LEGEND_REFERENCES = [5, 15] as const;

/** As referências menores que o máximo, mais o próprio máximo: a régua sempre alcança a maior bolha. */
function legendValues(maxCount: number): readonly number[] {
  return [...LEGEND_REFERENCES.filter((value) => value < maxCount), maxCount];
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}h`;
}

/**
 * Raio em px de um círculo cuja área segue a mesma escala linear do ZAxis (domínio a partir de 0).
 *
 * O piso `AREA_MIN` vale só acima de zero. Aplicado ao zero, ele desenharia uma bolha de 12 px² num
 * cruzamento em que nada foi marcado, e quanto maior o máximo do recorte mais essa bolha se confunde
 * com a de valor 1 (com máximo de 32 o valor 1 mede 39,8 px², com máximo de 888 mede 13 px²). Quem
 * chama tira as linhas de contagem zero do desenho, na mesma régua desta guarda
 * (conserto de 2026-09-25).
 */
function raioPorArea(valor: number, maxValor: number): number {
  if (valor <= 0) return 0;
  const base = maxValor > 0 ? valor / maxValor : 0;
  const area = AREA_MIN + base * (AREA_MAX - AREA_MIN);
  return Math.sqrt(area / Math.PI);
}

export default function ScheduleBubbleGrid({ data = defaultData, height, className }: ScheduleBubbleGridProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  /** Cruzamento medido com zero agenda não vira bolha: ele é a mesma coisa que cruzamento ausente
   * do dado, e o piso de área faria os dois virarem marca. Sai do desenho e vai ao rodapé. */
  const cells = data.filter((row) => row.count > 0);
  const emptyCells = data.length - cells.length;

  if (cells.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        {/* Recorte sem linha e recorte com todas as linhas em zero são dois estados: o segundo tem
            cruzamento medido, e dizer que não há cruzamento seria falso. */}
        <span>
          {data.length === 0
            ? 'Nenhuma agenda neste recorte: não há cruzamento de dia e hora para desenhar.'
            : `Nenhuma agenda neste recorte: os ${formatInt(data.length)} cruzamentos medidos deram zero.`}
        </span>
      </div>
    );
  }

  const counts = cells.map((row) => row.count);
  const maxCount = Math.max(...counts);
  const totalCount = counts.reduce((sum, value) => sum + value, 0);
  const busiest = [...cells].sort((a, b) => b.count - a.count)[0];
  const legendRows = legendValues(maxCount);
  /** A caixa de todos os círculos é a do maior deles, que agora é o máximo observado. */
  const maiorLegendaRaio = raioPorArea(maxCount, maxCount);

  const summary = [
    `Gráfico de bolhas em grade com ${formatInt(totalCount)} agendas marcadas no trimestre, por dia útil e hora, das 8h às 19h.`,
    busiest ? `Pico em ${busiest.day} às ${formatHour(busiest.hour)}, com ${formatInt(busiest.count)} agendas.` : '',
    emptyCells === 0 ? '' : `${formatInt(emptyCells)} cruzamentos medidos com zero agenda ficam sem bolha.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as ScheduleCell | undefined;
    if (!row) return null;
    const entries = [{ dataKey: 'count', name: 'Agendas', value: `${formatInt(row.count)} agendas` }] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={`${row.day}, ${formatHour(row.hour)}`} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {busiest ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          Pico em <span className="font-semibold text-text-primary">{busiest.day}</span>, às{' '}
          <span className="tabular-nums">{formatHour(busiest.hour)}</span>: <span className="kpi-number font-medium text-text-primary">{formatInt(busiest.count)}</span> agendas
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              allowDuplicatedCategory={false}
              axisLine={false}
              dataKey="hour"
              interval={0}
              name="Hora"
              tickFormatter={(value: number) => formatHour(value)}
              tickMargin={8}
              type="category"
            />
            <YAxis {...AXIS_PROPS} allowDuplicatedCategory={false} axisLine={false} dataKey="day" interval={0} name="Dia" tickMargin={8} type="category" width={Y_AXIS_WIDTH} />
            <ZAxis dataKey="count" domain={[0, maxCount]} name="Agendas" range={[AREA_MIN, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={[...cells]} fill="var(--chart-1)" fillOpacity={BUBBLE_FILL_OPACITY} isAnimationActive={animate} stroke="var(--surface-raised)" strokeWidth={1} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-center gap-6 text-[0.6875rem] text-text-muted">
        <span>Agendas</span>
        {legendRows.map((value) => {
          const raio = raioPorArea(value, maxCount);
          const box = Math.ceil(2 * maiorLegendaRaio);
          return (
            <span className="flex items-end gap-2.5" key={value}>
              <svg height={box} width={box}>
                <circle cx={box / 2} cy={box - raio} fill="var(--chart-1)" fillOpacity={BUBBLE_FILL_OPACITY} r={raio} stroke="var(--surface-raised)" strokeWidth={1} />
              </svg>
              <span className="kpi-number">{formatInt(value)}</span>
            </span>
          );
        })}
      </div>
      {/* Rodapé do que saiu do desenho, na forma de `01_dispersao-simples/v1`: só esta linha diz que
          havia cruzamento medido com zero agenda. */}
      {emptyCells === 0 ? null : (
        <p aria-hidden className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">
          {`${formatInt(emptyCells)} ${emptyCells === 1 ? 'cruzamento medido' : 'cruzamentos medidos'} com zero agenda, sem bolha`}
        </p>
      )}
    </div>
  );
}
