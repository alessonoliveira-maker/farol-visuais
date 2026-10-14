import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  type DotItemDotProps,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import {
  formatCurrency,
  formatDecimal,
  formatInt,
  formatMonthShort,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyLeadCost } from './data';

/**
 * Custo por lead e volume de leads em duas linhas, as duas convertidas em índice sobre o primeiro
 * mês do recorte, num eixo só.
 *
 * A decisão de encoding desta versão é a que ela ensina, e ela é uma renúncia: as duas medidas têm
 * unidades diferentes (reais por lead e contagem), e o caminho fácil seria um segundo eixo com o
 * domínio escolhido a olho. A EIX-8 do CONTRATO proíbe eixo duplo, e a regra de escala que a
 * própria versão pede, índice na mesma data base, dispensa o segundo eixo em vez de maquiá-lo:
 * dividido pelo valor da base, um real por lead e um lead viram a MESMA unidade, o índice, e aí um
 * eixo basta. O preço é o achatamento da série de menor amplitude, e ele é medido e escrito na
 * peça em vez de escondido.
 */
export interface LeadCostIndexLinesProps {
  readonly data?: readonly MonthlyLeadCost[];
  readonly height?: number;
  readonly className?: string;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

interface IndexedMonth extends MonthlyLeadCost {
  /** Custo por lead do mês, ou `null` quando o mês não teve lead para dividir. */
  readonly costPerLead: number | null;
  /** Índice do custo por lead sobre a base, ou `null` sem custo. */
  readonly costIndex: number | null;
  /** Índice do volume de leads sobre a base. */
  readonly leadIndex: number | null;
}

interface IndexDomain {
  readonly domain: readonly [number, number];
  readonly ticks: readonly number[];
  readonly step: number;
}

/** O índice da base, em pontos: toda série vale isto no mês de referência. */
const INDEX_BASE = 100;
/** EIX-4: de 3 a 5 linhas de grade em cartão, e o plano desta peça tem 165,5 px. */
const MAX_TICKS = 5;
/**
 * Passos candidatos do eixo de índice, em pontos. Todos DIVIDEM 100, e é isso que garante que a
 * base caia sempre num tique: sem essa restrição o índice 100 viraria uma linha de referência
 * entre duas marcas, e o leitor perderia a única âncora absoluta que um índice tem.
 */
const INDEX_STEPS = [5, 10, 20, 25, 50, 100] as const;
/** Acima desta razão entre as amplitudes, o eixo comum achata a série menor e a peça avisa. */
const FLATTEN_RATIO = 1.5;
const COST_COLOR = 'var(--chart-1)';
const LEAD_COLOR = 'var(--chart-3)';
/**
 * TOK-4 e TOK-9, medido de `tokens.css` pela fórmula da WCAG: `--chart-1` contra `--chart-3` mede
 * 1,47:1 no escuro e 1,03:1 no claro, isto é, no tema claro a cor sozinha NÃO separa as duas
 * linhas. Não é defeito de paleta e não se conserta trocando o token: as categóricas do Farol têm
 * luminância pareada de propósito. O que resolve é o segundo canal da ACE-2, aqui em dois lugares,
 * a FORMA do ponto (círculo contra quadrado) e o rótulo direto no fim de cada linha.
 *
 * O revestimento na cor do cartão, que é a saída da TOK-10 para linha sobre coluna, foi TENTADO e
 * rejeitado aqui: por construção do índice as duas séries valem 100 no mês da base, então elas
 * compartilham exatamente aquele ponto, e a faixa de 6 px da linha de cima apagaria o ponto da
 * outra logo na entrada do desenho. Onde as duas se cruzam no meio do recorte, quem desambigua é a
 * forma do ponto nos dois vizinhos do cruzamento.
 */
const LINE_WIDTH = 2;
const DOT_RADIUS = 2.6;
/** Metade do lado do ponto quadrado: a área fica perto da do círculo de 2,6 px de raio. */
const DOT_HALF = 2.3;
const BASE_COLOR = 'var(--line-strong)';
const BASE_WIDTH = 1.5;
/** ESP-3: faixa reservada no topo do corpo para o título do eixo, que nada mais ocupa. */
const MARGIN = { top: 24, right: 60, bottom: 0, left: 0 } as const;
/**
 * Altura do título do eixo acima do plano, em px. O `label` do YAxis do Recharts nasce na MESMA
 * linha do tique do topo, e o primeiro render saiu com "índice" a 0 px de tinta de "175", que é a
 * ROT-9 e o aviso da guarda COLISAO-TEXTO. Posicionar à mão resolve pelo eixo vertical: a tinta do
 * título fica 6 px acima da tinta do tique, e o respiro horizontal de 8 px vem do tickMargin.
 */
const AXIS_UNIT_LIFT = 12;
/** Camada de rótulo do Recharts: o texto fica por cima de qualquer marca. */
const LABEL_Z = 2000;
/** EIX-6: o tique mais longo é `175`, que soma 16,17 px glifo a glifo, mais 8 de respiro. */
const Y_AXIS_WIDTH = 48;
const TICK_MARGIN = 8;
/** EIX-6b: `tickMargin` de 8 px mais cerca de 15 px de tinta de uma linha de 11 px. */
const X_AXIS_HEIGHT = 24;
const END_LABEL_GAP = 6;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;

/** Custo por lead do mês. `null`, nunca zero, quando não houve lead para servir de denominador. */
function costPerLead(row: MonthlyLeadCost): number | null {
  if (row.leads <= 0) return null;
  return row.investment / row.leads;
}

/** Valor em índice sobre a base. `null` quando falta o valor ou quando a base não é divisível. */
function toIndex(value: number | null, base: number | null): number | null {
  if (value === null || base === null || base === 0) return null;
  return (INDEX_BASE * value) / base;
}

/** Amplitude de uma série de índice, em pontos. `null` para série sem nenhum ponto (EST-1b). */
function indexAmplitude(values: readonly (number | null)[]): number | null {
  const present = values.filter((value): value is number => value !== null);
  const first = present[0];
  if (first === undefined) return null;
  let low = first;
  let high = first;
  for (const value of present) {
    if (value < low) low = value;
    if (value > high) high = value;
  }
  return high - low;
}

/**
 * Domínio e tiques do eixo de índice, calculados do dado e nunca do automático do Recharts.
 *
 * A conta procura o MENOR passo da lista que feche o intervalo em no máximo `MAX_TICKS` marcas, e
 * o domínio é o múltiplo desse passo abaixo do mínimo e acima do máximo. Como todo passo divide
 * 100, a base cai sempre num tique. Devolve `null` para série vazia, em vez de um domínio
 * inventado (EST-1b).
 */
function buildIndexDomain(values: readonly number[]): IndexDomain | null {
  const first = values[0];
  if (first === undefined) return null;
  let low = first;
  let high = first;
  for (const value of values) {
    if (value < low) low = value;
    if (value > high) high = value;
  }
  for (const step of INDEX_STEPS) {
    const bottom = Math.floor(low / step) * step;
    const top = Math.ceil(high / step) * step;
    const count = (top - bottom) / step + 1;
    if (count <= MAX_TICKS) {
      return {
        domain: [bottom, top],
        step,
        ticks: Array.from({ length: count }, (_, index) => bottom + index * step),
      };
    }
  }
  return null;
}

/** As duas linhas da dica de um mês, na ordem visual do fim das linhas (DIC-4). */
function buildTooltipEntries(row: IndexedMonth): readonly TooltipEntry[] {
  return [
    {
      color: COST_COLOR,
      dataKey: 'costIndex',
      graphicalItemId: 'costIndex',
      name: 'Custo por lead',
      value:
        row.costPerLead === null || row.costIndex === null
          ? formatUnavailable()
          : `${formatCurrency(row.costPerLead)} · índice ${formatInt(row.costIndex)}`,
    },
    {
      color: LEAD_COLOR,
      dataKey: 'leadIndex',
      graphicalItemId: 'leadIndex',
      name: 'Leads no mês',
      value:
        row.leadIndex === null
          ? formatUnavailable()
          : `${formatInt(row.leads)} · índice ${formatInt(row.leadIndex)}`,
    },
  ];
}

/** O título do eixo, posicionado à mão para não nascer colado no tique do topo (ROT-9). */
function AxisUnit(): ReactElement | null {
  const plot = usePlotArea();
  if (!plot) return null;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <text
        className="font-sans"
        fill="var(--text-muted)"
        fontSize={11}
        textAnchor="start"
        x={plot.x}
        y={plot.y - AXIS_UNIT_LIFT}
      >
        índice
      </text>
    </ZIndexLayer>
  );
}

