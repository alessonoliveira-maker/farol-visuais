/**
 * Funil de marketing em agosto de 2026, da geração de lead à agenda realizada.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plataforma real.
 */
export interface ColumnStage {
  readonly id: string;
  readonly label: string;
  readonly noun: string;
  readonly value: number;
}

export const data: readonly ColumnStage[] = [
  { id: 'leads', label: 'Leads', noun: 'leads', value: 1240 },
  { id: 'qualificados', label: 'Leads qualificados', noun: 'leads qualificados', value: 318 },
  { id: 'agendas', label: 'Agendas', noun: 'agendas', value: 96 },
  { id: 'realizadas', label: 'Agendas realizadas', noun: 'agendas realizadas', value: 74 },
];

/** Etapas de cima do funil, fora do gráfico porque a ordem de grandeza esmagaria as colunas finais. */
export const excludedStages: readonly { readonly label: string; readonly value: number }[] = [
  { label: 'impressões', value: 2_400_000 },
  { label: 'cliques', value: 38_600 },
];
