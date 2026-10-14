import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  expandedId as defaultExpandedId,
  passo as defaultPasso,
  type CtrDeviationSeries,
} from './data';

/**
 * Horizon chart em que a campanha escolhida abre numa área de altura normal, com o valor real
 * e a linha de zero, enquanto as demais seguem dobradas em faixas na mesma escala. É o degrau
 * de aprendizado: quem nunca viu horizon chart entende a forma dobrada olhando a que está aberta.
 */
export interface CampaignExpandedHorizonProps {
  readonly data?: readonly CtrDeviationSeries[];
  /** Tamanho de uma faixa de intensidade, em pontos percentuais; comum a todas as campanhas. */
  readonly passo?: number;
  /** Id da campanha aberta em área comum; as demais ficam dobradas em horizonte. */
  readonly expandedId?: string;
  readonly height?: number;
  readonly className?: string;
}

interface DeviationPoint {
  readonly deviation: number;
}

const BANDS = 3;
const BAND_OPACITIES = [0.35, 0.65, 1] as const;
const ROW_HEIGHT = 24;
const EXPANDED_HEIGHT = 88;
const NAME_WIDTH = 184;
const ROW_MARGIN = { top: 1, right: 0, bottom: 1, left: 0 } as const;
const EXPANDED_MARGIN = { top: 6, right: 4, bottom: 6, left: 4 } as const;
/** CTR acima da meta é bom; abaixo é atenção (COR-6): polaridade oposta à do desvio de custo. */
const GOOD_FILL = 'var(--positive)';
const ATTENTION_FILL = 'var(--negative)';

function clampBand(value: number, band: number, passoValue: number): number {
  return Math.min(Math.max(value - band * passoValue, 0), passoValue);
}

function signedPoints(value: number): string {
  return value < 0 ? `−${formatPercentPoints(Math.abs(value), 1)}` : `+${formatPercentPoints(value, 1)}`;
}

function renderBands(sign: 1 | -1, color: string, passoValue: number, animate: boolean): ReactElement[] {
  return BAND_OPACITIES.map((opacity, band) => (
    <Area
      dataKey={(point: DeviationPoint) => clampBand(sign * point.deviation, band, passoValue)}
      fill={color}
      fillOpacity={opacity}
      isAnimationActive={animate}
      key={`${String(sign)}-${String(band)}`}
      stroke="none"
      type="linear"
    />
  ));
}

function BandLegendSide({
  label,
  color,
  cut1,
  cut2,
}: {
  readonly label: string;
  readonly color: string;
  readonly cut1: number;
  readonly cut2: number;
}): ReactElement {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span aria-hidden className="flex shrink-0 items-center gap-0.5">
        {BAND_OPACITIES.map((opacity) => (
          <span className="size-2.5 rounded-[2px]" key={opacity} style={{ backgroundColor: color, opacity }} />
        ))}
      </span>
      <span className="min-w-0 text-text-secondary">
        {label}: até {formatPercentPoints(cut1, 1)}; de {formatPercentPoints(cut1, 1)} a {formatPercentPoints(cut2, 1)}
        ; acima de {formatPercentPoints(cut2, 1)}
      </span>
    </span>
  );
}

function BandLegend({ passoValue }: { readonly passoValue: number }): ReactElement {
  const cut1 = passoValue;
  const cut2 = passoValue * 2;
  return (
    <div className="mb-2 flex shrink-0 flex-col gap-1 text-[11px] text-text-muted">
      <span>
        {String(BANDS)} faixas por sentido; cada faixa vale {formatPercentPoints(passoValue, 1)}. A campanha aberta
        mostra o valor real com a linha de zero; as demais, a intensidade em faixas.
      </span>
      <BandLegendSide color={GOOD_FILL} cut1={cut1} cut2={cut2} label="acima da meta, bom" />
      <BandLegendSide color={ATTENTION_FILL} cut1={cut1} cut2={cut2} label="abaixo da meta, atenção" />
    </div>
  );
}

export default function CampaignExpandedHorizon({
  data = defaultData,
  passo = defaultPasso,
  expandedId = defaultExpandedId,
  height,
  className,
}: CampaignExpandedHorizonProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte: não há desvio de CTR para comparar.</span>
      </div>
    );
  }

  const expanded = data.find((row) => row.id === expandedId);
  const expandedPeak = expanded ? Math.max(...expanded.deviations) : 0;
  const expandedDomain = expanded ? Math.max(Math.abs(Math.min(...expanded.deviations)), expandedPeak) * 1.2 : passo;

  const summary = `Horizon chart com o desvio diário de CTR de ${String(data.length)} campanhas fictícias contra a meta, em ${String(BANDS)} faixas de ${formatPercentPoints(passo, 1)}. ${expanded ? expanded.name : 'Nenhuma campanha'} está aberta em área comum${expanded ? `, com pico de ${signedPoints(expandedPeak)}` : ''}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <BandLegend passoValue={passo} />
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        {data.map((row) => {
          const isExpanded = row.id === expandedId;
          const points: readonly DeviationPoint[] = row.deviations.map((deviation) => ({ deviation }));
          return (
            <div
              className="flex min-w-0 shrink-0 items-center"
              key={row.id}
              style={{ height: isExpanded ? EXPANDED_HEIGHT : ROW_HEIGHT }}
            >
              <span
                className={cn(
                  'shrink-0 truncate pr-2 text-xs',
                  isExpanded ? 'font-bold text-text-primary' : 'text-text-secondary',
                )}
                style={{ width: NAME_WIDTH }}
              >
                {row.name}
              </span>
              <div aria-hidden className="h-full min-w-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  {isExpanded ? (
                    <AreaChart accessibilityLayer={false} data={points as DeviationPoint[]} margin={EXPANDED_MARGIN}>
                      <YAxis domain={[-expandedDomain, expandedDomain]} hide />
                      <ReferenceLine stroke="var(--line-strong)" strokeWidth={1} y={0} />
                      <Area
                        baseValue={0}
                        dataKey={(point: DeviationPoint) => Math.max(point.deviation, 0)}
                        fill={GOOD_FILL}
                        fillOpacity={0.55}
                        isAnimationActive={animate}
                        stroke={GOOD_FILL}
                        strokeWidth={1.5}
                        type="monotone"
                      />
                      <Area
                        baseValue={0}
                        dataKey={(point: DeviationPoint) => Math.min(point.deviation, 0)}
                        fill={ATTENTION_FILL}
                        fillOpacity={0.55}
                        isAnimationActive={animate}
                        stroke={ATTENTION_FILL}
                        strokeWidth={1.5}
                        type="monotone"
                      />
                    </AreaChart>
                  ) : (
                    <AreaChart accessibilityLayer={false} data={points as DeviationPoint[]} margin={ROW_MARGIN}>
                      <YAxis domain={[0, passo]} hide />
                      {renderBands(1, GOOD_FILL, passo, animate)}
                      {renderBands(-1, ATTENTION_FILL, passo, animate)}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
