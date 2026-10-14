import { Ban, Briefcase, Crown, Filter, Headset, Megaphone, type LucideIcon } from 'lucide-react';

import { formatInt, formatMonthLong } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Audience, type DiscardRoadmap } from './data';

/**
 * Roadmap por horizonte com a coluna depois vazia e uma quarta coluna de descartadas. A coluna
 * sem iniciativa continua na grade com o texto dela, a descartada vai rebaixada em tom neutro
 * com o motivo curto, a iniciativa sem público declarado vem por último em tom neutro e o título
 * longo quebra em duas linhas, com o texto inteiro no atributo title. HTML com Tailwind.
 */
export interface DiscardRoadmapProps {
  readonly data?: DiscardRoadmap;
  readonly height?: number;
  readonly className?: string;
}

const AUDIENCE_ICON: Record<Audience, LucideIcon> = {
  Comercial: Briefcase,
  'Pré-vendas': Headset,
  Marketing: Megaphone,
  Diretoria: Crown,
};
/** Cor fixa por público na ordem 1, 3, 6, 5 (COR-8); sem público vai em tom neutro. */
const AUDIENCE_COLOR: Record<Audience, string> = {
  Comercial: 'var(--chart-1)',
  'Pré-vendas': 'var(--chart-3)',
  Marketing: 'var(--chart-6)',
  Diretoria: 'var(--chart-5)',
};
const NEUTRAL_COLOR = 'var(--line-strong)';

export default function DiscardRoadmapGrid({ data = defaultData, height, className }: DiscardRoadmapProps) {
  const { cycle, columns: columnDefs, initiatives } = data;
  const style = height === undefined ? undefined : { height };

  if (initiatives.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Este recorte não tem iniciativas, nem priorizadas nem descartadas.</span>
      </div>
    );
  }

  const columns = columnDefs.map((column) => ({
    ...column,
    discarded: column.id === 'descartado',
    // A ordem é a prioridade declarada; a iniciativa sem público fica por último porque o dado a declara assim.
    items: initiatives
      .filter((item) => item.column === column.id)
      .sort((a, b) => a.priority - b.priority),
  }));
  const emptyLive = columns.filter((column) => !column.discarded && column.items.length === 0);
  const discardedCount = columns.filter((column) => column.discarded).reduce((sum, column) => sum + column.items.length, 0);

  const summary =
    `Roadmap em ${formatInt(columns.length)} colunas, sem escala de tempo: ` +
    columns.map((column) => `${formatInt(column.items.length)} em ${column.label.toLowerCase()}`).join(', ') +
    (emptyLive.length > 0 ? `. ${emptyLive.map((column) => column.label).join(' e ')} ainda sem iniciativa priorizada.` : '.');

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col gap-3', className)}
      role="group"
      style={style}
    >
      <p className="text-xs font-medium text-text-secondary">
        A distância entre as colunas não é tempo. {formatInt(discardedCount)} ideias descartadas no ciclo de {formatMonthLong(cycle)}.
      </p>
      <div className="grid min-h-0 grid-cols-4 gap-3">
        {columns.map((column) => (
          <section aria-label={column.label} className="flex min-w-0 flex-col gap-2" key={column.id}>
            <div className="flex items-baseline justify-between gap-2 px-0.5">
              <h3 className={cn('text-xs font-semibold', column.discarded ? 'text-text-muted' : 'text-text-primary')}>{column.label}</h3>
              <span className="kpi-number text-[0.6875rem] text-text-muted">
                {formatInt(column.items.length)} {column.items.length === 1 ? 'iniciativa' : 'iniciativas'}
              </span>
            </div>
            {column.items.length === 0 ? (
              <p className="rounded-md bg-surface-sunken px-2.5 py-2 text-xs text-text-muted">sem iniciativa priorizada</p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {column.items.map((item, index) => {
                  const Icon = item.audience === null ? null : AUDIENCE_ICON[item.audience];
                  return (
                    <li
                      className="flex items-start gap-2 rounded-md border-l-[3px] bg-surface-sunken px-2 py-2"
                      key={item.id}
                      style={{ borderLeftColor: item.audience === null ? NEUTRAL_COLOR : AUDIENCE_COLOR[item.audience] }}
                      title={item.title}
                    >
                      <span className="kpi-number flex w-5 shrink-0 justify-start pt-px text-[0.6875rem] font-semibold text-text-muted">
                        {column.discarded ? <Ban aria-hidden className="size-3" /> : `${formatInt(index + 1)}º`}
                      </span>
                      <div className="min-w-0">
                        <p className={cn('line-clamp-2 text-xs font-semibold', column.discarded ? 'text-text-muted' : 'text-text-primary')}>
                          {item.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[0.6875rem] text-text-muted">
                          {Icon ? <Icon aria-hidden className="size-3 shrink-0" /> : null}
                          {item.audience ?? 'Sem público declarado'}
                        </p>
                        {item.reason === null ? null : <p className="text-[0.6875rem] text-text-muted">motivo: {item.reason}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
