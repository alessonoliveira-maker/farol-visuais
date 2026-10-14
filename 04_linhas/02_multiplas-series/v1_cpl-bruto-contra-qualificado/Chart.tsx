import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyCplPair } from './data';

/**
 * Duas linhas na mesma unidade e no mesmo eixo: o CPL bruto e o CPL qualificado mensais, sem
 * eixo duplo. Cor por categoria fixa (não pela posição no array), rótulo no fim de cada linha
 * com marcador na cor da série, e anticolisão quando os dois finais ficam próximos.
 */
export interface CplComparisonProps {
  readonly data?: readonly MonthlyCplPair[];
  readonly height?: number;
  readonly className?: string;
}

/** Domínio redondo: cobre os dois indicadores nos 8 meses com folga. */
const DOMAIN: readonly [number, number] = [150, 300];
const DOMAIN_TICKS = [150, 200, 250, 300] as const;
const MARGIN = { top: 16, right: 140, bottom: 0, left: 0 } as const;
/** ROT-2: respiro entre a ponta da linha e o rótulo. */
const VALUE_LABEL_GAP = 8;
/** ROT-2: 16 px entre âncoras de rótulo de 12 px é o piso medido pelo contrato. Aplicado em
 * pixel real (capturado do próprio Recharts), não estimado a partir do domínio: quando os dois
 * valores terminam muito próximos (como aqui, de propósito), uma fração do domínio erra o
 * tamanho do pixel real e pode deixar os dois textos quase colados. */
const LABEL_ANCHOR_GAP = 16;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Point {
  readonly cx: number;
  readonly cy: number;
}

export default function CplComparison({ data = defaultData, height, className }: CplComparisonProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const first = data[0];
  const last = data[data.length - 1];

  if (!first || !last) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não há CPL para comparar.
      </div>
    );
  }

  const lastIndex = data.length - 1;
  const gapStart = first.qualifiedCpl - first.rawCpl;
  const gapEnd = last.qualifiedCpl - last.rawCpl;
  const summary = `Gráfico de linhas com o CPL bruto e o CPL qualificado mensais de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}. Em ${formatMonthShort(first.month)} o qualificado custava ${formatCurrencyCompact(gapStart)} a mais; em ${formatMonthShort(last.month)} a diferença caiu para ${formatCurrencyCompact(gapEnd)}.`;

  /** Pixel real do fim da linha "CPL bruto", capturado no próprio render do Recharts: a linha
   * "CPL qualificado" é a segunda do JSX, e por isso já encontra este valor pronto quando
   * desenha o par de rótulos (nenhuma linha extra, então nenhuma entrada a mais na dica). */
  let rawEnd: Point | undefined;

  const renderText = (x: number, y: number, name: string, value: number) => (
    <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} key={name} style={HALO} x={x} y={y}>
      <tspan className="font-sans">{name} </tspan>
      {formatCurrencyCompact(value)}
    </text>
  );

  const renderRawDot = ({ cx, cy, index }: DotItemDotProps) => {
    if (index !== lastIndex || cx === undefined || cy === undefined) return null;
    rawEnd = { cx, cy };
    return <circle cx={cx} cy={cy} fill="var(--chart-1)" key="raw-dot" r={3} />;
  };

  const renderQualifiedDotAndLabels = ({ cx, cy, index }: DotItemDotProps) => {
    if (index !== lastIndex || cx === undefined || cy === undefined || !rawEnd) return null;
    let qualifiedY = cy;
    if (Math.abs(rawEnd.cy - cy) < LABEL_ANCHOR_GAP) {
      qualifiedY = cy <= rawEnd.cy ? rawEnd.cy - LABEL_ANCHOR_GAP : rawEnd.cy + LABEL_ANCHOR_GAP;
    }
    const displaced = Math.abs(qualifiedY - cy) > 0.5;
    return (
      <g key="qualified-dot">
        <circle cx={cx} cy={cy} fill="var(--chart-3)" r={3} />
        {renderText(rawEnd.cx + VALUE_LABEL_GAP, rawEnd.cy, 'CPL bruto', last.rawCpl)}
        {displaced ? <line stroke="var(--chart-3)" strokeWidth={1} x1={cx + 2} x2={cx + 2} y1={cy} y2={qualifiedY} /> : null}
        {renderText(cx + VALUE_LABEL_GAP, qualifiedY, 'CPL qualificado', last.qualifiedCpl)}
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        A diferença caiu de <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(gapStart)}</span> para{' '}
        <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(gapEnd)}</span> em <span className="tabular-nums">{formatInt(data.length)}</span> meses
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={data} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={DOMAIN} tickFormatter={formatCurrencyAxis} tickMargin={8} ticks={[...DOMAIN_TICKS]} width={56} />
            <Tooltip
              content={<ChartTooltip valueFormat="currencyCompact" />}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
              itemSorter={(item) => -(Number(item.value) || 0)}
            />
            <Line activeDot={{ r: 4 }} dataKey="rawCpl" dot={renderRawDot} isAnimationActive={animate} name="CPL bruto" stroke="var(--chart-1)" strokeWidth={2} type="linear" />
            <Line activeDot={{ r: 4 }} dataKey="qualifiedCpl" dot={renderQualifiedDotAndLabels} isAnimationActive={animate} name="CPL qualificado" stroke="var(--chart-3)" strokeWidth={2} type="linear" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
