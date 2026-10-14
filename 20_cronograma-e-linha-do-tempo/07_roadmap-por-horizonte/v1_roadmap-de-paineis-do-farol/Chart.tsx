import { Briefcase, Crown, Filter, Headset, Megaphone, type LucideIcon } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Audience, type PanelRoadmap } from './data';

/**
 * Roadmap por horizonte dos painéis do Farol: três colunas (agora, próximo, depois) sem escala de
 * tempo, um cartão por painel com prioridade, título, público em texto e ícone. A ordem dentro da
 * coluna é a prioridade declarada no dado, nunca a alfabética. HTML com Tailwind e grade CSS.
 */
export interface PanelRoadmapProps {
  readonly data?: PanelRoadmap;
  readonly height?: number;
  readonly className?: string;
}

/** Ícone por público: a forma diz o público sem depender de cor. */
const AUDIENCE_ICON: Record<Audience, LucideIcon> = {
  Comercial: Briefcase,
  'Pré-vendas': Headset,
  Marketing: Megaphone,
  Diretoria: Crown,
};

function countLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'painel' : 'painéis'}`;
}

export default function PanelRoadmapGrid({ data = defaultData, height, className }: PanelRoadmapProps) {
  const { horizons, initiatives } = data;
  const style = height === undefined ? undefined : { height };

  if (initiatives.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Este recorte não tem painéis planejados, então não há o que situar nos horizontes.</span>
      </div>
    );
  }

  const columns = horizons.map((horizon) => ({
    ...horizon,
    // Prioridade declarada no dado ordena a coluna; a lista de entrada não precisa vir ordenada.
    items: initiatives.filter((item) => item.horizon === horizon.id).sort((a, b) => a.priority - b.priority),
  }));
  const first = columns[0]?.items[0];

  const summary =
    `Roadmap dos painéis do Farol em ${formatInt(columns.length)} horizontes, sem escala de tempo: ${formatInt(initiatives.length)} painéis, ` +
    columns.map((column) => `${formatInt(column.items.length)} em ${column.label.toLowerCase()}`).join(', ') +
    (first && columns[0] ? `. O primeiro de ${columns[0].label.toLowerCase()} é ${first.title.toLowerCase()}.` : '.');

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col gap-3', className)}
      role="group"
      style={style}
    >
      <p className="text-xs font-medium text-text-secondary">
        A distância entre as colunas não é tempo: nenhuma data está comprometida.
      </p>
      <div className="grid min-h-0 grid-cols-3 gap-3">
        {columns.map((column) => (
          <section aria-label={column.label} className="flex min-w-0 flex-col gap-2" key={column.id}>
            <div className="flex items-baseline justify-between gap-2 px-0.5">
              <h3 className="text-xs font-semibold text-text-primary">{column.label}</h3>
              <span className="kpi-number text-[0.6875rem] text-text-muted">{countLabel(column.items.length)}</span>
            </div>
            <ol className="flex flex-col gap-1.5">
              {column.items.map((item, index) => {
                const Icon = AUDIENCE_ICON[item.audience];
                return (
                  <li className="flex items-start gap-2 rounded-md bg-surface-sunken px-2.5 py-2" key={item.id}>
                    <span className="kpi-number w-5 shrink-0 pt-px text-[0.6875rem] font-semibold text-text-muted">
                      {formatInt(index + 1)}º
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary">{item.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[0.6875rem] text-text-secondary">
                        <Icon aria-hidden className="size-3 shrink-0" />
                        {item.audience}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
