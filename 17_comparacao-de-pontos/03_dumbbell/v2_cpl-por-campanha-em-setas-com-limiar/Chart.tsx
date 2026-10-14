import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  useXAxisScale,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, monthAfter, monthBefore, thresholdPercent, type CampaignCpl } from './data';

/**
 * Arrow plot do CPL por campanha: cada linha é uma seta do mês antigo para o novo, e só as
 * campanhas que mudaram mais que o limiar ganham cor. A cor segue a polaridade (custo que cai é
 * bom) e o delta com sinal fica escrito na ponta livre. A cabeça é um path calculado.
 */
export interface CplArrowsProps {
  readonly data?: readonly CampaignCpl[];
  readonly height?: number;
  readonly className?: string;
}

/** Domínio fixo em reais por lead: a mesma posição vale o mesmo CPL em qualquer recorte. */
const X_DOMAIN: [number, number] = [0, 120];
const X_TICKS = [0, 30, 60, 90, 120];
const MARGIN = { top: 4, right: 56, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 176;
const X_AXIS_HEIGHT = 24;
const ROW_STEP = 16;
const SHAFT_WIDTH = 2;
const HEAD_LENGTH = 8;
const HEAD_HALF_WIDTH = 4.5;
const MARKER_RADIUS = 4;
/** Haste mais curta que isto não comporta cabeça e haste legíveis: vira marcador neutro. */
const SHORT_SHAFT_PX = 12;
const VALUE_LABEL_GAP = 8;
const NEUTRAL_COLOR = 'var(--text-muted)';

interface ArrowShapeProps {
  readonly y?: number;
  readonly height?: number;
  readonly payload?: CampaignCpl;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** A faixa do Bar: menor e maior, só para o Recharts medir; o sentido da seta nunca sai daqui. */
function bandOf(row: CampaignCpl): [number, number] {
  return [Math.min(row.july, row.august), Math.max(row.july, row.august)];
}

/** Mudança relativa como fração, para ordenar e escrever. A classificação NÃO usa esta razão. */
function relativeChange(row: CampaignCpl): number {
  return (row.august - row.july) / row.july;
}

/** Limiar estrito em inteiros: |ago − jul| × 100 > limiar × jul. Exatamente 15% fica de fora. */
function exceedsThreshold(row: CampaignCpl): boolean {
  return Math.abs(row.august - row.july) * 100 > thresholdPercent * row.july;
}

/** Maior mudança relativa primeiro, em módulo; empate pelo nome para a ordem ser estável. */
function rankByChange(rows: readonly CampaignCpl[]): CampaignCpl[] {
  return [...rows].sort((a, b) => Math.abs(relativeChange(b)) - Math.abs(relativeChange(a)) || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Cor só acima do limiar, pela polaridade: CPL que cai é bom (COR-6). O resto fica neutro. */
function arrowColor(row: CampaignCpl): string {
  if (!exceedsThreshold(row)) return NEUTRAL_COLOR;
  return row.august < row.july ? 'var(--positive)' : 'var(--negative)';
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico (NUM-3); uma casa em todas as linhas. */
function signedPercent(fraction: number): string {
  if (fraction === 0) return 'sem mudança';
  return `${fraction < 0 ? '−' : '+'}${formatPercent(Math.abs(fraction), 1)}`;
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );
}

/**
 * A seta sai sempre de julho para agosto: a ponta de saída é a escala de `july` e a da cabeça é a
 * de `august`, escritas aqui, e nunca a ordem da faixa menor e maior que o Recharts mede. A cabeça
 * é um path calculado (sem marker-end, que herda a espessura do traço). Mudança de zero também
 * chega aqui, porque a forma própria não descarta a marca de largura zero (REC-11).
 */
function ArrowShape({ y, height, payload }: ArrowShapeProps): ReactElement | null {
  const scale = useXAxisScale();
  if (y === undefined || height === undefined || payload === undefined || scale === undefined) return null;
  const tailX = scale(payload.july);
  const tipX = scale(payload.august);
  if (tailX === undefined || tipX === undefined) return null;
  const centerY = y + height / 2;
  const color = arrowColor(payload);
  const change = relativeChange(payload);
  const freeX = Math.max(tailX, tipX);
  const label = (
    <text
      className="font-display"
      dominantBaseline="central"
      fill={color === NEUTRAL_COLOR ? 'var(--text-secondary)' : color}
      fontSize={11}
      fontWeight={exceedsThreshold(payload) ? 600 : 500}
      x={freeX + HEAD_HALF_WIDTH + VALUE_LABEL_GAP}
      y={centerY}
    >
      {signedPercent(change)}
    </text>
  );
  if (Math.abs(tipX - tailX) < SHORT_SHAFT_PX) {
    return (
      <g>
        <circle cx={(tailX + tipX) / 2} cy={centerY} fill={NEUTRAL_COLOR} r={MARKER_RADIUS} />
        {label}
      </g>
    );
  }
  const direction = tipX > tailX ? 1 : -1;
  const baseX = tipX - direction * HEAD_LENGTH;
  const head = `M${String(tipX)},${String(centerY)} L${String(baseX)},${String(centerY - HEAD_HALF_WIDTH)} L${String(baseX)},${String(centerY + HEAD_HALF_WIDTH)} Z`;
  return (
    <g>
      <line stroke={color} strokeWidth={SHAFT_WIDTH} x1={tailX} x2={baseX} y1={centerY} y2={centerY} />
      <path d={head} fill={color} />
      {label}
    </g>
  );
}

function LegendArrow({ color }: { readonly color: string }): ReactElement {
  return (
    <svg aria-hidden className="h-2 w-5 shrink-0" viewBox="0 0 20 8">
      <line stroke={color} strokeWidth={2} x1={0} x2={12} y1={4} y2={4} />
      <path d="M20,4 L12,0 L12,8 Z" fill={color} />
    </svg>
  );
}

export default function CplArrows({ data = defaultData, height, className }: CplArrowsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /** A ordem do array é a ordem no eixo; o primeiro item fica no alto, conferido no render (REC-3). */
  const rows = rankByChange(data);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte: não há CPL nos dois meses para comparar.</span>
      </div>
    );
  }

  const changed = rows.filter(exceedsThreshold);
  const rose = changed.filter((row) => row.august > row.july).length;
  const fell = changed.length - rose;
  const before = formatMonthShort(monthBefore);
  const after = formatMonthShort(monthAfter);
  const countText = `${formatInt(changed.length)} de ${formatInt(rows.length)} campanhas mudaram o CPL mais de ${formatInt(thresholdPercent)}%`;
  const summary = [
    `Gráfico de setas com o CPL de ${formatInt(rows.length)} campanhas, de ${before} para ${after}, em reais por lead.`,
    `${countText}: ${formatInt(rose)} subiram e ${formatInt(fell)} caíram.`,
    'Ordenado da maior para a menor variação percentual.',
  ].join(' ');

  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as CampaignCpl | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'july', name: before, value: formatCurrency(row.july, 0) },
      { dataKey: 'august', name: after, value: formatCurrency(row.august, 0) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 flex shrink-0 items-baseline justify-between gap-4 text-xs leading-4 text-text-secondary">
        <span className="min-w-0 truncate">
          <span className="kpi-number font-medium text-text-primary">{formatInt(changed.length)}</span> de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(rows.length)}</span> campanhas mudaram mais de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(thresholdPercent)}%</span>
        </span>
        <span className="shrink-0 text-text-muted">
          Seta de <span className="tabular-nums">{before}</span> para <span className="tabular-nums">{after}</span>
        </span>
      </p>
      <ul aria-hidden className="mb-1 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-4 text-text-secondary">
        <li className="flex items-center gap-2">
          <LegendArrow color="var(--positive)" />
          Caiu, melhor
        </li>
        <li className="flex items-center gap-2">
          <LegendArrow color="var(--negative)" />
          Subiu, pior
        </li>
        <li className="flex items-center gap-2">
          <LegendArrow color={NEUTRAL_COLOR} />
          Dentro do limiar
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: NEUTRAL_COLOR }} />
          Haste curta
        </li>
      </ul>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={X_DOMAIN}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              tickMargin={8}
              ticks={X_TICKS}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="name"
              interval={0}
              tick={NameTick}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey={bandOf} isAnimationActive={animate} shape={(props: ArrowShapeProps) => <ArrowShape {...props} />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
