import { ArrowRight, Filter, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react';

import { formatDate, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type StalledBySeverity } from './data';

/**
 * Cartão de exceção com dois níveis de severidade e denominador: quantas oportunidades abertas estão
 * paradas, de quantas, e como elas se dividem entre atenção e grave. Cada nível tem forma de ícone e
 * palavra próprias; a cor semântica vive só no ícone e na borda esquerda, que segue o pior nível com
 * caso. Todo texto fica em tokens de texto sobre o fundo do cartão (COR-7).
 */
export interface SeverityExceptionCardProps {
  readonly data?: StalledBySeverity;
  readonly className?: string;
}

const LEVEL_ICON_SIZE = 14;
const LEVEL_ICON_STROKE = 2.25;
/** Ícone, palavra do nível, faixa de dias e contagem alinhada à direita. */
const LEVEL_GRID = 'grid-cols-[0.875rem_3.5rem_minmax(0,1fr)_auto]';

type CardState = 'critical' | 'warning' | 'calm';

const BORDER_BY_STATE: Record<CardState, string> = {
  critical: 'border-l-negative',
  warning: 'border-l-warning',
  calm: 'border-l-line-subtle',
};

interface LevelRow {
  readonly key: 'critical' | 'warning';
  readonly word: string;
  readonly range: string;
  readonly count: number;
  readonly Icon: LucideIcon;
  readonly tone: string;
}

/** O grave vem primeiro: a ordem de leitura é a ordem de ação. */
function levelsOf(rule: StalledBySeverity): readonly LevelRow[] {
  return [
    {
      key: 'critical',
      word: 'Grave',
      range: `acima de ${formatDays(rule.criticalAboveDays)}`,
      count: rule.criticalCount,
      Icon: OctagonAlert,
      tone: 'text-negative',
    },
    {
      key: 'warning',
      word: 'Atenção',
      range: `entre ${formatInt(rule.warningAboveDays + 1)} e ${formatDays(rule.criticalAboveDays)}`,
      count: rule.warningCount,
      Icon: TriangleAlert,
      tone: 'text-warning',
    },
  ];
}

function stateOf(rule: StalledBySeverity): CardState {
  if (rule.criticalCount > 0) return 'critical';
  return rule.warningCount > 0 ? 'warning' : 'calm';
}

function summaryOf(rule: StalledBySeverity, total: number, levels: readonly LevelRow[]): string {
  const date = formatDate(rule.evaluatedOn);
  if (rule.openTotal === 0) {
    return `Cartão de exceção sem base. ${rule.label}: nenhuma oportunidade aberta no recorte em ${date}, então a régua de ${rule.basis} não tem casos para avaliar.`;
  }
  const head = `Cartão de exceção com dois níveis. ${rule.label}: ${formatInt(total)} de ${formatInt(rule.openTotal)} oportunidades abertas fora da régua em ${date}`;
  if (total === 0) return `${head}; nenhum caso em atenção nem grave, régua de ${rule.basis}.`;
  const parts = levels.map((level) => `${formatInt(level.count)} ${level.key === 'critical' ? 'no nível grave' : 'em atenção'}, ${level.range}`);
  return `${head}; ${parts.join(', e ')}.`;
}

export default function SeverityExceptionCard({ data = defaultData, className }: SeverityExceptionCardProps) {
  const total = data.criticalCount + data.warningCount;
  const levels = levelsOf(data);

  return (
    <article
      aria-label={summaryOf(data, total, levels)}
      className={cn(
        'flex h-full w-full min-w-0 flex-col rounded-lg border border-l-2 border-line-subtle bg-surface-raised p-4',
        BORDER_BY_STATE[data.openTotal === 0 ? 'calm' : stateOf(data)],
        className,
      )}
      role="group"
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">
          avaliada em {formatDate(data.evaluatedOn)}
        </p>
      </div>

      {data.openTotal === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 text-text-muted" role="status">
          <Filter aria-hidden className="size-4 shrink-0" />
          <p className="text-xs leading-snug">
            Nenhuma oportunidade aberta neste recorte: a régua não tem casos para avaliar.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2.5 flex min-w-0 items-baseline gap-1.5">
            <span className="kpi-number text-2xl leading-none font-semibold text-text-primary">{formatInt(total)}</span>
            <span className="text-sm text-text-secondary">
              de <span className="kpi-number font-semibold text-text-primary">{formatInt(data.openTotal)}</span>{' '}
              oportunidades abertas
            </span>
          </p>

          <ul className="mt-3 space-y-2">
            {levels.map(({ key, word, range, count, Icon, tone }) => (
              <li className={cn('grid min-w-0 items-center gap-x-2', LEVEL_GRID)} key={key}>
                <Icon
                  aria-hidden
                  className={cn('shrink-0', count > 0 ? tone : 'text-text-muted')}
                  size={LEVEL_ICON_SIZE}
                  strokeWidth={LEVEL_ICON_STROKE}
                />
                <span className="text-xs font-semibold text-text-primary">{word}</span>
                <span className="min-w-0 text-xs text-text-secondary">{range}</span>
                <span className="kpi-number text-right text-sm leading-none font-semibold text-text-primary">
                  {formatInt(count)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[0.6875rem] leading-snug text-text-muted">régua: {data.basis}</p>

          {total > 0 ? (
            <a
              className="mt-auto inline-flex items-center gap-1 self-start pt-3 text-xs font-semibold text-text-primary"
              href={data.listHref}
            >
              <span className="underline decoration-text-muted underline-offset-4">
                {total === 1 ? 'Ver o caso' : `Ver os ${formatInt(total)} casos`}
              </span>
              <ArrowRight aria-hidden className="size-3.5 shrink-0" strokeWidth={2.25} />
            </a>
          ) : (
            <p className="mt-auto pt-3 text-[0.6875rem] text-text-muted" role="status">
              nenhum caso fora da régua
            </p>
          )}
        </>
      )}
    </article>
  );
}
