import { Filter } from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MetaReceitaPorOrigem } from './data';

/**
 * Anel único empilhado por origem: quanto da meta do trimestre já veio de cada canal. A ordem dos
 * segmentos é a ordem do dado, nunca a do valor, e o total no centro sempre vem com o valor
 * absoluto e a meta escritos, porque o percentual sozinho esconde de onde ele veio.
 */
export interface MetaReceitaPorOrigemRadialProps {
  readonly data?: MetaReceitaPorOrigem;
  readonly height?: number;
  readonly className?: string;
}

const TRACK_FILL = 'var(--surface-sunken)';
const SEGMENT_STROKE = 'var(--surface-raised)';
const START_ANGLE = 90;
const END_ANGLE = -270;
/** Slots categóricos na ordem 1, 3, 6, 5 (COR-8): os quatro primeiros com a maior distância entre si. */
const ORIGIN_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2], CHART_SERIES_COLORS[5], CHART_SERIES_COLORS[4]];

export default function MetaReceitaPorOrigemRadial({ data = defaultData, height, className }: MetaReceitaPorOrigemRadialProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  if (data.origens.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem de receita neste recorte do trimestre.</span>
      </div>
    );
  }

  const meta = Math.max(data.meta, 1);
  const total = data.origens.reduce((sum, origem) => sum + origem.valor, 0);
  const percent = Math.min(total / meta, 1);
  const row: Record<string, number> = {};
  for (const origem of data.origens) row[origem.id] = origem.valor;
  const rows = [row];
  /**
   * O percentual é escrito uma vez só e reaproveitado no centro do anel e na frase acessível. Antes
   * a frase chamava `formatPercent(percent)`, que traz uma casa decimal, enquanto o centro usava
   * zero casa: no dado fixo a divergência sai em "65%" contra "65,0%", e basta um recorte em que o
   * arredondamento caia para lados diferentes para os dois números deixarem de ser o mesmo. A casa
   * escolhida é a do corpo, que é a que o leitor confere contra a planilha, e é também a que a
   * lista de origens ao lado já usava (conserto de 2026-09-28, DAD-5).
   */
  const percentText = formatPercent(percent, 0);

  const summary = [
    `Anel de progresso empilhado por origem com a receita reconhecida no ${data.quarterLabel}: ${formatCurrencyCompact(total)} de ${formatCurrencyCompact(data.meta)}, ${percentText} da meta.`,
    data.origens.map((origem) => `${origem.label} ${formatCurrencyCompact(origem.valor)}`).join(', ') + '.',
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center gap-7', className)} role="img" style={style}>
      <div className="relative aspect-square h-full min-w-0 shrink-0">
        <ResponsiveContainer height="100%" width="100%">
          <RadialBarChart
            accessibilityLayer={false}
            data={rows}
            endAngle={END_ANGLE}
            innerRadius="76%"
            outerRadius="94%"
            startAngle={START_ANGLE}
          >
            <PolarAngleAxis axisLine={false} domain={[0, meta]} tick={false} type="number" />
            {data.origens.map((origem, index) => (
              <RadialBar
                background={index === 0 ? { fill: TRACK_FILL } : false}
                cornerRadius={index === data.origens.length - 1 ? 4 : 0}
                dataKey={origem.id}
                fill={ORIGIN_COLORS[index]}
                isAnimationActive={animate}
                key={origem.id}
                minPointSize={0}
                stackId="origens"
                stroke={SEGMENT_STROKE}
                strokeWidth={1}
              />
            ))}
          </RadialBarChart>
        </ResponsiveContainer>
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="kpi-number text-2xl leading-none font-semibold text-text-primary">{percentText}</span>
          <span className="kpi-number mt-2 text-sm font-semibold text-text-primary">
            {formatCurrencyCompact(total)} de {formatCurrencyCompact(data.meta)}
          </span>
          <span className="mt-1 text-[0.6875rem] text-text-muted">{data.quarterLabel}</span>
        </div>
      </div>
      <ul aria-hidden className="min-w-0 flex-1 space-y-2.5">
        {data.origens.map((origem, index) => (
          <li className="flex items-center gap-2.5 text-xs" key={origem.id}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: ORIGIN_COLORS[index] }} />
            <span className="min-w-0 flex-1 truncate text-text-secondary">{origem.label}</span>
            <span className="kpi-number shrink-0 font-medium text-text-primary">{formatCurrencyCompact(origem.valor)}</span>
            <span className="kpi-number w-12 shrink-0 text-right text-text-muted">{formatPercent(origem.valor / meta, 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
