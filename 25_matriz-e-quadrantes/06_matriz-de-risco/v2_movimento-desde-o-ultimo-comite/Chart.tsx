import { ArrowDown, ArrowUp, Filter } from 'lucide-react';
import { useState } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, IMPACT_BANDS, LEVEL_TABLE, PROBABILITY_BANDS, type Band, type Level, type Risk } from './data';

/**
 * Movimento da matriz de risco desde o último comitê. A grade é a mesma 5x5 da versão base, com o
 * nível lido de tabela acordada. O risco que mudou de NÍVEL (não só de célula) deixa uma marca de
 * subida ou descida, com o número de níveis, na célula de destino; enquanto está em foco, a célula de
 * origem ganha contorno tracejado e a de destino contorno cheio. A marca carrega o número e o traço
 * carrega a densidade: a cor sozinha nunca diz que algo se moveu.
 */
export interface RiskMatrixProps {
  readonly data?: readonly Risk[];
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const LEFT_W = 80;
const CELL_W = 66;
const CELL_H = 44;
const GAP = 2;

/** Rampa sequencial em luminância, que sobrevive a daltonismo: 1, 3 e 6, os degraus com texto legível. */
const LEVEL_FILL: Record<Level, string> = {
  baixo: CHART_SEQUENTIAL_COLORS[0],
  medio: CHART_SEQUENTIAL_COLORS[2],
  alto: CHART_SEQUENTIAL_COLORS[5],
};
/** Texto sobre cada tom, pelos pares medidos: o degrau 6 só lê com o texto de contraste do acento. */
const LEVEL_TEXT: Record<Level, string> = {
  baixo: 'var(--text-primary)',
  medio: 'var(--text-primary)',
  alto: 'var(--accent-cyan-contrast)',
};
const LEVEL_LABEL: Record<Level, string> = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' };

function bandIndex(value: number, bands: readonly Band[]): number {
  const found = bands.findIndex((band) => band.to === null || value < band.to);
  return found === -1 ? bands.length - 1 : found;
}

/** Critério numérico da faixa, escrito no cabeçalho: "< 20%", "20% a 40%", "> 80%". */
function criterion(band: Band, isFirst: boolean, isPercent: boolean): string {
  const fmt = (value: number) => (isPercent ? formatPercent(value, 0) : formatInt(value));
  if (isFirst) return `< ${fmt(band.to ?? band.from)}`;
  if (band.to === null) return `> ${fmt(band.from)}`;
  return `${fmt(band.from)} a ${fmt(band.to)}`;
}

function levelAt(probIndex: number, impactIndex: number): Level {
  return LEVEL_TABLE[probIndex]?.[impactIndex] ?? 'baixo';
}

interface Move {
  readonly risk: Risk;
  readonly from: { readonly p: number; readonly i: number };
  readonly to: { readonly p: number; readonly i: number };
  readonly delta: number;
}

const LEVEL_RANK: Record<Level, number> = { baixo: 0, medio: 1, alto: 2 };

function lowerFirst(text: string): string {
  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

export default function RiskMatrix({ data = defaultData, highlightId, height, className }: RiskMatrixProps) {
  const [focusId, setFocusId] = useState<string | undefined>(highlightId);

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum risco neste recorte: a matriz não tem o que posicionar.</span>
      </div>
    );
  }

  const counts = PROBABILITY_BANDS.map(() => IMPACT_BANDS.map(() => 0));
  let outside = 0;
  for (const risk of data) {
    if (risk.impact === null) {
      outside += 1;
      continue;
    }
    const row = counts[bandIndex(risk.probability, PROBABILITY_BANDS)];
    const column = bandIndex(risk.impact, IMPACT_BANDS);
    if (row) row[column] = (row[column] ?? 0) + 1;
  }
  const byLevel: Record<Level, number> = { baixo: 0, medio: 0, alto: 0 };
  let busiest = { p: 0, i: 0, n: 0 };
  counts.forEach((row, p) =>
    row.forEach((n, i) => {
      byLevel[levelAt(p, i)] += n;
      if (n > busiest.n) busiest = { p, i, n };
    }),
  );
  const assessed = data.length - outside;
  const moves: Move[] = [];
  for (const risk of data) {
    const before = risk.previous;
    if (before === undefined || before.impact === null || risk.impact === null) continue;
    const from = { p: bandIndex(before.probability, PROBABILITY_BANDS), i: bandIndex(before.impact, IMPACT_BANDS) };
    const to = { p: bandIndex(risk.probability, PROBABILITY_BANDS), i: bandIndex(risk.impact, IMPACT_BANDS) };
    const delta = LEVEL_RANK[levelAt(to.p, to.i)] - LEVEL_RANK[levelAt(from.p, from.i)];
    if (delta !== 0) moves.push({ risk, from, to, delta });
  }
  const focus = moves.find((move) => move.risk.id === focusId) ?? moves[0];
  const up = moves.filter((move) => move.delta > 0).length;
  const down = moves.length - up;
  const upText = up === 0 ? 'nenhum risco subiu de nível' : `${formatInt(up)} ${up === 1 ? 'risco subiu' : 'riscos subiram'} de nível`;
  const downText = down === 0 ? 'nenhum desceu' : `${formatInt(down)} ${down === 1 ? 'desceu' : 'desceram'}`;
  const focusText = focus
    ? `${lowerFirst(focus.risk.name)}, de ${LEVEL_LABEL[levelAt(focus.from.p, focus.from.i)].toLowerCase()} para ${LEVEL_LABEL[levelAt(focus.to.p, focus.to.i)].toLowerCase()}`
    : '';

