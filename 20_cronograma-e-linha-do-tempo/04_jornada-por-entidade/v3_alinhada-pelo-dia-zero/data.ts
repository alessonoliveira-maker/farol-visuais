/**
 * Oportunidades comerciais ganhas em 2026: o dia em que cada uma entrou em qualificação, diagnóstico,
 * proposta e negociação, e o dia em que foi ganha. Dado fictício e fixo: as oportunidades são
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
  { id: 'op-01', name: 'Oportunidade 01', entries: ['2026-01-09', '2026-01-19', '2026-01-26', '2026-02-21'], closed: '2026-03-13' },
  { id: 'op-02', name: 'Oportunidade 02', entries: ['2026-01-10', '2026-01-18', '2026-01-28', '2026-02-23'], closed: '2026-03-14' },
  { id: 'op-03', name: 'Oportunidade 03', entries: ['2026-01-17', '2026-01-19', '2026-02-07', '2026-03-03'], closed: '2026-03-29' },
  { id: 'op-04', name: 'Oportunidade 04', entries: ['2026-01-20', '2026-01-21', '2026-01-25', '2026-01-31'], closed: '2026-02-05' },
  { id: 'op-05', name: 'Oportunidade 05', entries: ['2026-01-27', '2026-02-05', '2026-02-24', '2026-03-15'], closed: '2026-04-08' },
  { id: 'op-06', name: 'Oportunidade 06', entries: ['2026-01-31', '2026-02-04', '2026-02-17', '2026-03-08'], closed: '2026-03-27' },
  { id: 'op-07', name: 'Oportunidade 07', entries: ['2026-02-08', '2026-02-20', '2026-02-27', '2026-03-17'], closed: '2026-04-15' },
  { id: 'op-08', name: 'Oportunidade 08', entries: ['2026-02-10', '2026-02-14', '2026-02-27', '2026-03-22'], closed: '2026-05-19' },
  { id: 'op-09', name: 'Oportunidade 09', entries: ['2026-02-16', '2026-02-28', '2026-03-12', '2026-03-29'], closed: '2026-04-08' },
  { id: 'op-10', name: 'Oportunidade 10', entries: ['2026-02-20', '2026-02-26', '2026-03-05', '2026-03-22'], closed: '2026-04-06' },
  { id: 'op-11', name: 'Oportunidade 11', entries: ['2026-02-26', '2026-03-03', '2026-03-21', '2026-04-02'], closed: '2026-04-11' },
  { id: 'op-12', name: 'Oportunidade 12', entries: ['2026-03-05', '2026-03-07', '2026-03-15', '2026-03-30'], closed: '2026-04-05' },
  { id: 'op-13', name: 'Oportunidade 13', entries: ['2026-03-06', '2026-03-17', '2026-03-27', '2026-04-16'], closed: '2026-04-28' },
  { id: 'op-14', name: 'Oportunidade 14', entries: ['2026-03-13', '2026-03-19', '2026-04-05', '2026-04-11'], closed: '2026-04-28' },
  { id: 'op-15', name: 'Oportunidade 15', entries: ['2026-03-16', '2026-03-24', '2026-03-31', '2026-04-26'], closed: '2026-05-09' },
  { id: 'op-16', name: 'Oportunidade 16', entries: ['2026-03-24', '2026-04-01', '2026-04-09', '2026-04-27'], closed: '2026-05-25' },
  { id: 'op-17', name: 'Oportunidade 17', entries: ['2026-03-26', '2026-04-02', '2026-04-16', '2026-05-05'], closed: '2026-05-16' },
  { id: 'op-18', name: 'Oportunidade 18', entries: ['2026-03-31', '2026-04-08', '2026-04-30', '2026-05-17'], closed: '2026-06-03' },
  { id: 'op-19', name: 'Oportunidade 19', entries: ['2026-04-05', '2026-04-16', '2026-04-29', '2026-05-13'], closed: '2026-06-03' },
  { id: 'op-20', name: 'Oportunidade 20', entries: ['2026-04-14', '2026-05-10', '2026-06-09', '2026-06-28'], closed: '2026-07-16' },
  { id: 'op-21', name: 'Oportunidade 21', entries: ['2026-04-19', '2026-04-21', '2026-05-05', '2026-05-26'], closed: '2026-06-03' },
  { id: 'op-22', name: 'Oportunidade 22', entries: ['2026-04-23', '2026-05-04', '2026-05-25', '2026-06-01'], closed: '2026-06-18' },
  { id: 'op-23', name: 'Oportunidade 23', entries: ['2026-04-26', '2026-05-05', '2026-05-12', '2026-06-02'], closed: '2026-06-29' },
  { id: 'op-24', name: 'Oportunidade 24', entries: ['2026-04-30', '2026-05-12', '2026-05-21', '2026-05-28'], closed: '2026-06-25' },
  { id: 'op-25', name: 'Oportunidade 25', entries: ['2026-05-07', '2026-05-18', '2026-06-02', '2026-06-27'], closed: '2026-07-21' },
  { id: 'op-26', name: 'Oportunidade 26', entries: ['2026-05-11', '2026-05-23', '2026-05-31', '2026-06-20'], closed: '2026-06-25' },
  { id: 'op-27', name: 'Oportunidade 27', entries: ['2026-05-19', '2026-05-24', '2026-06-01', '2026-06-25'], closed: '2026-07-25' },
  { id: 'op-28', name: 'Oportunidade 28', entries: ['2026-05-21', '2026-06-01', '2026-06-19', '2026-07-08'], closed: '2026-08-06' },
  { id: 'op-29', name: 'Oportunidade 29', entries: ['2026-05-29', '2026-06-02', '2026-06-17', '2026-07-04'], closed: '2026-07-26' },
  { id: 'op-30', name: 'Oportunidade 30', entries: ['2026-06-03', '2026-06-11', '2026-06-20', '2026-07-06'], closed: '2026-07-22' },
  { id: 'op-31', name: 'Oportunidade 31', entries: ['2026-06-04', '2026-06-06', '2026-06-23', '2026-07-18'], closed: '2026-07-26' },
  { id: 'op-32', name: 'Oportunidade 32', entries: ['2026-06-12', '2026-06-14', '2026-06-26', '2026-08-09'], closed: '2026-08-23' },
  { id: 'op-33', name: 'Oportunidade 33', entries: ['2026-06-18', '2026-06-30', '2026-07-18', '2026-08-09'], closed: '2026-08-31' },
  { id: 'op-34', name: 'Oportunidade 34', entries: ['2026-06-23', '2026-06-26', '2026-07-17', '2026-08-03'], closed: '2026-08-29' },
  { id: 'op-35', name: 'Oportunidade 35', entries: ['2026-06-26', '2026-07-05', '2026-07-17', '2026-07-25'], closed: '2026-08-04' },
  { id: 'op-36', name: 'Oportunidade 36', entries: ['2026-07-01', '2026-07-05', '2026-07-24', '2026-07-31'], closed: '2026-08-07' },
  { id: 'op-37', name: 'Oportunidade 37', entries: ['2026-07-07', '2026-07-09', '2026-07-21', '2026-08-03'], closed: '2026-08-18' },
  { id: 'op-38', name: 'Oportunidade 38', entries: ['2026-07-12', '2026-07-23', '2026-07-28', '2026-08-22'], closed: '2026-09-13' },
  { id: 'op-39', name: 'Oportunidade 39', entries: ['2026-07-17', '2026-07-29', '2026-08-12', '2026-09-02'], closed: '2026-10-02' },
  { id: 'op-40', name: 'Oportunidade 40', entries: ['2026-07-19', '2026-07-21', '2026-08-03', '2026-08-24'], closed: '2026-09-06' },
];
