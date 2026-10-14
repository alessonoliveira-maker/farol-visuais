import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyCpl } from './data';

/**
 * Pirulito radial: 52 hastes finas, uma por semana, partindo de um anel de zero no meio do raio.
 * Semana com CPL acima da média empurra a haste para fora (ruim, negative); abaixo da média
 * empurra para dentro (bom, positive). Denso demais para rótulo em cada haste: as duas semanas
 * extremas ganham o valor escrito, e a escala no anel de zero cobre o resto.
 */
export interface WeeklyCplDeviationProps {
  readonly data?: readonly WeeklyCpl[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW = 480;
const CENTER = 240;
const ZERO_R = 150;
const BAND = 45;
const WEEK_COUNT = 52;
const STEP_DEG = 360 / WEEK_COUNT;
/** Ângulo da costura do ano, no vão entre a semana 52 e a semana 1: onde a escala escreve os valores. */
const AXIS_ANGLE_DEG = -STEP_DEG / 2;
/**
 * As 52 hastes nascem todas em `ZERO_R` e só existem entre `ZERO_R - BAND` e `ZERO_R + BAND`
 * (105 a 195): diferente da v3, aqui não há vão angular nenhum entre semanas largo o bastante
 * para um rótulo, porque toda semana tem haste. Por isso a média sai do próprio anel de zero e
 * desce para o buraco vazio do centro, e as duas anotações de semana extrema saem do feixe de
 * hastes de vez, uma para fora do anel externo e outra para dentro do buraco: os três raios
 * abaixo foram medidos por simulação para não cruzar nenhuma haste nem estourar o viewBox de 480.
 */
const AVG_LABEL_R = 70;
const WORST_LABEL_R = 225;
const BEST_LABEL_R = 75;
/** Halo obrigatório (ROT-7): a escala e as anotações vivem fora do feixe de hastes, mas cruzam os anéis de referência. */
const HALO_STYLE = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Semana 1 no topo (ângulo 0); a costura do ano fica no vão depois da semana 52, não antes dela. */
function weekAngle(week: number): number {
  return (week - 1) * STEP_DEG;
}

function polarPoint(r: number, angleDeg: number): { x: number; y: number } {
  const a = toRad(angleDeg);
  return { x: CENTER + r * Math.sin(a), y: CENTER - r * Math.cos(a) };
}

function signedCurrency(value: number): string {
  const sign = value >= 0 ? '+' : '−';
  return `${sign}${formatCurrency(Math.abs(value), 2)}`;
}

export default function WeeklyCplDeviation({ data = defaultData, height, className }: WeeklyCplDeviationProps) {
  const style = height === undefined ? undefined : { height };
  const average = data.length > 0 ? data.reduce((sum, row) => sum + row.cpl, 0) / data.length : 0;
  const deviations = data.map((row) => ({ week: row.week, deviation: row.cpl - average }));
  const domainMax = Math.max(1, ...deviations.map((row) => Math.ceil(Math.abs(row.deviation) * 2) / 2));
  const firstRow = deviations[0];
  const worst = firstRow ? deviations.reduce((top, row) => (row.deviation > top.deviation ? row : top), firstRow) : undefined;
  const best = firstRow ? deviations.reduce((bottom, row) => (row.deviation < bottom.deviation ? row : bottom), firstRow) : undefined;

  const radiusFor = (deviation: number) => ZERO_R + (deviation / domainMax) * BAND;
  const colorFor = (deviation: number) => (deviation > 0 ? 'var(--negative)' : 'var(--positive)');

  const axisTop = polarPoint(ZERO_R + BAND, AXIS_ANGLE_DEG);
  const axisZero = polarPoint(AVG_LABEL_R, AXIS_ANGLE_DEG);
  const axisBottom = polarPoint(ZERO_R - BAND, AXIS_ANGLE_DEG);

  const summary =
    worst && best
      ? `Pirulito radial com o desvio do CPL de 52 semanas de 2025 contra a média de ${formatCurrency(average, 2)}. A semana ${String(worst.week)} teve o pior CPL, ${signedCurrency(worst.deviation)} acima da média; a semana ${String(best.week)} teve o melhor, ${signedCurrency(best.deviation)}.`
      : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center justify-center', className)} role="img" style={style}>
      <svg aria-hidden className="aspect-square h-full max-h-full w-full max-w-full" viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`}>
        <circle cx={CENTER} cy={CENTER} fill="none" r={ZERO_R + BAND} stroke="var(--line-subtle)" />
        <circle cx={CENTER} cy={CENTER} fill="none" r={ZERO_R - BAND} stroke="var(--line-subtle)" />
        <circle cx={CENTER} cy={CENTER} fill="none" r={ZERO_R} stroke="var(--line-strong)" />
        {deviations.map((row) => {
          const from = polarPoint(ZERO_R, weekAngle(row.week));
          const to = polarPoint(radiusFor(row.deviation), weekAngle(row.week));
          const color = colorFor(row.deviation);
          return (
            <g key={`week-${String(row.week)}`}>
              <line stroke={color} strokeWidth={1.6} vectorEffect="non-scaling-stroke" x1={from.x} x2={to.x} y1={from.y} y2={to.y} />
              <circle cx={to.x} cy={to.y} fill={color} r={2.6} />
            </g>
          );
        })}
        <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO_STYLE} textAnchor="middle" x={axisTop.x} y={axisTop.y}>
          {signedCurrency(domainMax)}
        </text>
        <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO_STYLE} textAnchor="middle" x={axisZero.x} y={axisZero.y}>
          {`média ${formatCurrency(average, 2)}`}
        </text>
        <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO_STYLE} textAnchor="middle" x={axisBottom.x} y={axisBottom.y}>
          {signedCurrency(-domainMax)}
        </text>
        {worst
          ? (() => {
              const point = polarPoint(WORST_LABEL_R, weekAngle(worst.week));
              return (
                <text className="font-display" dominantBaseline="central" fill="var(--negative)" fontSize={12} fontWeight={700} style={HALO_STYLE} textAnchor="middle" x={point.x} y={point.y}>
                  {`semana ${String(worst.week)}: ${signedCurrency(worst.deviation)}`}
                </text>
              );
            })()
          : null}
        {best
          ? (() => {
              const point = polarPoint(BEST_LABEL_R, weekAngle(best.week));
              return (
                <text className="font-display" dominantBaseline="central" fill="var(--positive)" fontSize={12} fontWeight={700} style={HALO_STYLE} textAnchor="middle" x={point.x} y={point.y}>
                  {`semana ${String(best.week)}: ${signedCurrency(best.deviation)}`}
                </text>
              );
            })()
          : null}
      </svg>
    </div>
  );
}
