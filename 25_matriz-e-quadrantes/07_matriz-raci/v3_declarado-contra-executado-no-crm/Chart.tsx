import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt, formatPercentFromScale100, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, roles, type RaciLetter, type RaciStepExecution } from './data';

/**
 * Matriz RACI com duas camadas por célula: a letra declarada (PREMISSA) e o percentual dos
 * registros da etapa que o papel de fato fez no CRM (MEDIDO). A célula que diverge em mais de
 * 30 pontos percentuais leva contorno e percentual em negrito; papel sem letra que executa com
 * frequência é marcado na própria célula vazia. HTML com Tailwind e tabela semântica.
 */
export interface RaciExecutionProps {
  readonly data?: readonly RaciStepExecution[];
  readonly height?: number;
  readonly className?: string;
}

/** Largura fixa da coluna de papel: cabe duas letras de 20 px e o percentual com uma casa. */
const ROLE_COLUMN_WIDTH = 92;
/** Divergência acima desta distância, em pontos percentuais, ganha destaque. */
const DIVERGENCE_LIMIT = 30;
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

/**
 * Distância, em pontos percentuais, entre o declarado e o medido: quem tem R deveria fazer todos
 * os registros, quem não tem R deveria fazer nenhum. `null` quando a etapa não tem registro.
 */
function divergence(letters: readonly RaciLetter[], share: number | null): number | null {
  if (share === null) return null;
  return letters.includes('R') ? 100 - share : share;
}

function isDiverging(letters: readonly RaciLetter[], share: number | null): boolean {
  const gap = divergence(letters, share);
  return gap !== null && gap > DIVERGENCE_LIMIT;
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

export default function RaciExecution({ data = defaultData, height, className }: RaciExecutionProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        O recorte não tem etapas do handoff, então não há declarado para comparar com o CRM.
      </div>
    );
  }

  const flagged = data.map((step) => roles.filter((_, roleIndex) => isDiverging(step.letters[roleIndex] ?? [], step.shares[roleIndex] ?? null)).length);
  const flaggedCells = flagged.reduce((acc, count) => acc + count, 0);
  const flaggedSteps = flagged.filter((count) => count > 0).length;
  const measuredSteps = data.filter((step) => step.records > 0).length;
  const reading = `${formatInt(flaggedCells)} células divergem em mais de ${formatInt(DIVERGENCE_LIMIT)} p.p. do declarado, em ${formatInt(flaggedSteps)} de ${formatInt(measuredSteps)} etapas com registro.`;
  const summary =
    `Matriz RACI com ${formatInt(data.length)} etapas e ${formatInt(roles.length)} papéis, declarado contra executado no CRM no trimestre. ` +
    `${formatInt(flaggedCells)} células divergem em mais de ${formatInt(DIVERGENCE_LIMIT)} pontos percentuais, em ${formatInt(flaggedSteps)} etapas.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="table" style={style}>
      <p aria-hidden className="shrink-0 text-xs leading-snug text-text-secondary">
        {reading}
      </p>
      <div aria-hidden className="flex shrink-0 flex-col gap-1 text-[11px] text-text-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-semibold tracking-wide text-prov-premissa">PREMISSA</span>
          {LETTER_ORDER.map((letter) => (
            <span className="inline-flex items-center gap-1.5" key={letter}>
              <Glyph letter={letter} />
              {letter === 'A' ? 'Responde' : letter === 'R' ? 'Executa' : letter === 'C' ? 'É consultado' : 'É informado'}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-semibold tracking-wide text-prov-medido">MEDIDO</span>
          <span>Percentual dos registros da etapa feitos pelo papel</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-4 rounded-sm border-2 border-warning" />
            Diverge mais de {formatInt(DIVERGENCE_LIMIT)} p.p.
          </span>
        </div>
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
          {data.map((step) => (
            <tr className="h-[46px] border-t border-line-subtle" key={step.id}>
              <th className="py-1 pr-2 text-left text-xs leading-tight font-medium text-text-primary" scope="row">
                {step.name}
                <span className="block text-[11px] font-normal text-text-muted">
                  {step.records > 0 ? `${formatInt(step.records)} registros no trimestre` : 'Sem registro no trimestre'}
                </span>
              </th>
              {roles.map((role, roleIndex) => {
                const letters = LETTER_ORDER.filter((letter) => step.letters[roleIndex]?.includes(letter));
                const share = step.shares[roleIndex] ?? null;
                const diverging = isDiverging(letters, share);
                const gap = divergence(letters, share);
                return (
                  <td className="py-1" key={role.id}>
                    <div className={cn('mx-auto flex w-[76px] flex-col items-center rounded border-2', diverging ? 'border-warning' : 'border-transparent')}>
                      <div className="flex h-5 items-center justify-center gap-0.5">
                        {letters.length > 0 ? (
                          letters.map((letter) => <Glyph key={letter} letter={letter} />)
                        ) : (
                          <span aria-hidden className="text-[11px] text-text-muted">
                            {diverging ? 'sem letra' : '·'}
                          </span>
                        )}
                      </div>
                      <span className={cn('font-display text-[11px] leading-tight tabular-nums', diverging ? 'font-semibold text-text-primary' : 'text-text-secondary')}>
                        {share === null ? formatUnavailable() : formatPercentFromScale100(share)}
                      </span>
                    </div>
                    <span className="sr-only">
                      {letters.length === 0 ? 'sem letra' : letters.map((letter) => LETTER_LABEL[letter]).join(' e ')}
                      {share === null ? ', sem registro' : `, fez ${formatPercentFromScale100(share)} dos registros`}
                      {diverging && gap !== null ? `, diverge ${formatInt(gap)} pontos percentuais do declarado` : ''}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p aria-hidden className="shrink-0 text-[11px] leading-snug text-text-muted">
        RACI é declaração de processo, não medição: a letra vem do desenho do handoff e o percentual vem do registro no CRM.
        Quem tem R deveria fazer todos os registros da etapa; quem não tem R, nenhum.
      </p>
    </div>
  );
}
