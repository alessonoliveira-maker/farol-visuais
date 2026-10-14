import { CalendarCheck, Filter } from 'lucide-react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Audience, type AudienceRoadmap } from './data';

/**
 * Roadmap por horizonte cortado em faixas por público: quatro faixas por três horizontes, com o
 * rótulo da faixa fixo à esquerda, contagem por célula e a cor do público só na borda esquerda do
 * cartão. A iniciativa que já foi para o Gantt traz o selo com a data. No estreito, a container
 * query empilha os horizontes dentro de cada faixa. HTML com Tailwind e grade CSS.
 */
export interface AudienceRoadmapProps {
  readonly data?: AudienceRoadmap;
  readonly height?: number;
  readonly className?: string;
}

/** Cor fixa por público, na ordem 1, 3, 6, 5 (COR-8): o público escolhe o slot, nunca a posição. */
const AUDIENCE_COLOR: Record<Audience, string> = {
  Comercial: 'var(--chart-1)',
  'Pré-vendas': 'var(--chart-3)',
  Marketing: 'var(--chart-6)',
  Diretoria: 'var(--chart-5)',
};
/** Colunas da grade larga: rótulo da faixa fixo e três horizontes iguais. */
const WIDE_GRID = '@xl:grid-cols-[80px_repeat(3,minmax(0,1fr))]';

export default function AudienceRoadmapGrid({ data = defaultData, height, className }: AudienceRoadmapProps) {
  const { horizons, audiences, initiatives } = data;
  const style = height === undefined ? undefined : { height };

  if (initiatives.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Este recorte não tem iniciativas, então as faixas por público ficam sem o que mostrar.</span>
      </div>
    );
  }

  const bands = audiences.map((audience) => ({
    audience,
    total: initiatives.filter((item) => item.audience === audience).length,
    cells: horizons.map((horizon) => ({
      horizon,
      items: initiatives
        .filter((item) => item.audience === audience && item.horizon === horizon.id)
        .sort((a, b) => a.priority - b.priority),
    })),
  }));
  const horizonTotals = horizons.map((horizon) => initiatives.filter((item) => item.horizon === horizon.id).length);
  const inGantt = initiatives.filter((item) => item.ganttOn !== null).length;

  const summary =
    `Roadmap de ${formatInt(initiatives.length)} iniciativas de ${formatInt(audiences.length)} públicos em ${formatInt(horizons.length)} horizontes, sem escala de tempo: ` +
    horizons.map((horizon, index) => `${formatInt(horizonTotals[index] ?? 0)} em ${horizon.label.toLowerCase()}`).join(', ') +
    `. ${formatInt(inGantt)} já têm data no Gantt.`;

  return (
    <div
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="group"
      style={style}
    >
      <p className="text-xs font-medium text-text-secondary">
        A distância entre as colunas não é tempo:{' '}
        {inGantt > 0 ? (
          <>
            só <span className="tabular-nums">{formatInt(inGantt)}</span> de <span className="tabular-nums">{formatInt(initiatives.length)}</span>{' '}
            {inGantt === 1 ? 'iniciativa tem' : 'iniciativas têm'} data comprometida.
          </>
        ) : (
          'nenhuma data está comprometida.'
        )}
      </p>
      <div aria-hidden className={cn('hidden gap-2 @xl:grid', WIDE_GRID)}>
        <span />
        {horizons.map((horizon, index) => (
          <div className="flex items-baseline justify-between gap-2 pr-5 pl-0.5" key={horizon.id}>
            <span className="text-xs font-semibold text-text-primary">{horizon.label}</span>
            <span className="kpi-number text-[0.6875rem] text-text-muted">{formatInt(horizonTotals[index] ?? 0)}</span>
          </div>
        ))}
      </div>
      {bands.map((band) => (
        <section aria-label={band.audience} className={cn('grid grid-cols-1 gap-2', WIDE_GRID)} key={band.audience}>
          <div className="@xl:pt-1">
            <h3 className="text-xs font-semibold text-text-primary">{band.audience}</h3>
            <p className="kpi-number text-[0.6875rem] text-text-muted">
              {formatInt(band.total)} {band.total === 1 ? 'iniciativa' : 'iniciativas'}
            </p>
          </div>
          {band.cells.map((cell) => (
            <div className="flex min-w-0 items-start gap-1" key={cell.horizon.id}>
              <div className="min-w-0 flex-1">
                <p className="text-[0.6875rem] font-medium text-text-muted @xl:hidden">{cell.horizon.label}</p>
                <ol className="flex flex-col gap-1">
                  {cell.items.map((item) => (
                    <li
                      className="rounded-md border-l-[3px] bg-surface-sunken px-2 py-1.5"
                      key={item.id}
                      style={{ borderLeftColor: AUDIENCE_COLOR[item.audience] }}
                    >
                      <p className="text-xs font-medium text-text-primary">{item.title}</p>
                      {item.ganttOn === null ? null : (
                        <p className="kpi-number flex items-center gap-1 text-[0.6875rem] text-text-secondary">
                          <CalendarCheck aria-hidden className="size-3 shrink-0" />
                          {formatDate(item.ganttOn)}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              <span className="kpi-number w-4 shrink-0 pt-1.5 text-right text-[0.6875rem] text-text-muted">{formatInt(cell.items.length)}</span>
            </div>
          ))}
        </section>
      ))}
      <p aria-hidden className="flex items-center gap-1 text-[0.6875rem] text-text-muted">
        <CalendarCheck aria-hidden className="size-3 shrink-0" />
        Iniciativa que já foi para o Gantt, com a data comprometida. O número à direita é a contagem da célula.
      </p>
    </div>
  );
}
