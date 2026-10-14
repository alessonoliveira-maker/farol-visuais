import { Filter } from 'lucide-react';

import { formatCurrencyCompact, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OpenOpportunities, type OpenOpportunity } from './data';

/**
 * Unit chart das oportunidades paradas: um quadrado por oportunidade aberta, em colunas por etapa,
 * pintado pela faixa de dias sem movimento. Dentro da etapa a ordem de preenchimento é pelos dias,
 * do menor ao maior: a base é o que se mexeu há pouco e o topo é o que está parado, então a faixa
 * crítica forma um bloco contíguo junto da contagem. A faixa crítica tem também contorno, e não só cor.
 */
export interface StalledUnitsProps {
  readonly data?: OpenOpportunities;
  readonly className?: string;
}

const CELL = 10;
const GAP = 2;
const PITCH = CELL + GAP;
const COLS = 5;
const CELL_RADIUS = 1.5;
const GRID_WIDTH = COLS * PITCH - GAP;
/** Largura reservada ao lado da pilha para a nota direta. */
const NOTE_WIDTH = 68;
const NOTE_GAP = 8;
/** Limites das faixas em dias sem movimento: até 15, de 16 a 30 e acima de 30. */
const RECENT_LIMIT = 15;
const STALE_LIMIT = 30;
/** Contorno da faixa crítica, em unidades do viewBox (1 unidade é 1 px no cartão). */
const STALE_STROKE_WIDTH = 1.5;

type Band = 'recent' | 'middle' | 'stale';

interface BandStyle {
  readonly label: string;
  readonly fill: string;
}

const BAND_ORDER: readonly Band[] = ['recent', 'middle', 'stale'];
const BANDS: Readonly<Record<Band, BandStyle>> = {
  recent: { label: `até ${formatInt(RECENT_LIMIT)} dias`, fill: 'var(--seq-5)' },
  middle: { label: `${formatInt(RECENT_LIMIT + 1)} a ${formatInt(STALE_LIMIT)} dias`, fill: 'var(--seq-7)' },
  stale: { label: `mais de ${formatInt(STALE_LIMIT)} dias`, fill: 'var(--warning)' },
};

function bandOf(idleDays: number): Band {
  if (idleDays <= RECENT_LIMIT) return 'recent';
  return idleDays <= STALE_LIMIT ? 'middle' : 'stale';
}

interface Group {
  readonly id: string;
  readonly label: string;
  readonly items: readonly OpenOpportunity[];
  readonly staleCount: number;
}

/** Grupo com mais paradas, ou `null` sem grupo; empate fica com o primeiro do funil (EST-1b). */
function mostStale(groups: readonly Group[]): Group | null {
  let best: Group | null = null;
  for (const group of groups) {
    if (group.staleCount > 0 && (best === null || group.staleCount > best.staleCount)) best = group;
  }
  return best;
}

export default function StalledUnits({ data = defaultData, className }: StalledUnitsProps) {
  const groups: Group[] = data.stages.map((stage) => {
    // Do que se mexeu há pouco ao que está parado: a faixa crítica sobe para o topo da pilha.
    const items = data.items.filter((item) => item.stageId === stage.id).sort((a, b) => a.idleDays - b.idleDays || a.id.localeCompare(b.id));
    return { id: stage.id, label: stage.label, items, staleCount: items.filter((item) => bandOf(item.idleDays) === 'stale').length };
  });
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const staleTotal = groups.reduce((sum, group) => sum + group.staleCount, 0);

  if (total === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade aberta neste recorte: não há o que desenhar.</span>
      </div>
    );
  }

  const worst = mostStale(groups);
  const summary = `Gráfico de unidades com ${formatInt(total)} oportunidades abertas em ${formatInt(groups.length)} etapas, ${formatInt(staleTotal)} delas paradas há mais de ${formatInt(STALE_LIMIT)} dias.${worst ? ` A etapa ${worst.label} concentra ${formatInt(worst.staleCount)} dessas paradas.` : ''}`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure">
      <p aria-hidden className="text-xs leading-5 text-text-muted">
        <span className="kpi-number text-sm leading-none font-semibold text-text-primary">{formatInt(total)}</span> oportunidades abertas,{' '}
        <span className="kpi-number text-sm leading-none font-semibold text-text-primary">{formatInt(staleTotal)}</span> paradas há mais de {formatInt(STALE_LIMIT)} dias
      </p>
      <ul aria-hidden className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-[0.6875rem] leading-4 text-text-secondary">
        {BAND_ORDER.map((band) => (
          <li className="flex items-center gap-1.5" key={band}>
            <span
              className={cn('size-2.5 shrink-0 rounded-[2px]', band === 'stale' && 'border-[1.5px] border-text-primary')}
              style={{ backgroundColor: BANDS[band].fill }}
            />
            <span className="kpi-number">{BANDS[band].label}</span>
          </li>
        ))}
        <li className="text-text-muted">um quadrado, uma oportunidade</li>
      </ul>
      <div className="grid min-h-0 flex-1 grid-flow-col auto-cols-fr gap-3">
        {groups.map((group) => {
          const rows = Math.ceil(group.items.length / COLS);
          const firstStale = group.items.length - group.staleCount;
          // Altura do colchete: das linhas que a faixa crítica toca, contadas do topo da pilha.
          const noteHeight = (rows - Math.floor(firstStale / COLS)) * PITCH - GAP;
          return (
            <div className="flex min-w-0 flex-col" key={group.id}>
              <div className="flex min-h-0 flex-1 flex-col justify-end gap-1">
                <p aria-hidden className="kpi-number text-sm leading-4 font-semibold text-text-primary">
                  {formatInt(group.items.length)}
                </p>
                {rows > 0 ? (
                  <div className="relative" style={{ width: GRID_WIDTH }}>
                    <svg aria-hidden className="block w-full" viewBox={`0 0 ${String(GRID_WIDTH)} ${String(rows * PITCH - GAP)}`}>
                      {group.items.map((item, index) => {
                        const band = bandOf(item.idleDays);
                        // O contorno da faixa crítica entra pelo lado de dentro, para o quadrado seguir com 10 px.
                        const inset = band === 'stale' ? STALE_STROKE_WIDTH / 2 : 0;
                        return (
                          <rect
                            fill={BANDS[band].fill}
                            height={CELL - inset * 2}
                            key={item.id}
                            rx={CELL_RADIUS}
                            stroke={band === 'stale' ? 'var(--text-primary)' : undefined}
                            strokeWidth={band === 'stale' ? STALE_STROKE_WIDTH : undefined}
                            width={CELL - inset * 2}
                            x={(index % COLS) * PITCH + inset}
                            y={(rows - 1 - Math.floor(index / COLS)) * PITCH + inset}
                          >
                            <title>{`${item.id}, ${group.label}: ${formatCurrencyCompact(item.value)}, ${formatDays(item.idleDays)} sem movimento`}</title>
                          </rect>
                        );
                      })}
                    </svg>
                    {worst?.id === group.id ? (
                      <p
                        aria-hidden
                        className="absolute top-0 border-l-2 border-warning pl-1.5 text-[0.6875rem] leading-[14px] text-text-muted"
                        style={{ height: noteHeight, left: GRID_WIDTH + NOTE_GAP, width: NOTE_WIDTH }}
                      >
                        <span className="kpi-number">{formatInt(group.staleCount)}</span> paradas há mais de {formatInt(STALE_LIMIT)} dias
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p aria-hidden className="mt-1 h-8 border-t border-line-subtle pt-1 text-xs leading-4 text-text-secondary">
                {group.label}
              </p>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
