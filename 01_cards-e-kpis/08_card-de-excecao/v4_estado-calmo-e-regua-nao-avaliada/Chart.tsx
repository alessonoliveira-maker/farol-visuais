import { ArrowRight, CircleCheck, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatDate, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type BusinessRules, type CalmBand, type UnevaluatedRule } from './data';

/**
 * Faixa de exceções num dia calmo: o grupo de negócio com nenhum caso fora das réguas, no mesmo
 * cartão e na mesma altura que uma régua estourada teria, para a grade não pular quando o estado
 * muda; e, separado por espaço em grupo próprio, a régua de mídia que não pôde ser avaliada porque a
 * fonte não carregou. Ausência de dado nunca é lida como "tudo bem" (COR-7, EST-2).
 */
export interface CalmExceptionBandProps {
  readonly data?: CalmBand;
  readonly className?: string;
}

const ICON_STROKE = 2;

function criterionOf(rule: UnevaluatedRule): string {
  return rule.criterion.replace('{limit}', formatCurrencyCompact(rule.limitBrl));
}

function summaryOf(band: CalmBand): string {
  const date = formatDate(band.evaluatedOn);
  const businessPart = `Faixa de exceções. Negócio, ${band.business.scope}, em ${date}: ${formatInt(band.business.casesOutside)} de ${formatInt(band.business.rules.length)} réguas com caso.`;
  const dataPart =
    band.unevaluated.length === 0
      ? 'Nenhuma régua de dado ficou sem avaliar.'
      : `Dado, em grupo separado: ${band.unevaluated
          .map((rule) => `${rule.source} está ${formatUnavailable()} desde ${formatDate(rule.lastLoadOn)}`)
          .join('; ')}, o que não é o mesmo que tudo bem.`;
  return `${businessPart} ${dataPart}`;
}

function BusinessCard({ business, evaluatedOn }: { readonly business: BusinessRules; readonly evaluatedOn: string }) {
  return (
    <div
      className="flex h-full min-w-0 flex-col rounded-lg border border-l-2 border-line-subtle bg-surface-raised p-4"
      role="status"
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{business.scope}</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">avaliada em {formatDate(evaluatedOn)}</p>
      </div>

      <p className="mt-3 flex min-w-0 items-baseline gap-2">
        <CircleCheck aria-hidden className="size-5 shrink-0 text-text-muted" strokeWidth={ICON_STROKE} />
        <span className="kpi-number text-2xl leading-none font-semibold text-text-primary">
          {formatInt(business.casesOutside)}
        </span>
        <span className="text-sm font-medium text-text-primary">casos fora das réguas</span>
      </p>

      <p className="mt-1.5 text-xs leading-snug text-text-secondary">
        {formatInt(business.rules.length)} réguas avaliadas: {business.rules.join(', ')}.
      </p>

      <p className="mt-auto pt-3 text-[0.6875rem] text-text-muted tabular-nums">
        próxima avaliação em {formatDate(business.nextEvaluationOn)}
      </p>
    </div>
  );
}

function DataHealthCard({ rule }: { readonly rule: UnevaluatedRule }) {
  return (
    <li className="min-w-0">
      <div className="flex h-full min-w-0 flex-col rounded-lg border border-l-2 border-line-subtle bg-surface-raised p-4">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{rule.source}</p>

        <p className="mt-3 flex items-center gap-2 text-text-muted" role="status">
          <Unplug aria-hidden className="size-5 shrink-0" strokeWidth={ICON_STROKE} />
          <span className="font-display text-xl leading-6">{formatUnavailable()}</span>
        </p>

        <p className="mt-1.5 text-xs leading-snug text-text-secondary">{criterionOf(rule)}</p>

        <p className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-3">
          <span className="text-[0.6875rem] text-text-muted tabular-nums">última carga em {formatDate(rule.lastLoadOn)}</span>
          <a
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-text-primary"
            href={rule.healthHref}
          >
            <span className="underline decoration-text-muted underline-offset-4">{rule.healthLabel}</span>
            <ArrowRight aria-hidden className="size-3.5 shrink-0" strokeWidth={2.25} />
          </a>
        </p>
      </div>
    </li>
  );
}

export default function CalmExceptionBand({ data = defaultData, className }: CalmExceptionBandProps) {
  return (
    <section
      aria-label={summaryOf(data)}
      className={cn('@container flex h-full w-full min-w-0 flex-col', className)}
      role="group"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-6 @2xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-[0.6875rem] font-medium text-text-muted">Exceção de negócio</p>
          <BusinessCard business={data.business} evaluatedOn={data.evaluatedOn} />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-[0.6875rem] font-medium text-text-muted">Exceção de dado</p>
          {data.unevaluated.length === 0 ? (
            <p className="text-xs text-text-muted" role="status">
              nenhuma régua de dado ficou sem avaliar
            </p>
          ) : (
            <ul className="grid min-h-0 flex-1 grid-cols-1 gap-3">
              {data.unevaluated.map((rule) => (
                <DataHealthCard key={rule.id} rule={rule} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
