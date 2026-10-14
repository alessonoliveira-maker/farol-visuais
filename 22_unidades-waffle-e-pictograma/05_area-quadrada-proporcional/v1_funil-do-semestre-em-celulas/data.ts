/**
 * Totais do funil comercial de um semestre, na mesma unidade (itens), para desenhar em células de 5.
 * Dado fictício e fixo: nenhum número é de operação real.
 *
 * O caso difícil está no arredondamento: 1.284 / 5 = 256,8, 212 / 5 = 42,4 e 38 / 5 = 7,6, e nenhum
 * dos três é inteiro. O desenho usa o inteiro mais próximo (257, 42 e 8) e o total exato vai escrito.
 */
export interface FunnelStage {
  readonly id: string;
  /** Nome da etapa no plural, em minúsculas, porque entra no meio da frase acessível. */
  readonly label: string;
  /** Total exato da etapa no período. */
  readonly total: number;
}

export interface FunnelCells {
  /** Período do recorte, em texto de tela. */
  readonly period: string;
  /** Quantos itens vale uma célula. */
  readonly unit: number;
  readonly stages: readonly FunnelStage[];
}

export const data: FunnelCells = {
  period: '1º semestre de 2026',
  unit: 5,
  stages: [
    { id: 'leads', label: 'leads', total: 1284 },
    { id: 'oportunidades', label: 'oportunidades', total: 212 },
    { id: 'vitorias', label: 'vitórias', total: 38 },
  ],
};
