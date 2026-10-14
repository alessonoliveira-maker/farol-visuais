import { Filter, Unplug } from 'lucide-react';

import { formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OpenOpportunity, type OpenPipeline } from './data';

/**
 * Stepper compacto para coluna de tabela: um marcador de 8 px por etapa, sem rótulo, e o nome da
 * etapa atual em texto ao lado para a leitura exata. A tabela vem ordenada pela etapa atual, a
 * mais adiantada primeiro, e depois pelos dias parados. A legenda dos estados é uma só, no
 * cabeçalho da coluna.
 */
export interface CompactStepperTableProps {
  readonly data?: OpenPipeline;
  readonly height?: number;
  readonly className?: string;
}

type StepState = 'done' | 'current' | 'pending';

/** Palavra de cada estado na legenda única do cabeçalho: o estado também se lê em texto. */
const STATE_WORD: Readonly<Record<StepState, string>> = { done: 'feita', current: 'atual', pending: 'futura' };
const STATE_ORDER: readonly StepState[] = ['done', 'current', 'pending'];

/** Etapa mais adiantada primeiro, depois mais dias parados; sem etapa ou sem data vai ao fim. */
function sortRows(rows: readonly OpenOpportunity[]): OpenOpportunity[] {
  return [...rows].sort(
    (a, b) =>
      (b.stageIndex ?? -1) - (a.stageIndex ?? -1) ||
      (b.stalledDays ?? -1) - (a.stalledDays ?? -1) ||
      (a.id < b.id ? -1 : 1),
  );
}

function stateAt(index: number, stageIndex: number | null): StepState {
  if (stageIndex === null || index > stageIndex) return 'pending';
  return index === stageIndex ? 'current' : 'done';
}

/** Marcador de 8 px; o atual é um anel de 14 px, porque a forma maior dispensa a cor. */
function Dot({ state }: { readonly state: StepState }) {
  return (
    <span aria-hidden className="flex size-3.5 shrink-0 items-center justify-center">
      {state === 'done' ? (
        <span className="size-2 rounded-full bg-chart-1" />
      ) : state === 'current' ? (
        <span className="flex size-3.5 items-center justify-center rounded-full border-2 border-chart-1">
          <span className="size-1.5 rounded-full bg-chart-1" />
        </span>
      ) : (
        <span className="size-2 rounded-full border border-text-muted" />
      )}
    </span>
  );
}

function Unavailable() {
  return (
    <span className="inline-flex items-center gap-1 text-text-muted">
      <Unplug aria-hidden className="size-3 shrink-0" />
      {formatUnavailable()}
    </span>
  );
}

export default function CompactStepperTable({ data = defaultData, height, className }: CompactStepperTableProps) {
  const { stages, opportunities } = data;
  const style = height === undefined ? undefined : { height };

  if (opportunities.length === 0 || stages.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Este recorte não tem oportunidades abertas, então não há etapa para situar.</span>
      </div>
    );
  }

  const rows = sortRows(opportunities);
  const lastIndex = stages.length - 1;
  const lastLabel = (stages[lastIndex] ?? '').toLowerCase();
  const inLast = rows.filter((row) => row.stageIndex === lastIndex).length;
  const noStage = rows.filter((row) => row.stageIndex === null).length;
  const stalest = rows.reduce<OpenOpportunity | null>(
    (best, row) => (row.stalledDays !== null && (best === null || row.stalledDays > (best.stalledDays ?? -1)) ? row : best),
    null,
  );

  const summary =
    `Tabela de ${formatInt(rows.length)} oportunidades abertas com o percurso em ${formatInt(stages.length)} etapas, ordenada pela etapa atual e depois pelos dias parados. ` +
    `${formatInt(inLast)} em ${lastLabel}` +
    (stalest?.stalledDays != null ? `; a mais parada é ${stalest.id}, há ${formatDays(stalest.stalledDays)}` : '') +
    (noStage > 0 ? `; ${formatInt(noStage)} sem etapa registrada.` : '.');

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-2', className)}
      role="group"
      style={style}
    >
      <p className="text-xs font-medium text-text-secondary">
        <span className="kpi-number font-semibold text-text-primary">{formatInt(rows.length)}</span> oportunidades abertas, da etapa mais
        adiantada à mais inicial
      </p>
      <table className="w-full table-fixed border-collapse text-xs [&_td]:pr-3 [&_th]:pr-3 [&_td:last-child]:pr-0 [&_th:last-child]:pr-0">
        <colgroup>
          <col className="w-[4rem]" />
          <col />
          <col className="w-[10.5rem]" />
          <col className="w-[6.75rem]" />
          <col className="w-[6.5rem]" />
        </colgroup>
        <thead>
          <tr className="h-7 text-left text-[0.6875rem] font-medium text-text-muted">
            <th className="font-medium" scope="col">Código</th>
            <th className="font-medium" scope="col">Conta</th>
            <th className="font-medium" scope="col">
              <span className="flex items-center gap-2">
                {STATE_ORDER.map((state) => (
                  <span className="flex items-center gap-1" key={state}>
                    <Dot state={state} />
                    {STATE_WORD[state]}
                  </span>
                ))}
              </span>
            </th>
            <th className="font-medium" scope="col">Etapa atual</th>
            <th className="text-right font-medium" scope="col">Dias parados</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="h-6" key={row.id}>
              <td className="kpi-number font-semibold text-text-primary">{row.id}</td>
              <td className="text-text-secondary">{row.account}</td>
              <td>
                <span
                  aria-label={row.stageIndex === null ? 'sem etapa registrada' : `etapa ${formatInt(row.stageIndex + 1)} de ${formatInt(stages.length)}`}
                  className="flex items-center gap-0.5"
                  role="img"
                >
                  {row.stageIndex === null
                    ? null
                    : stages.map((stage, index) => <Dot key={stage} state={stateAt(index, row.stageIndex)} />)}
                </span>
              </td>
              <td className="font-semibold text-text-primary">
                {row.stageIndex === null ? <Unavailable /> : stages[row.stageIndex]}
              </td>
              <td className="kpi-number text-right text-text-secondary">
                {row.stalledDays === null ? <Unavailable /> : formatDays(row.stalledDays)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
