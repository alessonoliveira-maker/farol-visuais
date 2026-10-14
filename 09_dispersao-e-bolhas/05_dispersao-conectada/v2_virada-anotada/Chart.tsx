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
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PlatformMonth } from './data';

/**
 * A virada de público: o CPL cai nos doze meses inteiros, e a qualificação sobe até um mês e cai
 * daí em diante. Duas linhas separadas mostrariam as duas quedas, e nenhuma delas mostraria que a
 * segunda começa justamente onde a primeira compensava; é o cotovelo da trajetória que diz isso, e
 * por isso ele é a única coisa colorida do plano.
 */
export interface TurningPointTrajectoryProps {
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
}

const MARGIN = { top: 30, right: 28, bottom: 8, left: 8 } as const;
/** CPL observado de R$ 96 a R$ 205; o passo de 30 fecha em 5 linhas de grade redondas (EIX-4). */
const DOMAIN_X: readonly [number, number] = [90, 210];
const TICKS_X = [90, 120, 150, 180, 210] as const;
/** Qualificação observada de 11,1% a 29,4%; passo de 5 pontos, 5 linhas de grade. */
const DOMAIN_Y: readonly [number, number] = [0.1, 0.3];
const TICKS_Y = [0.1, 0.15, 0.2, 0.25, 0.3] as const;
const Y_AXIS_WIDTH = 48;
/**
 * O traço CARREGA a relação aqui: apagado ele, ninguém sabe qual mês virou qual. Pela ACE-6 isso o
 * torna dado e cobra 3:1 contra o cartão, e é por isso que `--line-strong` está fora: ele mede
 * 1,79:1 no escuro e 1,83:1 no claro. Medido contra `--surface-raised`: `--text-muted` 5,21:1 no
 * escuro e 5,37:1 no claro, `--chart-1` 9,50:1 e 6,00:1.
 */
const NEUTRAL_STROKE = 'var(--text-muted)';
const TURN_STROKE = 'var(--chart-1)';
const NEUTRAL_WIDTH = 2;
const TURN_WIDTH = 3;
const START_RADIUS = 4.5;
const MID_RADIUS = 3;
const END_RADIUS = 5;
/** O anel em volta do cotovelo é o segundo canal do destaque, para a cor não ser a única (ACE-2). */
const TURN_RING_RADIUS = 9;
const LABEL_SIZE = 11;
const LABEL_DROP = 17;
const NOTE_LIFT = 11;
const NOTE_GAP = 12;
const NOTE_DROP = 6;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;
/** Raio fixado pelas duas pontas do `ZAxis`, porque o tamanho do ponto aqui não codifica nada. */
const Z_RANGE: readonly [number, number] = [Math.PI * MID_RADIUS * MID_RADIUS, Math.PI * MID_RADIUS * MID_RADIUS];

/** CPL do mês. Sem lead captado não existe custo por lead: é ausência, nunca zero (EST-1b). */
function costPerLead(investimento: number, leads: number): number | null {
  if (leads <= 0) return null;
  return investimento / leads;
}

/** Taxa de qualificação do mês. Sem lead captado a taxa não existe (EST-1b). */
function qualificationRate(qualificados: number, leads: number): number | null {
  if (leads <= 0) return null;
  return qualificados / leads;
}

/**
 * O mês em que a QUALIFICAÇÃO muda de direção, e não o CPL: aqui o CPL cai nos doze meses, então
 * uma virada procurada nele não existiria. Devolve -1 quando a série não vira.
 */
function findTurnIndex(rows: readonly Point[]): number {
  for (let index = 1; index < rows.length - 1; index += 1) {
    const prev = rows[index - 1];
    const curr = rows[index];
    const next = rows[index + 1];
    if (!prev || !curr || !next) continue;
    const antes = Math.sign(curr.taxa - prev.taxa);
    const depois = Math.sign(next.taxa - curr.taxa);
    if (antes !== 0 && depois !== 0 && antes !== depois) return index;
  }
  return -1;
}

