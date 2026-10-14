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
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import {
  formatCurrencyAxis,
  formatCurrencyCompact,
  formatInt,
  formatPercent,
  formatRateWithVolume,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveWinRate } from './data';

/**
 * Dispersão simples com rótulo direto só nos extremos: cada ponto é um executivo, posicionado pelo
 * ticket médio no eixo horizontal e pelo win rate no vertical. A nuvem do meio fica em neutro e só
 * os 3 maiores e os 3 menores win rate ganham nome, porque acima de cerca de 8 rótulos diretos a
 * nuvem deixa de ser legível e o texto passa a competir com a marca.
 */
export interface ExecutiveWinRateScatterProps {
  readonly data?: readonly ExecutiveWinRate[];
  readonly height?: number;
  readonly className?: string;
}

/** O papel de desenho de cada ponto, e é ele que decide cor, anel e rótulo. */
type Role = 'alta' | 'meio' | 'baixa';

interface Point {
  readonly id: string;
  readonly name: string;
  readonly ticketMedio: number;
  readonly winRate: number;
  readonly ganhas: number;
  readonly oportunidades: number;
  readonly role: Role;
  /** O primeiro e o último da ordem, os dois únicos que levam peso 700 pelo teto da TIP-3. */
  readonly extremo: boolean;
}

