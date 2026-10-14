import { Filter } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, IMPACT_BANDS, LEVEL_TABLE, PROBABILITY_BANDS, type Band, type Level, type Risk } from './data';

/**
 * Mapa de risco dos cenários com lista: a grade 5x5 é o controle de filtro da lista ao lado. Clicar
 * numa célula, ou andar com as setas e confirmar com Enter, abre os riscos dela com dono, gatilho e
 * plano de resposta; a contagem da célula se repete no título da lista. O nível vem da tabela de
 * consulta acordada, e a cor só resume, porque o nível e o número vêm escritos na célula.
 */
export interface RiskMapProps {
  readonly data?: readonly Risk[];
  readonly height?: number;
  readonly className?: string;
}

const LEFT_W = 80;
const CELL_W = 66;
const CELL_H = 34;
const GAP = 2;
/** Célula aberta quando o componente monta: faixa provável e impacto maior. */
const INITIAL_CELL = { p: 3, i: 3 } as const;

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

function levelAt(p: number, i: number): Level {
  return LEVEL_TABLE[p]?.[i] ?? 'baixo';
}

function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}

export default function RiskMap({ data = defaultData, height, className }: RiskMapProps) {
  const [selected, setSelected] = useState<{ p: number; i: number }>({ p: INITIAL_CELL.p, i: INITIAL_CELL.i });

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum risco neste cenário: o mapa não tem o que posicionar.</span>
      </div>
    );
  }

  const placed = data.map((risk) => ({
    risk,
    p: bandIndex(risk.probability, PROBABILITY_BANDS),
    i: bandIndex(risk.impact, IMPACT_BANDS),
  }));
  const countAt = (p: number, i: number) => placed.filter((entry) => entry.p === p && entry.i === i).length;
  const inCell = placed.filter((entry) => entry.p === selected.p && entry.i === selected.i);
  const highCount = placed.filter((entry) => levelAt(entry.p, entry.i) === 'alto').length;
  const selLevel = levelAt(selected.p, selected.i);
  const selProb = (PROBABILITY_BANDS[selected.p]?.label ?? '').toLowerCase();
  const selImpact = (IMPACT_BANDS[selected.i]?.label ?? '').toLowerCase();
  const listTitle = `${formatInt(inCell.length)} ${inCell.length === 1 ? 'risco' : 'riscos'} na faixa ${selProb} e impacto ${selImpact}, nível ${LEVEL_LABEL[selLevel].toLowerCase()}`;

  const summary =
    `Mapa de risco 5 por 5 com ${formatInt(data.length)} riscos dos cenários, ${formatInt(highCount)} no nível alto. ` +
    `A grade filtra a lista: na faixa ${selProb} e impacto ${selImpact} há ${formatInt(inCell.length)} ` +
    `${inCell.length === 1 ? 'risco' : 'riscos'}, com dono, gatilho e plano de resposta.`;

  const columns = `${String(LEFT_W)}px repeat(${String(IMPACT_BANDS.length)}, ${String(CELL_W)}px)`;
  const lastP = PROBABILITY_BANDS.length - 1;
  const lastI = IMPACT_BANDS.length - 1;

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // A faixa mais provável fica no topo, então a seta para cima SOBE o índice de probabilidade.
    const step: Record<string, readonly [number, number]> = {
      ArrowUp: [1, 0],
      ArrowDown: [-1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const move = step[event.key];
    if (move === undefined) return;
    event.preventDefault();
    const next = { p: clamp(selected.p + move[0], lastP), i: clamp(selected.i + move[1], lastI) };
    setSelected(next);
    event.currentTarget.parentElement?.parentElement?.querySelector<HTMLElement>(`[data-cell="${String(next.p)}-${String(next.i)}"]`)?.focus();
  };

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 items-start gap-6', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div
        aria-label="Matriz de risco por probabilidade e impacto; setas movem a seleção"
        className="grid shrink-0"
        role="grid"
        style={{ gridTemplateColumns: columns, gap: GAP }}
      >
        <div />
        <div className="text-[0.6875rem] leading-4 text-text-muted" style={{ gridColumn: '2 / -1' }}>
          Impacto em receita, R$ mil
        </div>
        <div className="flex items-end pb-0.5 text-[0.6875rem] leading-4 text-text-muted">Probabilidade</div>
        {IMPACT_BANDS.map((band, i) => (
          <div className="min-w-0 pb-0.5 text-center" key={band.key} role="columnheader">
            <div className="text-xs leading-4 text-text-secondary">{band.label}</div>
            <div className="font-display text-[0.6875rem] leading-4 tabular-nums text-text-muted">{criterion(band, i === 0, false)}</div>
          </div>
        ))}
        {/* Laço de trás para frente: a faixa mais provável tem de ficar no topo, e o array nasce do mais raro. */}
        {PROBABILITY_BANDS.map((_, step) => {
          const p = lastP - step;
          const band = PROBABILITY_BANDS[p];
          if (!band) return null;
          return (
            <div className="contents" key={band.key} role="row">
              <div className="flex min-w-0 flex-col justify-center pr-2 text-right" role="rowheader" style={{ height: CELL_H }}>
                <div className="text-xs leading-4 text-text-secondary">{band.label}</div>
                <div className="font-display text-[0.6875rem] leading-4 tabular-nums text-text-muted">{criterion(band, p === 0, true)}</div>
              </div>
              {IMPACT_BANDS.map((impact, i) => {
                const n = countAt(p, i);
                const level = levelAt(p, i);
                const isSelected = selected.p === p && selected.i === i;
                return (
                  <div
                    aria-label={`${band.label}, ${impact.label}: nível ${LEVEL_LABEL[level].toLowerCase()}, ${formatInt(n)} riscos`}
                    aria-selected={isSelected}
                    className={cn(
                      'flex cursor-pointer items-center justify-center gap-1.5 rounded-[2px]',
                      n === 0 && 'text-text-muted',
                      isSelected ? 'border-2 border-text-primary' : n === 0 ? 'border border-line-subtle' : '',
                    )}
                    data-cell={`${String(p)}-${String(i)}`}
                    key={impact.key}
                    onClick={() => setSelected({ p, i })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelected({ p, i });
                      } else onKeyDown(event);
                    }}
                    role="gridcell"
                    style={{ height: CELL_H, backgroundColor: n === 0 ? undefined : LEVEL_FILL[level], color: n === 0 ? undefined : LEVEL_TEXT[level] }}
                    tabIndex={isSelected ? 0 : -1}
                  >
                    <span className="text-[0.6875rem] leading-4">{LEVEL_LABEL[level]}</span>
                    <span className="font-display text-sm font-medium leading-4 tabular-nums">{formatInt(n)}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <section aria-label="Riscos da célula selecionada" className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-2">
        <h3 className="m-0 text-xs font-semibold leading-4 text-text-primary">{listTitle}</h3>
        {inCell.length === 0 ? (
          <p className="m-0 text-[0.6875rem] leading-4 text-text-muted">Nenhum risco avaliado nesta faixa: é zero medido, não ausência de avaliação.</p>
        ) : (
          <ul className="m-0 flex min-h-0 list-none flex-col gap-2 overflow-y-auto p-0">
            {inCell.map(({ risk }) => (
              <li className="text-[0.6875rem] leading-4 text-text-secondary" key={risk.id}>
                <div className="text-xs font-medium text-text-primary">{risk.name}</div>
                <div>{`Dono: ${risk.owner}`}</div>
                <div>{`Gatilho: ${risk.trigger}`}</div>
                <div>{`Resposta: ${risk.response}`}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </figure>
  );
}
