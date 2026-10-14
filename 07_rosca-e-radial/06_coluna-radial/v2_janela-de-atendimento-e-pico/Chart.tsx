import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, referenceDate as defaultReferenceDate, windowEndHour as defaultWindowEndHour, windowStartHour as defaultWindowStartHour, type HourlyEntries } from './data';

/**
 * A mesma coluna radial das 24 horas, com a janela de atendimento marcada em faixa angular e o
 * pico do dia anotado com o valor exato. O restante da leitura segue pela escala dos anéis: o
 * mesmo viés do raio da versão básica vale aqui, então só a anotação e a escala têm valor exato.
 */
export interface HourlyWindowColumnsProps {
  readonly data?: readonly HourlyEntries[];
  readonly referenceDate?: string;
  readonly windowStartHour?: number;
  readonly windowEndHour?: number;
  readonly height?: number;
  readonly className?: string;
}

const VIEW = 480;
const CENTER = 240;
const INNER_R = 115;
const OUTER_R = 180;
const DOMAIN_MAX = 200;
const GRID_VALUES = [50, 100, 150, 200] as const;
const GAP_DEG = 2;
const HOUR_STEP = 3;
const TICK_GAP = 15;
const AXIS_ANGLE_DEG = 37.5;
/** Respiro entre a ponta da coluna e o texto da anotação de pico. */
const LABEL_GAP = 10;
/** Até onde a faixa da janela de atendimento se estende, um pouco além do anel externo. */
const WINDOW_BAND_R = OUTER_R + 8;
/** Halo obrigatório (ROT-7): escala e anotação nascem em cima do anel ou perto da coluna. */
const HALO_STYLE = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function arcPath(r0: number, r1: number, a0Deg: number, a1Deg: number): string {
  const a0 = toRad(a0Deg);
  const a1 = toRad(a1Deg);
  const point = (r: number, a: number) => [CENTER + r * Math.sin(a), CENTER - r * Math.cos(a)] as const;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = point(r1, a0);
  const [x1, y1] = point(r1, a1);
  const [x2, y2] = point(r0, a1);
  const [x3, y3] = point(r0, a0);
  return `M${String(x0)},${String(y0)} A${String(r1)},${String(r1)} 0 ${String(large)} 1 ${String(x1)},${String(y1)} L${String(x2)},${String(y2)} A${String(r0)},${String(r0)} 0 ${String(large)} 0 ${String(x3)},${String(y3)} Z`;
}

function polarPoint(r: number, angleDeg: number): { x: number; y: number } {
  const a = toRad(angleDeg);
  return { x: CENTER + r * Math.sin(a), y: CENTER - r * Math.cos(a) };
}

function anchorFor(x: number): 'start' | 'middle' | 'end' {
  const diff = x - CENTER;
  if (Math.abs(diff) < 6) return 'middle';
  return diff > 0 ? 'start' : 'end';
}

function valueToRadius(value: number): number {
  return INNER_R + (Math.min(value, DOMAIN_MAX) / DOMAIN_MAX) * (OUTER_R - INNER_R);
}

export default function HourlyWindowColumns({
  data = defaultData,
  referenceDate = defaultReferenceDate,
  windowStartHour = defaultWindowStartHour,
  windowEndHour = defaultWindowEndHour,
  height,
  className,
}: HourlyWindowColumnsProps) {
  const style = height === undefined ? undefined : { height };
  const total = data.reduce((sum, row) => sum + row.count, 0);
  const firstRow = data[0];
  const peak = firstRow ? data.reduce((best, row) => (row.count > best.count ? row : best), firstRow) : undefined;
  const outside = data
    .filter((row) => row.hour < windowStartHour || row.hour >= windowEndHour)
    .reduce((sum, row) => sum + row.count, 0);
  const outsideShare = total > 0 ? outside / total : 0;

  const readingLine =
    peak && total > 0
      ? `${formatPercent(outsideShare, 0)} das entradas chegam fora da janela de atendimento (${String(windowStartHour)}h às ${String(windowEndHour)}h); pico às ${String(peak.hour)}h.`
      : '';
  const summary = peak
    ? `Coluna radial com as entradas por hora de ${referenceDate}, marcando a janela de atendimento das ${String(windowStartHour)}h às ${String(windowEndHour)}h. ${readingLine}`
    : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="text-xs leading-4 text-text-muted">
        {readingLine}
      </p>
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg aria-hidden className="aspect-square h-full max-h-full w-full max-w-full" viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`}>
          <path d={arcPath(INNER_R, WINDOW_BAND_R, windowStartHour * 15, windowEndHour * 15)} fill="var(--surface-sunken)" />
          {GRID_VALUES.map((value) => (
            <circle cx={CENTER} cy={CENTER} fill="none" key={`grid-${String(value)}`} r={valueToRadius(value)} stroke="var(--line-subtle)" />
          ))}
          <circle cx={CENTER} cy={CENTER} fill="none" r={INNER_R} stroke="var(--line-strong)" />
          {data.map((row) => (
            <path d={arcPath(INNER_R, valueToRadius(row.count), row.hour * 15 + GAP_DEG / 2, row.hour * 15 + 15 - GAP_DEG / 2)} fill="var(--chart-1)" key={`bar-${String(row.hour)}`} />
          ))}
          {GRID_VALUES.map((value) => {
            const point = polarPoint(valueToRadius(value), AXIS_ANGLE_DEG);
            return (
              <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} key={`grid-label-${String(value)}`} style={HALO_STYLE} textAnchor="middle" x={point.x} y={point.y}>
                {formatInt(value)}
              </text>
            );
          })}
          {data
            .filter((row) => row.hour % HOUR_STEP === 0)
            .map((row) => {
              const point = polarPoint(OUTER_R + TICK_GAP, row.hour * 15);
              return (
                <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} key={`hour-${String(row.hour)}`} textAnchor={anchorFor(point.x)} x={point.x} y={point.y}>
                  {String(row.hour)}h
                </text>
              );
            })}
          {peak
            ? (() => {
                const point = polarPoint(valueToRadius(peak.count) + LABEL_GAP, peak.hour * 15);
                return (
                  <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO_STYLE} textAnchor={anchorFor(point.x)} x={point.x} y={point.y}>
                    {`pico ${String(peak.hour)}h: ${formatInt(peak.count)}`}
                  </text>
                );
              })()
            : null}
        </svg>
      </div>
    </div>
  );
}
