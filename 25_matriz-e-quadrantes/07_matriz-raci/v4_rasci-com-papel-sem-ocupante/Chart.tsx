import { Check, Filter, TriangleAlert, UserX } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, roles, type RasciLetter, type RasciStep } from './data';

/**
 * Matriz RASCI: a letra S de suporte entra ao lado de R, A, C e I sem mudar a regra do A único.
 * A coluna do papel sem ocupante é hachurada e mantém as letras declaradas; a etapa cujo único A
 * está nesse papel recebe alerta. A forma do glifo carrega a letra (A cheio, R contornado em
 * círculo, S contornado em quadrado, C e I só texto). HTML com Tailwind e tabela semântica.
 */
export interface RasciMatrixProps {
  readonly data?: readonly RasciStep[];
  readonly height?: number;
  readonly className?: string;
}

/** Largura fixa da coluna de papel, também a largura da hachura (viewBox igual ao tamanho da célula). */
const ROLE_COLUMN_WIDTH = 80;
const ALERT_COLUMN_WIDTH = 200;
const ROW_HEIGHT = 42;
const HATCH_STEP = 8;
const LETTER_ORDER: readonly RasciLetter[] = ['A', 'R', 'S', 'C', 'I'];
const LETTER_NAME: Record<RasciLetter, string> = {
  A: 'Responde, um só por etapa',
  R: 'Executa',
  S: 'Dá suporte',
  C: 'É consultado',
  I: 'É informado',
};
const LETTER_LABEL: Record<RasciLetter, string> = {
  A: 'responde em última instância',
  R: 'executa',
  S: 'dá suporte',
  C: 'é consultado',
  I: 'é informado',
};
const LETTER_SHAPE: Record<RasciLetter, string> = {
  A: 'rounded-full bg-chart-1',
  R: 'rounded-full border-2 border-chart-1 text-text-primary',
  S: 'rounded-sm border-2 border-text-secondary text-text-secondary',
  C: 'text-text-secondary',
  I: 'text-text-muted',
};

type IssueKind = 'sem-a' | 'dois-a' | 'a-vago';

const ISSUE_TEXT: Record<IssueKind, string> = {
  'sem-a': 'Sem A: ninguém responde',
  'dois-a': 'Dois A: dois papéis respondem',
  'a-vago': 'O único A está no papel vago',
};

/** Diagonais da hachura, em coordenadas da célula: cada uma sobe da base ao topo em 45 graus. */
function hatchOffsets(width: number, height: number): readonly number[] {
  const offsets: number[] = [];
  for (let offset = -height; offset < width; offset += HATCH_STEP) offsets.push(offset);
  return offsets;
}

function validate(step: RasciStep): IssueKind | null {
  const holders = roles.filter((_, index) => step.letters[index]?.includes('A'));
  if (holders.length === 0) return 'sem-a';
  if (holders.length > 1) return 'dois-a';
  return holders[0]?.vacantSince === undefined ? null : 'a-vago';
}

function Glyph({ letter, solid = false }: { readonly letter: RasciLetter; readonly solid?: boolean }): ReactElement {
  return (
    <span
      aria-hidden
      className={cn('flex size-5 shrink-0 items-center justify-center font-display text-[11px] leading-none font-semibold', LETTER_SHAPE[letter], solid && letter !== 'A' && 'bg-surface-raised')}
      style={letter === 'A' ? { color: 'var(--accent-cyan-contrast)' } : undefined}
    >
      {letter}
    </span>
  );
}

