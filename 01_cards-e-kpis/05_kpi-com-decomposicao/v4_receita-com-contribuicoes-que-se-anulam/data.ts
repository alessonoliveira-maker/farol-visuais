/**
 * Receita reconhecida em dois trimestres, em reais, e a contribuição de cada linha de produto para a
 * variação entre eles, com sinal. Dado fictício e fixo: nenhum valor é de empresa real.
 *
 * Caso limite de propósito: as altas e as quedas se anulam e a variação total é zero, então a
 * participação de cada produto no total não tem base; e os cinco produtos listados somam +R$ 3,2 mil,
 * o que obriga o cartão a nomear o resíduo que fecha a conta. Os itens vêm fora de ordem.
 */
export interface ProductChange {
  readonly id: string;
  readonly name: string;
  /** Contribuição para a variação, em reais: positiva subiu, negativa caiu. */
  readonly change: number;
}

export interface RevenueChangeBreakdown {
  readonly label: string;
  /** Rótulo de tela do período atual e do período de comparação. */
  readonly periodLabel: string;
  readonly basePeriodLabel: string;
  /** Para onde aponta o "bom": subir é bom para receita. */
  readonly goodDirection: 'up' | 'down';
  /** Receita do período atual e do de comparação; `null` quando não houve coleta. */
  readonly current: number | null;
  readonly base: number | null;
  readonly items: readonly ProductChange[];
}

export const data: RevenueChangeBreakdown = {
  label: 'Variação da receita reconhecida',
  periodLabel: '3º tri/26',
  basePeriodLabel: '2º tri/26',
  goodDirection: 'up',
  current: 2_418_600,
  base: 2_418_600,
  items: [
    { id: 'real-estate', name: 'Gestão imobiliária', change: 19_600 },
    { id: 'investments', name: 'Gestão de investimentos', change: 98_700 },
    { id: 'debentures', name: 'Assessoria em emissão de debêntures', change: -37_900 },
    { id: 'succession', name: 'Planejamento sucessório', change: 54_200 },
    { id: 'fidc', name: 'Estruturação de FIDC', change: -131_400 },
  ],
};
