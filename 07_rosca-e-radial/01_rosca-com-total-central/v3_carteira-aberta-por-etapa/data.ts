/**
 * Carteira aberta do funil comercial por etapa, em reais e em contagem de oportunidades.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real é citada.
 * A ordem do array é a ordem do funil, não a ordem de valor.
 */
export interface PipelineStageValue {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly deals: number;
}

export const data: readonly PipelineStageValue[] = [
  { id: 'qualificacao', label: 'Qualificação', value: 1_850_000, deals: 24 },
  { id: 'proposta', label: 'Proposta', value: 2_050_000, deals: 16 },
  { id: 'negociacao', label: 'Negociação', value: 2_100_000, deals: 11 },
  { id: 'fechamento', label: 'Fechamento', value: 1_400_000, deals: 7 },
];
