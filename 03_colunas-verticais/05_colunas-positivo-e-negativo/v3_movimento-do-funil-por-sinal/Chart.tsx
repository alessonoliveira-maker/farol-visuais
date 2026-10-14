import type { ReactElement } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyFunnelMovement } from './data';

/** Pilha por sinal: entradas empilhadas para cima, saídas para baixo, líquido marcado em linha. */
export interface SignedFunnelStackProps {
  readonly data?: readonly WeeklyFunnelMovement[];
  readonly height?: number;
  readonly className?: string;
}

interface Segment {
  readonly key: 'novas' | 'reativadas' | 'perdidasNeg' | 'desqualificadasNeg';
  readonly label: string;
  readonly color: string;
}

/** Encostado no zero primeiro: novas e perdidas são os componentes principais, dos dois lados. */
const SEGMENTS: readonly Segment[] = [
  { key: 'novas', label: 'Novas oportunidades', color: 'var(--chart-3)' },
  { key: 'reativadas', label: 'Reativadas', color: 'var(--chart-6)' },
  { key: 'perdidasNeg', label: 'Perdidas', color: 'var(--chart-5)' },
  { key: 'desqualificadasNeg', label: 'Desqualificadas', color: 'var(--chart-2)' },
];
const NET_COLOR = 'var(--chart-1)';
const MARGIN = { top: 24, right: 8, bottom: 20, left: 0 } as const;
/**
 * ESP-6, uma coluna por semana (a pilha ocupa uma banda só; os componentes não somam séries lado
 * a lado): corpo do cartão no preset largo ≈ 894 x 274 px (960 x 400 menos os mesmos 66 x 126 px
 * de moldura medidos no preset card, seção 13). Disponível ≈ 894 − 40 (eixo) − 8 (margem) = 846;
 * passo = 846 / 13 semanas ≈ 65,1; espessura = passo × (1 − 2 × 0,32) ≈ 65,1 × 0,36 ≈ 23,4 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 26;
const VALUE_AXIS_WIDTH = 40;

interface Row extends WeeklyFunnelMovement {
  readonly perdidasNeg: number;
  readonly desqualificadasNeg: number;
  readonly entradas: number;
  readonly saidas: number;
  readonly net: number;
}

function toRow(item: WeeklyFunnelMovement): Row {
  const entradas = item.novas + item.reativadas;
  const saidas = item.perdidas + item.desqualificadas;
  return { ...item, perdidasNeg: -item.perdidas, desqualificadasNeg: -item.desqualificadas, entradas, saidas, net: entradas - saidas };
}

/** Arredonda para fora (mais negativo ou mais positivo) no múltiplo de `step`, para o domínio
 * terminar na primeira linha de grade além do maior valor absoluto de cada lado (EIX-4). */
function roundOut(value: number, step: number): number {
  const sign = value < 0 ? -1 : 1;
  return sign * Math.ceil(Math.abs(value) / step) * step;
}

function signed(value: number): string {
  if (value === 0) return formatInt(0);
  return `${value > 0 ? '+' : '−'}${formatInt(Math.abs(value))}`;
}

export default function SignedFunnelStack({ data = defaultData, height, className }: SignedFunnelStackProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhuma semana neste recorte: não há movimento de funil registrado no período.
      </div>
    );
  }

  const rows = data.map(toRow);
  const bestNet = rows.reduce((max, row) => (row.net > max.net ? row : max), rows[0]!);
  const noEntryWeeks = rows.filter((row) => row.novas === 0 && row.reativadas === 0);
  const totalNet = rows.reduce((sum, row) => sum + row.net, 0);
  const domainMax = roundOut(Math.max(...rows.map((row) => row.entradas)), 20);
  const domainMin = roundOut(Math.min(...rows.map((row) => -row.saidas)), 20);

  const summary =
    `Gráfico de colunas empilhadas por sinal com o movimento do funil de pré-vendas em ${String(rows.length)} semanas: entradas para cima, saídas para baixo, líquido em linha. ` +
    `Líquido do período ${signed(totalNet)}. Melhor semana ${bestNet.week}, ${signed(bestNet.net)}.` +
    (noEntryWeeks[0] ? ` ${noEntryWeeks[0].week} sem entrada, só saída.` : '');

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const weekKey = typeof props.label === 'string' ? props.label : '';
    const row = rows.find((item) => item.week === weekKey);
    if (!row) return null;
    const payload = [
      { name: 'Novas oportunidades', value: signed(row.novas), color: 'var(--chart-3)', graphicalItemId: 'novas' },
      { name: 'Reativadas', value: signed(row.reativadas), color: 'var(--chart-6)', graphicalItemId: 'reativadas' },
      { name: 'Perdidas', value: signed(-row.perdidas), color: 'var(--chart-5)', graphicalItemId: 'perdidasNeg' },
      { name: 'Desqualificadas', value: signed(-row.desqualificadas), color: 'var(--chart-2)', graphicalItemId: 'desqualificadasNeg' },
      { name: 'Líquido', value: signed(row.net), color: NET_COLOR, graphicalItemId: 'net' },
    ];
    return <ChartTooltip active={props.active} label={formatDate(row.weekStart)} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Líquido do período <span className="font-semibold text-text-primary">{signed(totalNet)}</span> oportunidades; melhor semana{' '}
        <span className="font-semibold text-text-primary">{bestNet.week}</span>, {signed(bestNet.net)}
        {noEntryWeeks[0] ? (
          <>
            {' · '}
            <span className="font-semibold text-negative">{noEntryWeeks[0].week}</span> sem entradas na semana
          </>
        ) : null}
      </p>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {SEGMENTS.map((segment) => (
          <li className="flex items-center gap-1.5" key={segment.key}>
            <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: segment.color }} />
            {segment.label}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-2.5 shrink-0" style={{ backgroundColor: NET_COLOR }} />
          Líquido
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          {/*
            stackOffset="sign" é obrigatório: sem ele o Recharts empilha saídas (negativas) por
            cima das entradas (positivas) já desenhadas, em vez de descer a partir do zero, e a
            coluna lê como entradas + saídas, todas positivas, cobrindo o azul das novas
            oportunidades com os segmentos de saída.
          */}
          <ComposedChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN} stackOffset="sign">
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="week" tickMargin={8} />
            <YAxis {...AXIS_PROPS} allowDecimals={false} domain={[domainMin, domainMax]} tickCount={5} tickFormatter={formatInt} width={VALUE_AXIS_WIDTH} />
            <ReferenceLine stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {SEGMENTS.map((segment) => (
              <Bar dataKey={segment.key} fill={segment.color} isAnimationActive={animate} key={segment.key} maxBarSize={BAR_MAX} name={segment.label} stackId="mov" />
            ))}
            <Line dataKey="net" dot={{ r: 3, fill: NET_COLOR, strokeWidth: 0 }} isAnimationActive={animate} name="Líquido" stroke={NET_COLOR} strokeWidth={2.5} type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
