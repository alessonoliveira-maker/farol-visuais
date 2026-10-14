/**
 * Percurso de uma oportunidade que não segue a linha reta: uma etapa pulada, um retorno de
 * proposta para qualificação e o passo atual bloqueado à espera de documento. O estado de cada
 * etapa vem declarado no dado, porque um percurso não linear não se deduz da posição.
 * Datas em `YYYY-MM-DD`. Dado fictício e fixo.
 */
export type PathStatus = 'done' | 'current' | 'skipped' | 'pending';

export interface PathStep {
  readonly id: string;
  readonly label: string;
  readonly status: PathStatus;
  /** Data em que a etapa foi alcançada; `null` para pulada e futura. */
  readonly reachedOn: string | null;
}

export interface PathReturn {
  readonly fromId: string;
  readonly toId: string;
  readonly on: string;
}

export interface PathBlock {
  readonly stepId: string;
  readonly reason: string;
}

export interface NonLinearPath {
  readonly opportunity: string;
  readonly steps: readonly PathStep[];
  readonly returns: readonly PathReturn[];
  readonly block: PathBlock | null;
}

export const data: NonLinearPath = {
  opportunity: 'OP-0388',
  steps: [
    { id: 'qualificacao', label: 'Qualificação', status: 'current', reachedOn: '2026-09-30' },
    { id: 'diagnostico', label: 'Diagnóstico', status: 'skipped', reachedOn: null },
    { id: 'proposta', label: 'Proposta', status: 'done', reachedOn: '2026-09-18' },
    { id: 'negociacao', label: 'Negociação', status: 'pending', reachedOn: null },
    { id: 'fechamento', label: 'Fechamento', status: 'pending', reachedOn: null },
  ],
  returns: [{ fromId: 'proposta', toId: 'qualificacao', on: '2026-09-30' }],
  block: { stepId: 'qualificacao', reason: 'aguarda cadastro fiscal' },
};
