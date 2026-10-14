import { Filter } from 'lucide-react';
import { useId } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  COARSE_IMPACT_BANDS,
  COARSE_LEVEL_TABLE,
  COARSE_PROBABILITY_BANDS,
  data as defaultData,
  GROUP_OF_BAND,
  IMPACT_BANDS,
  LEVEL_TABLE,
  PROBABILITY_BANDS,
  type Band,
  type Level,
  type Risk,
} from './data';

/**
 * Compressão de faixa: os mesmos riscos em duas matrizes lado a lado, 5x5 e 3x3. A 3x3 junta faixas
 * pela tabela GROUP_OF_BAND e lê o nível da própria tabela de consulta, então riscos que o 5x5
 * separa passam a dividir a mesma célula. Risco sem impacto avaliado fica numa faixa à parte, fora
 * da grade e com hachura diagonal, que não se confunde com a célula de zero: zero é dígito sobre a
 * superfície base, ausência é hachura.
 */
export interface RiskCompressionProps {
  readonly data?: readonly Risk[];
  readonly height?: number;
  readonly className?: string;
}

const LEFT_W = 80;
const FINE_W = 66;
const FINE_H = 32;
const COARSE_W = 111;
const COARSE_H = 55;
const GAP = 2;
const STRIP_H = 24;
const HATCH_STEP = 6;

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

function criterion(band: Band, isFirst: boolean, isPercent: boolean): string {
  const fmt = (value: number) => (isPercent ? formatPercent(value, 0) : formatInt(value));
  if (isFirst) return `< ${fmt(band.to ?? band.from)}`;
  if (band.to === null) return `> ${fmt(band.from)}`;
  return `${fmt(band.from)} a ${fmt(band.to)}`;
}

interface PanelProps {
  readonly title: string;
  readonly probBands: readonly Band[];
  readonly impactBands: readonly Band[];
  readonly table: readonly (readonly Level[])[];
  readonly counts: readonly (readonly number[])[];
  readonly outside: number;
  readonly cellW: number;
  readonly cellH: number;
  readonly patternId: string;
}

