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
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Campaign } from './data';

/**
 * Bolhas com três estados de investimento: verba gasta desenha bolha cheia, zero MEDIDO desenha
 * anel tracejado do tamanho mínimo, e investimento não registrado sai do plano e é contado no
 * rodapé. Os dois últimos casos costumam virar a mesma coisa no desenho, e virar a mesma coisa é
 * mentir: a campanha orgânica de verba zero é resultado, a campanha sem apuração é lacuna.
 *
 * A outra pergunta que esta versão responde é de escala: com a maior verba passando 200 vezes a
 * menor, a área proporcional some com as pequenas, então existe piso de área, e o piso vai DECLARADO
 * na régua com a distorção que ele produz medida do próprio dado.
 */
export interface UnequalInvestmentBubblesProps {
  readonly data?: readonly Campaign[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 14, right: 24, bottom: 36, left: 8 } as const;
const DOMAIN_LEADS: readonly [number, number] = [0, 2_500];
const TICKS_LEADS = [0, 500, 1_000, 1_500, 2_000, 2_500] as const;
const DOMAIN_TAXA: readonly [number, number] = [0, 0.6];
const TICKS_TAXA = [0, 0.15, 0.3, 0.45, 0.6] as const;
const Y_AXIS_WIDTH = 68;
/**
 * Piso e teto do RAIO em px; a área sai deles, porque é a área que codifica o valor. A GEO-3 pede
 * `Math.sqrt(rMin ** 2 + (rMax ** 2 − rMin ** 2) * v / topo)`, e a conta em área é a mesma
 * identidade: com `area = π·rMin² + t·(π·rMax² − π·rMin²)`, `sqrt(area / π)` devolve exatamente
 * aquela raiz. O que a armadilha proíbe é a meia correção, a raiz aplicada por dentro do piso.
 *
 * O piso é 5 px aqui, e não os 2,2 px das versões de faixa estreita, por dois motivos medidos: um
 * anel tracejado de raio 2,2 tem 14 px de circunferência e não mostra tracejo nenhum, e com a maior
 * verba em 233 vezes a menor a área honesta da menor daria menos de meio pixel quadrado. Piso maior
 * distorce mais, e é por isso que ele vai escrito na régua em vez de ficar só no código.
 */
const RAIO_MIN = 5;
const RAIO_MAX = 17;
const AREA_MIN = Math.PI * RAIO_MIN * RAIO_MIN;
const AREA_MAX = Math.PI * RAIO_MAX * RAIO_MAX;
/** Degraus intermediários da régua; o último é o máximo observado (ROT-5b). */
const LEGEND_REFERENCES = [25_000, 100_000] as const;
/** Acima desta razão entre a maior e a menor verba, o piso de área vai declarado na régua. */
const RAZAO_PARA_DECLARAR_PISO = 200;

interface PaidCampaign extends Campaign {
  readonly investimento: number;
}

/** As referências menores que o máximo, mais o próprio máximo: a régua sempre alcança a maior bolha. */
function legendValues(maxValor: number): readonly number[] {
  return [...LEGEND_REFERENCES.filter((value) => value < maxValor), maxValor];
}

/** Raio em px de um círculo cuja ÁREA segue a escala linear do `ZAxis`, com domínio a partir de 0. */
function raioPorArea(valor: number, maxValor: number): number {
  const area = AREA_MIN + (valor / maxValor) * (AREA_MAX - AREA_MIN);
  return Math.sqrt(area / Math.PI);
}

/** Fração da área da maior bolha que um valor ocupa depois do piso; é o que a régua declara. */
function fracaoDaArea(valor: number, maxValor: number): number {
  const raio = raioPorArea(valor, maxValor);
  return (raio * raio) / (RAIO_MAX * RAIO_MAX);
}

/**
 * O zero medido em anel tracejado do tamanho mínimo. O `shape` é obrigatório aqui: sem ele a bolha
 * de zero sairia preenchida no mesmo raio de piso de uma campanha de R$ 900, e as duas leriam igual.
 * A forma vazada e tracejada é o segundo canal que a ACE-2 pede, e a palavra que a acompanha está na
 * régua, com o `R$ 0` escrito, que é a exigência da EST-3.
 */
function ZeroRing({ cx, cy }: { readonly cx?: number; readonly cy?: number }) {
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} fill="none" r={RAIO_MIN} stroke="var(--text-muted)" strokeDasharray="2 2" strokeWidth={1.25} />;
}

