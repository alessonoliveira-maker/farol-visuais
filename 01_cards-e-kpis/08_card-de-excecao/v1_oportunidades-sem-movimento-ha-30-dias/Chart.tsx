import { ArrowRight, CircleCheck, TriangleAlert, Unplug } from 'lucide-react';

import { formatDate, formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExceptionRule } from './data';

/**
 * Cartão de exceção de uma régua: a contagem de casos fora do critério escrito, o critério literal,
 * a data da avaliação e o caminho permanente para a lista. A cor semântica mora só na borda esquerda
 * e no ícone; o texto fica em tokens de texto sobre o fundo do cartão (COR-7). Régua sem caso e
 * régua não avaliada ocupam o mesmo lugar, com a mesma estrutura, para a grade não pular.
 */
export interface ExceptionCardProps {
  readonly data?: ExceptionRule;
  readonly className?: string;
}

/** Ícone de estado em 16 px nos três estados, para o cabeçalho manter a mesma altura. */
const ICON_SIZE = 16;
const ICON_STROKE = 2;

type CardState = 'breached' | 'calm' | 'unavailable';

function stateOf(count: number | null): CardState {
  if (count === null) return 'unavailable';
  return count > 0 ? 'breached' : 'calm';
}

function nounFor(rule: ExceptionRule, count: number): string {
  return count === 1 ? rule.noun.one : rule.noun.other;
}

function criterionOf(rule: ExceptionRule): string {
  return rule.criterion.replace('{limit}', formatDays(rule.limitDays));
}

function linkLabel(count: number): string {
  return count === 1 ? 'Ver o caso' : `Ver os ${formatInt(count)} casos`;
}

function summaryOf(rule: ExceptionRule): string {
  const date = formatDate(rule.evaluatedOn);
  if (rule.count === null) {
    return `Cartão de exceção. ${rule.scope}: a régua de ${rule.noun.other} ${criterionOf(rule)} não pôde ser avaliada em ${date}; o resultado está ${formatUnavailable()} e não quer dizer zero casos.`;
  }
  if (rule.count === 0) {
    return `Cartão de exceção em estado calmo. ${rule.scope}: 0 ${rule.noun.other} ${criterionOf(rule)} na avaliação de ${date}; nenhum caso fora da régua.`;
  }
  const count = formatInt(rule.count);
  return `Cartão de exceção. ${rule.scope}: ${count} ${nounFor(rule, rule.count)} ${criterionOf(rule)}, fora da régua na avaliação de ${date}. O link abre a lista dos casos.`;
}

export default function ExceptionCard({ data = defaultData, className }: ExceptionCardProps) {
  const state = stateOf(data.count);
  const StateIcon = state === 'breached' ? TriangleAlert : state === 'calm' ? CircleCheck : Unplug;

  return (
    <article
      aria-label={summaryOf(data)}
      className={cn(
        'flex h-full w-full min-w-0 flex-col rounded-lg border border-l-2 border-line-subtle bg-surface-raised p-4',
        state === 'breached' ? 'border-l-warning' : 'border-l-line-subtle',
        className,
      )}
      role="group"
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-xs font-medium text-text-secondary">
          <StateIcon
            aria-hidden
            className={cn('shrink-0', state === 'breached' ? 'text-warning' : 'text-text-muted')}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
          />
          <span className="truncate">{data.scope}</span>
        </p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">
          avaliada em {formatDate(data.evaluatedOn)}
        </p>
      </div>

      {data.count === null ? (
        <div className="flex min-h-0 flex-1 flex-col" role="status">
          <p className="mt-3 flex items-center gap-2 text-text-muted">
            <Unplug aria-hidden className="size-5 shrink-0" />
            <span className="font-display text-xl leading-6">{formatUnavailable()}</span>
          </p>
          <p className="mt-1.5 text-xs leading-snug text-text-secondary">{criterionOf(data)}</p>
          <p className="mt-auto pt-3 text-[0.6875rem] text-text-muted">a régua não pôde ser avaliada nesta data</p>
        </div>
      ) : data.count === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col" role="status">
          <p className="mt-3 flex min-w-0 items-baseline gap-2">
            <span className="kpi-number text-2xl leading-none font-semibold text-text-primary">0</span>
            <span className="text-sm font-medium text-text-primary">{data.noun.other}</span>
          </p>
          <p className="mt-1.5 text-xs leading-snug text-text-secondary">{criterionOf(data)}</p>
          <p className="mt-auto pt-3 text-[0.6875rem] text-text-muted">nenhum caso fora da régua</p>
        </div>
      ) : (
        <>
          <p className="mt-3 flex min-w-0 items-baseline gap-2">
            <span className="kpi-number text-2xl leading-none font-semibold text-text-primary">
              {formatInt(data.count)}
            </span>
            <span className="text-sm font-medium text-text-primary">{nounFor(data, data.count)}</span>
          </p>
          <p className="mt-1.5 text-xs leading-snug text-text-secondary">{criterionOf(data)}</p>
          <a
            className="mt-auto inline-flex items-center gap-1 self-start pt-3 text-xs font-semibold text-text-primary"
            href={data.listHref}
          >
            <span className="underline decoration-text-muted underline-offset-4">{linkLabel(data.count)}</span>
            <ArrowRight aria-hidden className="size-3.5 shrink-0" strokeWidth={2.25} />
          </a>
        </>
      )}
    </article>
  );
}
