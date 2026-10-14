/**
 * Leads do recorte por etapa da pré-venda, em contagem. Dado fictício e fixo.
 *
 * O recorte soma 1.900 leads, acima do teto de 1.500 itens em que cada lead ainda vira um quadrado:
 * o gráfico passa sozinho a um quadrado para cada 10 leads. Os casos difíceis: "Sem etapa registrada"
 * (406 leads) é categoria de primeira classe e fica por último, e "Convertido" tem 14 leads, que
 * arredondam para um único quadrado.
 */
export interface LeadStage {
  readonly id: string;
  readonly label: string;
  /** Leads na etapa; `0` é zero medido. */
  readonly count: number;
  /** Lead sem etapa registrada: ausência de dado, sempre por último e em contorno tracejado. */
  readonly missing?: boolean;
}

export const data: readonly LeadStage[] = [
  { id: 'novo', label: 'Novo', count: 560 },
  { id: 'em-contato', label: 'Em contato', count: 470 },
  { id: 'qualificado', label: 'Qualificado', count: 290 },
  { id: 'reuniao', label: 'Reunião agendada', count: 160 },
  { id: 'convertido', label: 'Convertido', count: 14 },
  { id: 'sem-etapa', label: 'Sem etapa registrada', count: 406, missing: true },
];
