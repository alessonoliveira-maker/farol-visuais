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
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CreativeFrequencyCtr } from './data';

/**
 * O mesmo desenho do modelo, com o piso funcionando: a nuvem de frequência contra taxa de clique
 * não passa nem o piso de R² nem o de tamanho de amostra, então a reta de tendência não é
 * desenhada e o gráfico diz por quê, com os dois números medidos. O que se recusa a desenhar aqui
 * é a autoridade que uma reta daria ao ruído; a nuvem continua inteira, porque ela é o dado.
 */
export interface FrequencyCtrScatterProps {
  readonly data?: readonly CreativeFrequencyCtr[];
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly rotulo: string;
  readonly frequenciaMedia: number;
  readonly taxaClique: number;
  readonly impressoes: number;
  readonly cliques: number;
}

interface LinearFit {
  readonly inclinacao: number;
  readonly intercepto: number;
  readonly r2: number;
  readonly n: number;
  /** Menor e maior X observados: a reta nunca se estende além da nuvem. */
  readonly x0: number;
  readonly x1: number;
}

const MARGIN = { top: 10, right: 20, bottom: 8, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [0, 6];
const TICKS_X = [0, 2, 4, 6] as const;
/** O eixo termina em 2%, a primeira linha de grade acima da maior taxa de clique do dado. */
const DOMAIN_Y: readonly [number, number] = [0, 0.02];
const TICKS_Y = [0, 0.005, 0.01, 0.015, 0.02] as const;
const Y_AXIS_WIDTH = 48;
/** Raio fixado nas duas pontas do `ZAxis`, porque o tamanho do ponto aqui não codifica nada. */
const POINT_RADIUS = 4.5;
const Z_RANGE: readonly [number, number] = [
  Math.PI * POINT_RADIUS * POINT_RADIUS,
  Math.PI * POINT_RADIUS * POINT_RADIUS,
];
/** Os dois pisos da regra do modelo: sem os dois, a reta não entra e o rótulo explica o motivo. */
const R2_FLOOR = 0.3;
const N_FLOOR = 10;
const LABEL_SIZE = 11;
const LABEL_LINE = 17;
/** Recuo do rótulo de ausência dentro do plano, na faixa baixa que a nuvem não ocupa. */
const LABEL_INSET_X = 12;
const LABEL_INSET_BOTTOM = 12;

/**
 * Taxa de clique do criativo. Devolve `null` sem impressão entregue, porque taxa sem base é
 * ausência e não zero: publicada como 0% ela desceria o criativo para o piso do gráfico e entraria
 * na conta do R², dando à nuvem um ponto que ninguém mediu.
 */
function clickRate(cliques: number, impressoes: number): number | null {
  if (impressoes <= 0) return null;
  return cliques / impressoes;
}

/**
 * Mínimos quadrados só do que interessa ao piso: inclinação, R² e n. Devolve `null` com menos de
 * dois pontos ou sem variação em um dos eixos, caso em que não existe reta a julgar.
 */
function linearFit(pontos: readonly Point[]): LinearFit | null {
  const n = pontos.length;
  if (n < 2) return null;
  const mediaX = pontos.reduce((soma, ponto) => soma + ponto.frequenciaMedia, 0) / n;
  const mediaY = pontos.reduce((soma, ponto) => soma + ponto.taxaClique, 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const ponto of pontos) {
    sxx += (ponto.frequenciaMedia - mediaX) ** 2;
    sxy += (ponto.frequenciaMedia - mediaX) * (ponto.taxaClique - mediaY);
    syy += (ponto.taxaClique - mediaY) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  const inclinacao = sxy / sxx;
  let menorX: number | null = null;
  let maiorX: number | null = null;
  for (const ponto of pontos) {
    menorX = menorX === null || ponto.frequenciaMedia < menorX ? ponto.frequenciaMedia : menorX;
    maiorX = maiorX === null || ponto.frequenciaMedia > maiorX ? ponto.frequenciaMedia : maiorX;
  }
  if (menorX === null || maiorX === null) return null;
  return {
    inclinacao,
    intercepto: mediaY - inclinacao * mediaX,
    r2: (sxy * sxy) / (sxx * syy),
    n,
    x0: menorX,
    x1: maiorX,
  };
}

/**
 * O rótulo que explica a ausência da reta, desenhado dentro do plano.
 *
 * Ele fica na faixa baixa do plano, abaixo da menor taxa da nuvem, porque é o único lugar em que um
 * bloco de duas linhas não encosta em marca nenhuma. As duas linhas são `tspan` de um `text` só, e
 * não dois `text`: são a mesma frase quebrada, e o halo precisa valer para o bloco inteiro.
 */
function MissingLineLabel({ titulo, detalhe }: { readonly titulo: string; readonly detalhe: string }) {
  const plotArea = usePlotArea();
  if (!plotArea) return null;
  const x = plotArea.x + LABEL_INSET_X;
  const base = plotArea.y + plotArea.height - LABEL_INSET_BOTTOM;

  return (
    <text
      className="font-display"
      fontSize={LABEL_SIZE}
      style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
      textAnchor="start"
      x={x}
      y={base - LABEL_LINE}
    >
      <tspan fill="var(--text-primary)" fontWeight={600} x={x}>
        {titulo}
      </tspan>
      <tspan dy={LABEL_LINE} fill="var(--text-muted)" x={x}>
        {detalhe}
      </tspan>
    </text>
  );
}

export default function FrequencyCtrScatter({ data = defaultData, height, className }: FrequencyCtrScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  let semBase = 0;
  for (const row of data) {
    const taxa = clickRate(row.cliques, row.impressoes);
    if (taxa === null) {
      semBase += 1;
      continue;
    }
    points.push({
      id: row.id,
      rotulo: row.rotulo,
      frequenciaMedia: row.frequenciaMedia,
      taxaClique: taxa,
      impressoes: row.impressoes,
      cliques: row.cliques,
    });
  }

  if (points.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum criativo neste recorte com impressão entregue para calcular a taxa de clique.</span>
      </div>
    );
  }

  const fit = linearFit(points);
  const passaPiso = fit !== null && fit.r2 >= R2_FLOOR && fit.n >= N_FLOOR;
  const taxas = points.map((ponto) => ponto.taxaClique);
  const menor = Math.min(...taxas);
  const maior = Math.max(...taxas);
  /**
   * Os dois números do piso saem daqui para a frase acessível e para o rótulo, na mesma forma. Sem
   * ajuste possível o R² não é zero, é ausência de medida, e sai como tal.
   */
  const r2Texto = fit === null ? formatUnavailable() : formatDecimal(fit.r2, 2);
  const nTexto = formatInt(fit?.n ?? points.length);
  const motivo = `R² ${r2Texto} contra o piso de ${formatDecimal(R2_FLOOR, 2)}, e n ${nTexto} contra o piso de ${formatInt(N_FLOOR)}`;
  const faixaTexto = `${formatPercent(menor, 2)} a ${formatPercent(maior, 2)}`;

  /** A inclinação traduzida: pontos percentuais de taxa de clique por vez a mais de frequência. */
  const inclinacaoTexto =
    fit === null
      ? ''
      : `${fit.inclinacao >= 0 ? '+' : '−'}${formatDecimal(Math.abs(fit.inclinacao) * 100, 2)} p.p. de taxa de clique por vez a mais de frequência`;
  const tendenciaDetalhe = fit === null ? '' : `R² ${formatDecimal(fit.r2, 2)}, n ${formatInt(fit.n)}`;

  const summary =
    `Gráfico de dispersão com ${formatInt(points.length)} criativos, frequência média contra taxa de clique, ` +
    (passaPiso
      ? `com reta de tendência: ${inclinacaoTexto}, ${tendenciaDetalhe}, acima dos pisos de ${formatDecimal(R2_FLOOR, 2)} e ${formatInt(N_FLOOR)}. `
      : `sem reta de tendência. Sem relação linear detectável: ${motivo}. `) +
    `Taxa de clique de ${faixaTexto}.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'taxaClique', name: 'Taxa de clique', value: formatRateWithVolume(point.cliques, point.impressoes, 2) },
      { dataKey: 'frequenciaMedia', name: 'Frequência', value: `${formatDecimal(point.frequenciaMedia, 1)} vezes` },
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
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`${formatInt(points.length)} criativos no plano, taxa de clique de ${faixaTexto}`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="frequenciaMedia"
              domain={[...DOMAIN_X]}
              name="Frequência"
              tickFormatter={(value: number) => `${formatInt(value)} vezes`}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="taxaClique"
              domain={[...DOMAIN_Y]}
              name="Taxa de clique"
              tickFormatter={(value: number) => formatPercent(value, 1)}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip
              content={renderTooltip}
              cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }}
              isAnimationActive={false}
            />
            {passaPiso && fit !== null ? (
              <ReferenceLine
                segment={[
                  { x: fit.x0, y: fit.intercepto + fit.inclinacao * fit.x0 },
                  { x: fit.x1, y: fit.intercepto + fit.inclinacao * fit.x1 },
                ]}
                stroke="var(--text-muted)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            ) : null}
            <Scatter data={points} fill="var(--chart-1)" isAnimationActive={animate} name="Criativos" shape="circle" />
            {passaPiso ? (
              <MissingLineLabel detalhe={tendenciaDetalhe} titulo={inclinacaoTexto} />
            ) : (
              <MissingLineLabel detalhe={motivo} titulo="Sem relação linear detectável" />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {(passaPiso
          ? `Reta de mínimos quadrados entre a menor e a maior frequência, porque a nuvem passa os dois pisos`
          : 'A reta só entra quando a nuvem passa os dois pisos, e aqui não passa') +
          (semBase === 0
            ? ''
            : `; ${formatInt(semBase)} ${semBase === 1 ? 'criativo sem impressão fica' : 'criativos sem impressão ficam'} fora do plano`)}
      </p>
    </div>
  );
}