/**
 * A trajetória, um `<line>` por par de meses vizinhos, numa camada própria em vez do `line` do
 * `Scatter`: aquele pinta o caminho inteiro de uma cor só, e a versão precisa de duas, o cotovelo
 * aceso e o resto em neutro. As escalas do Recharts só respondem dentro do gráfico, por isso a
 * camada vive como filha do `ScatterChart`.
 */
function TrajectoryLine({ points, turnIndex }: { readonly points: readonly Point[]; readonly turnIndex: number }) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;

  return (
    <g>
      {points.slice(0, -1).map((from, index) => {
        const to = points[index + 1];
        if (!to) return null;
        const x1 = xScale(from.cpl);
        const y1 = yScale(from.taxa);
        const x2 = xScale(to.cpl);
        const y2 = yScale(to.taxa);
        if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return null;
        // Os dois segmentos que encostam na virada formam o cotovelo; só eles acendem.
        const noCotovelo = turnIndex >= 0 && (index === turnIndex - 1 || index === turnIndex);
        return (
          <line
            key={`${from.id}-${to.id}`}
            stroke={noCotovelo ? TURN_STROKE : NEUTRAL_STROKE}
            strokeLinecap="round"
            strokeWidth={noCotovelo ? TURN_WIDTH : NEUTRAL_WIDTH}
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
          />
        );
      })}
    </g>
  );
}

interface NotesLayerProps {
  readonly points: readonly Point[];
  readonly turnIndex: number;
  readonly startLabel: string;
  readonly turnNote: string;
  readonly endNote: string;
}

/**
 * As duas anotações da ANO-1 e o rótulo do mês de partida, desenhados por último para ficarem por
 * cima do traço, cada um com halo da cor do cartão porque todos os três cruzam a trajetória
 * (ROT-7). As posições saem das escalas e são presas ao plano, então mudar o domínio não joga
 * texto para fora.
 */
function NotesLayer({ points, turnIndex, startLabel, turnNote, endNote }: NotesLayerProps) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const first = points[0];
  const last = points[points.length - 1];
  const turn = turnIndex >= 0 ? points[turnIndex] : undefined;

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
          fontWeight={500}
          key="partida"
          style={HALO}
          textAnchor="middle"
          x={cx}
          y={cy + LABEL_DROP}
        >
          {startLabel}
        </text>,
      );
    }
  }

  if (turn) {
    const cx = xScale(turn.cpl);
    const cy = yScale(turn.taxa);
    if (cx !== undefined && cy !== undefined) {
      marks.push(
        <text
          className="font-display"
          fill="var(--text-muted)"
          fontSize={LABEL_SIZE}
          fontWeight={600}
          key="virada"
          style={HALO}
          textAnchor="middle"
          x={cx}
          y={cy - NOTE_LIFT}
        >
          {turnNote}
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
          fill="var(--text-muted)"
          fontSize={LABEL_SIZE}
          key="chegada"
          style={HALO}
          textAnchor="start"
          x={cx + NOTE_GAP}
          y={cy + NOTE_DROP}
        >
          {endNote}
        </text>,
      );
    }
  }

  return <g>{marks}</g>;
}

interface PointShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: Point & { readonly isFirst: boolean; readonly isLast: boolean; readonly isTurn: boolean };
}

