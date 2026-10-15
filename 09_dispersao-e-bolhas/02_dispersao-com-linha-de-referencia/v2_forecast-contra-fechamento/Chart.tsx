import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  usePlotArea,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import {
  formatCurrencyAxis,
  formatCurrencyCompact,
  formatDays,
  formatInt,
  formatPercent,
  formatRateWithVolume,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, tolerance as defaultTolerance, type ForecastVersusClosed } from './data';

/**
 * Previsto contra realizado na diagonal de identidade: o eixo horizontal traz o valor que estava no
 * forecast e o vertical o valor fechado, com a mesma unidade e o mesmo domínio nos dois, que é o que
 * dá sentido à linha y = x. Acima da diagonal fechou mais do que previa, abaixo fechou menos, e a
 * distância até ela é o erro do forecast.
 */
export interface ForecastVersusClosedScatterProps {
  readonly data?: readonly ForecastVersusClosed[];
  /** A tolerância aceita em torno da diagonal, em fração do valor previsto. */
  readonly tolerance?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly rotulo: string;
  readonly previstoReais: number;
  readonly fechadoReais: number;
  readonly razao: number;
  readonly dentro: boolean;
}

/**
 * A margem direita é reserva de rótulo, não sobra: é nela que os nomes das duas referências vivem,
 * fora das marcas, como a ANO-3 pede. Ela também é o que sobra de largura para a área útil ficar
 * quadrada, e a conta está na nota do `meta.json`.
 */
const MARGIN = { top: 12, right: 121, bottom: 8, left: 8 } as const;
/** O mesmo domínio nos dois eixos é o que faz a diagonal significar igualdade. */
const DOMAIN_MAX = 600_000;
const DOMAIN: readonly [number, number] = [0, DOMAIN_MAX];
const TICKS = [0, 150_000, 300_000, 450_000, DOMAIN_MAX] as const;
/**
 * Acima da faixa de 48 a 64 da EIX-6, e por medição: com 64 o tique `R$ 600 mil` não cabe nos 56 px
 * que sobram depois do `tickMargin` e quebra em duas linhas, que é o sintoma da REC-2. A régua da
 * 14.1 manda a constante de acabamento ceder quando o desvio aparece no render, e aqui aparece.
 */
const Y_AXIS_WIDTH = 72;
/** Raio fixado nas duas pontas do `ZAxis`, porque o tamanho do ponto aqui não codifica nada. */
const POINT_RADIUS = 4;
const Z_RANGE: readonly [number, number] = [
  Math.PI * POINT_RADIUS * POINT_RADIUS,
  Math.PI * POINT_RADIUS * POINT_RADIUS,
];
const IDENTITY_WIDTH = 1.5;
const TOLERANCE_WIDTH = 1;
const LABEL_SIZE = 11;
const LABEL_GAP = 6;
/** A defasagem do forecast comparado, escrita no rodapé para o leitor saber de quando é o número. */
const FORECAST_LAG_DAYS = 30;

/**
 * Os nomes das referências, desenhados na margem reservada à direita do plano.
 *
 * Eles não são `label` da `ReferenceLine` de propósito: o rótulo nativo nasce na altura da própria
 * linha e dentro da área, e ali cai justamente sobre os pontos vizinhos da diagonal, que é onde a
 * nuvem se acumula. Na margem ele não compete com marca nenhuma, em qualquer recorte.
 */
function ReferenceNames({
  toleranceLow,
  tolerance,
}: {
  readonly toleranceLow: number;
  readonly tolerance: number;
}) {
  const plotArea = usePlotArea();
  const yScale = useYAxisScale();
  if (!plotArea || !yScale) return null;
  const x = plotArea.x + plotArea.width + LABEL_GAP;
  const yBaixo = yScale(toleranceLow);
  if (yBaixo === undefined) return null;

  return (
    <g>
      <text
        className="font-display"
        fill="var(--text-muted)"
        fontSize={LABEL_SIZE}
        fontWeight={600}
        style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
        textAnchor="start"
        x={x}
        y={plotArea.y + LABEL_SIZE}
      >
        previsto = fechado
      </text>
      <text
        className="font-display"
        fill="var(--text-muted)"
        fontSize={LABEL_SIZE}
        textAnchor="start"
        x={x}
        y={yBaixo + LABEL_GAP}
      >
        {`tolerância ±${formatPercent(tolerance, 0)}`}
      </text>
    </g>
  );
}

