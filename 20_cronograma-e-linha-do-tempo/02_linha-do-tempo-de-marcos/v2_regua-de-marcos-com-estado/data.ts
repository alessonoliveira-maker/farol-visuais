/**
 * Cinco marcos do trimestre da diretoria, cada um com estado e data. O atraso não vem no dado:
 * é calculado no componente (marco não atingido com data anterior a `today`).
 * `confirmed: false` marca data ainda prevista, não comprometida.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export type MilestoneState = 'done' | 'current' | 'pending';

export interface QuarterMilestone {
  readonly id: string;
  readonly name: string;
  readonly date: string;
  readonly state: MilestoneState;
  readonly confirmed: boolean;
}

export const data: readonly QuarterMilestone[] = [
  { id: 'q-orcamento', name: 'Orçamento fechado', date: '2027-07-05', state: 'done', confirmed: true },
  { id: 'q-treino', name: 'Treino dos executivos', date: '2027-07-26', state: 'done', confirmed: true },
  { id: 'q-crm', name: 'Integração do CRM', date: '2027-08-16', state: 'pending', confirmed: true },
  { id: 'q-painel', name: 'Novo painel de metas', date: '2027-09-13', state: 'current', confirmed: true },
  { id: 'q-revisao', name: 'Revisão do trimestre', date: '2027-09-30', state: 'pending', confirmed: false },
];

/** Dia de referência do trimestre, no mesmo formato do dado. */
export const today = '2027-08-30';
