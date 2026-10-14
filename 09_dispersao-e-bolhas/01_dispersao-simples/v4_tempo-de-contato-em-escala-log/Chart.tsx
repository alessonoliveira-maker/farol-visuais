import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  Label,
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
import { formatDays, formatHours, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadContactAttempt } from './data';

/**
 * Dispersão em escala logarítmica: 1.800 leads pelo tempo até o primeiro contato e pelas tentativas
 * até a agenda. A escala log existe porque a medida atravessa quatro ordens de grandeza, de 1 minuto
 * a 7 dias, e em escala linear 90% dos pontos se amassam na primeira décima parte do eixo. O preço é
 * que o log não representa o zero, então o contato imediato não pode virar ponto: ele sai para a
 * borda, com a contagem escrita, e quem não tem horário registrado sai do plano.
 */
export interface ContactTimeLogScatterProps {
  readonly data?: readonly LeadContactAttempt[];
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly minutos: number;
  readonly tentativas: number;
}

const MARGIN = { top: 10, right: 20, bottom: 26, left: 8 } as const;
/** Domínio positivo, obrigatório em escala log: 1 minuto a 7 dias. */
const DOMAIN_X: readonly [number, number] = [1, 10_080];
/** Marcas em unidade humana, e não no passo que o eixo escolheria sozinho na unidade crua (REC-21). */
const TICKS_X = [1, 10, 60, 360, 1440, 10_080] as const;
const DOMAIN_Y: readonly [number, number] = [0, 10];
const TICKS_Y = [0, 5, 10] as const;
const Y_AXIS_WIDTH = 34;
/** Raio de 2 px, fixado nas duas pontas do `ZAxis`, porque o tamanho aqui não codifica nada. */
const POINT_RADIUS = 2;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
/** Opacidade baixa para 1.697 pontos: onde a tinta fica forte é onde a nuvem se acumula. */
const POINT_FILL_OPACITY = 0.35;
/** As duas faixas que a linha de leitura compara, em minutos: até 1 h e acima de 1 dia. */
const BAND_FAST = 60;
const BAND_SLOW = 1440;
/**
 * A faixa da borda onde os zeros medidos ficam, à esquerda do primeiro minuto do plano. Ela só
 * existe porque o `padding` esquerdo do eixo reserva os mesmos pixels: sem essa reserva o valor 1
 * cai exatamente na borda do plano e a nuvem do primeiro minuto cobre a faixa inteira.
 */
const ZERO_STRIP_WIDTH = 20;
const ZERO_STRIP_PADDING = { left: 28, right: 6 } as const;
const ZERO_MARK_WIDTH = 2;
const ZERO_MARK_HEIGHT = 6;
const ZERO_COLUMNS = 4;
const ZERO_COLUMN_GAP = 4;

/** Tique em unidade humana: minuto até 1 h, hora até 1 dia, dia acima disso. */
function formatMinutesTick(minutos: number): string {
  if (minutos < 60) return `${formatInt(minutos)} min`;
  if (minutos < 1440) return formatHours(minutos / 60);
  return formatDays(minutos / 1440);
}

/**
 * Mediana. Devolve `null` para lista vazia, nunca `0`: mediana de nada não é zero tentativa, é
 * ausência de leitura, e um `0` escrito na linha de leitura diria que a faixa fecha sem esforço
 * quando o que houve é faixa sem lead (EST-1b).
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const meio = Math.floor(sorted.length / 2);
  const alto = sorted[meio];
  if (alto === undefined) return null;
  if (sorted.length % 2 === 1) return alto;
  const baixo = sorted[meio - 1];
  if (baixo === undefined) return null;
  return (baixo + alto) / 2;
}

/**
 * Os zeros medidos, na borda do plano.
 *
 * Eles não são ausência: o contato aconteceu, e aconteceu no mesmo minuto. Em escala log não existe
 * posição para o zero, então a marca vai para uma faixa reservada à esquerda do primeiro minuto,
 * separada por um tracejado, com a contagem escrita ao lado. Em coluna, porque 41 marcas na mesma
 * altura viram uma só.
 */