export default function ForecastVersusClosedScatter({
  data = defaultData,
  tolerance = defaultTolerance,
  height,
  className,
}: ForecastVersusClosedScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  const perdidas: ForecastVersusClosed[] = [];
  /** Ganhas que não estavam no forecast: previsto zero, fechado positivo, contadas no rodapé. */
  const semForecast: ForecastVersusClosed[] = [];
  for (const row of data) {
    if (row.desfecho === 'perdida') {
      perdidas.push(row);
      continue;
    }
    if (row.previstoReais <= 0) {
      semForecast.push(row);
      continue;
    }
    points.push({
      id: row.id,
      rotulo: row.rotulo,
      previstoReais: row.previstoReais,
      fechadoReais: row.fechadoReais,
      razao: row.fechadoReais / row.previstoReais,
      dentro: Math.abs(row.fechadoReais - row.previstoReais) <= tolerance * row.previstoReais,
    });
  }
  const previstoPerdido = perdidas.reduce((soma, row) => soma + row.previstoReais, 0);

  if (points.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade ganha neste recorte com forecast e valor fechado registrados.</span>
      </div>
    );
  }

  /** A ordem de pintura é o papel: neutro primeiro, quem ficou fora da tolerância por cima. */
  const dentro = points.filter((point) => point.dentro);
  const fora = points.filter((point) => !point.dentro);
  const toleranciaTexto = `±${formatPercent(tolerance, 0)}`;
  /** A mesma chamada alimenta a legenda e a frase acessível, para as duas lerem o mesmo par. */
  const acerto = formatRateWithVolume(dentro.length, points.length);
  const perdidoTexto = formatCurrencyCompact(previstoPerdido);
  const fechadoSemForecast = semForecast.reduce((soma, row) => soma + row.fechadoReais, 0);
  const semForecastTexto =
    semForecast.length === 0
      ? ''
      : `${formatInt(semForecast.length)} ganhas fora do forecast, com ${formatCurrencyCompact(fechadoSemForecast)} fechados, ficam fora do plano porque não há previsto para comparar`;
  const perdidasTexto =
    perdidas.length === 0
      ? ''
      : `${formatInt(perdidas.length)} perdidas, com ${perdidoTexto} previstos, ficam fora do plano porque o fechado delas é zero`;
  const rodape =
    perdidas.length === 0 && semForecast.length === 0
      ? `Toda oportunidade ganha do trimestre está no plano, e a comparação é com o forecast de ${formatDays(FORECAST_LAG_DAYS)} antes`
      : [semForecastTexto, perdidasTexto].filter((texto) => texto !== '').join('; ');

  const summary =
    `Gráfico de dispersão com ${formatInt(points.length)} oportunidades ganhas, forecast no eixo horizontal e valor ` +
    `fechado no vertical, com a diagonal de igualdade. Dentro de ${toleranciaTexto} do forecast: ${acerto}. ` +
    (semForecast.length === 0
      ? ''
      : `${formatInt(semForecast.length)} ganhas sem forecast, com ${formatCurrencyCompact(fechadoSemForecast)}, não aparecem. `) +
    (perdidas.length === 0
      ? ''
      : `${formatInt(perdidas.length)} perdidas com ${perdidoTexto} previstos não aparecem.`);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const desvio = point.razao - 1;
    const sinal = desvio >= 0 ? '+' : '−';
    const entries = [
      { dataKey: 'previstoReais', name: 'Previsto', value: formatCurrencyCompact(point.previstoReais) },
      { dataKey: 'fechadoReais', name: 'Fechado', value: formatCurrencyCompact(point.fechadoReais) },
      {
        dataKey: 'razao',
        name: 'Desvio',
        value: `${sinal}${formatPercent(Math.abs(desvio))} contra o forecast`,
      },
    ] as unknown as ChartTooltipProps['payload'];
    return (
      <ChartTooltip
        active={props.active}
        label={point.rotulo}
        labelFormat="text"
        payload={entries}
        valueFormat="text"
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul
        aria-hidden
        className="mb-2 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-xs tabular-nums text-text-secondary"
      >
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height={10} viewBox="0 0 10 10" width={10}>
            <circle cx={5} cy={5} fill="var(--text-muted)" r={4} />
          </svg>
          <span>{`Dentro de ${toleranciaTexto}`}</span>
          <span className="text-text-muted">{acerto}</span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height={10} viewBox="0 0 10 10" width={10}>
            <polygon fill="var(--chart-1)" points="5,0.5 9.5,5 5,9.5 0.5,5" />
          </svg>
          <span>Fora da tolerância</span>
          <span className="text-text-muted">{`${formatInt(fora.length)} oportunidades`}</span>
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="previstoReais"
              domain={[...DOMAIN]}
              name="Previsto"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKS]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="fechadoReais"
              domain={[...DOMAIN]}
              name="Fechado"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKS]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip
              content={renderTooltip}
              cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }}
              isAnimationActive={false}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              segment={[
                { x: 0, y: 0 },
                { x: DOMAIN_MAX / (1 + tolerance), y: DOMAIN_MAX },
              ]}
              stroke="var(--line-strong)"
              strokeDasharray="4 4"
              strokeWidth={TOLERANCE_WIDTH}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              segment={[
                { x: 0, y: 0 },
                { x: DOMAIN_MAX, y: DOMAIN_MAX * (1 - tolerance) },
              ]}
              stroke="var(--line-strong)"
              strokeDasharray="4 4"
              strokeWidth={TOLERANCE_WIDTH}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              segment={[
                { x: 0, y: 0 },
                { x: DOMAIN_MAX, y: DOMAIN_MAX },
              ]}
              stroke="var(--text-muted)"
              strokeWidth={IDENTITY_WIDTH}
            />
            <Scatter
              data={dentro}
              fill="var(--text-muted)"
              isAnimationActive={animate}
              name={`Dentro de ${toleranciaTexto}`}
              shape="circle"
            />
            <Scatter
              data={fora}
              fill="var(--chart-1)"
              isAnimationActive={animate}
              name="Fora da tolerância"
              shape="diamond"
            />
            <ReferenceNames tolerance={tolerance} toleranceLow={DOMAIN_MAX * (1 - tolerance)} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {rodape}
      </p>
    </div>
  );
}