const MARGIN = { top: 14, right: 22, bottom: 8, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [0, 600_000];
const TICKS_X = [0, 150_000, 300_000, 450_000, 600_000] as const;
/** O eixo termina em 80%, a primeira linha de grade acima do maior win rate do dado (EIX-4). */
const DOMAIN_Y: readonly [number, number] = [0, 0.8];
const TICKS_Y = [0, 0.2, 0.4, 0.6, 0.8] as const;
const Y_AXIS_WIDTH = 48;
/** Quantos pontos de cada ponta recebem nome; seis rótulos é o teto que a nuvem aguenta aqui. */
const EXTREMES = 3;
/** Raio da marca em pixels, fixado pelas duas pontas do `ZAxis` para o tamanho não codificar nada. */
const POINT_RADIUS = 4.5;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
/** O anel é o segundo canal do destaque, para a cor não ser a única pista (ACE-2). */
const RING_RADIUS = 8.5;
const LABEL_SIZE = 11;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.4;
const LABEL_PAD = 3;

const ROLE_COLOR: Readonly<Record<Role, string>> = {
  alta: 'var(--positive)',
  baixa: 'var(--negative)',
  meio: 'var(--text-muted)',
};

/**
 * As 8 candidatas de posição do rótulo, na ordem de preferência: primeiro os lados, que nunca
 * cobrem grade de valor, depois topo e base, depois as diagonais.
 */
const LABEL_CANDIDATES: readonly { readonly dx: number; readonly dy: number; readonly anchor: Anchor }[] = [
  { dx: 13, dy: 4, anchor: 'start' },
  { dx: -13, dy: 4, anchor: 'end' },
  { dx: 0, dy: -13, anchor: 'middle' },
  { dx: 0, dy: 19, anchor: 'middle' },
  { dx: 11, dy: -10, anchor: 'start' },
  { dx: -11, dy: -10, anchor: 'end' },
  { dx: 11, dy: 17, anchor: 'start' },
  { dx: -11, dy: 17, anchor: 'end' },
];

/** Só as três âncoras que o SVG aceita, para o tipo não virar `string` na hora de desenhar. */
type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/**
 * Win rate do executivo. Devolve `null` sem oportunidade fechada, porque taxa sem base é ausência
 * e não zero: publicada como 0% ela mandaria o executivo para o fundo do gráfico (EST-1b).
 */
function winRate(ganhas: number, oportunidades: number): number | null {
  if (oportunidades <= 0) return null;
  return ganhas / oportunidades;
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

/**
 * Camada de rótulo e anel dos extremos, desenhada por último para ficar por cima da nuvem (REC-13).
 *
 * Ela vive dentro do `ScatterChart` porque só ali os hooks de escala do Recharts respondem, e a
 * anticolisão precisa dos pixels de todos os pontos ao mesmo tempo: o `content` do `LabelList`
 * recebe um rótulo por vez e não tem como saber onde os vizinhos caíram.
 */
function ExtremeLabelLayer({ points, labeled }: { readonly points: readonly Point[]; readonly labeled: readonly Point[] }) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const placed: { readonly point: Point; readonly cx: number; readonly cy: number; readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number }[] = [];
  const marks: Box[] = [];
  for (const point of points) {
    const cx = xScale(point.ticketMedio);
    const cy = yScale(point.winRate);
    if (cx === undefined || cy === undefined) continue;
    const raio = labeled.includes(point) ? RING_RADIUS : POINT_RADIUS;
    marks.push({ left: cx - raio, top: cy - raio, right: cx + raio, bottom: cy + raio });
  }

  for (const point of labeled) {
    const cx = xScale(point.ticketMedio);
    const cy = yScale(point.winRate);
    if (cx === undefined || cy === undefined) continue;
    const width = point.name.length * LABEL_CHAR_WIDTH;
    let melhor: { readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number; readonly faltas: number } | null = null;
    for (const candidate of LABEL_CANDIDATES) {
      const x = cx + candidate.dx;
      const y = cy + candidate.dy;
      const left = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
      const box: Box = { left, top: y - LABEL_SIZE + 2, right: left + width, bottom: y + 2 };
      const foraDoPlano =
        box.left < plotArea.x + 1 ||
        box.right > plotArea.x + plotArea.width - 1 ||
        box.top < plotArea.y ||
        box.bottom > plotArea.y + plotArea.height;
      const faltas =
        (foraDoPlano ? 100 : 0) +
        marks.filter((mark) => overlaps(box, mark, 1)).length +
        placed.filter((outro) => overlaps(box, outro.box, LABEL_PAD)).length;
      if (faltas === 0) {
        melhor = { box, anchor: candidate.anchor, x, y, faltas };
        break;
      }
      if (melhor === null || faltas < melhor.faltas) melhor = { box, anchor: candidate.anchor, x, y, faltas };
    }
    if (melhor === null) continue;
    placed.push({ point, cx, cy, box: melhor.box, anchor: melhor.anchor, x: melhor.x, y: melhor.y });
  }

  return (
    <g>
      {placed.map((item) => (
        <circle
          cx={item.cx}
          cy={item.cy}
          fill="none"
          key={`anel-${item.point.id}`}
          r={RING_RADIUS}
          stroke={ROLE_COLOR[item.point.role]}
          strokeWidth={1.5}
        />
      ))}
      {placed.map((item) => (
        <text
          fill="var(--text-primary)"
          fontSize={LABEL_SIZE}
          fontWeight={item.point.extremo ? 700 : 600}
          key={`rotulo-${item.point.id}`}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor={item.anchor}
          x={item.x}
          y={item.y}
        >
          {item.point.name}
        </text>
      ))}
    </g>
  );
}

export default function ExecutiveWinRateScatter({ data = defaultData, height, className }: ExecutiveWinRateScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const medidos = data
    .map((row) => {
      const rate = winRate(row.ganhas, row.oportunidades);
      if (row.ticketMedio === null || rate === null) return null;
      return { id: row.id, name: row.name, ticketMedio: row.ticketMedio, winRate: rate, ganhas: row.ganhas, oportunidades: row.oportunidades };
    })
    .filter((row): row is Omit<Point, 'role' | 'extremo'> => row !== null)
    .sort((a, b) => b.winRate - a.winRate);
  const missingCount = data.length - medidos.length;

  if (medidos.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte com ticket médio e oportunidade fechada registrados.</span>
      </div>
    );
  }

  const quantos = Math.min(EXTREMES, Math.floor(medidos.length / 2));
  const points: Point[] = medidos.map((row, index) => ({
    ...row,
    role: index < quantos ? 'alta' : index >= medidos.length - quantos ? 'baixa' : 'meio',
    extremo: index === 0 || index === medidos.length - 1,
  }));
  /** A ordem de pintura é o papel, não o valor: neutro primeiro, extremos por cima (REC-13). */
  const neutros = points.filter((point) => point.role === 'meio');
  const baixos = points.filter((point) => point.role === 'baixa');
  const altos = points.filter((point) => point.role === 'alta');
  const labeled = [...altos, ...baixos];

  const primeiro = points[0];
  const ultimo = points[points.length - 1];
  const volume = points.reduce((soma, point) => soma + point.oportunidades, 0);
  /** A mesma chamada alimenta a frase acessível e a linha de leitura, para as duas lerem igual. */
  const maiorTaxa = primeiro === undefined ? null : formatPercent(primeiro.winRate);
  const menorTaxa = ultimo === undefined ? null : formatPercent(ultimo.winRate);

  const summary =
    `Gráfico de dispersão com ${formatInt(points.length)} executivos, ticket médio no eixo horizontal e win rate no vertical. ` +
    (primeiro === undefined || ultimo === undefined
      ? ''
      : `Lidera ${primeiro.name} com ${formatRateWithVolume(primeiro.ganhas, primeiro.oportunidades)}; o menor é ${ultimo.name} com ${formatRateWithVolume(ultimo.ganhas, ultimo.oportunidades)}. `) +
    (missingCount > 0 ? `${formatInt(missingCount)} sem ticket médio ou win rate não aparecem.` : '');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'winRate', name: 'Win rate', value: formatRateWithVolume(point.ganhas, point.oportunidades) },
      { dataKey: 'ticketMedio', name: 'Ticket médio', value: formatCurrencyCompact(point.ticketMedio) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`${formatInt(points.length)} executivos, ${formatInt(volume)} oportunidades fechadas`}
        {maiorTaxa === null || menorTaxa === null ? '' : `; win rate de ${menorTaxa} a ${maiorTaxa}`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              dataKey="ticketMedio"
              domain={[...DOMAIN_X]}
              name="Ticket médio"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              dataKey="winRate"
              domain={[...DOMAIN_Y]}
              name="Win rate"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={neutros} fill={ROLE_COLOR.meio} isAnimationActive={animate} name="Meio da nuvem" />
            <Scatter data={baixos} fill={ROLE_COLOR.baixa} isAnimationActive={animate} name="Menores win rate" />
            <Scatter data={altos} fill={ROLE_COLOR.alta} isAnimationActive={animate} name="Maiores win rate" />
            <ExtremeLabelLayer labeled={labeled} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`Nome direto nos ${formatInt(quantos)} maiores e nos ${formatInt(quantos)} menores`}
        {missingCount > 0 ? `; ${formatInt(missingCount)} sem ticket médio ou sem oportunidade fechada não aparecem` : ''}
      </p>
    </div>
  );
}
