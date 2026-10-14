import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FunnelStage } from './data';

/**
 * Funil em barras horizontais com um trilho de fundo que vale a entrada inteira: cada barra
 * mostra o volume absoluto da etapa, e o texto entre uma barra e a seguinte diz quantos saíram
 * e qual taxa de passo isso é. A última barra fecha com a taxa acumulada da entrada, para nenhum
 * percentual aparecer sem dizer contra o que ele foi calculado.
 */
export interface FunnelBarsProps {
  readonly data?: readonly FunnelStage[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 6, right: 148, bottom: 2, left: 0 } as const;
const NAME_AXIS_WIDTH = 132;
const VALUE_LABEL_GAP = 6;
/** Teto da espessura em cartão (ESP-2); a espessura real sai do passo calculado pela ESP-6. */
const BAR_MAX = 22;
/** Mesmo valor do `barCategoryGap` do BarChart: deriva o vão entre barras a partir da própria espessura (ESP-6), em vez de arbitrar um deslocamento fixo. */
const BAR_CATEGORY_GAP = 0.3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

export default function FunnelBars({ data = defaultData, height, className }: FunnelBarsProps) {
  const animate = useAnimateOnce();
  const rows = data;
  const style = height === undefined ? undefined : { height };

  if (rows.length < 2) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Funil precisa de ao menos duas etapas para calcular taxa de passo.</span>
      </div>
    );
  }

  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const entrada = first.value;
  const transitions = rows.slice(1).map((stage, i) => {
    const prev = rows[i]!;
    const saíram = prev.value - stage.value;
    const passoRate = prev.value > 0 ? stage.value / prev.value : 0;
    return { prev, stage, saíram, passoRate };
  });
  const worst = transitions.reduce((acc, t) => (t.saíram > acc.saíram ? t : acc), transitions[0]!);
  const cumulativa = entrada > 0 ? last.value / entrada : 0;

  const summary =
    `Gráfico de barras horizontal com o funil de pré-vendas da semana de 2026-09-07 em ${String(rows.length)} etapas, ` +
    `de ${formatInt(entrada)} ${first.noun} a ${formatInt(last.value)} ${last.noun}, ${formatPercent(cumulativa)} da entrada. ` +
    `A maior queda de passo foi de ${worst.prev.label.toLowerCase()} para ${worst.stage.label.toLowerCase()}: ` +
    `${formatInt(worst.saíram)} saídas, ${formatPercent(worst.passoRate)} do passo.`;

  const reading = `De ${formatInt(entrada)} entradas, ${formatInt(last.value)} chegam a ${last.label.toLowerCase()}: ${formatPercent(cumulativa)} da entrada.`;

  const renderValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const i = index ?? -1;
    const stage = rows[i];
    if (!stage) return null;
    const isLast = i === rows.length - 1;
    const tipX = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const midY = Number(y) + Number(barHeight) / 2;
    return (
      <g>
        <text
          className="font-display"
          dominantBaseline={isLast ? 'auto' : 'central'}
          fill="var(--text-primary)"
          fontSize={12}
          fontWeight={500}
          style={HALO}
          x={tipX}
          y={isLast ? midY - 1 : midY}
        >
          {formatInt(stage.value)} {stage.noun}
        </text>
        {isLast ? (
          <text className="font-sans" dominantBaseline="hanging" fill="var(--text-muted)" fontSize={11} style={HALO} x={tipX} y={midY + 4}>
            {formatPercent(cumulativa)} da entrada ({formatInt(stage.value)} de {formatInt(entrada)})
          </text>
        ) : null}
      </g>
    );
  };

  const renderPasso = ({ x, y, height: barHeight, index }: LabelProps): ReactElement | null => {
    const i = index ?? -1;
    if (i >= rows.length - 1) return null;
    const t = transitions[i];
    if (!t) return null;
    // Vão entre categorias derivado da própria espessura da barra (ESP-6): com passo = espessura / (1 − 2×vão),
    // o vão em pixels é espessura × (1 − 2×vão) / (2×vão)... aqui simplificado para espessura × (1/(1−2×vão) − 1).
    const gapPx = Number(barHeight) * (1 / (1 - 2 * BAR_CATEGORY_GAP) - 1);
    return (
      <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO} x={Number(x)} y={Number(y) + Number(barHeight) + gapPx / 2}>
        −{formatInt(t.saíram)} ({formatPercent(t.passoRate)} do passo)
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={`${String(BAR_CATEGORY_GAP * 100)}%`} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, entrada]} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="label"
              interval={0}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar background={{ fill: 'var(--surface-sunken)' }} dataKey="value" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]}>
              <LabelList content={renderValue} dataKey="value" />
              <LabelList content={renderPasso} dataKey="value" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
