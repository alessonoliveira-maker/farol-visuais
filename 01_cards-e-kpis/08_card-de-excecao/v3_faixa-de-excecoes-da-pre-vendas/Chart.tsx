import { ArrowRight, CircleCheck, OctagonAlert, TriangleAlert, Unplug, type LucideIcon } from 'lucide-react';

import { formatDate, formatDays, formatHours, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExceptionStrip, type RuleBreach, type RuleLimit, type Severity } from './data';

/**
 * Faixa de exceções de uma área, acima da grade de KPIs: um cartão por régua estourada, na ordem de
 * ação (grave antes de atenção e, no mesmo nível, a etapa mais cedo da esteira), nunca na ordem de
 * cálculo. Cada cartão é um único link para a fila de trabalho; a cor semântica mora só no ícone e na
 * borda esquerda, e o texto fica em tokens de texto sobre o cartão (COR-7). Sem régua estourada, a
 * faixa colapsa numa linha de status e a grade abaixo sobe.
 */
export interface ExceptionBandProps {
  readonly data?: ExceptionStrip;
  readonly className?: string;
}

const ICON_SIZE = 16;
const ICON_STROKE = 2;
/** Acima desta base a contagem sozinha já diz a proporção; até ela, o denominador vai escrito. */
const DENOMINATOR_MAX_BASE = 500;
/** Grave antes de atenção. */
const SEVERITY_RANK: Record<Severity, number> = { critical: 0, warning: 1 };

interface SeverityStyle {
  readonly word: string;
  readonly Icon: LucideIcon;
  readonly icon: string;
  readonly border: string;
}

/** Forma do ícone e palavra distinguem os níveis; a cor é o terceiro canal, não o único. */
const SEVERITY_STYLE: Record<Severity, SeverityStyle> = {
  critical: { word: 'Grave', Icon: OctagonAlert, icon: 'text-negative', border: 'border-l-negative' },
  warning: { word: 'Atenção', Icon: TriangleAlert, icon: 'text-warning', border: 'border-l-warning' },
};

const LIMIT_FORMAT: Record<RuleLimit['unit'], (value: number) => string> = {
  days: formatDays,
  hours: formatHours,
  leads: (value) => `${formatInt(value)} ${value === 1 ? 'lead' : 'leads'}`,
};

function byAction(breaches: readonly RuleBreach[]): readonly RuleBreach[] {
  return [...breaches].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.flowStep - b.flowStep,
  );
}

function criterionOf(breach: RuleBreach): string {
  return breach.criterion.replace('{limit}', LIMIT_FORMAT[breach.limit.unit](breach.limit.value));
}

function nounOf(breach: RuleBreach): string {
  return breach.count === 1 ? breach.noun.one : breach.noun.other;
}

/** Base escrita só quando existe e é pequena o bastante para mudar a leitura da contagem. */
function writtenBase(breach: RuleBreach): number | null {
  return breach.base !== null && breach.base <= DENOMINATOR_MAX_BASE ? breach.base : null;
}

function countPhrase(breach: RuleBreach): string {
  const base = writtenBase(breach);
  return `${formatInt(breach.count)}${base === null ? '' : ` de ${formatInt(base)}`} ${nounOf(breach)}`;
}

function ordinal(position: number): string {
  return `${formatInt(position)}º`;
}

function summaryOf(strip: ExceptionStrip, ordered: readonly RuleBreach[]): string {
  const area = strip.area.toLowerCase();
  const date = formatDate(strip.evaluatedOn);
  const rules = formatInt(strip.rulesEvaluated);
  if (strip.rulesEvaluated === 0) {
    return `Faixa de exceções da ${area}: avaliação ${formatUnavailable()} em ${date}. Nenhuma régua foi avaliada, o que não quer dizer zero casos fora das réguas.`;
  }
  if (ordered.length === 0) {
    return `Faixa de exceções da ${area} recolhida: 0 de ${rules} réguas estouradas na avaliação de ${date}. Nenhum caso fora das réguas; a grade de indicadores sobe.`;
  }
  const groups = (['critical', 'warning'] as const).flatMap((severity) => {
    const items = ordered.filter((breach) => breach.severity === severity);
    if (items.length === 0) return [];
    const list = items.map((breach) => `${breach.label}, ${formatInt(breach.count)} ${nounOf(breach)}`).join('; ');
    return [`${SEVERITY_STYLE[severity].word}: ${list}.`];
  });
  return `Faixa de exceções da ${area} em ${date}: ${formatInt(ordered.length)} de ${rules} réguas estouradas. ${groups.join(' ')}`;
}

