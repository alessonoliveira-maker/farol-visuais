import { TriangleAlert } from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ConsumoPlataforma, type OrcamentoDoMes } from './data';

/**
 * Três anéis de progresso na mesma escala percentual: consumo do orçamento de mídia contra o
 * planejado de cada plataforma. O anel trava na volta cheia quando passa de 100%, nunca dá
 * segunda volta, e o excedente vai escrito fora do arco, numa linha própria abaixo dele; zero
 * medido e ausência de coleta têm desenho próprio, para nenhum dos dois virar um anel vazio igual
 * ao outro.
 */
export interface OrcamentoDoMesRadialProps {
  readonly data?: OrcamentoDoMes;
  readonly height?: number;
  readonly className?: string;
}

const RING_FILL = 'var(--chart-1)';
const OVER_FILL = 'var(--negative)';
const TRACK_FILL = 'var(--surface-sunken)';
const START_ANGLE = 90;
const END_ANGLE = -270;
const FLAT_NEAR_EDGE = 3;
/** Furo maior que o do anel único de um cartão inteiro: aqui três anéis dividem a mesma largura, e
 * o par de valores precisa caber em duas linhas curtas em vez de uma linha larga. */
const INNER_RADIUS = '74%';
const OUTER_RADIUS = '92%';

/** Fração de consumo (pode passar de 1); null quando a plataforma não tem coleta. */
function ratioOf(plataforma: ConsumoPlataforma): number | null {
  if (plataforma.consumido === null) return null;
  return plataforma.planejado > 0 ? plataforma.consumido / plataforma.planejado : 0;
}

interface RingProps {
  readonly plataforma: ConsumoPlataforma;
  readonly animate: boolean;
}

/** Só o anel: o quadrado de progresso com o percentual e o par de valores no centro. */
function PlatformRing({ plataforma, animate }: RingProps) {
  const ratio = ratioOf(plataforma);
  if (ratio === null) {
    return (
      <div aria-hidden className="relative aspect-square w-full">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle cx={50} cy={50} fill="none" r={40} stroke="var(--text-muted)" strokeDasharray="5 5" strokeWidth={9} vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="kpi-number text-sm font-semibold text-text-muted">{formatUnavailable()}</span>
        </div>
      </div>
    );
  }

  const percentCapped = Math.min(Math.max(ratio, 0), 1) * 100;
  const over = ratio > 1;
  const corner = percentCapped <= FLAT_NEAR_EDGE || percentCapped >= 100 - FLAT_NEAR_EDGE ? 0 : 6;
  const rows = [{ percent: percentCapped }];

  return (
    <div aria-hidden className="relative aspect-square w-full">
      <ResponsiveContainer height="100%" width="100%">
        <RadialBarChart accessibilityLayer={false} data={rows} endAngle={END_ANGLE} innerRadius={INNER_RADIUS} outerRadius={OUTER_RADIUS} startAngle={START_ANGLE}>
          <PolarAngleAxis {...AXIS_PROPS} axisLine={false} dataKey="percent" domain={[0, 100]} tick={false} type="number" />
          <RadialBar background={{ fill: TRACK_FILL }} cornerRadius={corner} dataKey="percent" fill={over ? OVER_FILL : RING_FILL} isAnimationActive={animate} minPointSize={0} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn('kpi-number text-lg font-semibold', over ? 'text-negative' : 'text-text-primary')}>{formatPercent(ratio, 0)}</span>
        {/* Par de valores em duas linhas curtas, nunca uma só: com três anéis na mesma largura o
         * furo não tem espaço lateral para "consumido de planejado" inteiro numa linha sem cruzar
         * o arco. */}
        <span className="kpi-number mt-1 text-[0.6875rem] font-medium text-text-secondary">{formatCurrencyCompact(plataforma.consumido ?? 0)}</span>
        <span className="kpi-number text-[0.6875rem] font-medium text-text-secondary">de {formatCurrencyCompact(plataforma.planejado)}</span>
      </div>
    </div>
  );
}

export default function OrcamentoDoMesRadial({ data = defaultData, height, className }: OrcamentoDoMesRadialProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const summary = [
    `Três anéis de progresso com o consumo de mídia paga em ${formatMonthShort(data.month)}, na mesma escala.`,
    ...data.plataformas.map((plataforma) => {
      const ratio = ratioOf(plataforma);
      if (ratio === null) return `${plataforma.label} sem coleta.`;
      if (ratio > 1) return `${plataforma.label} em ${formatPercent(ratio, 0)}, ${formatPercent(ratio - 1, 0)} acima do planejado.`;
      return `${plataforma.label} em ${formatPercent(ratio, 0)}.`;
    }),
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-start justify-around gap-4', className)} role="img" style={style}>
      {data.plataformas.map((plataforma) => {
        const ratio = ratioOf(plataforma);
        const over = ratio !== null && ratio > 1;
        return (
          <div className="flex min-w-0 flex-1 flex-col items-center" key={plataforma.id}>
            <PlatformRing animate={animate} plataforma={plataforma} />
            <div aria-hidden className="mt-1 flex h-4 items-center justify-center gap-1 text-[0.6875rem] font-medium text-negative">
              {over ? (
                <>
                  <TriangleAlert aria-hidden className="size-3 shrink-0" />
                  <span>+{formatPercent(ratio - 1, 0)} acima do planejado</span>
                </>
              ) : null}
            </div>
            <p aria-hidden className="max-w-full truncate text-center text-[0.6875rem] text-text-muted">
              {plataforma.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
