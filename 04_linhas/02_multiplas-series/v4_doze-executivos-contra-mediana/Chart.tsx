import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, executives as defaultExecutives, highlightId as defaultHighlightId, type Executive, type MonthlyRevenueRow } from './data';

/**
 * Acima de 5 séries, o espaguete vence: 11 linhas neutras de 1 px seguram o formato do grupo, a
 * mediana entra como segunda referência tracejada, e só o destaque e a mediana ganham rótulo
 * final e dica; as 11 neutras ficam sem número individual (nota no rodapé explica a troca).
 */
export interface ExecutiveGroupProps {
  readonly data?: readonly MonthlyRevenueRow[];
  readonly executives?: readonly Executive[];
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

interface ChartRow extends MonthlyRevenueRow {
  /**
   * As três medidas do mês, ou `null` quando nenhum executivo foi medido nele. Receita zero é um
   * valor plausível na escala, então a mediana zerada de uma lista vazia desenha o tracejado rente à
   * base do eixo e afirma que o grupo inteiro faturou nada naquele mês.
   */
  readonly median: number | null;
  readonly min: number | null;
  readonly max: number | null;
  readonly highlightLabelY: number | null;
  readonly medianLabelY: number | null;
}

const DOMAIN: readonly [number, number] = [50_000, 400_000];
const DOMAIN_TICKS = [100_000, 200_000, 300_000, 400_000] as const;
const MARGIN = { top: 16, right: 168, bottom: 0, left: 8 } as const;
const VALUE_LABEL_GAP = 8;
const MIN_LABEL_GAP = (DOMAIN[1] - DOMAIN[0]) * 0.07;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
  return sorted[mid] ?? null;
}

/** Mesma anticolisão de v1 e v2: separa dois rótulos de ponta que ficariam a menos de
 * MIN_LABEL_GAP, empurrando o maior para cima. */
function spreadPair(a: number, b: number): readonly [number, number] {
  if (Math.abs(a - b) >= MIN_LABEL_GAP) return [a, b];
  return a <= b ? [a, a + MIN_LABEL_GAP] : [b + MIN_LABEL_GAP, b];
}

