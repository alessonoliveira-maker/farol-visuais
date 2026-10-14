import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, IMPACT_BANDS, LEVEL_TABLE, PROBABILITY_BANDS, type Band, type Level, type Risk } from './data';

/**
 * Matriz de risco 5x5 em células: probabilidade nas linhas, crescendo de baixo para cima, impacto
 * nas colunas. O nível de cada célula vem de uma tabela de consulta acordada (LEVEL_TABLE), nunca do
 * produto dos índices, porque multiplicar escalas ordinais inventa uma ordem que ninguém acordou.
 * A cor é resumo grosseiro e anda sempre com o nível escrito e a contagem. Risco sem impacto
 * avaliado fica fora da grade e é contado à parte, nunca como impacto zero.
 */
export interface RiskMatrixProps {
  readonly data?: readonly Risk[];
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

export default function RiskMatrix({ data = defaultData, height, className }: RiskMatrixProps) {
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
  const busiestLabel = `${(PROBABILITY_BANDS[busiest.p]?.label ?? '').toLowerCase()} e ${(IMPACT_BANDS[busiest.i]?.label ?? '').toLowerCase()}`;

  const summary =
    `Matriz de risco 5 por 5 com ${formatInt(assessed)} riscos avaliados: ${formatInt(byLevel.alto)} no nível alto, ` +
    `${formatInt(byLevel.medio)} no médio e ${formatInt(byLevel.baixo)} no baixo. ` +
    `A célula mais cheia é ${busiestLabel}, com ${formatInt(busiest.n)}. ` +
    (outside > 0 ? `${formatInt(outside)} sem impacto avaliado ficam fora.` : 'Todos têm impacto avaliado.');

  const columns = `${String(LEFT_W)}px repeat(${String(IMPACT_BANDS.length)}, ${String(CELL_W)}px)`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="m-0 text-xs font-medium text-text-secondary">
        {`${formatInt(byLevel.alto)} de ${formatInt(assessed)} riscos estão no nível alto; a célula mais cheia reúne ${formatInt(busiest.n)}.`}
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
                const tone = n === 0 ? 'border border-line-subtle text-text-muted' : '';
                return (
                  <div
                    className={cn('flex flex-col items-center justify-center rounded-[2px]', tone)}
                    key={`${band.key}-${impact.key}`}
                    style={{ height: CELL_H, backgroundColor: n === 0 ? undefined : LEVEL_FILL[level], color: n === 0 ? undefined : LEVEL_TEXT[level] }}
                  >
                    <span className="text-[0.6875rem] leading-4">{LEVEL_LABEL[level]}</span>
                    <span className="font-display text-sm font-medium leading-4 tabular-nums">{formatInt(n)}</span>
                  </div>
                );
              }),
            ];
          })}
        </div>
      </div>

      <p aria-hidden className="m-0 text-[0.6875rem] leading-4 text-text-muted">
        {outside > 0
          ? `${formatInt(outside)} riscos sem impacto avaliado ficam fora da grade. Nível lido da tabela acordada.`
          : 'Nível lido da tabela acordada, não do produto dos índices.'}
      </p>
    </figure>
  );
}