  const summary =
    `Matriz de risco 5 por 5 com ${formatInt(assessed)} riscos avaliados, ${formatInt(byLevel.alto)} no nível alto. ` +
    `Desde o último comitê, ${upText} e ${downText}. ` +
    (focus ? `Em foco: ${focusText}.` : '');

  const columns = `${String(LEFT_W)}px repeat(${String(IMPACT_BANDS.length)}, ${String(CELL_W)}px)`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="m-0 text-xs font-medium text-text-secondary">
        {`${upText.charAt(0).toUpperCase()}${upText.slice(1)}; ${downText}`}
      </p>

      <div aria-hidden className="flex min-h-0 flex-1 items-start">
        <div className="grid shrink-0" style={{ gridTemplateColumns: columns, gap: GAP }}>
          <div />
          <div className="text-[0.6875rem] leading-4 text-text-muted" style={{ gridColumn: '2 / -1' }}>
            Impacto em receita, R$ mil
          </div>
          <div className="flex items-end pb-0.5 text-[0.6875rem] leading-4 text-text-muted">Probabilidade</div>
          {IMPACT_BANDS.map((band, i) => (
            <div className="min-w-0 pb-0.5 text-center" key={band.key}>
              <div className="text-xs leading-4 text-text-secondary">{band.label}</div>
              <div className="font-display text-[0.6875rem] leading-4 tabular-nums text-text-muted">
                {criterion(band, i === 0, false)}
              </div>
            </div>
          ))}
          {/* Laço de trás para frente: a faixa mais provável tem de ficar no topo, e o array nasce do mais raro. */}
          {PROBABILITY_BANDS.map((_, step) => {
            const p = PROBABILITY_BANDS.length - 1 - step;
            const band = PROBABILITY_BANDS[p];
            if (!band) return null;
            return [
              <div className="flex min-w-0 flex-col justify-center pr-2 text-right" key={`h-${band.key}`} style={{ height: CELL_H }}>
                <div className="text-xs leading-4 text-text-secondary">{band.label}</div>
                <div className="font-display text-[0.6875rem] leading-4 tabular-nums text-text-muted">
                  {criterion(band, p === 0, true)}
                </div>
              </div>,
              ...IMPACT_BANDS.map((impact, i) => {
                const n = counts[p]?.[i] ?? 0;
                const level = levelAt(p, i);
                const arriving = moves.filter((move) => move.to.p === p && move.to.i === i);
                const mark = arriving[0];
                const isOrigin = focus !== undefined && focus.from.p === p && focus.from.i === i;
                const isDestination = focus !== undefined && focus.to.p === p && focus.to.i === i;
                const frame = isOrigin
                  ? 'border-2 border-dashed border-text-primary'
                  : isDestination
                    ? 'border-2 border-solid border-text-primary'
                    : n === 0
                      ? 'border border-line-subtle'
                      : '';
                const cls = cn(
                  'flex flex-col items-center justify-center rounded-[2px]',
                  n === 0 && 'text-text-muted',
                  frame,
                );
                const style = { height: CELL_H, backgroundColor: n === 0 ? undefined : LEVEL_FILL[level], color: n === 0 ? undefined : LEVEL_TEXT[level] };
                const body = (
                  <>
                    <span className="text-[0.6875rem] leading-4">{LEVEL_LABEL[level]}</span>
                    <span className="flex items-center gap-1">
                      <span className="font-display text-sm font-medium leading-4 tabular-nums">{formatInt(n)}</span>
                      {mark ? (
                        <span className="flex items-center rounded-[2px] bg-surface-raised px-0.5 font-display text-[0.6875rem] leading-4 tabular-nums text-text-primary">
                          {mark.delta > 0 ? <ArrowUp aria-hidden className="size-3" /> : <ArrowDown aria-hidden className="size-3" />}
                          {`${mark.delta > 0 ? '+' : '−'}${formatInt(Math.abs(mark.delta))}`}
                        </span>
                      ) : null}
                    </span>
                  </>
                );
                if (!mark) return <div className={cls} key={`${band.key}-${impact.key}`} style={style}>{body}</div>;
                return (
                  <button
                    aria-pressed={focus?.risk.id === mark.risk.id}
                    className={cls}
                    key={`${band.key}-${impact.key}`}
                    onClick={() => setFocusId(mark.risk.id)}
                    style={style}
                    type="button"
                  >
                    {body}
                  </button>
                );
              }),
            ];
          })}
        </div>
      </div>

      <p aria-hidden className="m-0 text-[0.6875rem] leading-4 text-text-muted">
        {focus
          ? `Em foco: ${focusText}. Contorno tracejado é a origem; cheio, o destino.`
          : 'Nenhum risco mudou de nível desde o último comitê.'}
      </p>
    </figure>
  );
}
