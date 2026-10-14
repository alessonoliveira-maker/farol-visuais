import { Filter } from 'lucide-react';

import { formatCurrencyCompact, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OpenOpportunities, type OpenOpportunity } from './data';

/**
 * Unit chart por etapa: um quadrado por oportunidade aberta, agrupado em colunas pela etapa do funil.
 * Cada grupo é uma grade calculada aqui, de baixo para cima, com colunas fixas. Os quadrados mais
 * antigos ficam na base e o topo da pilha é o que entrou mais recentemente. A contagem fica acima do
 * grupo e o nome da etapa na base.
 */
export interface OpportunityUnitsProps {
  readonly data?: OpenOpportunities;
  readonly className?: string;
}

const CELL = 10;
const GAP = 2;
const PITCH = CELL + GAP;
const COLS = 4;
const CELL_RADIUS = 1.5;
const GRID_WIDTH = COLS * PITCH - GAP;
const MARK_COLOR = 'var(--chart-1)';

interface Group {
  readonly id: string;
  readonly label: string;
  readonly items: readonly OpenOpportunity[];
}

/** Linhas que um grupo de `count` quadrados ocupa; 0 para grupo vazio. */
function rowsFor(count: number): number {
  return Math.ceil(count / COLS);
}

/** Maior grupo, ou `null` sem grupo: a lista vazia não tem maior (EST-1b). */
function largest(groups: readonly Group[]): Group | null {
  let best: Group | null = null;
  for (const group of groups) {
    if (best === null || group.items.length > best.items.length) best = group;
  }
  return best;
}

function smallest(groups: readonly Group[]): Group | null {
  let best: Group | null = null;
  for (const group of groups) {
    if (best === null || group.items.length < best.items.length) best = group;
  }
  return best;
}

export default function OpportunityUnits({ data = defaultData, className }: OpportunityUnitsProps) {
  const groups: Group[] = data.stages.map((stage) => ({
    id: stage.id,
    label: stage.label,
    // Mais antigo na base: a ordem de preenchimento é pelos dias no funil, do maior para o menor.
    items: data.items.filter((item) => item.stageId === stage.id).sort((a, b) => b.daysInFunnel - a.daysInFunnel || a.id.localeCompare(b.id)),
  }));
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  if (total === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade aberta neste recorte: não há o que desenhar.</span>
      </div>
    );
  }

  const top = largest(groups);
  const bottom = smallest(groups);
  const summary = `Gráfico de unidades com ${formatInt(total)} oportunidades abertas em ${formatInt(groups.length)} etapas, um quadrado por oportunidade. A maior etapa é ${top?.label ?? ''}, com ${formatInt(top?.items.length ?? 0)}; a menor, ${bottom?.label ?? ''}, com ${formatInt(bottom?.items.length ?? 0)}.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure">
      <p aria-hidden className="text-xs leading-5 text-text-muted">
        <span className="kpi-number text-sm leading-none font-semibold text-text-primary">{formatInt(total)}</span> oportunidades abertas, um quadrado por oportunidade
      </p>
      <div className="grid min-h-0 flex-1 grid-flow-col auto-cols-fr gap-3">
        {groups.map((group) => {
          const rows = rowsFor(group.items.length);
          const stack = group.items.map((item, index) => ({
            item,
            x: (index % COLS) * PITCH,
            // A linha 0 é a da base: o y sobe conforme a linha cresce.
            y: (rows - 1 - Math.floor(index / COLS)) * PITCH,
          }));
          return (
            <div className="flex min-w-0 flex-col" key={group.id}>
              <div className="flex min-h-0 flex-1 flex-col justify-end gap-1">
                <p aria-hidden className="kpi-number text-sm leading-4 font-semibold text-text-primary">
                  {formatInt(group.items.length)}
                </p>
                {rows > 0 ? (
                  <svg
                    aria-hidden
                    className="block w-full"
                    style={{ maxWidth: GRID_WIDTH }}
                    viewBox={`0 0 ${String(GRID_WIDTH)} ${String(rows * PITCH - GAP)}`}
                  >
                    {stack.map(({ item, x, y }) => (
                      <rect fill={MARK_COLOR} height={CELL} key={item.id} rx={CELL_RADIUS} width={CELL} x={x} y={y}>
                        <title>{`${item.id}, ${group.label}: ${formatCurrencyCompact(item.value)}, ${formatDays(item.daysInFunnel)} no funil`}</title>
                      </rect>
                    ))}
                  </svg>
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
