/**
 * Funil da pré-vendas na semana de 2026-09-07 (semana 37): realizado contra a meta semanal de
 * cada etapa. A meta é da própria etapa, desdobrada da cadência semanal da equipe; não é a meta
 * do resultado final de handoff aceito.
 * Dado fictício e fixo: nenhuma pessoa ou organização real.
 */
export interface EtapaMeta {
  readonly id: string;
  readonly etapa: string;
  readonly realizado: number;
  readonly meta: number;
}

export const data: readonly EtapaMeta[] = [
  { id: 'entradas', etapa: 'Entradas', realizado: 1180, meta: 1100 },
  { id: 'conexao', etapa: 'Conexão', realizado: 612, meta: 650 },
  { id: 'agenda-marcada', etapa: 'Agenda marcada', realizado: 248, meta: 290 },
  { id: 'agenda-realizada', etapa: 'Agenda realizada', realizado: 187, meta: 240 },
  { id: 'handoff', etapa: 'Handoff aceito', realizado: 142, meta: 190 },
];

/** Limite inferior da faixa "dentro da meta", em fração de atingimento. */
export const limiarDentro = 1.0;
/** Limite inferior da faixa "perto da meta", em fração de atingimento. */
export const limiarPerto = 0.8;
