/**
 * Funil de leads de mídia paga no trimestre, em contagem de leads reais, nos níveis aninhados:
 * quem tem telefone contém quem qualificou, que contém quem chegou à agenda e quem comprou.
 * Dado fictício e fixo: nenhum número é de operação real.
 *
 * O caso difícil está no fim do funil: 7 vendas em 1.240 leads dão 0,56 em 100, menos de uma figura,
 * então a venda vai só em texto e nenhum ícone é fatiado.
 */
export interface PaidLeadFunnel {
  /** Trimestre do recorte, em texto de tela. */
  readonly period: string;
  /** Leads de mídia paga captados no trimestre: a base que 100 figuras representam. */
  readonly total: number;
  readonly withPhone: number;
  readonly qualified: number;
  readonly scheduled: number;
  readonly won: number;
}

export const data: PaidLeadFunnel = {
  period: '3º trimestre',
  total: 1240,
  withPhone: 719,
  qualified: 260,
  scheduled: 50,
  won: 7,
};
