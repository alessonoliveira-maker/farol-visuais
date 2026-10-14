import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyCplQualified } from './data';

/** Coluna por mês com o desvio do CPL contra a média do semestre; descer é bom nesta métrica. */
export interface CplDeviationColumnsProps {
  readonly data?: readonly MonthlyCplQualified[];
  readonly height?: number;
  readonly className?: string;
}

interface Deviation {
  readonly month: string;
  readonly cpl: number;
  readonly deviation: number;
}

const MARGIN = { top: 24, right: 80, bottom: 20, left: 0 } as const;
/**
 * ESP-6, série única: corpo do cartão ≈ 574 x 234 px. Disponível ≈ 574 − 80 (margem reservada do
 * rótulo "média" à direita, ROT-7/ANO-3) ≈ 494; passo = 494 / 6 meses ≈ 82,3; espessura =
 * passo × (1 − 2 × 0,32) ≈ 82,3 × 0,36 ≈ 29,6 px. O teto da ESP-2 em cartão é 24, então
 * `maxBarSize` fecha em 24, não no valor calculado: o passo sobra e o respiro cresce.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const VALUE_LABEL_GAP = 6;
const DOMAIN_LIMIT = 50;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;
/** Os três meses seguidos com CPL acima da média, para a ReferenceArea (ANO-4). */
const HIGH_WINDOW: readonly [string, string] = ['2026-06', '2026-08'];

function signedCurrency(value: number): string {
  if (Math.round(value) === 0) return formatCurrencyCompact(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyCompact(Math.abs(value))}`;
}

export default function CplDeviationColumns({ data = defaultData, height, className }: CplDeviationColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não há CPL qualificado medido no período.
      </div>
    );
  }

  const mean = data.reduce((sum, row) => sum + row.cpl, 0) / data.length;
  const rows: readonly Deviation[] = data.map((row) => ({ month: row.month, cpl: row.cpl, deviation: row.cpl - mean }));
  const worst = rows.reduce((max, row) => (row.deviation > max.deviation ? row : max), rows[0]!);
  const best = rows.reduce((min, row) => (row.deviation < min.deviation ? row : min), rows[0]!);
  const aboveCount = rows.filter((row) => row.deviation > 0).length;

  const summary =
    `Gráfico de colunas com o desvio do CPL qualificado contra a média de ${formatCurrencyCompact(mean)} no semestre, onde subir é ruim. ` +
    `${String(aboveCount)} meses acima da média. Pior mês ${formatMonthShort(worst.month)}, CPL ${formatCurrencyCompact(worst.cpl)}; melhor ${formatMonthShort(best.month)}, ${formatCurrencyCompact(best.cpl)}.`;

  const renderBar = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: { x?: number; y?: number; width?: number; height?: number; payload?: Deviation }): ReactElement | null => {
    if (!payload) return null;
    const fill = payload.deviation <= 0 ? 'var(--positive)' : 'var(--negative)';
    // Recharts devolve `height` com sinal (negativo para baixo do zero): o topo do retângulo é o
    // menor dos dois pixels, nunca `y` puro, senão o desvio negativo nasce invertido.
    const top = Math.min(y, y + barHeight);
    return <rect fill={fill} height={Math.max(Math.abs(barHeight), 1)} rx={3} width={width} x={x} y={top} />;
  };

  const renderValue = ({ x, y, width, height: barHeight, value }: LabelProps): ReactElement | null => {
    const num = typeof value === 'number' ? value : Number(value ?? 0);
    const cx = Number(x) + Number(width) / 2;
    const yNum = Number(y);
    const hNum = Number(barHeight);
    const top = Math.min(yNum, yNum + hNum);
    const bottom = Math.max(yNum, yNum + hNum);
    // A posição segue o sinal do desvio (positivo sobe, negativo desce); a cor segue a polaridade
    // invertida da métrica de custo (desvio negativo é bom), que é uma decisão à parte.
    const above = num >= 0;
    const ty = above ? top - VALUE_LABEL_GAP : bottom + VALUE_LABEL_GAP + 9;
    return (
      <text className="font-display" fill={num <= 0 ? 'var(--positive)' : 'var(--negative)'} fontSize={12} fontWeight={500} textAnchor="middle" x={cx} y={ty}>
        {signedCurrency(num)}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const monthKey = typeof props.label === 'string' ? props.label : '';
    const row = rows.find((item) => item.month === monthKey);
    const payload = [{ name: 'CPL do mês', value: row ? formatCurrencyCompact(row.cpl) : '', color: 'var(--chart-1)', graphicalItemId: 'cpl' }];
    return <ChartTooltip active={props.active} label={monthKey} labelFormat="month" payload={payload} />;
  };

  // ANO-3/ROT-7: a média nasce na margem reservada à direita (MARGIN.right), fora da última
  // coluna, nunca `insideBottomRight` sobre o zero, que colidia com a coluna de ago/26 e caía
  // sobre --negative com --text-muted, abaixo do piso da ACE-3. Halo por segurança, para
  // qualquer recorte em que a marca cresça até a beira do gráfico.
  const renderMeanLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number } }): ReactElement => (
    <text fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="start" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) + 4} y={viewBox?.y ?? 0}>
      {`média ${formatCurrencyCompact(mean)}`}
    </text>
  );

  // ESP-3/checklist 15 (correção da revisão): a nota "3 meses acima da média" ficava centrada na
  // janela jun→ago e o rótulo de valor de jun/26 (+R$ 38, o mês mais próximo do zero da janela)
  // nascia colado ao início do texto, lendo como "+R$ 383". A nota agora ancora no canto superior
  // direito da faixa, junto de ago/26, e desce alguns pixels abaixo do teto do domínio: o mês mais
  // próximo dali é o de menor desvio da janela (ago, +15), cujo rótulo nasce bem mais baixo, então
  // sobra respiro nos dois eixos. Halo por segurança contra a grade e a borda da própria faixa.
  const renderAreaLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number } }): ReactElement => (
    <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="end" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) - 6} y={(viewBox?.y ?? 0) + 14}>
      3 meses acima da média
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Métrica de custo: coluna para baixo é boa. Pior mês <span className="font-semibold text-negative">{formatMonthShort(worst.month)}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} domain={[-DOMAIN_LIMIT, DOMAIN_LIMIT]} hide tickCount={5} />
            <ReferenceArea fill="var(--surface-sunken)" label={renderAreaLabel} x1={HIGH_WINDOW[0]} x2={HIGH_WINDOW[1]} />
            <ReferenceLine ifOverflow="extendDomain" label={renderMeanLabel} stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="deviation" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar}>
              <LabelList content={renderValue} dataKey="deviation" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
