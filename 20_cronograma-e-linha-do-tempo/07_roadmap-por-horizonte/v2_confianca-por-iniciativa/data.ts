/**
 * Iniciativas do plano de 2027 por horizonte, com o grau de confiança de cada uma (alta, média
 * ou baixa). A confiança cai conforme o horizonte se afasta, e a linha de leitura do componente
 * só afirma isso quando a conta do dado confirma. Dado fictício e fixo.
 */
export type HorizonId = 'agora' | 'proximo' | 'depois';
export type Confidence = 'alta' | 'media' | 'baixa';

export interface Horizon {
  readonly id: HorizonId;
  readonly label: string;
}

export interface PlanInitiative {
  readonly id: string;
  readonly title: string;
  readonly horizon: HorizonId;
  readonly confidence: Confidence;
  readonly priority: number;
}

export interface ConfidenceRoadmap {
  readonly horizons: readonly Horizon[];
  readonly initiatives: readonly PlanInitiative[];
}

export const data: ConfidenceRoadmap = {
  horizons: [
    { id: 'agora', label: 'Agora' },
    { id: 'proximo', label: 'Próximo' },
    { id: 'depois', label: 'Depois' },
  ],
  initiatives: [
    { id: 'in-06', title: 'Regionalização das metas', horizon: 'proximo', confidence: 'media', priority: 2 },
    { id: 'in-01', title: 'Nova cadência de follow-up', horizon: 'agora', confidence: 'alta', priority: 1 },
    { id: 'in-09', title: 'Programa de indicação', horizon: 'depois', confidence: 'baixa', priority: 2 },
    { id: 'in-03', title: 'Qualificação por pontuação', horizon: 'agora', confidence: 'alta', priority: 3 },
    { id: 'in-05', title: 'Playbook de renovação', horizon: 'proximo', confidence: 'alta', priority: 1 },
    { id: 'in-02', title: 'Agenda única de reuniões', horizon: 'agora', confidence: 'alta', priority: 2 },
    { id: 'in-08', title: 'Canal de parceiros', horizon: 'depois', confidence: 'baixa', priority: 1 },
    { id: 'in-07', title: 'Previsão semanal de receita', horizon: 'proximo', confidence: 'media', priority: 3 },
    { id: 'in-04', title: 'Pacote de preços por segmento', horizon: 'proximo', confidence: 'baixa', priority: 4 },
    { id: 'in-10', title: 'Expansão para novas praças', horizon: 'depois', confidence: 'baixa', priority: 3 },
  ],
};
