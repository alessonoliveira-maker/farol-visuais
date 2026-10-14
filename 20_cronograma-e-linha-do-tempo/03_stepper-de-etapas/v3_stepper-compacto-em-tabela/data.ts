/**
 * Oportunidades abertas do trimestre com a etapa atual (índice em `stages`, `null` quando o CRM
 * não registrou etapa) e os dias parados na etapa (`null` quando não há data de entrada).
 * Dado fictício e fixo: as contas são inventadas.
 */
export interface OpenOpportunity {
  readonly id: string;
  readonly account: string;
  readonly stageIndex: number | null;
  readonly stalledDays: number | null;
}

export interface OpenPipeline {
  readonly stages: readonly string[];
  readonly opportunities: readonly OpenOpportunity[];
}

export const data: OpenPipeline = {
  stages: ['Qualificação', 'Diagnóstico', 'Proposta', 'Negociação', 'Fechamento'],
  opportunities: [
    { id: 'OP-0412', account: 'Distribuidora Norte', stageIndex: 2, stalledDays: 5 },
    { id: 'OP-0418', account: 'Metalúrgica Vale Verde', stageIndex: 4, stalledDays: 2 },
    { id: 'OP-0419', account: 'Rede Farma Central', stageIndex: 1, stalledDays: 12 },
    { id: 'OP-0421', account: 'Transportes Rio Claro', stageIndex: 3, stalledDays: 9 },
    { id: 'OP-0423', account: 'Cooperativa Campo Alto', stageIndex: 0, stalledDays: 0 },
    { id: 'OP-0424', account: 'Construtora Pedra Azul', stageIndex: 3, stalledDays: 21 },
    { id: 'OP-0426', account: 'Têxtil Horizonte', stageIndex: 2, stalledDays: 5 },
    { id: 'OP-0427', account: 'Auto Peças Meridional', stageIndex: 1, stalledDays: 3 },
    { id: 'OP-0429', account: 'Atacado Boa Vista do Sul', stageIndex: 4, stalledDays: 7 },
    { id: 'OP-0431', account: 'Clínica Bem Viver', stageIndex: null, stalledDays: null },
    { id: 'OP-0433', account: 'Logística Três Rios', stageIndex: 2, stalledDays: 18 },
    { id: 'OP-0434', account: 'Agro Serra Dourada', stageIndex: 0, stalledDays: 4 },
    { id: 'OP-0436', account: 'Papelaria Ponto Alto', stageIndex: 1, stalledDays: 12 },
    { id: 'OP-0437', account: 'Grupo Alvorada Alimentos', stageIndex: 3, stalledDays: 1 },
  ],
};