export default function ExecutiveGroup({
  data = defaultData,
  executives = defaultExecutives,
  highlightId = defaultHighlightId,
  height,
  className,
}: ExecutiveGroupProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const fallbackExecutive = executives[0];

  if (data.length === 0 || !fallbackExecutive) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum executivo neste recorte: não há grupo para comparar.
      </div>
    );
  }

  const highlight = executives.find((e) => e.id === highlightId) ?? fallbackExecutive;
  const lastIndex = data.length - 1;
  const baseRows: ChartRow[] = data.map((row) => {
    const values = Object.values(row.values);
    /* `Math.min` e `Math.max` de lista vazia devolvem infinito, que o eixo lê como valor: as três
       medidas nascem juntas do mesmo `values`, e juntas viram null quando ele está vazio. */
    return {
      ...row,
      median: median(values),
      min: values.length === 0 ? null : Math.min(...values),
      max: values.length === 0 ? null : Math.max(...values),
      highlightLabelY: null,
      medianLabelY: null,
    };
  });

  const lastRow = baseRows[lastIndex];
  const highlightEnd = lastRow?.values[highlight.id] ?? null;
  const medianEnd = lastRow?.median ?? null;
  /** Sem os dois valores não há par para afastar, e a ponta que falta fica sem rótulo. */
  const [highlightLabelY, medianLabelY] =
    highlightEnd === null || medianEnd === null ? [highlightEnd, medianEnd] : spreadPair(highlightEnd, medianEnd);

  const rows = baseRows.map((row, i) => (i === lastIndex ? { ...row, highlightLabelY, medianLabelY } : row));

  const firstRow = data[0];
  const endText = highlightEnd === null ? formatUnavailable() : formatCurrencyCompact(highlightEnd);
  const medianText = medianEnd === null ? formatUnavailable() : formatCurrencyCompact(medianEnd);
  /** A relação sai do dado: escrita à mão, ela mente no primeiro recorte que inverter as duas pontas. */
  const endRelation =
    highlightEnd === null || medianEnd === null
      ? 'contra a mediana de'
      : highlightEnd >= medianEnd
        ? 'acima da mediana de'
        : 'abaixo da mediana de';
  const summary = firstRow
    ? `Gráfico de linhas com a receita reconhecida mensal de ${String(executives.length)} executivos e a mediana do grupo, de ${formatMonthShort(firstRow.month)} a ${formatMonthShort(lastRow?.month ?? firstRow.month)}. ${highlight.name} começa abaixo da mediana e termina em ${endText}, ${endRelation} ${medianText}.`
    : `Gráfico de linhas com a mediana de ${String(executives.length)} executivos, sem meses para calcular.`;

  const curatedNames = new Set([highlight.name, 'Mediana do grupo', 'Mínimo do grupo', 'Máximo do grupo']);
  /** ChartTooltip é tipado para número puro (Payload<number,string>); o Tooltip do Recharts
   * admite ValueType mais amplo (inclui array). Nossos dataKeys nunca produzem array, então a
   * asserção abaixo só estreita de volta um tipo que a própria lib alargou sem necessidade. */
  const renderTooltip = (props: TooltipContentProps<TooltipValueType, string | number>) => {
    const curated = props.payload?.filter((entry) => typeof entry.name === 'string' && curatedNames.has(entry.name));
    return (
      <ChartTooltip active={props.active} label={props.label} payload={curated as unknown as ChartTooltipProps['payload']} valueFormat="currencyCompact" />
    );
  };

  const renderLabel = (name: string, color: string, weight: number, value: (row: ChartRow) => number | null) => {
    return ({ cx, cy, payload }: DotItemDotProps) => {
      if (cx === undefined || cy === undefined) return null;
      const end = value(payload as ChartRow);
      return (
        <text className="font-display" dominantBaseline="central" fill={color} fontSize={12} fontWeight={weight} style={HALO} x={cx + VALUE_LABEL_GAP} y={cy}>
          <tspan className="font-sans" fontWeight={weight}>
            {name}{' '}
          </tspan>
          {end === null ? formatUnavailable() : formatCurrencyCompact(end)}
        </text>
      );
    };
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={DOMAIN} tickFormatter={formatCurrencyAxis} tickMargin={8} ticks={[...DOMAIN_TICKS]} width={64} />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} itemSorter={(item) => -(Number(item.value) || 0)} />
            {executives
              .filter((executive) => executive.id !== highlight.id)
              .map((executive) => (
                <Line
                  activeDot={false}
                  connectNulls={false}
                  dataKey={(row: ChartRow) => row.values[executive.id] ?? null}
                  dot={false}
                  isAnimationActive={animate}
                  key={executive.id}
                  name={executive.name}
                  stroke="var(--line-strong)"
                  strokeWidth={1}
                  type="linear"
                />
              ))}
            {/* `connectNulls` desligado, como nas 12 séries: mês sem ninguém medido quebra também a
                mediana, em vez de a referência atravessar por cima do vazio (EIX-10). */}
            <Line activeDot={{ r: 4 }} connectNulls={false} dataKey="median" dot={false} isAnimationActive={animate} name="Mediana do grupo" stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} type="linear" />
            <Line activeDot={false} dataKey="min" dot={false} isAnimationActive={false} legendType="none" name="Mínimo do grupo" stroke="none" />
            <Line activeDot={false} dataKey="max" dot={false} isAnimationActive={false} legendType="none" name="Máximo do grupo" stroke="none" />
            <Line
              activeDot={{ r: 4 }}
              connectNulls={false}
              dataKey={(row: ChartRow) => row.values[highlight.id] ?? null}
              dot={false}
              isAnimationActive={animate}
              name={highlight.name}
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              type="linear"
            />
            <Line activeDot={false} dataKey="highlightLabelY" dot={renderLabel(highlight.name, 'var(--text-primary)', 700, (row) => row.values[highlight.id] ?? null)} isAnimationActive={false} legendType="none" stroke="none" />
            <Line activeDot={false} dataKey="medianLabelY" dot={renderLabel('mediana', 'var(--text-muted)', 500, (row) => row.median)} isAnimationActive={false} legendType="none" stroke="none" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Acima de <span className="tabular-nums">{formatInt(5)}</span> séries, o modelo{' '}
        <span className="tabular-nums">{formatInt(9)}</span> (pequenos múltiplos) evita o espaguete; aqui as{' '}
        <span className="tabular-nums">{formatInt(executives.length - 1)}</span> linhas de contexto seguram só o formato do grupo, sem
        rótulo nem dica. A leitura direta é destaque contra mediana, mínimo e máximo.
      </p>
    </div>
  );
}
