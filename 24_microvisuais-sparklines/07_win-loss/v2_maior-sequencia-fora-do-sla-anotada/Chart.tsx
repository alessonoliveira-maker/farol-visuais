import { Filter } from 'lucide-react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_WEEK, type Outcome } from './data';

/**
 * Win/loss do SLA semanal com a maior sequência fora do SLA anotada: colchete de 1 px sob os blocos
 * e rótulo com a contagem. O empate (exatamente no limite) é um traço central e quebra a sequência,
 * porque a semana não fechou fora. A anotação fica em HTML, posicionada em fração do viewBox.
 */
export interface LongestLossRunProps {
  readonly data?: readonly Outcome[];
  readonly height?: number;
  readonly className?: string;
}

const MS_WEEK = 7 * 86_400_000;
const VIEW_W = 560;
const VIEW_H = 36;
const MID = VIEW_H / 2;
const BLOCK = 16;
const GAP = 2;
const CENTER_GAP = 2;
const TIE_THICKNESS = 2;
/** Menos que isto não é sequência: um bloco solto não leva anotação. */
const MIN_RUN = 2;
/** Do meio da fileira em diante o rótulo se alinha ao fim da sequência, para não sair do corpo. */
const LABEL_FLIP_AT = 0.6;

interface Run {
  readonly start: number;
  readonly length: number;
}

function cellWidth(count: number): number {
  return (VIEW_W - GAP * (count - 1)) / count;
}

/** Data em UTC: a semana nunca muda de lugar por causa de fuso. */
function isoAt(week: number): string {
  const [year, month, day] = FIRST_WEEK.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1) + week * MS_WEEK).toISOString().slice(0, 10);
}

/** Maior trecho seguido de derrotas; empate, vitória ou ausência o interrompem, e em empate vale o primeiro. */
function longestLossRun(outcomes: readonly Outcome[]): Run | null {
  let best: Run | null = null;
  let start = 0;
  for (let index = 0; index < outcomes.length; index += 1) {
    if (outcomes[index] !== 'loss') {
      start = index + 1;
      continue;
    }
    const length = index - start + 1;
    if (best === null || length > best.length) best = { start, length };
  }
  return best !== null && best.length >= MIN_RUN ? best : null;
}

/** Posição do trecho em fração do viewBox, a mesma conta do desenho dos blocos. */
function spanOf(run: Run, count: number): { readonly left: number; readonly width: number } {
  const width = cellWidth(count);
  return {
    left: (run.start * (width + GAP)) / VIEW_W,
    width: (run.length * width + (run.length - 1) * GAP) / VIEW_W,
  };
}

const pct = (fraction: number): string => `${String(fraction * 100)}%`;

export default function LongestLossRun({ data = defaultData, height, className }: LongestLossRunProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2 text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4" />
        <p className="text-xs">O recorte não tem semanas medidas, então não há sequência para anotar.</p>
      </div>
    );
  }

  const wins = data.filter((outcome) => outcome === 'win').length;
  const losses = data.filter((outcome) => outcome === 'loss').length;
  const ties = data.filter((outcome) => outcome === 'tie').length;
  const run = longestLossRun(data);
  const span = run === null ? null : spanOf(run, data.length);
  const flip = span !== null && span.left + span.width / 2 > LABEL_FLIP_AT;
  const firstLabel = formatDate(isoAt(0));
  const lastLabel = formatDate(isoAt(data.length - 1));
  const runStart = run === null ? '' : formatDate(isoAt(run.start));
  const runEnd = run === null ? '' : formatDate(isoAt(run.start + run.length - 1));
  const tieBefore = run !== null && data[run.start - 1] === 'tie' ? run.start - 1 : null;
  const tieAfter = run !== null && data[run.start + run.length] === 'tie' ? run.start + run.length : null;
  const tieWeek = tieAfter ?? tieBefore;
  const tieNote =
    tieWeek === null
      ? ''
      : tieWeek === tieAfter
        ? `; o empate no limite da semana de ${formatDate(isoAt(tieWeek))} a encerra`
        : `; o empate no limite da semana de ${formatDate(isoAt(tieWeek))} a precede`;
  const runLabel = run === null ? '' : `${formatInt(run.length)} semanas seguidas fora`;
  const width = cellWidth(data.length);

  const summary =
    `Win/loss do SLA semanal em ${formatInt(data.length)} semanas, de ${firstLabel} a ${lastLabel}: ` +
    `${formatInt(wins)} dentro, ${formatInt(losses)} fora e ${formatInt(ties)} no limite. ` +
    (run === null
      ? 'Nenhuma sequência de derrotas.'
      : `A maior sequência fora do SLA tem ${formatInt(run.length)} semanas, de ${runStart} a ${runEnd}${tieNote}.`);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-center gap-3', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden>
        <p className="tabular-nums">
          <span className="font-display text-sm font-semibold text-text-primary">
            {run === null ? 'sem sequência fora do SLA' : runLabel}
          </span>
        </p>
        <p className="mt-1 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          {run === null
            ? `${formatInt(losses)} semanas fora do SLA, nenhuma colada na outra`
            : `a maior, de ${runStart} a ${runEnd}${tieNote}`}
        </p>
      </div>

      <div aria-hidden>
        {/* preserveAspectRatio none: só a largura estica, e o viewBox fixo mantém altura e vão em px. */}
        <svg className="block h-9 w-full" preserveAspectRatio="none" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          <line stroke="var(--line-subtle)" strokeWidth={1} vectorEffect="non-scaling-stroke" x1={0} x2={VIEW_W} y1={MID} y2={MID} />
          {data.map((outcome, index) => {
            const x = index * (width + GAP);
            if (outcome === 'tie') {
              return <rect fill="var(--text-muted)" height={TIE_THICKNESS} key={isoAt(index)} width={width} x={x} y={MID - TIE_THICKNESS / 2} />;
            }
            if (outcome === null) return null;
            const isWin = outcome === 'win';
            return (
              <rect
                fill={isWin ? 'var(--positive)' : 'var(--negative)'}
                height={BLOCK}
                key={isoAt(index)}
                width={width}
                x={x}
                y={isWin ? MID - CENTER_GAP - BLOCK : MID + CENTER_GAP}
              />
            );
          })}
        </svg>
        {span === null ? null : (
          <>
            <div className="mt-1 h-1.5 border-x border-b border-solid border-text-muted" style={{ marginLeft: pct(span.left), width: pct(span.width) }} />
            <div className={cn('flex h-4 text-[0.6875rem] leading-4 whitespace-nowrap text-text-muted', flip && 'justify-end')} style={{ marginLeft: pct(span.left), width: pct(span.width) }}>
              {runLabel}
            </div>
          </>
        )}
        <div className="mt-1 flex justify-between text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          <span>{`semana de ${firstLabel}`}</span>
          <span>{`semana de ${lastLabel}`}</span>
        </div>
      </div>

      <div aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 bg-positive" />
          dentro do SLA
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 bg-negative" />
          fora do SLA
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 shrink-0 bg-text-muted" />
          no limite, traço central
        </span>
      </div>
    </figure>
  );
}