export default function UnequalInvestmentBubbles({ data = defaultData, height, className }: UnequalInvestmentBubblesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const pagas = data.filter((row): row is PaidCampaign => row.investimento !== null && row.investimento > 0);
  const zeradas = data.filter((row): row is PaidCampaign => row.investimento === 0);
  const ausentes = data.filter((row) => row.investimento === null);

  if (pagas.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte com verba apurada acima de zero.</span>
      </div>
    );
  }

  // Maiores primeiro: o Recharts pinta na ordem de entrada, então as pequenas nascem por cima (REC-13).
  const rows = [...pagas].sort((a, b) => b.investimento - a.investimento);
  const zeros = [...zeradas].sort((a, b) => b.leads - a.leads);
  const verbas = rows.map((row) => row.investimento);
  const maxInvestimento = Math.max(...verbas);
  const minInvestimento = Math.min(...verbas);
  const totalInvestimento = verbas.reduce((soma, valor) => soma + valor, 0);
  const razao = maxInvestimento / minInvestimento;
  const declararPiso = razao >= RAZAO_PARA_DECLARAR_PISO;
  const legendRows = legendValues(maxInvestimento);
  /** A caixa de todos os círculos da régua é a do maior deles, que é o máximo observado. */
  const maiorLegendaRaio = raioPorArea(maxInvestimento, maxInvestimento);

  /** As mesmas chamadas alimentam a frase acessível e o corpo, para as duas lerem igual (DAD-9). */
  const quantasPagas = formatInt(rows.length);
  const quantasZeradas = formatInt(zeros.length);
  const quantasAusentes = formatInt(ausentes.length);
  const menorEscrita = formatCurrencyAxis(minInvestimento);
  const maiorEscrita = formatCurrencyCompact(maxInvestimento);
  const totalEscrito = formatCurrencyCompact(totalInvestimento);
  const zeroEscrito = formatCurrencyCompact(0);
  const vezes = formatInt(Math.round(razao));

  const summary =
    `Gráfico de bolhas com ${formatInt(data.length)} campanhas, leads no eixo horizontal, qualificação no vertical e ` +
    `investimento na área. ${quantasPagas} com verba de ${menorEscrita} a ${maiorEscrita}, ${quantasZeradas} com ` +
    `${zeroEscrito} medido em anel tracejado e ${quantasAusentes} sem verba apurada, fora do plano.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as PaidCampaign | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'leads', name: 'Leads', value: formatInt(row.leads) },
      { dataKey: 'taxaQualificacao', name: 'Qualificação', value: formatPercent(row.taxaQualificacao) },
      { dataKey: 'investimento', name: 'Investimento', value: formatCurrencyCompact(row.investimento) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`A maior verba é ${vezes} vezes a menor, de ${menorEscrita} a ${maiorEscrita}, em ${totalEscrito} somados`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              dataKey="leads"
              domain={[...DOMAIN_LEADS]}
              label={{ dy: 14, fill: 'var(--text-muted)', fontSize: 11, position: 'insideBottom', value: 'Leads gerados (contagem)' }}
              name="Leads"
              tickFormatter={formatInt}
              tickMargin={8}
              ticks={[...TICKS_LEADS]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="taxaQualificacao"
              domain={[...DOMAIN_TAXA]}
              name="Qualificação"
              label={{ angle: -90, dx: -4, fill: 'var(--text-muted)', fontSize: 11, position: 'insideLeft', style: { textAnchor: 'middle' }, value: 'Taxa de qualificação' }}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...TICKS_TAXA]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis dataKey="investimento" domain={[0, maxInvestimento]} name="Investimento" range={[AREA_MIN, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={rows} fill="var(--chart-1)" isAnimationActive={animate} name="Com verba" stroke="var(--surface-raised)" strokeWidth={1} />
            <Scatter data={zeros} isAnimationActive={animate} name="Verba zero medida" shape={<ZeroRing />} />
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
        <span className="flex items-end gap-2.5">
          <svg height={Math.ceil(2 * maiorLegendaRaio)} width={2 * RAIO_MIN + 3}>
            <circle
              cx={RAIO_MIN + 1.5}
              cy={Math.ceil(2 * maiorLegendaRaio) - RAIO_MIN - 1}
              fill="none"
              r={RAIO_MIN}
              stroke="var(--text-muted)"
              strokeDasharray="2 2"
              strokeWidth={1.25}
            />
          </svg>
          <span className="kpi-number">{`${zeroEscrito} medido`}</span>
        </span>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {declararPiso
          ? `piso de área: ${menorEscrita} lê ${formatPercent(fracaoDaArea(minInvestimento, maxInvestimento), 0)} da área e vale ${formatPercent(minInvestimento / maxInvestimento)}`
          : `área proporcional ao valor, sem piso declarado`}
      </p>
      <p aria-hidden className="mt-1 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`${quantasAusentes} campanhas com investimento ${formatUnavailable()} ficam fora do plano`}
      </p>
    </div>
  );
}
