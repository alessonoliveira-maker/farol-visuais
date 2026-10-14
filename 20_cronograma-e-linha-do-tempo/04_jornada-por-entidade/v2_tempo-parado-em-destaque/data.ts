/**
 * Oportunidades comerciais abertas: o dia em que cada uma entrou em cada etapa já alcançada. A etapa
 * atual é a última entrada e segue aberta até hoje. Dado fictício e fixo: as oportunidades são
 * numeradas e nenhuma representa cliente real.
 */
export interface OpenOpportunity {
  readonly id: string;
  readonly name: string;
  /** Entrada em cada etapa já alcançada, na ordem do funil, de 1 a 4 datas em YYYY-MM-DD. */
  readonly entries: readonly string[];
}

/** Etapas na ordem do funil. */
export const stages: readonly string[] = ['Qualificação', 'Diagnóstico', 'Proposta', 'Negociação'];

export const data: readonly OpenOpportunity[] = [
  { id: 'op-01', name: 'Oportunidade 01', entries: ['2026-07-02', '2026-07-20', '2026-08-14', '2026-08-27'] },
  { id: 'op-02', name: 'Oportunidade 02', entries: ['2026-07-08', '2026-07-14', '2026-08-20', '2026-09-15'] },
  { id: 'op-03', name: 'Oportunidade 03', entries: ['2026-07-15', '2026-07-22', '2026-08-03', '2026-09-30'] },
  { id: 'op-04', name: 'Oportunidade 04', entries: ['2026-08-04', '2026-08-18', '2026-09-10'] },
  { id: 'op-05', name: 'Oportunidade 05', entries: ['2026-08-10', '2026-09-15'] },
  { id: 'op-06', name: 'Oportunidade 06', entries: ['2026-08-18'] },
  { id: 'op-07', name: 'Oportunidade 07', entries: ['2026-08-25', '2026-09-01', '2026-09-22', '2026-10-01'] },
  { id: 'op-08', name: 'Oportunidade 08', entries: ['2026-09-01', '2026-09-20'] },
  { id: 'op-09', name: 'Oportunidade 09', entries: ['2026-09-08'] },
  { id: 'op-10', name: 'Oportunidade 10', entries: ['2026-09-15', '2026-09-24'] },
  { id: 'op-11', name: 'Oportunidade 11', entries: ['2026-09-22'] },
  { id: 'op-12', name: 'Oportunidade 12', entries: ['2026-09-29'] },
];

/** Hoje, vindo do dado, nunca do relógio. */
export const today = '2026-10-08';
/** Eixo do período: primeiro e último dia, inclusive. */
export const windowStart = '2026-07-01';
export const windowEnd = '2026-10-08';
/** Dias numa etapa acima dos quais a oportunidade conta como parada. */
export const stallDays = 30;
