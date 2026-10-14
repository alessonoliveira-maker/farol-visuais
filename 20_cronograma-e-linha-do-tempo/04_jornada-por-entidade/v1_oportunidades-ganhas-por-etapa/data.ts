/**
 * Oportunidades comerciais ganhas em 2026-T3: o dia em que cada uma entrou em qualificação,
 * diagnóstico, proposta e negociação, e o dia em que foi ganha. Uma etapa dura até a entrada da
 * seguinte; a última dura até a data de fechamento. Dado fictício e fixo: as oportunidades são
 * numeradas e nenhuma representa cliente real.
 */
export interface WonOpportunity {
  readonly id: string;
  readonly name: string;
  /** Entrada em cada etapa, na ordem do funil, em YYYY-MM-DD. A primeira é a data de criação. */
  readonly entries: readonly [string, string, string, string];
  /** Dia em que a oportunidade foi ganha, em YYYY-MM-DD. */
  readonly closed: string;
}

/** Etapas na ordem do funil, da entrada ao fechamento. */
export const stages: readonly string[] = ['Qualificação', 'Diagnóstico', 'Proposta', 'Negociação'];

export const data: readonly WonOpportunity[] = [
  { id: 'op-01', name: 'Oportunidade 01', entries: ['2026-05-06', '2026-05-20', '2026-06-10', '2026-06-24'], closed: '2026-07-15' },
  { id: 'op-02', name: 'Oportunidade 02', entries: ['2026-05-11', '2026-05-14', '2026-05-28', '2026-06-18'], closed: '2026-07-16' },
  { id: 'op-03', name: 'Oportunidade 03', entries: ['2026-05-18', '2026-05-27', '2026-06-08', '2026-06-22'], closed: '2026-07-13' },
  { id: 'op-04', name: 'Oportunidade 04', entries: ['2026-05-26', '2026-06-02', '2026-06-23', '2026-07-21'], closed: '2026-08-25' },
  { id: 'op-05', name: 'Oportunidade 05', entries: ['2026-06-02', '2026-06-05', '2026-06-12', '2026-06-30'], closed: '2026-07-21' },
  { id: 'op-06', name: 'Oportunidade 06', entries: ['2026-06-08', '2026-06-22', '2026-07-06', '2026-07-20'], closed: '2026-08-10' },
  { id: 'op-07', name: 'Oportunidade 07', entries: ['2026-06-15', '2026-06-17', '2026-06-24', '2026-07-02'], closed: '2026-07-16' },
  { id: 'op-08', name: 'Oportunidade 08', entries: ['2026-06-22', '2026-07-10', '2026-07-27', '2026-08-17'], closed: '2026-09-14' },
  { id: 'op-09', name: 'Oportunidade 09', entries: ['2026-06-29', '2026-07-06', '2026-07-20', '2026-08-05'], closed: '2026-08-26' },
  { id: 'op-10', name: 'Oportunidade 10', entries: ['2026-07-06', '2026-07-13', '2026-07-31', '2026-08-14'], closed: '2026-09-04' },
  { id: 'op-11', name: 'Oportunidade 11', entries: ['2026-07-13', '2026-07-14', '2026-07-21', '2026-08-11'], closed: '2026-09-08' },
  { id: 'op-12', name: 'Oportunidade 12', entries: ['2026-07-20', '2026-07-31', '2026-08-14', '2026-09-04'], closed: '2026-09-18' },
  { id: 'op-13', name: 'Oportunidade 13', entries: ['2026-07-27', '2026-08-03', '2026-08-24', '2026-09-07'], closed: '2026-09-28' },
  { id: 'op-14', name: 'Oportunidade 14', entries: ['2026-08-03', '2026-08-10', '2026-08-19', '2026-08-31'], closed: '2026-09-21' },
  { id: 'op-15', name: 'Oportunidade 15', entries: ['2026-08-10', '2026-08-17', '2026-09-01', '2026-09-16'], closed: '2026-09-30' },
];

/** Eixo do período: primeiro e último dia, inclusive. */
export const windowStart = '2026-05-01';
export const windowEnd = '2026-09-30';
