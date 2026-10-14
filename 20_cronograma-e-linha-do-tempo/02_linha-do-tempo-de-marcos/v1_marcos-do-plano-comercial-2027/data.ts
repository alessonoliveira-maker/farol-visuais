/**
 * Marcos do plano comercial de 2027: eventos de duração zero com data exata, em `YYYY-MM-DD`.
 * Dois marcos caem a 14 dias um do outro de propósito, para provar a anticolisão de rótulo.
 * `today` é a data de referência do plano, fixa, nunca lida do relógio.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export interface PlanMilestone {
  readonly id: string;
  readonly name: string;
  readonly date: string;
}

export const data: readonly PlanMilestone[] = [
  { id: 'm-orcamento', name: 'Orçamento aprovado', date: '2027-01-11' },
  { id: 'm-metas', name: 'Metas por executivo', date: '2027-01-25' },
  { id: 'm-playbook', name: 'Playbook novo no ar', date: '2027-03-15' },
  { id: 'm-piloto', name: 'Piloto de reativação', date: '2027-05-03' },
  { id: 'm-crm', name: 'CRM em produção', date: '2027-07-12' },
  { id: 'm-revisao', name: 'Revisão de meta', date: '2027-09-27' },
];

/** Dia de referência do plano, no mesmo formato do dado. */
export const today = '2027-05-24';
