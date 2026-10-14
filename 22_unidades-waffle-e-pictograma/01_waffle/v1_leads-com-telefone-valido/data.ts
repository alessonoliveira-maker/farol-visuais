/**
 * Leads captados em um mês e quantos chegaram com telefone válido para a pré-vendas ligar.
 * Dado fictício e fixo: nenhum número é de operação real.
 *
 * O caso difícil está no resto: 194 de 312 dá 62,18%, que não cai em número inteiro de quadrados.
 * A grade pinta 62 quadrados inteiros e o texto escreve a taxa exata, sem fatiar célula.
 */
export interface PhoneCoverage {
  /** Mês do recorte no formato YYYY-MM. */
  readonly month: string;
  /** Leads captados no mês. */
  readonly total: number;
  /** Leads que chegaram com telefone válido. */
  readonly valid: number;
}

export const data: PhoneCoverage = {
  month: '2026-08',
  total: 312,
  valid: 194,
};
