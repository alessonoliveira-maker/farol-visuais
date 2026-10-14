import { Check, Filter, TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, roles, type RaciLetter, type RaciStep } from './data';

/**
 * Matriz RACI com a regra de governança validada no componente: exatamente um A e pelo menos um R
 * por etapa. A coluna de alerta à direita escreve o problema com ícone e texto, e o rodapé conta
 * os R e os A de cada papel. A forma do glifo carrega a letra e a cor só reforça. HTML com Tailwind.
 */
export interface RaciGovernanceProps {
  readonly data?: readonly RaciStep[];
  readonly height?: number;
  readonly className?: string;
}

/** Largura fixa da coluna de papel: cabe duas letras de 20 px (42 px) e o nome de papel em duas linhas. */
const ROLE_COLUMN_WIDTH = 68;
/** Largura fixa da coluna de alerta: o texto do problema quebra em até duas linhas. */
const ALERT_COLUMN_WIDTH = 164;
const LETTER_ORDER: readonly RaciLetter[] = ['A', 'R', 'C', 'I'];
const LETTER_LABEL: Record<RaciLetter, string> = {
  A: 'responde em última instância',
  R: 'executa',
  C: 'é consultado',
  I: 'é informado',
};
const LETTER_SHAPE: Record<RaciLetter, string> = {
  A: 'rounded-full bg-chart-1',
  R: 'rounded-full border-2 border-chart-1 text-text-primary',
  C: 'text-text-secondary',
  I: 'text-text-muted',
};

type IssueKind = 'sem-a' | 'dois-a' | 'sem-r';

const ISSUE_TEXT: Record<IssueKind, string> = {
  'sem-a': 'Sem A: ninguém responde',
  'dois-a': 'Dois A: dois papéis respondem',
  'sem-r': 'Sem R: ninguém executa',
};
const ISSUE_CLASS: Record<IssueKind, string> = {
  'sem-a': 'text-negative',
  'dois-a': 'text-warning',
  'sem-r': 'text-warning',
};

function countIn(step: RaciStep, letter: RaciLetter): number {
  return step.letters.filter((cell) => cell.includes(letter)).length;
}

/** A regra de governança: um A e ao menos um R. Devolve o primeiro problema, ou `null` se a etapa está em regra. */
function validate(step: RaciStep): IssueKind | null {
  const accountable = countIn(step, 'A');
  if (accountable === 0) return 'sem-a';
  if (accountable > 1) return 'dois-a';
  if (countIn(step, 'R') === 0) return 'sem-r';
  return null;
}

/** Quantas etapas o papel tem com a letra; `null` quando não há etapa para contar (EST-1b). */
function countLetter(steps: readonly RaciStep[], roleIndex: number, letter: RaciLetter): number | null {
  if (steps.length === 0) return null;
  return steps.filter((step) => step.letters[roleIndex]?.includes(letter)).length;
}

function Glyph({ letter }: { readonly letter: RaciLetter }): ReactElement {
  return (
    <span
      aria-hidden
      className={cn('flex size-5 shrink-0 items-center justify-center font-display text-[11px] leading-none font-semibold', LETTER_SHAPE[letter])}
      style={letter === 'A' ? { color: 'var(--accent-cyan-contrast)' } : undefined}
    >
      {letter}
    </span>
  );
}

