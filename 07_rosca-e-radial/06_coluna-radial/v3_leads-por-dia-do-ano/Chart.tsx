import { useMemo } from 'react';

import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DailyLeads } from './data';

/**
 * 365 colunas radiais finas, uma por dia de 2025, agrupadas em 12 meses com vão angular entre
 * eles. Denso demais para valor em cada coluna: a leitura exata vem da média escrita no anel
 * tracejado e da escala do anel externo, nunca de comparar duas colunas vizinhas pelo raio.
 */
export interface DailyLeadsRadialColumnsProps {
  readonly data?: readonly DailyLeads[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW = 480;
const CENTER = 240;
const INNER_R = 115;
const OUTER_R = 180;
const MONTH_GAP_DEG = 2.4;
const TICK_GAP = 15;
/**
 * Ângulo da costura do ano, entre 31 de dezembro e 1º de janeiro. O vão em si (2,4°) não tem
 * coluna, mas é estreito demais para o texto do rótulo (perto de 20°): por isso a escala não
 * escreve dentro do vão, escreve fora do anel externo, onde não existe coluna em ângulo nenhum.
 */
const AXIS_ANGLE_DEG = -MONTH_GAP_DEG / 2;
/** Halo obrigatório (ROT-7): os dois rótulos de escala nascem na faixa vazia além do anel externo, nunca sobre coluna. */
const HALO_STYLE = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function arcPath(cx: number, r0: number, r1: number, a0Deg: number, a1Deg: number): string {
  const a0 = toRad(a0Deg);
  const a1 = toRad(a1Deg);
  const point = (r: number, a: number) => [cx + r * Math.sin(a), cx - r * Math.cos(a)] as const;
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

interface DayArc {
  readonly key: string;
  readonly d: string;
}

interface MonthLabel {
  readonly month: number;
  readonly angleDeg: number;
}

function buildGeometry(rows: readonly DailyLeads[], domainMax: number): { arcs: readonly DayArc[]; months: readonly MonthLabel[] } {
  const totalDays = rows.length;
  const gapTotal = MONTH_GAP_DEG * 12;
  const dayAngle = (360 - gapTotal) / totalDays;
  const arcs: DayArc[] = [];
  const months: MonthLabel[] = [];
  let cursor = 0;
  let currentMonth = -1;
  let monthStart = 0;
  let monthDays = 0;
  rows.forEach((row, index) => {
    if (row.month !== currentMonth) {
      if (currentMonth >= 0) {
        months.push({ month: currentMonth, angleDeg: monthStart + (monthDays * dayAngle) / 2 });
        cursor += MONTH_GAP_DEG;
      }
      currentMonth = row.month;
      monthStart = cursor;
      monthDays = 0;
    }
    const a0 = cursor;
    const a1 = cursor + dayAngle;
    const r1 = INNER_R + (Math.min(row.count, domainMax) / domainMax) * (OUTER_R - INNER_R);
    arcs.push({ key: `day-${String(index)}`, d: arcPath(CENTER, INNER_R, r1, a0, a1) });
    cursor = a1;
    monthDays += 1;
  });
  months.push({ month: currentMonth, angleDeg: monthStart + (monthDays * dayAngle) / 2 });
  return { arcs, months };
}

export default function DailyLeadsRadialColumns({ data = defaultData, height, className }: DailyLeadsRadialColumnsProps) {
  const style = height === undefined ? undefined : { height };
  const total = data.reduce((sum, row) => sum + row.count, 0);
  const average = data.length > 0 ? total / data.length : 0;
  const rawMax = data.reduce((max, row) => Math.max(max, row.count), 0);
  const domainMax = Math.max(10, Math.ceil(rawMax / 10) * 10);
  const monthTotals = new Map<number, number>();
  data.forEach((row) => monthTotals.set(row.month, (monthTotals.get(row.month) ?? 0) + row.count));
  let bestMonthIndex = 0;
  let bestMonthTotal = 0;
  monthTotals.forEach((monthTotal, monthIndex) => {
    if (monthTotal > bestMonthTotal) {
      bestMonthTotal = monthTotal;
      bestMonthIndex = monthIndex;
    }
  });

  const geometry = useMemo(() => buildGeometry(data, domainMax), [data, domainMax]);
  const avgRadius = INNER_R + (average / domainMax) * (OUTER_R - INNER_R);
  const maxRadius = OUTER_R;
  /**
   * Os dois rótulos de escala vivem fora do anel externo (nunca além dele nasce um dia): o vão
   * de 2,4° entre meses é largo demais para conter o texto, então em vez de tentar caber ali
   * dentro (como a média fazia, sobre o próprio anel tracejado) os dois saem para a faixa vazia
   * além de `maxRadius`, empilhados para não colidirem entre si.
   */
  const axisMaxPoint = polarPoint(maxRadius + 12, AXIS_ANGLE_DEG);
  const axisAvgPoint = polarPoint(maxRadius + 12 + 20, AXIS_ANGLE_DEG);

  const summary =
    data.length > 0
      ? `Coluna radial com os leads de cada um dos 365 dias de 2025, agrupados por mês em sentido horário a partir de janeiro no topo. Total de ${formatInt(total)} leads, média de ${formatInt(Math.round(average))} por dia. ${formatMonthShort(`2025-${String(bestMonthIndex + 1).padStart(2, '0')}`)} teve o maior volume do ano.`
      : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center justify-center', className)} role="img" style={style}>
      <svg aria-hidden className="aspect-square h-full max-h-full w-full max-w-full" viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`}>
        <circle cx={CENTER} cy={CENTER} fill="none" r={maxRadius} stroke="var(--line-subtle)" />
        <circle cx={CENTER} cy={CENTER} fill="none" r={avgRadius} stroke="var(--text-muted)" strokeDasharray="3 3" />
        <circle cx={CENTER} cy={CENTER} fill="none" r={INNER_R} stroke="var(--line-strong)" />
        {geometry.arcs.map((arc) => (
          <path d={arc.d} fill="var(--chart-1)" key={arc.key} />
        ))}
        {geometry.months.map((entry) => {
          const point = polarPoint(OUTER_R + TICK_GAP, entry.angleDeg);
          return (
            <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} key={`month-${String(entry.month)}`} textAnchor={anchorFor(point.x)} x={point.x} y={point.y}>
              {formatMonthShort(`2025-${String(entry.month + 1).padStart(2, '0')}`)}
            </text>
          );
        })}
        <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO_STYLE} textAnchor="middle" x={axisAvgPoint.x} y={axisAvgPoint.y}>
          {`média ${formatInt(Math.round(average))}`}
        </text>
        <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO_STYLE} textAnchor="middle" x={axisMaxPoint.x} y={axisMaxPoint.y}>
          {formatInt(domainMax)}
        </text>
      </svg>
    </div>
  );
}
