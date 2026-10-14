import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatInt, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PlatformMonth } from './data';

/**
 * A trajetória com um mês sem coleta. O erro fácil aqui é ligar jan/26 a mar/26 por cima do buraco:
 * o traço passaria a afirmar um caminho que ninguém mediu, e num plano de duas medidas ele afirmaria
 * duas coisas de uma vez. A série quebra em duas, o mês que faltou é nomeado no desenho, e nenhum
 * segmento atravessa o vão.
 */
export interface TrajectoryWithGapProps {
  readonly data?: readonly PlatformMonth[];
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly month: string;
  readonly cpl: number;
  readonly taxa: number;
  readonly leads: number;
  readonly qualificados: number;
  readonly isFirst: boolean;
  readonly isLast: boolean;
}

interface Gap {
  readonly key: string;
  readonly months: readonly string[];
  readonly before: Point;
  readonly after: Point;
}

const MARGIN = { top: 24, right: 28, bottom: 8, left: 8 } as const;
/** CPL observado de R$ 108 a R$ 198; passo de 30 fecha em 5 linhas de grade redondas (EIX-4). */
const DOMAIN_X: readonly [number, number] = [100, 220];
const TICKS_X = [100, 130, 160, 190, 220] as const;
/** Qualificação observada de 16,1% a 29,3%; passo de 5 pontos, 4 linhas de grade. */
const DOMAIN_Y: readonly [number, number] = [0.15, 0.3];
const TICKS_Y = [0.15, 0.2, 0.25, 0.3] as const;
const Y_AXIS_WIDTH = 48;
/**
 * O traço CARREGA a relação: apagado ele, ninguém sabe qual mês virou qual. Pela ACE-6 isso o torna
 * dado e cobra 3:1 contra o cartão, e é por isso que `--line-strong` está fora, com 1,79:1 no
 * escuro e 1,83:1 no claro. Medido contra `--surface-raised`: `--chart-1` 9,50:1 e 6,00:1.
 */
const LINE_STROKE = 'var(--chart-1)';
/** O vão não é dado, é a falta dele, e por isso sai em neutro de texto e não na cor da série. */
const GAP_STROKE = 'var(--text-muted)';
const LINE_WIDTH = 2;
const START_RADIUS = 4.5;
const MID_RADIUS = 3;
const END_RADIUS = 5;
/** Maior que qualquer marca de dado, de propósito: o anel do vão não é um ponto da trajetória. */
const GAP_RADIUS = 7;
const LABEL_SIZE = 11;
const LABEL_DROP = 17;
const LABEL_GAP = 12;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;
/** Raio fixado pelas duas pontas do `ZAxis`, porque o tamanho do ponto aqui não codifica nada. */
const Z_RANGE: readonly [number, number] = [Math.PI * MID_RADIUS * MID_RADIUS, Math.PI * MID_RADIUS * MID_RADIUS];

/** CPL do mês. Sem lead captado não existe custo por lead: é ausência, nunca zero (EST-1b). */
function costPerLead(investimento: number | null, leads: number | null): number | null {
  if (investimento === null || leads === null || leads <= 0) return null;
  return investimento / leads;
}

/** Taxa de qualificação do mês. Sem lead captado a taxa não existe (EST-1b). */
function qualificationRate(qualificados: number | null, leads: number | null): number | null {
  if (qualificados === null || leads === null || leads <= 0) return null;
  return qualificados / leads;
}

/**
 * A trajetória, uma perna por corrida de meses medidos, um `<line>` por par de vizinhos. O `line` do
 * `Scatter` ligaria a série inteira, inclusive por cima do vão, que é exatamente o que a EIX-10
 * proíbe; a camada própria existe para o vão simplesmente não ter segmento. As escalas do Recharts
 * só respondem dentro do gráfico, por isso ela vive como filha do `ScatterChart`.
 */
function LegLines({ legs }: { readonly legs: readonly (readonly Point[])[] }) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;

  return (
    <g>
      {legs.map((leg) =>
        leg.slice(0, -1).map((from, index) => {
          const to = leg[index + 1];
          if (!to) return null;
          const x1 = xScale(from.cpl);
          const y1 = yScale(from.taxa);
          const x2 = xScale(to.cpl);
          const y2 = yScale(to.taxa);
          if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return null;
          return (
            <line
              key={`${from.id}-${to.id}`}
              stroke={LINE_STROKE}
              strokeLinecap="round"
              strokeWidth={LINE_WIDTH}
              x1={x1}
              x2={x2}
              y1={y1}
              y2={y2}
            />
          );
        }),
      )}
    </g>
  );
}