/** Ponto quadrado da série de volume: a FORMA é o segundo canal que a cor não entrega (ACE-2). */
function SquareDot({ cx, cy }: DotItemDotProps): ReactElement | null {
  if (cx === undefined || cy === undefined) return null;
  return (
    <rect
      fill={LEAD_COLOR}
      height={DOT_HALF * 2}
      width={DOT_HALF * 2}
      x={cx - DOT_HALF}
      y={cy - DOT_HALF}
    />
  );
}

export default function LeadCostIndexLines({
  data = defaultData,
  height,
  className,
}: LeadCostIndexLinesProps) {
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
        <span>Nenhum mês neste recorte: sem a data base não existe índice para comparar as duas séries.</span>
      </div>
    );
  }

  const base = data[0];
  const baseCost = base === undefined ? null : costPerLead(base);
  const baseLeads = base === undefined ? null : base.leads;

  const rows: readonly IndexedMonth[] = data.map((row) => {
    const cost = costPerLead(row);
    return {
      ...row,
      costPerLead: cost,
      costIndex: toIndex(cost, baseCost),
      leadIndex: toIndex(row.leads, baseLeads),
    };
  });

  const indexValues = rows.flatMap((row) =>
    [row.costIndex, row.leadIndex].filter((value): value is number => value !== null),
  );
  const scale = buildIndexDomain(indexValues);
  const costAmplitude = indexAmplitude(rows.map((row) => row.costIndex));
  const leadAmplitude = indexAmplitude(rows.map((row) => row.leadIndex));
  const flattening =
    costAmplitude === null || leadAmplitude === null || leadAmplitude === 0
      ? null
      : costAmplitude / leadAmplitude;
  const last = rows[rows.length - 1];

  const summary =
    base === undefined || last === undefined || scale === null
      ? 'Gráfico de duas linhas em índice sem base calculável para comparar custo por lead e volume.'
      : `Gráfico de duas linhas em índice, base ${formatInt(INDEX_BASE)} em ${formatMonthShort(base.month)}, com o custo por lead e o volume de leads em ${formatInt(rows.length)} meses. ${last.costIndex === null ? `Em ${formatMonthShort(last.month)} o custo ficou sem índice, porque não houve lead` : `O custo terminou em índice ${formatInt(last.costIndex)}`}; ${last.leadIndex === null ? 'o volume ficou sem índice' : `o volume terminou em índice ${formatInt(last.leadIndex)}`}, num eixo único de ${formatInt(scale.domain[0])} a ${formatInt(scale.domain[1])} pontos.`;

  /** Rótulo direto no fim de cada linha (ROT-3), que é a identificação sem depender da cor. */
  const renderEndLabel =
    (name: string, color: string, key: 'costIndex' | 'leadIndex') =>
    ({ x, y, index }: LabelProps): ReactElement | null => {
      const row = index === undefined ? undefined : rows[index];
      const value = row === undefined ? null : row[key];
      let lastPresent = -1;
      rows.forEach((candidate, position) => {
        if (candidate[key] !== null) lastPresent = position;
      });
      if (row === undefined || value === null || index !== lastPresent) return null;
      return (
        <text
          className="font-sans"
          dominantBaseline="central"
          fill={color}
          fontSize={11}
          fontWeight={600}
          style={HALO}
          textAnchor="start"
          x={Number(x) + END_LABEL_GAP}
          y={Number(y)}
        >
          {name} <tspan className="font-display">{formatInt(value)}</tspan>
        </text>
      );
    };

  const renderBaseLabel = ({
    viewBox,
  }: {
    readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number };
  }): ReactElement => (
    <text
      className="font-sans"
      fill="var(--text-muted)"
      fontSize={11}
      style={HALO}
      textAnchor="end"
      x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)}
      y={(viewBox?.y ?? 0) + 14}
    >
      base <tspan className="font-display">{formatInt(INDEX_BASE)}</tspan>
    </text>
  );

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip
        active={tooltipProps.active}
        label={month}
        labelFormat="month"
        payload={buildTooltipEntries(row)}
      />
    );
  };

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="img"
      style={style}
    >
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        {last === undefined || last.costIndex === null || last.leadIndex === null ? (
          <>Sem índice calculável no último mês do recorte</>
        ) : (
          <>
            <span className="font-semibold text-text-primary">
              {last.costIndex > last.leadIndex ? 'O custo subiu mais que o volume' : 'O volume subiu mais que o custo'}
            </span>
            : índice{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(last.costIndex)}</span>{' '}
            do custo por lead contra{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(last.leadIndex)}</span>{' '}
            do volume em {formatMonthShort(last.month)}
          </>
        )}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickMargin={TICK_MARGIN}
            />
            <YAxis
              {...AXIS_PROPS}
              allowDataOverflow
              axisLine={false}
              domain={scale === null ? undefined : [scale.domain[0], scale.domain[1]]}
              niceTicks="none"
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={TICK_MARGIN}
              ticks={scale === null ? undefined : [...scale.ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={renderTooltip}
              cursor={{ stroke: 'var(--line-strong)' }}
              isAnimationActive={false}
            />
            <AxisUnit />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderBaseLabel}
              stroke={BASE_COLOR}
              strokeWidth={BASE_WIDTH}
              y={INDEX_BASE}
            />
            <Line
              connectNulls={false}
              dataKey="costIndex"
              dot={{ r: DOT_RADIUS, fill: COST_COLOR, strokeWidth: 0 }}
              isAnimationActive={animate}
              label={renderEndLabel('custo', COST_COLOR, 'costIndex')}
              name="Custo por lead"
              stroke={COST_COLOR}
              strokeWidth={LINE_WIDTH}
              type="linear"
            />
            <Line
              connectNulls={false}
              dataKey="leadIndex"
              dot={SquareDot}
              isAnimationActive={animate}
              label={renderEndLabel('leads', LEAD_COLOR, 'leadIndex')}
              name="Leads no mês"
              stroke={LEAD_COLOR}
              strokeWidth={LINE_WIDTH}
              type="linear"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-1.5 shrink-0 text-[11px] leading-4 text-text-muted">
        {scale === null || base === undefined || baseCost === null ? (
          <>Sem a data base do recorte não existe regra de escala a declarar</>
        ) : (
          <>
            Índice, base <span className="tabular-nums">{formatInt(INDEX_BASE)}</span> em{' '}
            {formatMonthShort(base.month)}: eixo único de{' '}
            <span className="tabular-nums">{formatInt(scale.domain[0])}</span> a{' '}
            <span className="tabular-nums">{formatInt(scale.domain[1])}</span> pontos, passo{' '}
            <span className="tabular-nums">{formatInt(scale.step)}</span>. Na base,{' '}
            <span className="tabular-nums">{formatCurrency(baseCost)}</span> por lead e{' '}
            <span className="tabular-nums">{formatInt(base.leads)}</span> leads.
          </>
        )}
      </p>
      {flattening === null || flattening < FLATTEN_RATIO ? null : (
        <p aria-hidden className="mt-0.5 shrink-0 text-[11px] leading-4 text-warning">
          A amplitude do índice do custo é{' '}
          <span className="tabular-nums">{formatDecimal(flattening, 1)}</span> vezes a do volume: no
          eixo comum a série de menor amplitude fica achatada.
        </p>
      )}
    </div>
  );
}