function Panel({ title, probBands, impactBands, table, counts, outside, cellW, cellH, patternId }: PanelProps) {
  const columns = `${String(LEFT_W)}px repeat(${String(impactBands.length)}, ${String(cellW)}px)`;
  return (
    <div aria-hidden className="flex shrink-0 flex-col gap-1">
      <div className="text-xs font-medium leading-4 text-text-secondary">{title}</div>
      <div className="grid" style={{ gridTemplateColumns: columns, gap: GAP }}>
        <div className="flex items-end pb-0.5 text-[0.6875rem] leading-4 text-text-muted">Probabilidade</div>
        {impactBands.map((band, i) => (
          <div className="min-w-0 pb-0.5 text-center" key={band.key}>
            <div className="text-xs leading-4 text-text-secondary">{band.label}</div>
            <div className="font-display text-[0.6875rem] leading-4 tabular-nums text-text-muted">{criterion(band, i === 0, false)}</div>
          </div>
        ))}
        {/* Laço de trás para frente: a faixa mais provável tem de ficar no topo, e o array nasce do mais raro. */}
        {probBands.map((_, step) => {
          const p = probBands.length - 1 - step;
          const band = probBands[p];
          if (!band) return null;
          return [
            <div className="flex min-w-0 flex-col justify-center pr-2 text-right" key={`h-${band.key}`} style={{ height: cellH }}>
              <div className="text-xs leading-4 text-text-secondary">{band.label}</div>
              <div className="font-display text-[0.6875rem] leading-4 tabular-nums text-text-muted">{criterion(band, p === 0, true)}</div>
            </div>,
            ...impactBands.map((impact, i) => {
              const n = counts[p]?.[i] ?? 0;
              const level = table[p]?.[i] ?? 'baixo';
              return (
                <div
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-[2px]',
                    n === 0 && 'border border-line-subtle text-text-muted',
                  )}
                  key={`${band.key}-${impact.key}`}
                  style={{ height: cellH, backgroundColor: n === 0 ? undefined : LEVEL_FILL[level], color: n === 0 ? undefined : LEVEL_TEXT[level] }}
                >
                  <span className="text-[0.6875rem] leading-4">{LEVEL_LABEL[level]}</span>
                  <span className="font-display text-sm font-medium leading-4 tabular-nums">{formatInt(n)}</span>
                </div>
              );
            }),
          ];
        })}
        <div className="flex items-center justify-end pr-2 text-right text-[0.6875rem] leading-4 text-text-muted" style={{ height: STRIP_H }}>
          Sem avaliação
        </div>
        <div className="relative flex items-center justify-center rounded-[2px] border border-text-muted" style={{ gridColumn: '2 / -1', height: STRIP_H }}>
          <svg aria-hidden className="absolute inset-0 size-full">
            <defs>
              <pattern height={HATCH_STEP} id={patternId} patternUnits="userSpaceOnUse" width={HATCH_STEP}>
                <path d={`M-1 ${String(HATCH_STEP + 1)} L${String(HATCH_STEP + 1)} -1`} stroke="var(--text-muted)" strokeWidth={1} />
              </pattern>
            </defs>
            <rect fill={`url(#${patternId})`} height="100%" width="100%" />
          </svg>
          <span className="relative rounded-[2px] bg-surface-raised px-1.5 font-display text-[0.6875rem] leading-4 tabular-nums text-text-primary">
            {`${formatInt(outside)} ${outside === 1 ? 'risco' : 'riscos'} sem impacto avaliado`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RiskCompression({ data = defaultData, height, className }: RiskCompressionProps) {
  const uid = useId();

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum risco neste recorte: as duas matrizes não têm o que comparar.</span>
      </div>
    );
  }

  const fine = PROBABILITY_BANDS.map(() => IMPACT_BANDS.map(() => 0));
  const coarse = COARSE_PROBABILITY_BANDS.map(() => COARSE_IMPACT_BANDS.map(() => 0));
  const topCells = new Set<string>();
  const topP = COARSE_PROBABILITY_BANDS.length - 1;
  const topI = COARSE_IMPACT_BANDS.length - 1;
  let outside = 0;
  for (const risk of data) {
    if (risk.impact === null) {
      outside += 1;
      continue;
    }
    const p = bandIndex(risk.probability, PROBABILITY_BANDS);
    const i = bandIndex(risk.impact, IMPACT_BANDS);
    const fineRow = fine[p];
    if (fineRow) fineRow[i] = (fineRow[i] ?? 0) + 1;
    const gp = GROUP_OF_BAND[p] ?? 0;
    const gi = GROUP_OF_BAND[i] ?? 0;
    const coarseRow = coarse[gp];
    if (coarseRow) coarseRow[gi] = (coarseRow[gi] ?? 0) + 1;
    if (gp === topP && gi === topI) topCells.add(`${String(p)}-${String(i)}`);
  }
  const assessed = data.length - outside;
  const topCount = coarse[topP]?.[topI] ?? 0;

  const summary =
    `Duas matrizes de risco sobre os mesmos ${formatInt(assessed)} riscos avaliados, uma de 5 por 5 e outra de 3 por 3. ` +
    `Na 3 por 3, ${formatInt(topCount)} riscos dividem a célula alta e alta; na 5 por 5 ocupam ${formatInt(topCells.size)} células. ` +
    `${formatInt(outside)} sem impacto avaliado ficam fora das grades.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex min-h-0 flex-1 items-start gap-6">
        <Panel
          cellH={FINE_H}
          cellW={FINE_W}
          counts={fine}
          impactBands={IMPACT_BANDS}
          outside={outside}
          patternId={`${uid}-fino`}
          probBands={PROBABILITY_BANDS}
          table={LEVEL_TABLE}
          title="Grade 5 por 5, impacto em receita, R$ mil"
        />
        <Panel
          cellH={COARSE_H}
          cellW={COARSE_W}
          counts={coarse}
          impactBands={COARSE_IMPACT_BANDS}
          outside={outside}
          patternId={`${uid}-grosso`}
          probBands={COARSE_PROBABILITY_BANDS}
          table={COARSE_LEVEL_TABLE}
          title="Grade 3 por 3, impacto em receita, R$ mil"
        />
      </div>
      <p aria-hidden className="m-0 text-xs font-medium leading-4 text-text-secondary">
        {`No 3x3, ${formatInt(topCount)} riscos dividem a célula alta e alta; no 5x5, os mesmos ocupam ${formatInt(topCells.size)} células.`}
      </p>
    </figure>
  );
}