export default function RasciMatrix({ data = defaultData, height, className }: RasciMatrixProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        O recorte não tem etapas da redistribuição, então não há responsabilidades para mostrar.
      </div>
    );
  }

  const vacant = roles.find((role) => role.vacantSince !== undefined);
  const issues = data.map(validate);
  const vacantAlerts = issues.filter((issue) => issue === 'a-vago').length;
  const reading = vacant
    ? `Papel vago: ${vacant.name}. ${formatInt(vacantAlerts)} de ${formatInt(data.length)} etapas têm nele o único A.`
    : `Todos os papéis têm ocupante. ${formatInt(data.length)} etapas com um só A.`;
  const summary =
    `Matriz RASCI da redistribuição de fila com ${formatInt(data.length)} etapas e ${formatInt(roles.length)} papéis. ` +
    (vacant && vacant.vacantSince ? `${vacant.name} está sem ocupante desde ${formatDate(vacant.vacantSince)} e ${formatInt(vacantAlerts)} etapa tem nele o único A.` : 'Nenhum papel está vago.');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="table" style={style}>
      <p aria-hidden className="shrink-0 text-xs leading-snug text-text-secondary">
        {reading}
      </p>
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
        {LETTER_ORDER.map((letter) => (
          <span className="inline-flex items-center gap-1.5" key={letter}>
            <Glyph letter={letter} />
            {LETTER_NAME[letter]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <svg className="block shrink-0 border border-text-muted" height={16} viewBox="0 0 16 16" width={16}>
            {hatchOffsets(16, 16).map((offset) => (
              <line key={offset} stroke="var(--text-muted)" x1={offset} x2={offset + 16} y1={16} y2={0} />
            ))}
          </svg>
          Papel sem ocupante
        </span>
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
              Etapa da redistribuição
            </th>
            {roles.map((role) => (
              <th className="px-1 pb-1.5 text-center align-bottom text-[11px] leading-tight font-medium text-text-secondary" key={role.id} scope="col">
                {role.name}
                {role.vacantSince ? (
                  <span className="mt-0.5 flex items-center justify-center gap-1 font-semibold text-text-primary">
                    <UserX aria-hidden className="size-3.5 shrink-0" />
                    Vago
                  </span>
                ) : null}
              </th>
            ))}
            <th className="pb-1.5 pl-3 text-left align-bottom text-[11px] font-medium text-text-muted" scope="col">
              Governança
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((step) => {
            const issue = validate(step);
            return (
              <tr className="border-t border-line-subtle" key={step.id} style={{ height: ROW_HEIGHT }}>
                <th className={cn('py-1 pr-2 text-left text-xs leading-tight text-text-primary', issue === null ? 'font-medium' : 'font-semibold')} scope="row">
                  {step.name}
                </th>
                {roles.map((role, roleIndex) => {
                  const cell = LETTER_ORDER.filter((letter) => step.letters[roleIndex]?.includes(letter));
                  const isVacant = role.vacantSince !== undefined;
                  return (
                    <td className="p-0" key={role.id}>
                      <div className="grid place-items-center" style={{ height: ROW_HEIGHT - 1 }}>
                        {isVacant ? (
                          <svg aria-hidden className="col-start-1 row-start-1 block" height={ROW_HEIGHT - 1} viewBox={`0 0 ${String(ROLE_COLUMN_WIDTH)} ${String(ROW_HEIGHT - 1)}`} width={ROLE_COLUMN_WIDTH}>
                            {hatchOffsets(ROLE_COLUMN_WIDTH, ROW_HEIGHT - 1).map((offset) => (
                              <line key={offset} stroke="var(--text-muted)" x1={offset} x2={offset + ROW_HEIGHT - 1} y1={ROW_HEIGHT - 1} y2={0} />
                            ))}
                          </svg>
                        ) : null}
                        <div className="col-start-1 row-start-1 flex items-center justify-center gap-0.5">
                          {cell.length === 0 ? (
                            <span aria-hidden className={cn('text-xs text-text-muted', isVacant && 'bg-surface-raised px-1')}>
                              ·
                            </span>
                          ) : (
                            cell.map((letter) => <Glyph key={letter} letter={letter} solid={isVacant} />)
                          )}
                        </div>
                      </div>
                      <span className="sr-only">
                        {isVacant ? 'papel vago, ' : ''}
                        {cell.length === 0 ? 'sem letra' : cell.map((letter) => LETTER_LABEL[letter]).join(' e ')}
                      </span>
                    </td>
                  );
                })}
                <td className="py-1 pl-3">
                  <div className={cn('flex items-center gap-1.5 text-[11px] leading-tight', issue === null ? 'text-text-muted' : 'font-semibold text-warning')}>
                    {issue === null ? <Check aria-hidden className="size-3.5 shrink-0 text-positive" /> : <TriangleAlert aria-hidden className="size-3.5 shrink-0" />}
                    <span>{issue === null ? 'Em regra' : ISSUE_TEXT[issue]}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {vacant && vacant.vacantSince ? (
        <p aria-hidden className="shrink-0 text-[11px] leading-snug text-text-muted">
          {vacant.name} sem ocupante desde {formatDate(vacant.vacantSince)}: as letras declaradas seguem na matriz, mas ninguém as exerce hoje.
        </p>
      ) : null}
    </div>
  );
}