/**
 * O anel do vão e o nome do mês que faltou.
 *
 * O anel fica no meio do vão e NÃO é um valor: ele é vazado, tracejado, maior que qualquer marca de
 * dado e nenhum segmento chega até ele, então não há caminho nem posição sendo afirmada. A palavra
 * ao lado é que fecha a leitura, porque forma sozinha não diz por que o mês não está lá.
 */
function GapMarks({ gaps }: { readonly gaps: readonly Gap[] }) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;

  return (
    <g>
      {gaps.map((gap) => {
        const x1 = xScale(gap.before.cpl);
        const y1 = yScale(gap.before.taxa);
        const x2 = xScale(gap.after.cpl);
        const y2 = yScale(gap.after.taxa);
        if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return null;
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const primeiro = gap.months[0];
        const texto =
          gap.months.length === 1 && primeiro !== undefined
            ? `${formatMonthShort(primeiro)} sem coleta`
            : `${formatInt(gap.months.length)} meses sem coleta`;
        return (
          <g key={gap.key}>
            <circle
              cx={cx}
              cy={cy}
              fill="none"
              r={GAP_RADIUS}
              stroke={GAP_STROKE}
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />
            <text
              className="font-display"
              fill={GAP_STROKE}
              fontSize={LABEL_SIZE}
              fontWeight={600}
              style={HALO}
              textAnchor="start"
              x={cx + GAP_RADIUS + LABEL_GAP - 4}
              y={cy + 4}
            >
              {texto}
            </text>
          </g>
        );
      })}
    </g>
  );
}

interface EndLabelsProps {
  readonly first: Point | undefined;
  readonly last: Point | undefined;
  /** Vêm de fora já formatados, pela mesma chamada que monta a frase acessível (DAD-9). */
  readonly firstLabel: string;
  readonly lastLabel: string;
}

/** Rótulo de mês nas duas pontas da série, que é onde o modelo o exige. */
function EndLabels({ first, last, firstLabel, lastLabel }: EndLabelsProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;

  const marks: ReactElement[] = [];
  if (first) {
    const cx = xScale(first.cpl);
    const cy = yScale(first.taxa);
    if (cx !== undefined && cy !== undefined) {
      marks.push(
        <text
          className="font-display"
          fill="var(--text-secondary)"
          fontSize={LABEL_SIZE}
          key="partida"
          style={HALO}
          textAnchor="middle"
          x={cx}
          y={cy + LABEL_DROP}
        >
          {firstLabel}
        </text>,
      );
    }
  }
  if (last) {
    const cx = xScale(last.cpl);
    const cy = yScale(last.taxa);
    if (cx !== undefined && cy !== undefined) {
      marks.push(
        <text
          className="font-display"
          fill="var(--text-secondary)"
          fontSize={LABEL_SIZE}
          key="chegada"
          style={HALO}
          textAnchor="start"
          x={cx + LABEL_GAP}
          y={cy + 4}
        >
          {lastLabel}
        </text>,
      );
    }
  }
  return <g>{marks}</g>;
}

interface PointShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: Point;
}

