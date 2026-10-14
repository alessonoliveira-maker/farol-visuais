import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, roles, type RaciLetter, type RaciStep } from './data';

/**
 * Matriz RACI declarada: etapas do handoff nas linhas, papéis nas colunas e as letras de cada
 * papel por célula. A forma do glifo carrega a diferença (A cheio, R contornado, C e I só texto)
 * e a cor só reforça. HTML com Tailwind e tabela semântica, sem Recharts.
 */
export interface RaciMatrixProps {
  readonly data?: readonly RaciStep[];
  readonly height?: number;
  readonly className?: string;
}

/** Largura fixa da coluna de papel: cabe duas letras de 20 px com folga e o nome em duas linhas. */
const ROLE_COLUMN_WIDTH = 76;
/** Ordem de leitura dentro da célula: quem responde vem antes de quem executa. */
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

/** Quantas etapas o papel tem com a letra; `null` quando não há etapa para contar (EST-1b). */
function countLetter(steps: readonly RaciStep[], roleIndex: number, letter: RaciLetter): number | null {
  if (steps.length === 0) return null;
  return steps.filter((step) => step.letters[roleIndex]?.includes(letter)).length;
}

function topRole(steps: readonly RaciStep[], letter: RaciLetter): { readonly name: string; readonly count: number } | null {
  const counted = roles.map((role, index) => ({ name: role.name, count: countLetter(steps, index, letter) }));
  return counted.reduce<{ readonly name: string; readonly count: number } | null>(
    (best, item) => (item.count !== null && (best === null || item.count > best.count) ? { name: item.name, count: item.count } : best),
    null,
  );
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

export default function RaciMatrix({ data = defaultData, height, className }: RaciMatrixProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        O recorte não tem etapas do handoff, então não há responsabilidades para mostrar.
      </div>
    );
  }

  const accountable = topRole(data, 'A');
  const executor = topRole(data, 'R');
  const reading = `Etapas na ordem do processo, de cima para baixo. ${accountable?.name ?? ''} responde por ${formatInt(accountable?.count ?? 0)} de ${formatInt(data.length)} etapas.`;
  const summary =
    `Matriz RACI do handoff de pré-vendas para vendas com ${formatInt(data.length)} etapas e ${formatInt(roles.length)} papéis. ` +
    `${accountable?.name ?? ''} responde por ${formatInt(accountable?.count ?? 0)} etapas; ${executor?.name ?? ''} executa ${formatInt(executor?.count ?? 0)}.`;

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
        </colgroup>
        <thead>
          <tr>
            <th className="pb-1.5 text-left align-bottom text-[11px] font-medium text-text-muted" scope="col">
              Etapa do handoff
            </th>
            {roles.map((role) => (
              <th className="px-1 pb-1.5 text-center align-bottom text-[11px] leading-tight font-medium text-text-secondary" key={role.id} scope="col">
                {role.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((step, stepIndex) => (
            <tr className="h-[38px] border-t border-line-subtle" key={step.id}>
              <th className="py-1 pr-2 text-left text-xs leading-tight font-medium text-text-primary" scope="row">
                <span className="mr-1.5 font-display text-[11px] tabular-nums text-text-muted">{formatInt(stepIndex + 1)}</span>
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
                    <span className="sr-only">
                      {cell.length === 0 ? 'sem letra' : cell.map((letter) => LETTER_LABEL[letter]).join(' e ')}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
