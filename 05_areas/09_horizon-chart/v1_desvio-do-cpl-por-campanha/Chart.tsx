import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, passo as defaultPasso, type CplDeviationSeries } from './data';

/**
 * Horizon chart: cada campanha vira uma linha baixa em que a cor mostra o sentido do desvio do
 * CPL (alerta para acima da média, economia para abaixo) e a intensidade mostra a magnitude em
 * faixas de mesmo tamanho, sobrepostas na mesma altura. A leitura não é óbvia sem a chave, por
 * isso a legenda declara quantas faixas existem e o valor de corte de cada uma.
 */
export interface CplHorizonProps {
  readonly data?: readonly CplDeviationSeries[];
  /** Tamanho de uma faixa de intensidade, em reais; comum a todas as campanhas. */
  readonly passo?: number;
  readonly height?: number;
  readonly className?: string;
}

interface DeviationPoint {
  readonly deviation: number;
}

/** Três faixas por sentido: o teto que a revisão aceita antes de a leitura virar ruído. */
const BANDS = 3;
const BAND_OPACITIES = [0.35, 0.65, 1] as const;
/** Espessura da faixa de cada campanha: acima do piso de 12 px da ESP-2, com folga. */
const ROW_HEIGHT = 24;
const NAME_WIDTH = 148;
const ROW_MARGIN = { top: 1, right: 0, bottom: 1, left: 0 } as const;
/** CPL acima da média é alerta; abaixo é economia (COR-6, polaridade da métrica). */
const ALERT_FILL = 'var(--negative)';
const ECONOMY_FILL = 'var(--positive)';

function clampBand(value: number, band: number, passoValue: number): number {
  return Math.min(Math.max(value - band * passoValue, 0), passoValue);
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
        {label}: até {formatCurrency(cut1, 2)}; de {formatCurrency(cut1, 2)} a {formatCurrency(cut2, 2)}; acima de{' '}
        {formatCurrency(cut2, 2)}
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
        {String(BANDS)} faixas por sentido; cada faixa vale {formatCurrency(passoValue, 2)}.
      </span>
      <BandLegendSide color={ALERT_FILL} cut1={cut1} cut2={cut2} label="acima da média, alerta" />
      <BandLegendSide color={ECONOMY_FILL} cut1={cut1} cut2={cut2} label="abaixo da média, economia" />
    </div>
  );
}

export default function CplHorizon({ data = defaultData, passo = defaultPasso, height, className }: CplHorizonProps) {
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
        <span>Nenhuma campanha neste recorte: não há desvio de CPL para comparar.</span>
      </div>
    );
  }

  const rows = [...data].sort((a, b) => {
    const maxA = Math.max(...a.deviations.map(Math.abs));
    const maxB = Math.max(...b.deviations.map(Math.abs));
    return maxB - maxA;
  });

  const worst = rows[0];
  const worstMax = worst ? Math.max(...worst.deviations.map(Math.abs)) : 0;
  const worstDay = worst ? worst.deviations.findIndex((value) => Math.abs(value) === worstMax) : -1;

  const summary = `Horizon chart com o desvio diário do CPL de ${String(rows.length)} campanhas fictícias contra a própria média móvel de 30 dias, em ${String(BANDS)} faixas de ${formatCurrency(passo, 2)} por sentido. ${worst ? worst.name : 'Nenhuma campanha'} teve o maior desvio, ${formatCurrency(worstMax, 2)}${worstDay >= 0 ? ` no dia ${formatInt(worstDay + 1)}` : ''}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <BandLegend passoValue={passo} />
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        {rows.map((row) => {
          const points: readonly DeviationPoint[] = row.deviations.map((deviation) => ({ deviation }));
          return (
            <div className="flex min-w-0 shrink-0 items-center" key={row.id} style={{ height: ROW_HEIGHT }}>
              <span className="shrink-0 truncate pr-2 text-xs text-text-secondary" style={{ width: NAME_WIDTH }}>
                {row.name}
              </span>
              <div aria-hidden className="h-full min-w-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart accessibilityLayer={false} data={points as DeviationPoint[]} margin={ROW_MARGIN}>
                    <YAxis domain={[0, passo]} hide />
                    {renderBands(1, ALERT_FILL, passo, animate)}
                    {renderBands(-1, ECONOMY_FILL, passo, animate)}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