export default function TurningPointTrajectory({ data = defaultData, height, className }: TurningPointTrajectoryProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  let semLead = 0;
  for (const row of [...data].sort((a, b) => a.month.localeCompare(b.month))) {
    const cpl = costPerLead(row.investimento, row.leads);
    const taxa = qualificationRate(row.qualificados, row.leads);
    if (cpl === null || taxa === null) {
      semLead += 1;
      continue;
    }
    points.push({ id: row.id, month: row.month, cpl, taxa, leads: row.leads, qualificados: row.qualificados });
  }

  if (points.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte com lead captado: sem lead não existe CPL nem taxa de qualificação.</span>
      </div>
    );
  }

  const turnIndex = findTurnIndex(points);
  const first = points[0];
  const last = points[points.length - 1];
  const turn = turnIndex >= 0 ? points[turnIndex] : undefined;
  const marked = points.map((point, index) => ({
    ...point,
    isFirst: index === 0,
    isLast: index === points.length - 1,
    isTurn: index === turnIndex,
  }));

  /** As mesmas chamadas alimentam a frase acessível, a linha de leitura e as anotações (DAD-9). */
  const mesPartida = first === undefined ? '' : formatMonthShort(first.month);
  const mesChegada = last === undefined ? '' : formatMonthShort(last.month);
  const mesVirada = turn === undefined ? '' : formatMonthShort(turn.month);
  const cplPartida = first === undefined ? '' : formatCurrencyAxis(first.cpl);
  const cplChegada = last === undefined ? '' : formatCurrencyAxis(last.cpl);
  const taxaPartida = first === undefined ? '' : formatRateWithVolume(first.qualificados, first.leads);
  const taxaVirada = turn === undefined ? '' : formatRateWithVolume(turn.qualificados, turn.leads);
  const taxaChegada = last === undefined ? '' : formatRateWithVolume(last.qualificados, last.leads);

  const turnNote = turn === undefined ? '' : `${mesVirada}, o topo: ${taxaVirada}`;
  const endNote = last === undefined ? '' : `${mesChegada}: ${cplChegada} e ${taxaChegada}`;
  /**
   * A frase fica entre 100 e 250 caracteres da ACE-1 e abaixo do aviso de 235: medida com o dado
   * padrão, sai em 224 caracteres com virada e 219 sem ela. A taxa de partida só aparece no ramo
   * sem virada, porque com virada o que conclui é o topo e a chegada, não a largada.
   */
  const summary =
    `Dispersão conectada da plataforma A, CPL no eixo horizontal e qualificação no vertical. ` +
    `De ${mesPartida} a ${mesChegada} o CPL ` +
    (turn === undefined
      ? `vai de ${cplPartida} a ${cplChegada} e a qualificação vai de ${taxaPartida} a ${taxaChegada}, sem mudar de direção.`
      : `cai de ${cplPartida} a ${cplChegada} e a qualificação sobe ao topo de ${taxaVirada} em ${mesVirada}, caindo a ${taxaChegada}.`);
  const reading =
    turn === undefined
      ? `O CPL vai de ${cplPartida} a ${cplChegada} e a qualificação não muda de direção`
      : `O CPL cai de ${cplPartida} a ${cplChegada}, e a qualificação para de subir em ${mesVirada}`;

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
      return <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={START_RADIUS} stroke={NEUTRAL_STROKE} strokeWidth={2} />;
    }
    if (payload.isLast) {
      return <circle cx={cx} cy={cy} fill={NEUTRAL_STROKE} r={END_RADIUS} />;
    }
    if (payload.isTurn) {
      return (
        <g>
          <circle cx={cx} cy={cy} fill="none" r={TURN_RING_RADIUS} stroke={TURN_STROKE} strokeWidth={1.5} />
          <circle cx={cx} cy={cy} fill={TURN_STROKE} r={END_RADIUS} />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={MID_RADIUS} stroke={NEUTRAL_STROKE} strokeWidth={1.5} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {reading}
        {semLead > 0 ? '; meses sem lead captado ficam fora do plano' : ''}
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
            <TrajectoryLine points={points} turnIndex={turnIndex} />
            <Scatter data={marked} isAnimationActive={animate} name="Plataforma A" shape={renderPoint} />
            <NotesLayer endNote={endNote} points={points} startLabel={mesPartida} turnIndex={turnIndex} turnNote={turnNote} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
