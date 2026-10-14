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
import { formatCurrencyAxis, formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Campaign } from './data';

/**
 * Bolhas: cada círculo é uma campanha, posicionada pelo CPL no eixo horizontal e pela taxa de
 * qualificação no eixo vertical; a área do círculo codifica o investimento. As bolhas maiores são
 * desenhadas primeiro para as pequenas ficarem visíveis por cima, e uma legenda de tamanho dá régua
 * à área, que é a pior lida das três medidas: dois degraus redondos e o máximo do recorte.
 */
export interface CampaignBubblesProps {
  readonly data?: readonly Campaign[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 20, bottom: 8, left: 8 } as const;
const DOMAIN_CPL: readonly [number, number] = [0, 300];
const TICKS_CPL = [0, 75, 150, 225, 300] as const;
const DOMAIN_TAXA: readonly [number, number] = [0, 0.6];
const TICKS_TAXA = [0, 0.15, 0.3, 0.45, 0.6] as const;
const Y_AXIS_WIDTH = 48;
/** Área em px²: piso para a menor bolha não sumir, teto para a maior não estourar o cartão. */
const AREA_MIN = 12;
const AREA_MAX = 900;
// Cor cheia (sem fillOpacity): `--chart-1` a 0,55 compõe para 2,43:1 no tema claro, abaixo do piso de 3:1 da ACE-5; o contorno na cor do cartão separa as bolhas vizinhas.
/**
 * Referências redondas da legenda de tamanho, todas abaixo do máximo. O último degrau não é
 * constante: é o maior investimento do recorte, montado em `legendValues`. Com as três fixas em
 * 10 mil, 50 mil e 150 mil, a régua parava em R$ 150 mil enquanto a campanha de evento presencial
 * investia R$ 182 mil, e a maior bolha da tela, que é a que carrega a conclusão, ficava maior que
 * qualquer círculo da legenda e sem valor de referência. O degrau de 150 mil saiu junto porque a
 * área dele encostava na do máximo (raio de 15,4 px contra 16,9 px) e os dois círculos leriam como
 * um só (conserto de 2026-09-28, na mesma forma de `09_densidade-2d/v1` e
 * `04_bolhas-em-grade-categorica/v1`).
 */
const LEGEND_REFERENCES = [10_000, 50_000] as const;

/** As referências menores que o máximo, mais o próprio máximo: a régua sempre alcança a maior bolha. */
function legendValues(maxValor: number): readonly number[] {
  return [...LEGEND_REFERENCES.filter((value) => value < maxValor), maxValor];
}

/** Raio em px de um círculo cuja área segue a mesma escala linear do ZAxis (domínio a partir de 0). */
function raioPorArea(valor: number, maxValor: number): number {
  const area = AREA_MIN + (valor / maxValor) * (AREA_MAX - AREA_MIN);
  return Math.sqrt(area / Math.PI);
}

export default function CampaignBubbles({ data = defaultData, height, className }: CampaignBubblesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte com CPL, qualificação e investimento registrados.</span>
      </div>
    );
  }

  // Maiores primeiro no array: o Recharts desenha na ordem de entrada, então as pequenas nascem por cima.
  const rows = [...data].sort((a, b) => b.investimento - a.investimento);
  const maxInvestimento = rows[0]?.investimento ?? 0;

  const cplValues = rows.map((row) => row.cpl);
  const taxaValues = rows.map((row) => row.taxaQualificacao);
  const minCpl = Math.min(...cplValues);
  const maxCpl = Math.max(...cplValues);
  const minTaxa = Math.min(...taxaValues);
  const maxTaxa = Math.max(...taxaValues);
  const totalInvestimento = rows.reduce((sum, row) => sum + row.investimento, 0);
  const legendRows = legendValues(maxInvestimento);
  /** A caixa de todos os círculos é a do maior deles, que agora é o máximo observado. */
  const maiorLegendaRaio = raioPorArea(maxInvestimento, maxInvestimento);

  const summary =
    `Gráfico de bolhas com ${String(rows.length)} campanhas: CPL no eixo horizontal, taxa de qualificação no eixo ` +
    'vertical e investimento na área de cada bolha. ' +
    `CPL de ${formatCurrencyCompact(minCpl)} a ${formatCurrencyCompact(maxCpl)}; qualificação de ${formatPercent(minTaxa)} a ${formatPercent(maxTaxa)}; ` +
    `investimento total de ${formatCurrencyCompact(totalInvestimento)}.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as Campaign | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'cpl', name: 'CPL', value: formatCurrencyCompact(row.cpl) },
      { dataKey: 'taxaQualificacao', name: 'Qualificação', value: formatPercent(row.taxaQualificacao) },
      { dataKey: 'investimento', name: 'Investimento', value: formatCurrencyCompact(row.investimento) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Cada bolha é uma campanha; a área é o investimento, maior bolha em{' '}
        <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(maxInvestimento)}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis {...AXIS_PROPS} dataKey="cpl" domain={DOMAIN_CPL} name="CPL" tickFormatter={formatCurrencyAxis} tickMargin={8} ticks={[...TICKS_CPL]} type="number" />
            <YAxis {...AXIS_PROPS} dataKey="taxaQualificacao" domain={DOMAIN_TAXA} name="Qualificação" tickFormatter={(value: number) => formatPercent(value, 0)} tickMargin={8} ticks={[...TICKS_TAXA]} type="number" width={Y_AXIS_WIDTH} />
            <ZAxis dataKey="investimento" domain={[0, maxInvestimento]} name="Investimento" range={[AREA_MIN, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={rows} fill="var(--chart-1)" isAnimationActive={animate} stroke="var(--surface-raised)" strokeWidth={1} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-center gap-6 text-[0.6875rem] text-text-muted">
        <span>Investimento</span>
        {legendRows.map((value) => {
          const raio = raioPorArea(value, maxInvestimento);
          const box = Math.ceil(2 * maiorLegendaRaio);
          return (
            <span className="flex items-end gap-2.5" key={value}>
              <svg height={box} width={box}>
                <circle cx={box / 2} cy={box - raio} fill="var(--chart-1)" r={raio} stroke="var(--surface-raised)" strokeWidth={1} />
              </svg>
              <span className="kpi-number">{formatCurrencyCompact(value)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
