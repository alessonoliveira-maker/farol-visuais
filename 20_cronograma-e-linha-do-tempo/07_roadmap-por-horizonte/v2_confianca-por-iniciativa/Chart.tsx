import { Filter, SignalHigh, SignalLow, SignalMedium, type LucideIcon } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Confidence, type ConfidenceRoadmap } from './data';

/**
 * Roadmap por horizonte com o grau de confiança escrito em cada cartão: selo com palavra e ícone
 * (alta, média, baixa), borda tracejada no cartão de confiança baixa e uma legenda única dos três
 * selos no rodapé. A linha de leitura só diz que a confiança cai com o horizonte quando a conta do
 * dado confirma. HTML com Tailwind e grade CSS.
 */
export interface ConfidenceRoadmapProps {
  readonly data?: ConfidenceRoadmap;
  readonly height?: number;
  readonly className?: string;
}

interface Seal {
  readonly label: string;
  readonly Icon: LucideIcon;
  readonly weight: string;
}

/** Palavra, ícone e peso por grau: a diferença se lê sem cor (ACE-2). */
const SEAL: Record<Confidence, Seal> = {
  alta: { label: 'alta', Icon: SignalHigh, weight: 'font-semibold text-text-primary' },
  media: { label: 'média', Icon: SignalMedium, weight: 'font-medium text-text-secondary' },
  baixa: { label: 'baixa', Icon: SignalLow, weight: 'font-medium text-text-secondary' },
};
const SEAL_ORDER: readonly Confidence[] = ['alta', 'media', 'baixa'];

/** Parcela de iniciativas de confiança alta; null para coluna sem iniciativa (nunca 0 por falta). */
function highShare(items: readonly { readonly confidence: Confidence }[]): number | null {
  if (items.length === 0) return null;
  return items.filter((item) => item.confidence === 'alta').length / items.length;
}

export default function ConfidenceRoadmapGrid({ data = defaultData, height, className }: ConfidenceRoadmapProps) {
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
        <span>Este recorte não tem iniciativas no plano, então não há confiança a comparar.</span>
      </div>
    );
  }

  const columns = horizons.map((horizon) => {
    const items = initiatives.filter((item) => item.horizon === horizon.id).sort((a, b) => a.priority - b.priority);
    return { ...horizon, items, high: items.filter((item) => item.confidence === 'alta').length, share: highShare(items) };
  });

  // A afirmação "cai" só sai quando a parcela de alta diminui a cada horizonte, sem exceção.
  const shares = columns.map((column) => column.share);
  const falls = shares.every((share, index) => {
    const previous = index === 0 ? null : shares[index - 1];
    return share !== null && (previous === null || previous === undefined || share < previous);
  });
  const counts = columns
    .map((column) => `${formatInt(column.high)} de ${formatInt(column.items.length)} ${column.id === 'agora' ? 'agora' : column.id === 'proximo' ? 'no próximo' : 'depois'}`)
    .join(', ');
  const reading = `${falls ? 'A confiança cai com o horizonte' : 'Confiança por horizonte'}: alta em ${counts}.`;

  const summary =
    `Roadmap de ${formatInt(initiatives.length)} iniciativas de 2027 em ${formatInt(columns.length)} horizontes, sem datas, com selo de confiança em cada cartão: ` +
    `${columns.map((column) => `alta em ${formatInt(column.high)} de ${formatInt(column.items.length)} em ${column.label.toLowerCase()}`).join(', ')}.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col gap-3', className)}
      role="group"
      style={style}
    >
      <p aria-hidden className="text-xs font-medium text-text-secondary">
        {reading}
      </p>
      <div className="grid min-h-0 grid-cols-3 gap-3">
        {columns.map((column) => (
          <section aria-label={column.label} className="flex min-w-0 flex-col gap-2" key={column.id}>
            <div className="flex items-baseline justify-between gap-2 px-0.5">
              <h3 className="text-xs font-semibold text-text-primary">{column.label}</h3>
              <span className="kpi-number text-[0.6875rem] text-text-muted">
                {formatInt(column.items.length)} {column.items.length === 1 ? 'iniciativa' : 'iniciativas'}
              </span>
            </div>
            <ol className="flex flex-col gap-1.5">
              {column.items.map((item) => {
                const seal = SEAL[item.confidence];
                return (
                  <li
                    className={cn(
                      'rounded-md border bg-surface-sunken px-2.5 py-1.5',
                      item.confidence === 'baixa' ? 'border-dashed border-line-strong' : 'border-transparent',
                    )}
                    key={item.id}
                  >
                    <p className="text-xs font-semibold text-text-primary">{item.title}</p>
                    <p className={cn('flex items-center gap-1 text-[0.6875rem]', seal.weight)}>
                      <seal.Icon aria-hidden className="size-4 shrink-0" />
                      confiança {seal.label}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
      <ul aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] text-text-muted">
        <li>Selo de confiança:</li>
        {SEAL_ORDER.map((level) => {
          const seal = SEAL[level];
          return (
            <li className="flex items-center gap-1" key={level}>
              <seal.Icon aria-hidden className="size-4 shrink-0" />
              {seal.label}
              {level === 'baixa' ? ', com borda tracejada' : ''}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
