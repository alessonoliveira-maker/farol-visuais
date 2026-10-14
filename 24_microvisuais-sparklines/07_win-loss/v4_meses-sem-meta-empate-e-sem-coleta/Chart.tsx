import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthReading } from './data';

/**
 * Win/loss mensal de um executivo com três estados fora do ganhar e perder: mês sem meta atribuída
 * (espaço vazio, nunca derrota), empate (traço central) e mês sem coleta (contorno vazado). A conta
 * só vale sobre meses com meta e com coleta, então o resumo nunca divide por todos os meses do
 * calendário. A ausência já chega separada em dois campos: o componente só lê, não infere.
 */
export interface TargetGapsProps {
  readonly data?: readonly MonthReading[];
  readonly height?: number;
  readonly className?: string;
}

type Kind = 'win' | 'loss' | 'tie' | 'no-data' | 'no-target';

const VIEW_W = 560;
const VIEW_H = 40;
const MID = VIEW_H / 2;
const BLOCK = 18;
const GAP = 2;
const CENTER_GAP = 2;
const TIE_THICKNESS = 2;
const OUTLINE_WIDTH = 1;

function kindOf(reading: MonthReading): Kind {
  if (!reading.hasTarget) return 'no-target';
  return reading.outcome ?? 'no-data';
}

function cellWidth(count: number): number {
  return (VIEW_W - GAP * (count - 1)) / count;
}

const pct = (fraction: number): string => `${String(fraction * 100)}%`;

export default function TargetGaps({ data = defaultData, height, className }: TargetGapsProps) {
  const kinds = data.map(kindOf);
  const wins = kinds.filter((kind) => kind === 'win').length;
  const losses = kinds.filter((kind) => kind === 'loss').length;
  const ties = kinds.filter((kind) => kind === 'tie').length;
  const noData = kinds.filter((kind) => kind === 'no-data').length;
  const measured = wins + losses + ties;
  const lastNoTarget = kinds.lastIndexOf('no-target');

  if (data.length === 0 || measured === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2 text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4" />
        <p className="text-xs">{`Nenhum mês com meta e coleta neste recorte: ${formatUnavailable()}.`}</p>
      </div>
    );
  }

  const width = cellWidth(data.length);
  const first = data[0];
  const last = data.at(-1);
  const firstLabel = first ? formatMonthShort(first.month) : '';
  const lastLabel = last ? formatMonthShort(last.month) : '';
  const noTargetUntil = lastNoTarget === -1 ? null : formatMonthShort(data[lastNoTarget]?.month ?? '');
  const noTargetWidth = lastNoTarget === -1 ? 0 : ((lastNoTarget + 1) * width + lastNoTarget * GAP) / VIEW_W;

  const summary =
    `Win/loss da meta mensal de um executivo em ${formatInt(data.length)} meses, de ${firstLabel} a ${lastLabel}` +
    (noTargetUntil === null ? ': ' : `, sem meta atribuída até ${noTargetUntil}: `) +
    `${formatInt(wins)} de ${formatInt(measured)} meses com meta e coleta bateram a meta, ` +
    `${formatInt(ties)} empatou e ${formatInt(losses)} ficou fora; ${formatInt(noData)} mês sem coleta.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-center gap-3', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden>
        <p className="tabular-nums">
          <span className="font-display text-sm font-semibold text-text-primary">{`${formatInt(wins)} de ${formatInt(measured)}`}</span>
          <span className="ml-2 text-xs text-text-secondary">meses com meta e coleta bateram a meta</span>
        </p>
        <p className="mt-1 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          {`${noTargetUntil === null ? '' : `sem meta atribuída até ${noTargetUntil}, fora da conta; `}${formatInt(noData)} mês sem coleta, também fora`}
        </p>
      </div>

      <div aria-hidden>
        <div className="h-4 text-[0.6875rem] leading-4 whitespace-nowrap text-text-muted" style={{ width: pct(noTargetWidth) }}>
          {noTargetUntil === null ? null : 'sem meta atribuída'}
        </div>
        {noTargetUntil === null ? null : <div className="h-1.5 border-x border-t border-solid border-text-muted" style={{ width: pct(noTargetWidth) }} />}
        {/* preserveAspectRatio none: só a largura estica, e o viewBox fixo mantém altura e vão em px. */}
        <svg className="mt-1 block h-10 w-full" preserveAspectRatio="none" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {data.map((reading, index) => {
            const x = index * (width + GAP);
            const kind = kinds[index];
            if (kind === 'tie') {
              return <rect fill="var(--text-muted)" height={TIE_THICKNESS} key={reading.month} width={width} x={x} y={MID - TIE_THICKNESS / 2} />;
            }
            if (kind === 'no-data') {
              const inset = OUTLINE_WIDTH / 2;
              return (
                <rect
                  fill="none"
                  height={BLOCK - OUTLINE_WIDTH}
                  key={reading.month}
                  stroke="var(--text-muted)"
                  strokeWidth={OUTLINE_WIDTH}
                  vectorEffect="non-scaling-stroke"
                  width={width - OUTLINE_WIDTH}
                  x={x + inset}
                  y={MID - BLOCK / 2 + inset}
                />
              );
            }
            if (kind !== 'win' && kind !== 'loss') return null;
            const isWin = kind === 'win';
            return (
              <rect
                fill={isWin ? 'var(--positive)' : 'var(--negative)'}
                height={BLOCK}
                key={reading.month}
                width={width}
                x={x}
                y={isWin ? MID - CENTER_GAP - BLOCK : MID + CENTER_GAP}
              />
            );
          })}
        </svg>
        <div className="mt-1 flex justify-between text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          <span>{firstLabel}</span>
          <span>{lastLabel}</span>
        </div>
      </div>

      <div aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 bg-positive" />
          meta batida
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 bg-negative" />
          meta não batida
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 shrink-0 bg-text-muted" />
          empate, traço central
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 border border-solid border-text-muted" />
          sem coleta, contorno
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0" />
          sem meta atribuída, espaço vazio
        </span>
      </div>
    </figure>
  );
}
