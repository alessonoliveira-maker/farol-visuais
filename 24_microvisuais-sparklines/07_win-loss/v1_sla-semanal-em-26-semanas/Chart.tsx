import { Filter } from 'lucide-react';

import { formatDate, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_WEEK, type Outcome } from './data';

/**
 * Win/loss do SLA semanal: um bloco de altura fixa por semana, acima da linha central quando fechou
 * dentro do SLA e abaixo quando fechou fora. A altura não carrega valor: o desenho só mostra a
 * sequência. A geometria é função pura; só as marcas ficam no SVG, e o texto fica em HTML para não
 * encolher junto com a largura.
 */
export interface SlaWinLossProps {
  readonly data?: readonly Outcome[];
  readonly height?: number;
  readonly className?: string;
}

const MS_WEEK = 7 * 86_400_000;
const VIEW_W = 300;
const VIEW_H = 28;
const MID = VIEW_H / 2;
const BLOCK = 12;
const GAP = 2;
const CENTER_GAP = 2;
const MIN_RUN_TO_SAY = 2;

interface Block {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Bloco da semana: `win` sobe da linha central e `loss` desce; sem resultado não há bloco. */
function blockAt(outcome: Outcome, index: number, count: number): Block | null {
  if (outcome !== 'win' && outcome !== 'loss') return null;
  const width = (VIEW_W - GAP * (count - 1)) / count;
  const y = outcome === 'win' ? MID - CENTER_GAP - BLOCK : MID + CENTER_GAP;
  return { x: index * (width + GAP), y, width, height: BLOCK };
}

/** Data em UTC: a semana nunca muda de lugar por causa de fuso. */
function isoAt(week: number): string {
  const [year, month, day] = FIRST_WEEK.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1) + week * MS_WEEK).toISOString().slice(0, 10);
}

/** Quantas semanas seguidas, até a última, deram o mesmo resultado. */
function trailingRun(outcomes: readonly Outcome[], kind: 'win' | 'loss'): number {
  let length = 0;
  for (let index = outcomes.length - 1; index >= 0 && outcomes[index] === kind; index -= 1) length += 1;
  return length;
}

export default function SlaWinLoss({ data = defaultData, height, className }: SlaWinLossProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2 text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4" />
        <p className="text-xs">O recorte não tem semanas medidas, então não há sequência para desenhar.</p>
      </div>
    );
  }

  const wins = data.filter((outcome) => outcome === 'win').length;
  const losses = data.filter((outcome) => outcome === 'loss').length;
  const measured = wins + losses;
  const winRun = trailingRun(data, 'win');
  const lossRun = trailingRun(data, 'loss');
  const firstLabel = formatDate(isoAt(0));
  const lastLabel = formatDate(isoAt(data.length - 1));
  const ties = data.filter((outcome) => outcome === 'tie').length;
  const unmeasured = data.length - measured - ties;
  const last = data.at(-1);
  const lastLine =
    last === 'win'
      ? 'a última semana fechou dentro do SLA'
      : last === 'loss'
        ? 'a última semana fechou fora do SLA'
        : last === 'tie'
          ? 'a última semana fechou exatamente no limite do SLA'
          : 'a última semana não tem resultado medido';
  const extras = [
    ties > 0 ? `${formatInt(ties)} no limite` : null,
    unmeasured > 0 ? `${formatInt(unmeasured)} sem resultado medido` : null,
  ].filter((part): part is string => part !== null);
  const extraText = extras.length === 0 ? '' : `, ${extras.join(' e ')}`;
  const runLine =
    winRun >= MIN_RUN_TO_SAY
      ? `as últimas ${formatInt(winRun)} semanas seguidas fecharam dentro do SLA`
      : lossRun >= MIN_RUN_TO_SAY
        ? `as últimas ${formatInt(lossRun)} semanas seguidas fecharam fora do SLA`
        : lastLine;

  const summary =
    `Win/loss do SLA semanal da pré-vendas em ${formatInt(data.length)} semanas, de ${firstLabel} a ${lastLabel}: ` +
    `${formatInt(wins)} dentro do SLA e ${formatInt(losses)} fora${extraText}; ${runLine}.`;

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
            {measured === 0 ? formatUnavailable() : `${formatInt(wins)} de ${formatInt(measured)}`}
          </span>
          <span className="ml-2 text-xs text-text-secondary">semanas dentro do SLA</span>
        </p>
        <p className="mt-1 text-[0.6875rem] leading-4 text-text-muted tabular-nums">{runLine}</p>
      </div>

      <div aria-hidden>
        {/* preserveAspectRatio none: só a largura estica, e o viewBox fixo mantém altura e vão em px. */}
        <svg className="block h-7 w-full" preserveAspectRatio="none" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          <line
            stroke="var(--line-subtle)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            x1={0}
            x2={VIEW_W}
            y1={MID}
            y2={MID}
          />
          {data.map((outcome, index) => {
            const block = blockAt(outcome, index, data.length);
            if (block === null) return null;
            return (
              <rect
                fill={outcome === 'win' ? 'var(--positive)' : 'var(--negative)'}
                height={block.height}
                key={isoAt(index)}
                width={block.width}
                x={block.x}
                y={block.y}
              />
            );
          })}
        </svg>
        <div className="mt-2 flex justify-between text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          <span>{`semana de ${firstLabel}`}</span>
          <span>{`semana de ${lastLabel}`}</span>
        </div>
      </div>

      <div aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 bg-positive" />
          dentro do SLA, acima da linha
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 bg-negative" />
          fora do SLA, abaixo da linha
        </span>
      </div>
    </figure>
  );
}
