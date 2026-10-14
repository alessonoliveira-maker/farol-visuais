import type { ReactElement } from 'react';
import { Bar, BarChart, BarStack, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type BarShapeProps, type LabelProps, type TooltipPayloadEntry } from 'recharts';
import { Filter } from 'lucide-react';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MediaPlatformRow } from './data';

/**
 * Duas pilhas por plataforma, lado a lado na mesma banda: orçado em contorno tracejado e
 * realizado sólido, com a mesma cor por tipo de campanha nas duas. Plataforma sem orçado
 * aprovado mostra só a pilha realizada e escreve "sem orçado" no lugar da outra.
 */
export interface BudgetVsRealizedBarsProps {
  readonly data?: readonly MediaPlatformRow[];
  readonly height?: number;
  readonly className?: string;
}

const PROSPECTING_FILL = CHART_SERIES_COLORS[0] ?? 'var(--chart-1)';
const REMARKETING_FILL = CHART_SERIES_COLORS[2] ?? 'var(--chart-3)';
const MARGIN = { top: 4, right: 132, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 108;
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 16;
const SEGMENT_GAP = 2;
const CURSOR = { fill: 'var(--line-subtle)' } as const;
const ORDER = ['budgetProspecting', 'budgetRemarketing', 'realizedProspecting', 'realizedRemarketing'];

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

interface DerivedRow extends MediaPlatformRow {
  readonly budgetTotal: number;
  readonly realizedTotal: number;
}

function sortByOrder(item: TooltipPayloadEntry): number {
  return ORDER.indexOf(String(item.dataKey));
}

function segmentGap(x: number, stackedBarStart: number): number {
  return x - stackedBarStart > 0.5 ? SEGMENT_GAP : 0;
}

/** Pilha de orçado: contorno tracejado na cor do componente; sem orçado escreve o aviso. */
function budgetShape(color: string, showNoBudgetLabel: boolean) {
  return ({ x, y, width, height, stackedBarStart, payload }: BarShapeProps): ReactElement => {
    const row = payload as DerivedRow | undefined;
    if (row && !row.hasBudget) {
      if (!showNoBudgetLabel) return <g />;
      return (
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={x} y={y + height / 2}>
          sem orçado
        </text>
      );
    }
    const gap = segmentGap(x, stackedBarStart);
    const drawnWidth = width - gap;
    if (drawnWidth <= 0 || height <= 0) return <g />;
    return <rect fill="none" height={height} stroke={color} strokeDasharray="3 3" strokeWidth={1.5} width={drawnWidth} x={x + gap} y={y} />;
  };
}

/** Pilha de realizado: preenchimento sólido, sempre desenhada mesmo sem orçado para comparar. */
function realizedShape(color: string) {
  return ({ x, y, width, height, stackedBarStart }: BarShapeProps): ReactElement => {
    const gap = segmentGap(x, stackedBarStart);
    const drawnWidth = width - gap;
    if (drawnWidth <= 0 || height <= 0) return <g />;
    return <rect fill={color} height={height} width={drawnWidth} x={x + gap} y={y} />;
  };
}

/**
 * Desvio do orçado com sinal à mão sobre o valor absoluto (NUM-3); zero sai sem sinal.
 *
 * O `>= 0` mandava o desvio zero para o ramo positivo e imprimia "+0%", que declara estouro de
 * orçamento onde realizado e orçado bateram na régua. O teste é sobre o **texto impresso**, porque
 * o desvio que arredonda para 0% também não tem direção a declarar.
 */
function signedDeviation(deviation: number): string {
  const text = formatPercent(Math.abs(deviation), 0);
  if (text === formatPercent(0, 0)) return text;
  return `${deviation > 0 ? '+' : '−'}${text}`;
}

export default function BudgetVsRealizedBars({ data = defaultData, height, className }: BudgetVsRealizedBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows: DerivedRow[] = data
    .map((row) => ({
      ...row,
      budgetTotal: row.budgetProspecting + row.budgetRemarketing,
      realizedTotal: row.realizedProspecting + row.realizedRemarketing,
    }))
    .sort((a, b) => b.realizedTotal - a.realizedTotal);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não há investimento de mídia para comparar.</span>
      </div>
    );
  }

  const withBudget = rows.filter((row) => row.hasBudget && row.budgetTotal > 0);
  const mostOver = [...withBudget].sort((a, b) => (b.realizedTotal - b.budgetTotal) / b.budgetTotal - (a.realizedTotal - a.budgetTotal) / a.budgetTotal)[0];
  const withoutBudget = rows.find((row) => !row.hasBudget);
  const overPct = mostOver ? (mostOver.realizedTotal - mostOver.budgetTotal) / mostOver.budgetTotal : 0;
  /**
   * `mostOver` é eleita pelo desvio **com sinal**, então o extremo zero quer dizer que ninguém
   * passou do orçado, não que ninguém se desviou: abaixo do orçado ainda pode haver. Quando o
   * extremo lê zero, a frase não elege ninguém e o número sai dela, em vez de virar "a que mais se
   * desvia, +0%", que declara estouro e nomeia um campeão que não existe.
   */
  const noOverspend = mostOver !== undefined && signedDeviation(overPct) === formatPercent(0, 0);

  const summary = [
    `Gráfico de barras empilhadas com orçado e realizado de mídia paga de ${String(rows.length)} plataformas, por prospecção e remarketing.`,
    noOverspend
      ? 'Nenhuma plataforma passou do orçado no período.'
      : mostOver
        ? `${mostOver.name} é a que mais se desvia do orçado, ${overPct > 0 ? 'acima' : 'abaixo'} em ${formatPercent(Math.abs(overPct), 0)}.`
        : '',
    withoutBudget ? `${withoutBudget.name} ainda não tem orçado aprovado e já realizou ${formatCurrencyCompact(withoutBudget.realizedTotal)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );

  const renderRealizedTail = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const baseX = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const rowY = Number(y) + Number(barHeight) / 2;
    const deviation = row.hasBudget && row.budgetTotal > 0 ? (row.realizedTotal - row.budgetTotal) / row.budgetTotal : null;
    return (
      <text dominantBaseline="central" fontSize={12} x={baseX} y={rowY}>
        <tspan className="font-display" fill="var(--text-secondary)" fontWeight={500}>
          {formatCurrencyCompact(row.realizedTotal)}
        </tspan>
        {deviation === null ? (
          <tspan className="font-sans" dx={4} fill="var(--text-muted)" fontSize={11}>
            {' sem orçado'}
          </tspan>
        ) : (
          <tspan className="font-display" dx={4} fill={deviation > 0 ? 'var(--negative)' : 'var(--positive)'} fontSize={11} fontWeight={600}>
            {signedDeviation(deviation)}
          </tspan>
        )}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {/* O corpo e a frase acessível decidem o caso do extremo zero pelo mesmo `noOverspend`,
            para não divergirem: a frase dizia "acima em 0%" onde o corpo escrevia "+0%". */}
        {noOverspend ? (
          <>
            Nenhuma plataforma passou do orçado no período
            {'; '}
          </>
        ) : mostOver ? (
          <>
            <span className="font-semibold text-text-primary">{mostOver.name}</span> se desvia mais do orçado,{' '}
            <span className={cn('kpi-number font-medium', overPct > 0 ? 'text-negative' : 'text-positive')}>
              {signedDeviation(overPct)}
            </span>
            {'; '}
          </>
        ) : null}
        {withoutBudget ? (
          <>
            <span className="font-semibold text-text-primary">{withoutBudget.name}</span> segue sem orçado aprovado
          </>
        ) : null}
      </p>
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary" key="prospecting">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: PROSPECTING_FILL }} />
          Prospecção
        </li>
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary" key="remarketing">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: REMARKETING_FILL }} />
          Remarketing
        </li>
        <li className="flex items-center gap-2 text-xs leading-5 text-text-muted" key="legend-note">
          <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ border: '1px dashed var(--text-muted)' }} />
          orçado
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: 'var(--text-muted)' }} />
          realizado
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="32%" barGap={2} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, 'dataMax']} hide type="number" />
            <YAxis axisLine={false} dataKey="name" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip valueFormat="currencyCompact" />} cursor={CURSOR} isAnimationActive={false} itemSorter={sortByOrder} />
            <BarStack stackId="orcado">
              <Bar dataKey="budgetProspecting" isAnimationActive={animate} maxBarSize={BAR_MAX} name="Orçado, prospecção" shape={budgetShape(PROSPECTING_FILL, true)} />
              <Bar dataKey="budgetRemarketing" isAnimationActive={animate} maxBarSize={BAR_MAX} name="Orçado, remarketing" shape={budgetShape(REMARKETING_FILL, false)} />
            </BarStack>
            <BarStack stackId="realizado">
              <Bar dataKey="realizedProspecting" isAnimationActive={animate} maxBarSize={BAR_MAX} name="Realizado, prospecção" shape={realizedShape(PROSPECTING_FILL)} />
              <Bar dataKey="realizedRemarketing" isAnimationActive={animate} maxBarSize={BAR_MAX} name="Realizado, remarketing" shape={realizedShape(REMARKETING_FILL)}>
                <LabelList content={renderRealizedTail} />
              </Bar>
            </BarStack>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