export default function TrajectoryWithGap({ data = defaultData, height, className }: TrajectoryWithGapProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const ordenados = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const medidos: { readonly month: string; readonly id: string; readonly cpl: number; readonly taxa: number; readonly leads: number; readonly qualificados: number }[] = [];
  const legsCrus: (typeof medidos)[] = [];
  const buracos: { readonly months: string[]; readonly beforeIndex: number }[] = [];
  let corrida: typeof medidos = [];
  let pendentes: string[] = [];

  for (const row of ordenados) {
    const cpl = costPerLead(row.investimento, row.leads);
    const taxa = qualificationRate(row.qualificados, row.leads);
    if (cpl === null || taxa === null || row.leads === null || row.qualificados === null) {
      // O mês fica pendente: só vira vão se houver perna antes E depois dele.
      if (corrida.length > 0) pendentes.push(row.month);
      continue;
    }
    if (pendentes.length > 0 && corrida.length > 0) {
      legsCrus.push(corrida);
      buracos.push({ months: pendentes, beforeIndex: legsCrus.length - 1 });
      corrida = [];
      pendentes = [];
    }
    const item = { month: row.month, id: row.id, cpl, taxa, leads: row.leads, qualificados: row.qualificados };
    corrida.push(item);
    medidos.push(item);
  }
  if (corrida.length > 0) legsCrus.push(corrida);
  const semColeta = ordenados.length - medidos.length;

  if (medidos.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês deste recorte teve coleta: sem lead captado não existe CPL nem qualificação.</span>
      </div>
    );
  }

  const points: Point[] = medidos.map((item, index) => ({
    ...item,
    isFirst: index === 0,
    isLast: index === medidos.length - 1,
  }));
  const porId = new Map(points.map((point) => [point.id, point]));
  const legs: Point[][] = legsCrus.map((leg) =>
    leg.map((item) => porId.get(item.id)).filter((point): point is Point => point !== undefined),
  );
  const gaps: Gap[] = [];
  for (const buraco of buracos) {
    const antes = legs[buraco.beforeIndex];
    const depois = legs[buraco.beforeIndex + 1];
    const before = antes?.[antes.length - 1];
    const after = depois?.[0];
    const primeiro = buraco.months[0];
    if (!before || !after || primeiro === undefined) continue;
    gaps.push({ key: primeiro, months: buraco.months, before, after });
  }

  const first = points[0];
  const last = points[points.length - 1];

  /** As mesmas chamadas alimentam a frase acessível, a linha de leitura e a nota (DAD-9). */
  const mesPartida = first === undefined ? '' : formatMonthShort(first.month);
  const mesChegada = last === undefined ? '' : formatMonthShort(last.month);
  const cplPartida = first === undefined ? '' : formatCurrencyAxis(first.cpl);
  const cplChegada = last === undefined ? '' : formatCurrencyAxis(last.cpl);
  const taxaPartida = first === undefined ? '' : formatRateWithVolume(first.qualificados, first.leads);
  const taxaChegada = last === undefined ? '' : formatRateWithVolume(last.qualificados, last.leads);
  const mesesMedidos = formatInt(medidos.length);
  const mesesNoCalendario = formatInt(ordenados.length);
  const primeiroBuraco = gaps[0];
  const mesDoBuraco = primeiroBuraco === undefined ? '' : formatMonthShort(primeiroBuraco.key);
  const antesDoBuraco = primeiroBuraco === undefined ? '' : formatMonthShort(primeiroBuraco.before.month);
  const depoisDoBuraco = primeiroBuraco === undefined ? '' : formatMonthShort(primeiroBuraco.after.month);

  /**
   * A frase fica entre 100 e 250 caracteres da ACE-1 e abaixo do aviso de 235: medida com o dado
   * padrão, sai em 224 caracteres. O vão entra nela porque quem ouve a frase não vê o anel.
   */
  const summary =
    `Dispersão conectada com ${mesesMedidos} meses medidos de ${mesesNoCalendario}, CPL no eixo horizontal e qualificação no vertical. ` +
    (primeiroBuraco === undefined ? '' : `A linha quebra em ${mesDoBuraco}, sem coleta. `) +
    `O CPL vai de ${cplPartida} a ${cplChegada} e a qualificação de ${taxaPartida} a ${taxaChegada}.`;

  const reading = `O CPL cai de ${cplPartida} a ${cplChegada} nos ${mesesMedidos} meses medidos`;
  /**
   * Mês sem coleta que não fica ENTRE duas pernas não produz vão nenhum no desenho, então ele não
   * tem anel para ser lido e precisa da nota escrita, senão desaparece da peça sem deixar rastro.
   */
  const foraDoVao = semColeta - gaps.reduce((soma, gap) => soma + gap.months.length, 0);
  const footer =
    (primeiroBuraco === undefined
      ? `Todos os ${mesesNoCalendario} meses do calendário tiveram coleta`
      : `${mesDoBuraco} sem coleta: a trajetória quebra e não liga ${antesDoBuraco} a ${depoisDoBuraco}`) +
    (foraDoVao > 0 ? `; outros ${formatInt(foraDoVao)} meses do calendário também ficaram sem coleta` : '');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'cpl', name: 'CPL', value: formatCurrencyAxis(point.cpl) },
      { dataKey: 'taxa', name: 'Qualificação', value: formatRateWithVolume(point.qualificados, point.leads) },
    ] as unknown as ChartTooltipProps['payload'];
    return (
      <ChartTooltip
        active={props.active}
        label={formatMonthShort(point.month)}
        labelFormat="text"
        payload={entries}
        valueFormat="text"
      />
    );
  };

  const renderPoint = ({ cx, cy, payload }: PointShapeProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || !payload) return null;
    if (payload.isFirst) {
      return <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={START_RADIUS} stroke={LINE_STROKE} strokeWidth={2} />;
    }
    if (payload.isLast) {
      return <circle cx={cx} cy={cy} fill={LINE_STROKE} r={END_RADIUS} />;
    }
    return <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={MID_RADIUS} stroke={LINE_STROKE} strokeWidth={1.5} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="cpl"
              domain={[...DOMAIN_X]}
              name="CPL"
              tickFormatter={formatCurrencyAxis}
              tickLine={false}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="taxa"
              domain={[...DOMAIN_Y]}
              name="Qualificação"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <LegLines legs={legs} />
            <GapMarks gaps={gaps} />
            <Scatter data={points} isAnimationActive={animate} name="Plataforma A" shape={renderPoint} />
            <EndLabels first={first} firstLabel={mesPartida} last={last} lastLabel={mesChegada} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {footer}
      </p>
    </div>
  );
}
