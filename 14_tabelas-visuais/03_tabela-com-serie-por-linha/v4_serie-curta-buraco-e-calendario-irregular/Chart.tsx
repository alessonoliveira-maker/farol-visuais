import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, recessWeekIndex as defaultRecessWeekIndex, type SdrWeeklyAgendaGap } from './data';

/**
 * Tabela com sparkline por linha, caso limite de calendário: SDR recém admitido não tem linha antes
 * da contratação, semana de recesso comum a todas as linhas não conta como falha de ninguém, e
 * semana sem carga de dado de uma linha específica quebra o path e vira lacuna individual. Escala
 * própria por linha, como na versão básica: mostra a forma, não compara volume entre SDRs.
 */
export interface SdrGapTrendTableProps {
  readonly data?: readonly SdrWeeklyAgendaGap[];
  readonly recessWeekIndex?: number;
  readonly className?: string;
}

const WEEK_COUNT = 12;
const NAME_COL_WIDTH = 96;
const SPARK_WIDTH = 512;
const SPARK_HEIGHT = 26;
const SPARK_PAD_Y = 3;

interface Row {
  readonly sdr: SdrWeeklyAgendaGap;
  readonly segments: readonly string[];
  readonly gapMarkers: readonly { x: number }[];
  readonly recessMarkers: readonly { x: number }[];
  readonly lastX: number | null;
  readonly lastY: number | null;
  readonly current: number | null;
  readonly dataWeeks: number;
  readonly validWeeks: number;
  readonly admittedWeekLabel: string | null;
}

function buildRow(sdr: SdrWeeklyAgendaGap, recessIndex: number): Row {
  const startIndex = sdr.admittedFromWeek ?? 0;
  const step = SPARK_WIDTH / (WEEK_COUNT - 1);
  const values: number[] = [];
  for (let i = startIndex; i < WEEK_COUNT; i += 1) {
    const value = sdr.series[i]?.value ?? null;
    if (value !== null) values.push(value);
  }
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 1;
  const span = max - min || 1;
  const toY = (v: number) => SPARK_PAD_Y + (1 - (v - min) / span) * (SPARK_HEIGHT - SPARK_PAD_Y * 2);

  const segments: string[] = [];
  const gapMarkers: { x: number }[] = [];
  const recessMarkers: { x: number }[] = [];
  let current = '';
  let lastX: number | null = null;
  let lastY: number | null = null;
  let lastValue: number | null = null;

  for (let i = startIndex; i < WEEK_COUNT; i += 1) {
    const value = sdr.series[i]?.value ?? null;
    const x = i * step;
    if (value === null) {
      if (current) {
        segments.push(current);
        current = '';
      }
      if (i === recessIndex) recessMarkers.push({ x });
      else gapMarkers.push({ x });
      continue;
    }
    const y = toY(value);
    current += `${current ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `;
    lastX = x;
    lastY = y;
    lastValue = value;
  }
  if (current) segments.push(current);

  const validWeeks = WEEK_COUNT - startIndex - (startIndex <= recessIndex ? 1 : 0);
  const admittedWeekLabel = sdr.admittedFromWeek === undefined ? null : (sdr.series[startIndex]?.week ?? null);

  return {
    sdr,
    segments,
    gapMarkers,
    recessMarkers,
    lastX,
    lastY,
    current: lastValue,
    dataWeeks: values.length,
    validWeeks,
    admittedWeekLabel,
  };
}

export default function SdrGapTrendTable({ data = defaultData, recessWeekIndex = defaultRecessWeekIndex, className }: SdrGapTrendTableProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <span>Nenhum SDR neste recorte: não há série para desenhar.</span>
      </div>
    );
  }

  const rows = data.map((sdr) => buildRow(sdr, recessWeekIndex));
  const admitted = rows.find((row) => row.admittedWeekLabel !== null);

  const summary = [
    `Tabela com sparkline: agendas semanais de ${String(data.length)} SDRs em 12 semanas, cada linha na própria escala.`,
    'Recesso da equipe e semanas antes da admissão não contam como falha.',
    admitted?.admittedWeekLabel ? `${admitted.sdr.name} só entra a partir de ${formatDate(admitted.admittedWeekLabel)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('flex h-full w-full min-w-0 flex-col', className)}>
      <p className="mb-2 text-xs leading-4 text-text-muted">
        Escala própria por linha, só para ler a forma. Traço tracejado é a semana de recesso, comum a todas; círculo vazado é lacuna
        individual; ausência de traço no início é semana anterior à admissão do SDR.
      </p>
      <table aria-label={summary} className="w-full min-w-0 flex-1 border-collapse text-xs" role="table">
        <thead>
          <tr className="border-b border-line-subtle text-left text-text-muted">
            <th className="pb-1.5 font-medium" scope="col" style={{ width: NAME_COL_WIDTH }}>
              SDR
            </th>
            <th className="pb-1.5 font-medium tabular-nums" scope="col" style={{ width: SPARK_WIDTH }}>
              12 semanas, com recesso e lacunas
            </th>
            <th className="pb-1.5 text-right font-medium" scope="col">
              semanas com dado
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-line-subtle last:border-0" key={row.sdr.id}>
              <td className="py-1.5 pr-2 text-text-secondary">{row.sdr.name}</td>
              <td className="py-1.5">
                <svg aria-hidden height={SPARK_HEIGHT} viewBox={`0 0 ${String(SPARK_WIDTH)} ${String(SPARK_HEIGHT)}`} width={SPARK_WIDTH}>
                  {row.recessMarkers.map((marker) => (
                    <line
                      key={`recesso-${String(marker.x)}`}
                      stroke="var(--text-muted)"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                      x1={marker.x}
                      x2={marker.x}
                      y1={0}
                      y2={SPARK_HEIGHT}
                    />
                  ))}
                  {row.segments.map((segment) => (
                    <path
                      d={segment}
                      fill="none"
                      key={segment}
                      stroke="var(--chart-1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  {row.gapMarkers.map((marker) => (
                    <circle
                      cx={marker.x}
                      cy={SPARK_HEIGHT / 2}
                      fill="none"
                      key={`lacuna-${String(marker.x)}`}
                      r={2.6}
                      stroke="var(--text-muted)"
                      strokeWidth={1}
                    />
                  ))}
                  {row.lastX !== null && row.lastY !== null ? <circle cx={row.lastX} cy={row.lastY} fill="var(--chart-1)" r={2.4} /> : null}
                </svg>
              </td>
              <td className="kpi-number py-1.5 text-right text-text-secondary">
                {formatInt(row.dataWeeks)} de {formatInt(row.validWeeks)}
                {row.admittedWeekLabel ? ` desde ${formatDate(row.admittedWeekLabel)}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
