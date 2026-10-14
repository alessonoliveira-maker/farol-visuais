/**
 * Leads captados no semestre e quantos deles viraram oportunidade, para desenhar um quadrado de
 * células de 5 com o subconjunto aceso. Dado fictício e fixo: nenhum número é de operação real.
 *
 * O caso difícil está no arredondamento: 1.284 / 5 = 256,8 vira 257 células e 212 / 5 = 42,4 vira 42.
 * O desenho arredonda, e a taxa exata (212 de 1.284) vai escrita junto do bloco aceso.
 */
export interface LeadConversion {
  /** Período do recorte, em texto de tela. */
  readonly period: string;
  /** Quantos leads vale uma célula. */
  readonly unit: number;
  /** Leads captados no período. */
  readonly total: number;
  /** Leads que viraram oportunidade. */
  readonly converted: number;
}

export const data: LeadConversion = {
  period: '1º semestre de 2026',
  unit: 5,
  total: 1284,
  converted: 212,
};
