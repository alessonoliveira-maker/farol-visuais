/**
 * Cumprimento de 6 metas de 2026 pelas 9 áreas de uma diretoria fictícia, apurado em 2026-08.
 * `status` é por área e meta, na mesma ordem de `goals`: 'cumpriu', 'parcial' ou 'nao_cumpriu'.
 * Dado fictício e fixo: nenhuma área ou pessoa real é citada.
 */
export type GoalStatus = 'cumpriu' | 'parcial' | 'nao_cumpriu';

export interface Goal {
  readonly id: string;
  readonly name: string;
}

export interface AreaGoals {
  readonly id: string;
  readonly area: string;
  readonly statuses: readonly GoalStatus[];
}

export const goals: readonly Goal[] = [
  { id: 'orcamento', name: 'Orçamento do ano' },
  { id: 'prazo', name: 'Prazo do plano' },
  { id: 'nps', name: 'NPS interno' },
  { id: 'renovacao', name: 'Renovação de contratos chave' },
  { id: 'compliance', name: 'Conformidade regulatória' },
  { id: 'quadro', name: 'Quadro de pessoas' },
];

export const data: readonly AreaGoals[] = [
  { id: 'marketing', area: 'Marketing', statuses: ['cumpriu', 'cumpriu', 'cumpriu', 'parcial', 'cumpriu', 'cumpriu'] },
  { id: 'pre-vendas', area: 'Pré-vendas', statuses: ['cumpriu', 'cumpriu', 'cumpriu', 'cumpriu', 'cumpriu', 'cumpriu'] },
  { id: 'vendas', area: 'Vendas', statuses: ['cumpriu', 'cumpriu', 'nao_cumpriu', 'cumpriu', 'parcial', 'cumpriu'] },
  { id: 'produto', area: 'Produto', statuses: ['parcial', 'parcial', 'cumpriu', 'parcial', 'cumpriu', 'parcial'] },
  { id: 'operacoes', area: 'Operações', statuses: ['cumpriu', 'cumpriu', 'cumpriu', 'nao_cumpriu', 'cumpriu', 'cumpriu'] },
  { id: 'financeiro', area: 'Financeiro', statuses: ['cumpriu', 'nao_cumpriu', 'cumpriu', 'cumpriu', 'cumpriu', 'cumpriu'] },
  { id: 'juridico', area: 'Jurídico', statuses: ['nao_cumpriu', 'nao_cumpriu', 'parcial', 'nao_cumpriu', 'cumpriu', 'nao_cumpriu'] },
  { id: 'pessoas', area: 'Pessoas', statuses: ['cumpriu', 'cumpriu', 'parcial', 'cumpriu', 'parcial', 'cumpriu'] },
  { id: 'tecnologia', area: 'Tecnologia', statuses: ['cumpriu', 'cumpriu', 'cumpriu', 'parcial', 'nao_cumpriu', 'cumpriu'] },
];