function BreachCard({ breach, position }: { readonly breach: RuleBreach; readonly position: number }) {
  const style = SEVERITY_STYLE[breach.severity];
  const base = writtenBase(breach);
  const criterion = criterionOf(breach);

  return (
    <a
      aria-label={`${ordinal(position)}, ${style.word.toLowerCase()}. ${breach.label}: ${countPhrase(breach)}, ${criterion}. ${breach.queueLabel}.`}
      className={cn(
        'flex h-full min-w-0 flex-col rounded-lg border border-l-2 border-line-subtle bg-surface-raised p-4',
        style.border,
      )}
      href={breach.queueHref}
    >
      <span className="flex min-w-0 items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-text-primary">
          <style.Icon aria-hidden className={cn('shrink-0', style.icon)} size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          {style.word}
        </span>
        <span className="kpi-number shrink-0 text-[0.6875rem] font-medium text-text-muted">{ordinal(position)}</span>
      </span>

      <span className="mt-2 text-xs font-medium text-text-secondary">{breach.label}</span>

      <span className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-1.5">
        <span className="kpi-number text-2xl leading-none font-semibold text-text-primary">{formatInt(breach.count)}</span>
        {base === null ? null : (
          <span className="text-sm text-text-secondary">
            de <span className="kpi-number font-semibold text-text-primary">{formatInt(base)}</span>
          </span>
        )}
        <span className="text-sm text-text-primary">{nounOf(breach)}</span>
      </span>

      <span className="mt-1.5 text-xs leading-snug text-text-secondary">{criterion}</span>

      <span className="mt-auto inline-flex items-center gap-1 self-start pt-3 text-xs font-semibold text-text-primary">
        <span className="underline decoration-text-muted underline-offset-4">{breach.queueLabel}</span>
        <ArrowRight aria-hidden className="size-3.5 shrink-0" strokeWidth={2.25} />
      </span>
    </a>
  );
}

export default function ExceptionBand({ data = defaultData, className }: ExceptionBandProps) {
  const ordered = byAction(data.breaches);
  const date = formatDate(data.evaluatedOn);

  return (
    <section
      aria-label={summaryOf(data, ordered)}
      className={cn('@container flex h-full w-full min-w-0 flex-col', className)}
      role="group"
    >
      {data.rulesEvaluated === 0 ? (
        <p className="flex min-w-0 items-center gap-2 text-xs text-text-muted" role="status">
          <Unplug aria-hidden className="shrink-0" size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          <span>
            <span className="font-medium text-text-secondary">{data.area}</span>: réguas {formatUnavailable()} em {date}; nenhuma
            régua foi avaliada, o que não quer dizer zero casos.
          </span>
        </p>
      ) : ordered.length === 0 ? (
        <p className="flex min-w-0 items-center gap-2 text-xs text-text-muted" role="status">
          <CircleCheck aria-hidden className="shrink-0" size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          <span className="tabular-nums">
            <span className="font-medium text-text-secondary">{data.area}</span>: 0 de {formatInt(data.rulesEvaluated)} réguas
            estouradas na avaliação de {date}; a faixa fica recolhida nesta linha.
          </span>
        </p>
      ) : (
        <>
          <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="text-xs text-text-secondary">
              <span className="font-medium text-text-primary">{data.area}</span>:{' '}
              <span className="kpi-number font-semibold text-text-primary">{formatInt(ordered.length)}</span> de{' '}
              <span className="kpi-number">{formatInt(data.rulesEvaluated)}</span> réguas estouradas
            </p>
            <p className="flex flex-wrap items-baseline gap-x-4 text-[0.6875rem] text-text-muted">
              <span>ordem de ação: grave primeiro e, no mesmo nível, a etapa mais cedo da esteira</span>
              <span className="tabular-nums">avaliadas em {date}</span>
            </p>
          </div>

          <ol className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
            {ordered.map((breach, index) => (
              <li className="min-w-0" key={breach.id}>
                <BreachCard breach={breach} position={index + 1} />
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