function ZeroEdgeLayer({ zeros }: { readonly zeros: readonly number[] }) {
  const plotArea = usePlotArea();
  const yScale = useYAxisScale();
  if (!plotArea || !yScale || zeros.length === 0) return null;
  const base = plotArea.x + 2;
  const limite = plotArea.x + ZERO_STRIP_WIDTH;

  return (
    <g>
      <line
        stroke="var(--line-subtle)"
        strokeDasharray="3 3"
        x1={limite}
        x2={limite}
        y1={plotArea.y}
        y2={plotArea.y + plotArea.height}
      />
      {zeros.map((tentativas, indice) => {
        const cy = yScale(tentativas);
        if (cy === undefined) return null;
        return (
          <rect
            fill="var(--chart-1)"
            height={ZERO_MARK_HEIGHT}
            key={`zero-${String(indice)}`}
            width={ZERO_MARK_WIDTH}
            x={base + (indice % ZERO_COLUMNS) * ZERO_COLUMN_GAP}
            y={cy - ZERO_MARK_HEIGHT / 2}
          />
        );
      })}
      <text
        className="font-display"
        fill="var(--text-muted)"
        fontSize={11}
        style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
        textAnchor="start"
        x={limite + 6}
        y={plotArea.y + 10}
      >
        {`${formatInt(zeros.length)} em 0 min, fora da escala`}
      </text>
    </g>
  );
}

export default function ContactTimeLogScatter({ data = defaultData, height, className }: ContactTimeLogScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  const zeros: number[] = [];
  let missingCount = 0;
  for (const [indice, linha] of data.entries()) {
    const [minutos, tentativas] = linha;
    if (minutos === null) {
      missingCount += 1;
      continue;
    }
    if (minutos <= 0) {
      zeros.push(tentativas);
      continue;
    }
    points.push({ id: `lead-${String(indice + 1).padStart(4, '0')}`, minutos, tentativas });
  }

  if (points.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte com tempo até o primeiro contato acima de zero.</span>
      </div>
    );
  }

  const medianaRapida = median(points.filter((point) => point.minutos <= BAND_FAST).map((point) => point.tentativas));
  const medianaLenta = median(points.filter((point) => point.minutos > BAND_SLOW).map((point) => point.tentativas));
  /** As duas leituras nascem da mesma chamada, para a frase e o corpo dizerem o mesmo número. */
  const leitura =
    medianaRapida === null || medianaLenta === null
      ? null
      : `contatados em até ${formatHours(BAND_FAST / 60)}, mediana de ${formatInt(medianaRapida)} tentativas; acima de ${formatDays(BAND_SLOW / 1440)}, ${formatInt(medianaLenta)}`;

  /** Curta de propósito: a ACE-1 dá 250 caracteres, e aqui a leitura das duas faixas já come 72. */
  const summary =
    `Gráfico de dispersão com ${formatInt(points.length)} leads em escala logarítmica de tempo até o contato contra ` +
    'tentativas até a agenda. ' +
    (leitura === null ? '' : `Leads ${leitura}. `) +
    `${formatInt(zeros.length)} em 0 min na borda e ${formatInt(missingCount)} sem horário não aparecem.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'minutos', name: 'Até o contato', value: formatMinutesTick(point.minutos) },
      { dataKey: 'tentativas', name: 'Tentativas', value: formatInt(point.tentativas) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label="Lead" labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`${formatInt(points.length)} leads no plano`}
        {leitura === null ? '' : `; ${leitura}`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              dataKey="minutos"
              domain={[...DOMAIN_X]}
              name="Até o contato"
              padding={{ ...ZERO_STRIP_PADDING }}
              scale="log"
              tickFormatter={formatMinutesTick}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            >
              <Label
                fill="var(--text-muted)"
                fontSize={11}
                position="insideBottom"
                offset={-18}
                value="Tempo até o primeiro contato, em escala logarítmica"
              />
            </XAxis>
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              dataKey="tentativas"
              domain={[...DOMAIN_Y]}
              name="Tentativas"
              tickFormatter={formatInt}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <ZeroEdgeLayer zeros={zeros} />
            <Scatter data={points} fill="var(--chart-1)" fillOpacity={POINT_FILL_OPACITY} isAnimationActive={animate} name="Leads" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`Eixo vertical: tentativas até a agenda. ${formatInt(missingCount)} sem horário de contato registrado não aparecem`}
      </p>
    </div>
  );
}