export default function RaciGovernance({ data = defaultData, height, className }: RaciGovernanceProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        O recorte não tem etapas do handoff, então não há governança para validar.
      </div>
    );
  }

  const issues = data.map(validate);
  const issueCount = issues.filter((issue) => issue !== null).length;
  const rCounts = roles.map((_, index) => countLetter(data, index, 'R'));
  const aCounts = roles.map((_, index) => countLetter(data, index, 'A'));
  const topIndex = rCounts.reduce<number>((best, count, index) => ((count ?? 0) > (rCounts[best] ?? 0) ? index : best), 0);
  const topRole = roles[topIndex];
  const topR = rCounts[topIndex] ?? 0;
  const soleR = data.filter((step) => step.letters[topIndex]?.includes('R') && countIn(step, 'R') === 1).length;
  const reading = `${topRole?.name ?? ''} executa ${formatInt(topR)} de ${formatInt(data.length)} etapas e é o único R em ${formatInt(soleR)}. ${formatInt(issueCount)} etapas com problema de governança.`;
  const summary =
    `Matriz RACI do handoff com ${formatInt(data.length)} etapas e ${formatInt(roles.length)} papéis, validada pela regra de um só A por etapa. ` +
    `${formatInt(issueCount)} etapas com alerta; ${topRole?.name ?? ''} concentra ${formatInt(topR)} execuções.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="table" style={style}>
      <p aria-hidden className="shrink-0 text-xs leading-snug text-text-secondary">
        {reading}
      </p>
      <div aria-hidden className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
        {LETTER_ORDER.map((letter) => (
          <span className="inline-flex items-center gap-1.5" key={letter}>
            <Glyph letter={letter} />
            {letter === 'A' ? 'Responde, um só por etapa' : letter === 'R' ? 'Executa' : letter === 'C' ? 'É consultado' : 'É informado'}
          </span>
        ))}
      </div>
      <table className="w-full min-w-0 table-fixed border-collapse">
        <colgroup>
          <col />
          {roles.map((role) => (
            <col key={role.id} style={{ width: ROLE_COLUMN_WIDTH }} />
          ))}
          <col style={{ width: ALERT_COLUMN_WIDTH }} />
        </colgroup>
        <thead>
          <tr>
            <th className="pb-1.5 text-left align-bottom text-[11px] font-medium text-text-muted" scope="col">
              Etapa do handoff
            </th>
            {roles.map((role) => (
              <th className="px-0.5 pb-1.5 text-center align-bottom text-[11px] leading-tight font-medium text-text-secondary" key={role.id} scope="col">
                {role.name}
              </th>
            ))}
            <th className="pb-1.5 pl-3 text-left align-bottom text-[11px] font-medium text-text-muted" scope="col">
              Governança
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((step, stepIndex) => {
            const issue = issues[stepIndex] ?? null;
            return (
              <tr className="h-10 border-t border-line-subtle" key={step.id}>
                <th className={cn('py-1 pr-2 text-left text-xs leading-tight text-text-primary', issue === null ? 'font-medium' : 'font-semibold')} scope="row">
                  {step.name}
                </th>
                {roles.map((role, roleIndex) => {
                  const cell = LETTER_ORDER.filter((letter) => step.letters[roleIndex]?.includes(letter));
                  return (
                    <td className="py-1" key={role.id}>
                      <div className="flex items-center justify-center gap-0.5">
                        {cell.length === 0 ? (
                          <span aria-hidden className="text-xs text-text-muted">
                            ·
                          </span>
                        ) : (
                          cell.map((letter) => <Glyph key={letter} letter={letter} />)
                        )}
                      </div>
                      <span className="sr-only">{cell.length === 0 ? 'sem letra' : cell.map((letter) => LETTER_LABEL[letter]).join(' e ')}</span>
                    </td>
                  );
                })}
                <td className="py-1 pl-3">
                  <div className={cn('flex items-center gap-1.5 text-[11px] leading-tight', issue === null ? 'text-text-muted' : cn('font-semibold', ISSUE_CLASS[issue]))}>
                    {issue === null ? <Check aria-hidden className="size-3.5 shrink-0 text-positive" /> : <TriangleAlert aria-hidden className="size-3.5 shrink-0" />}
                    <span>{issue === null ? 'Em regra' : ISSUE_TEXT[issue]}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-line-strong">
            <th className="pt-1.5 text-left align-top text-[11px] font-medium text-text-muted" scope="row">
              Carga do papel, em etapas
            </th>
            {roles.map((role, roleIndex) => (
              <td className="pt-1.5 text-center align-top" key={role.id}>
                <span className="block font-display text-[11px] leading-snug font-semibold tabular-nums text-text-secondary">{formatInt(rCounts[roleIndex] ?? 0)} R</span>
                <span className="block font-display text-[11px] leading-snug font-semibold tabular-nums text-text-secondary">{formatInt(aCounts[roleIndex] ?? 0)} A</span>
              </td>
            ))}
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
