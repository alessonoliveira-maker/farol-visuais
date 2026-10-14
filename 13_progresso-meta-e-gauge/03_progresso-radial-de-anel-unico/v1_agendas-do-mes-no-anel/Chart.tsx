import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type AgendasDoMes } from './data';

/**
 * Anel de progresso único: agendas marcadas pela pré-vendas contra a meta do mês, num cartão
 * pequeno. O anel fecha a leitura por comprimento de arco, mas o denominador nunca fica só no
 * ângulo: o valor absoluto, a meta e o mês vêm escritos no centro, ao lado do percentual. O mês
 * fica FORA do furo, numa linha própria abaixo do anel: dentro do furo só cabem o percentual e o
 * par de valores sem cruzar o arco, e a legenda do mês nunca precisou estar dentro dele.
 */
export interface AgendasDoMesRadialProps {
  readonly data?: AgendasDoMes;
  readonly height?: number;
  readonly className?: string;
}

const RING_FILL = 'var(--chart-1)';
const TRACK_FILL = 'var(--surface-sunken)';
const START_ANGLE = 90;
const END_ANGLE = -270;
const INNER_RADIUS = '72%';
const OUTER_RADIUS = '90%';
const ROUND_CORNER = 6;
/** Perto de 0% ou de 100% a ponta arredondada desenha alguns graus a mais que o valor real: reta ali, para a ponta não mentir. */
const FLAT_NEAR_EDGE = 0.03;

export default function AgendasDoMesRadial({ data = defaultData, height, className }: AgendasDoMesRadialProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const meta = Math.max(data.meta, 1);
  const percent = Math.min(data.marcadas / meta, 1);
  const cornerRadius = percent <= FLAT_NEAR_EDGE || percent >= 1 - FLAT_NEAR_EDGE ? 0 : ROUND_CORNER;
  const rows = [{ marcadas: data.marcadas }];
  /**
   * O percentual é escrito uma vez só e reaproveitado no centro do anel e na frase acessível. Antes
   * a frase chamava `formatPercent(percent)`, que traz uma casa decimal, enquanto o centro usava
   * zero casa: com 41 de 90, quem enxergava lia "46%" e o leitor de tela ouvia "45,6%", que além de
   * outra precisão arredonda para o outro lado. A casa
   * escolhida é a do corpo, que é a que o leitor confere contra a planilha (conserto de 2026-09-28,
   * DAD-5).
   */
  const percentText = formatPercent(percent, 0);

  const summary = `Anel de progresso com as agendas marcadas pela pré-vendas em ${formatMonthLong(data.month)}. São ${formatInt(data.marcadas)} de ${formatInt(data.meta)} agendas previstas, ${percentText} da meta do mês.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadialBarChart
            accessibilityLayer={false}
            data={rows}
            endAngle={END_ANGLE}
            innerRadius={INNER_RADIUS}
            outerRadius={OUTER_RADIUS}
            startAngle={START_ANGLE}
          >
            <PolarAngleAxis {...AXIS_PROPS} axisLine={false} dataKey="marcadas" domain={[0, meta]} tick={false} type="number" />
            <RadialBar
              background={{ fill: TRACK_FILL }}
              cornerRadius={cornerRadius}
              dataKey="marcadas"
              fill={RING_FILL}
              isAnimationActive={animate}
              minPointSize={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="kpi-number text-3xl leading-none font-semibold text-text-primary">{percentText}</span>
          <span className="kpi-number mt-2 text-sm font-semibold text-text-primary">
            {formatInt(data.marcadas)} de {formatInt(data.meta)}
          </span>
        </div>
      </div>
      <p aria-hidden className="mt-1 shrink-0 truncate text-center text-[0.6875rem] text-text-muted">
        agendas em {formatMonthLong(data.month)}
      </p>
    </div>
  );
}
