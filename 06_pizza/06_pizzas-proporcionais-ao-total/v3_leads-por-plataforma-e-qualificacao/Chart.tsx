import type { CSSProperties } from 'react';
import { Filter } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadPlatform, type QualificationSlice } from './data';

/**
 * Pizzas proporcionais ao total em contagem de leads: a área de cada pizza é proporcional ao volume
 * da plataforma, porque o raio sai da raiz quadrada do volume sobre o maior volume, e as fatias
 * mostram o estado de qualificação na ordem natural. A identificação das partes não vai dentro das
 * fatias: cada pizza tem abaixo dela a lista dos três estados com a taxa e o volume, que é a forma
 * da ROT-10 que cabe quando a fatia é pequena e é a única que entrega taxa com volume (DAD-1).
 */
export interface LeadQualificationPiesProps {
  readonly data?: readonly LeadPlatform[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Cor por estado: só o qualificado acende, no slot 1 (COR-8); os outros dois estados são neutros,
 * sem cor semântica, em dois tons de texto que passam os 3:1 da ACE-3 nos dois temas (8,16 e 5,21
 * no escuro, 8,13 e 5,37 no claro). O nome escrito ao lado de cada amostra é o segundo canal.
 */
const STATE_COLORS = [CHART_SERIES_COLORS[0], 'var(--text-secondary)', 'var(--text-muted)'] as const;
/** Raio da maior pizza do conjunto, em px. */
const RADIUS_MAX = 76;
/** Margem zero no PieChart: o padrão de 5 px por lado descontaria o raio de toda pizza. */
const CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 } as const;
const START_ANGLE = 90;
const END_ANGLE = -270;

/** Volume de uma plataforma, somado das próprias fatias. Sem fatia não há volume: null, nunca 0 (EST-1b). */
function platformTotal(platform: LeadPlatform): number | null {
  if (platform.slices.length === 0) return null;
  return platform.slices.reduce((sum, slice) => sum + slice.value, 0);
}

/** A fatia de qualificado, que é a que a pergunta do cartão persegue, ou null quando ela não vem. */
function qualifiedSlice(platform: LeadPlatform): QualificationSlice | null {
  return platform.slices.find((slice) => slice.id === 'qualificado') ?? null;
}

/**
 * Raio em px pela raiz quadrada do volume sobre o maior volume: é a forma que faz a ÁREA carregar o
 * valor, porque a área cresce com o quadrado do raio (GEO-3). Sem raio mínimo, de propósito.
 */
function radiusForTotal(total: number, totalMax: number): number {
  if (totalMax <= 0) return 0;
  return RADIUS_MAX * Math.sqrt(Math.max(0, total) / totalMax);
}

interface MeasuredPlatform {
  readonly platform: LeadPlatform;
  readonly total: number;
  readonly qualified: number;
}

export default function LeadQualificationPies({ data = defaultData, height, className }: LeadQualificationPiesProps) {
  const animate = useAnimateOnce();
  const rootStyle: CSSProperties | undefined = height === undefined ? undefined : { height };

  const measured: readonly MeasuredPlatform[] = data.flatMap((platform) => {
    const total = platformTotal(platform);
    const qualified = qualifiedSlice(platform);
    if (total === null || total <= 0 || qualified === null) return [];
    return [{ platform, total, qualified: qualified.value }];
  });
  const totalMax = measured.reduce((max, item) => Math.max(max, item.total), 0);
  const biggest = measured.reduce<MeasuredPlatform | null>(
    (best, item) => (best === null || item.total > best.total ? item : best),
    null,
  );
  const bestRate = measured.reduce<MeasuredPlatform | null>(
    (best, item) => (best === null || item.qualified / item.total > best.qualified / best.total ? item : best),
    null,
  );

  if (biggest === null || bestRate === null || totalMax <= 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={rootStyle}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma com lead neste recorte: sem volume não há área para comparar.</span>
      </div>
    );
  }

  const perPlatform = measured
    .map((item) => `${item.platform.platformName} ${formatRateWithVolume(item.qualified, item.total)}`)
    .join('; ');
  const summary = `${formatInt(measured.length)} pizzas proporcionais ao total, leads qualificados sobre o total por plataforma: ${perPlatform}. ${bestRate.platform.platformName} tem a melhor fração.`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={rootStyle}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {bestRate.platform.platformName} tem a melhor fração qualificada: {formatRateWithVolume(bestRate.qualified, bestRate.total)}.
      </p>

      <div className="flex min-h-0 flex-1 items-end justify-center gap-6">
        {measured.map(({ platform, total }) => {
          const radius = radiusForTotal(total, totalMax);
          const diameter = radius * 2;
          return (
            <div className="flex min-w-0 flex-col items-center" key={platform.platformId}>
              <p className="mb-1 shrink-0 text-xs font-medium text-text-secondary">{platform.platformName}</p>
              <div className="shrink-0" style={{ height: diameter, width: diameter }}>
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart accessibilityLayer={false} margin={CHART_MARGIN}>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={platform.slices}
                      dataKey="value"
                      endAngle={END_ANGLE}
                      isAnimationActive={animate}
                      label={false}
                      labelLine={false}
                      nameKey="name"
                      outerRadius={radius}
                      startAngle={START_ANGLE}
                      stroke="var(--surface-raised)"
                      strokeWidth={2}
                    >
                      {platform.slices.map((slice, index) => (
                        <Cell fill={STATE_COLORS[index] ?? STATE_COLORS[0]} key={slice.id} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 shrink-0 text-[0.6875rem] font-medium text-text-primary tabular-nums">
                {formatInt(total)} leads
              </p>
              <ul className="mt-1 w-full shrink-0">
                {platform.slices.map((slice, index) => (
                  <li className="flex items-center gap-2 text-[0.6875rem]" key={slice.id}>
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: STATE_COLORS[index] ?? STATE_COLORS[0] }}
                    />
                    <span className="flex-1 text-text-secondary">{slice.name}</span>
                    <span className="shrink-0 text-text-primary tabular-nums">{formatRateWithVolume(slice.value, total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
