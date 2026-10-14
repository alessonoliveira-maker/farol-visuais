import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';

import { formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, passo as defaultPasso, type TeamSlaSeries } from './data';

/**
 * Horizon chart em SVG puro: 30 equipes não cabem em 30 instâncias do Recharts sem custo, então
 * a geometria de cada faixa vira um `path` calculado aqui. Cada linha é baixa (16 px) e cada
 * faixa dobra o desvio sobre a mesma altura, com a cor pelo sentido e a opacidade pela
 * magnitude. A legenda ensina a leitura: quantas faixas existem e o que cada tom fecha.
 */
export interface TeamSlaHorizonProps {
  readonly data?: readonly TeamSlaSeries[];
  /** Tamanho de uma faixa, em pontos percentuais de SLA; comum a todas as equipes. */
  readonly passo?: number;
  readonly height?: number;
  readonly className?: string;
}

const BANDS = 3;
const BAND_OPACITIES = [0.35, 0.65, 1] as const;
/** Linha micro (o horizonte absorvido pelo modelo): acima do piso de 12 px da ESP-2. */
const ROW_HEIGHT = 16;
const ROW_GAP = 2;
const NAME_WIDTH = 92;
const CHART_GAP = 8;
const RIGHT_PAD = 6;
const VIEW_WIDTH = 574;
/** Abaixo da meta é atenção; acima é bom (COR-6): SLA lento é o problema, não o contrário. */
const ATTENTION_FILL = 'var(--negative)';
const GOOD_FILL = 'var(--positive)';

function signedPoints(value: number): string {
  return value < 0 ? `−${formatPercentPoints(Math.abs(value), 1)}` : `+${formatPercentPoints(value, 1)}`;
}

/** Média do pior trimestre (três blocos de 60 dias): a chave de ordenação, não o nome. */
function worstQuarterAverage(values: readonly number[]): number {
  const chunkSize = Math.ceil(values.length / 3);
  let worst = Number.POSITIVE_INFINITY;
  for (let start = 0; start < values.length; start += chunkSize) {
    const chunk = values.slice(start, start + chunkSize);
    if (chunk.length === 0) continue;
    const average = chunk.reduce((sum, value) => sum + value, 0) / chunk.length;
    if (average < worst) worst = average;
  }
  return worst;
}

function bandPath(
  values: readonly number[],
  sign: 1 | -1,
  band: number,
  passoValue: number,
  x0: number,
  xStep: number,
  rowBottom: number,
): string {
  const segments = values.map((value, index) => {
    const clamped = Math.min(Math.max(sign * value - band * passoValue, 0), passoValue);
    const y = rowBottom - (clamped / passoValue) * ROW_HEIGHT;
    return `${(x0 + index * xStep).toFixed(1)},${y.toFixed(1)}`;
  });
  const lastX = (x0 + (values.length - 1) * xStep).toFixed(1);
  const baseY = rowBottom.toFixed(1);
  return `M${x0.toFixed(1)},${baseY} L${segments.join(' L')} L${lastX},${baseY} Z`;
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
        {label}: até {formatPercentPoints(cut1, 1)}; de {formatPercentPoints(cut1, 1)} a{' '}
        {formatPercentPoints(cut2, 1)}; acima de {formatPercentPoints(cut2, 1)}
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
        {String(BANDS)} faixas por sentido, dobradas sobre a mesma linha; cada faixa vale{' '}
        {formatPercentPoints(passoValue, 1)} de SLA. Ordenado pelo pior trimestre.
      </span>
      <BandLegendSide color={ATTENTION_FILL} cut1={cut1} cut2={cut2} label="abaixo da meta, atenção" />
      <BandLegendSide color={GOOD_FILL} cut1={cut1} cut2={cut2} label="acima da meta, bom" />
    </div>
  );
}

const TEXT_X = 2;

export default function TeamSlaHorizon({
  data = defaultData,
  passo = defaultPasso,
  height,
  className,
}: TeamSlaHorizonProps) {
  const uid = useId().replace(/:/g, '');
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma equipe neste recorte: não há SLA para comparar.</span>
      </div>
    );
  }

  const rows = [...data].sort((a, b) => worstQuarterAverage(a.deviations) - worstQuarterAverage(b.deviations));
  const rowCount = rows.length;
  const viewHeight = rowCount * ROW_HEIGHT + Math.max(rowCount - 1, 0) * ROW_GAP;
  const chartLeft = NAME_WIDTH + CHART_GAP;
  const chartWidth = VIEW_WIDTH - chartLeft - RIGHT_PAD;

  const worst = rows[0];
  const worstAverage = worst ? worstQuarterAverage(worst.deviations) : 0;

  const summary = `Horizon chart com o desvio diário de SLA de ${String(rowCount)} equipes fictícias de pré-vendas contra a meta, em 180 dias e ${String(BANDS)} faixas de ${formatPercentPoints(passo, 1)}, ordenado pelo pior trimestre. ${worst ? worst.name : 'Nenhuma equipe'} liderou o pior trimestre, com média de ${signedPoints(worstAverage)}.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="img"
      style={style}
    >
      <BandLegend passoValue={passo} />
      <div className="min-h-0 flex-1">
        <svg
          aria-hidden
          className="h-full w-full"
          style={{ aspectRatio: `${String(VIEW_WIDTH)} / ${String(viewHeight)}` }}
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(viewHeight)}`}
        >
          {rows.map((row, rowIndex) => {
            const rowTop = rowIndex * (ROW_HEIGHT + ROW_GAP);
            const rowBottom = rowTop + ROW_HEIGHT;
            const clipId = `${uid}-row-${String(rowIndex)}`;
            const isWorst = row.id === worst?.id;
            const xStep = row.deviations.length > 1 ? chartWidth / (row.deviations.length - 1) : 0;
            return (
              <g key={row.id}>
                <text
                  className="font-sans"
                  dominantBaseline="central"
                  fill={isWorst ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={11}
                  fontWeight={isWorst ? 700 : 400}
                  x={TEXT_X}
                  y={rowTop + ROW_HEIGHT / 2}
                >
                  {row.name}
                </text>
                <clipPath id={clipId}>
                  <rect height={ROW_HEIGHT - 1} width={chartWidth} x={chartLeft} y={rowTop + 0.5} />
                </clipPath>
                <g clipPath={`url(#${clipId})`}>
                  {BAND_OPACITIES.map((opacity, band) => (
                    <path
                      d={bandPath(row.deviations, -1, band, passo, chartLeft, xStep, rowBottom)}
                      fill={ATTENTION_FILL}
                      fillOpacity={opacity}
                      key={`neg-${String(band)}`}
                    />
                  ))}
                  {BAND_OPACITIES.map((opacity, band) => (
                    <path
                      d={bandPath(row.deviations, 1, band, passo, chartLeft, xStep, rowBottom)}
                      fill={GOOD_FILL}
                      fillOpacity={opacity}
                      key={`pos-${String(band)}`}
                    />
                  ))}
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
