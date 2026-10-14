import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, passo as defaultPasso, type ResponseTimeDeviationSeries } from './data';

/**
 * Horizon chart em que um dia de instabilidade passa muito do teto das faixas. O passo continua
 * comum às demais séries (não estica para caber o extremo): a faixa mais escura satura, um
 * marcador aponta o dia e a anotação escreve o valor real, não o recortado pelo clamp.
 */
export interface ResponseTimeHorizonProps {
  readonly data?: readonly ResponseTimeDeviationSeries[];
  /** Tamanho de uma faixa, em minutos de desvio; comum a todos os squads. */
  readonly passo?: number;
  readonly height?: number;
  readonly className?: string;
}

interface DeviationPoint {
  readonly deviation: number;
}

interface Outlier {
  readonly rowId: string;
  readonly rowName: string;
  readonly dayIndex: number;
  readonly dayCount: number;
  readonly value: number;
}

const BANDS = 3;
const BAND_OPACITIES = [0.35, 0.65, 1] as const;
const ROW_HEIGHT = 20;
const NAME_WIDTH = 148;
const ROW_MARGIN = { top: 1, right: 0, bottom: 1, left: 0 } as const;
/** Squad mais lento que a meta é atenção; mais rápido é bom (COR-6). */
const ATTENTION_FILL = 'var(--negative)';
const GOOD_FILL = 'var(--positive)';

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

function findOutlier(rows: readonly ResponseTimeDeviationSeries[], cap: number): Outlier | null {
  let found: Outlier | null = null;
  for (const row of rows) {
    row.deviations.forEach((value, dayIndex) => {
      if (Math.abs(value) <= cap) return;
      if (found && Math.abs(value) <= Math.abs(found.value)) return;
      found = { rowId: row.id, rowName: row.name, dayIndex, dayCount: row.deviations.length, value };
    });
  }
  return found;
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
        {label}: até {formatDecimal(cut1, 1)} min; de {formatDecimal(cut1, 1)} a {formatDecimal(cut2, 1)} min; acima
        de {formatDecimal(cut2, 1)} min
      </span>
    </span>
  );
}

function BandLegend({ passoValue, outlier }: { readonly passoValue: number; readonly outlier: Outlier | null }): ReactElement {
  const cut1 = passoValue;
  const cut2 = passoValue * 2;
  return (
    <div className="mb-1.5 flex shrink-0 flex-col gap-1 text-[11px] text-text-muted">
      <span>
        {String(BANDS)} faixas por sentido; cada faixa vale {formatDecimal(passoValue, 1)} min.
      </span>
      <BandLegendSide color={ATTENTION_FILL} cut1={cut1} cut2={cut2} label="mais lento que a meta" />
      <BandLegendSide color={GOOD_FILL} cut1={cut1} cut2={cut2} label="mais rápido que a meta" />
      {outlier ? (
        <span className="text-text-secondary">
          <span aria-hidden>{'▲ '}</span>
          {outlier.rowName}: {formatDecimal(Math.abs(outlier.value), 1)} min no dia {formatInt(outlier.dayIndex + 1)},
          fora de escala
        </span>
      ) : null}
    </div>
  );
}

export default function ResponseTimeHorizon({
  data = defaultData,
  passo = defaultPasso,
  height,
  className,
}: ResponseTimeHorizonProps) {
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
        <span>Nenhum squad neste recorte: não há tempo de resposta para comparar.</span>
      </div>
    );
  }

  const cap = BANDS * passo;
  const outlier = findOutlier(data, cap);

  const summary = `Horizon chart com o desvio diário do tempo de resposta ao lead de ${String(data.length)} squads fictícios contra a meta, em ${String(BANDS)} faixas de ${formatDecimal(passo, 1)} min.${outlier ? ` ${outlier.rowName} teve um dia fora de escala: ${formatDecimal(Math.abs(outlier.value), 1)} min no dia ${formatInt(outlier.dayIndex + 1)}, contra o teto de ${formatDecimal(cap, 1)} min das faixas.` : ''}`;


  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <BandLegend outlier={outlier} passoValue={passo} />
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-1">
        {data.map((row) => {
          const points: readonly DeviationPoint[] = row.deviations.map((deviation) => ({ deviation }));
          const isOutlierRow = outlier !== null && outlier.rowId === row.id;
          const pct = isOutlierRow && outlier ? (outlier.dayIndex / Math.max(outlier.dayCount - 1, 1)) * 100 : 0;
          return (
            <div className="flex min-w-0 shrink-0 items-center" key={row.id} style={{ height: ROW_HEIGHT }}>
              <span className="shrink-0 truncate pr-2 text-xs text-text-secondary" style={{ width: NAME_WIDTH }}>
                {row.name}
              </span>
              <div className="relative h-full min-w-0 flex-1">
                {isOutlierRow ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute z-10 -translate-x-1/2 text-[9px] leading-none text-text-primary"
                    style={{ left: `${String(pct)}%`, top: -6 }}
                  >
                    {'▲'}
                  </span>
                ) : null}
                <div aria-hidden className="h-full min-w-0">
                  <ResponsiveContainer height="100%" width="100%">
                    <AreaChart accessibilityLayer={false} data={points as DeviationPoint[]} margin={ROW_MARGIN}>
                      <YAxis domain={[0, passo]} hide />
                      {renderBands(1, ATTENTION_FILL, passo, animate)}
                      {renderBands(-1, GOOD_FILL, passo, animate)}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
