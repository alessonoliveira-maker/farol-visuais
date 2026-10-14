/**
 * Desvio contra a meta trimestral de cada área, em fração assinada (0,22 é 22% acima da meta;
 * −0,09 é 9% abaixo). Escala divergente centrada em 0%. Dado fictício e fixo.
 * `null` é trimestre sem meta cadastrada para aquela área (Pré-vendas só ganhou meta no 3º
 * trimestre), o que é diferente de desvio zero: zero é meta batida em cheio, e desenha a marca.
 */
export interface AreaQuarterlyDeviation {
  readonly areaId: string;
  readonly areaName: string;
  readonly deviations: readonly (number | null)[];
}

/** As 4 colunas, em ordem. */
export const QUARTERS: readonly string[] = ['1º trimestre', '2º trimestre', '3º trimestre', '4º trimestre'];

export const data: readonly AreaQuarterlyDeviation[] = [
  { areaId: 'comercial', areaName: 'Comercial', deviations: [0.22, 0.05, -0.03, 0.31] },
  { areaId: 'marketing', areaName: 'Marketing', deviations: [-0.01, 0.09, 0.24, -0.19] },
  { areaId: 'prevendas', areaName: 'Pré-vendas', deviations: [null, null, 0.12, 0.06] },
  { areaId: 'sucesso-cliente', areaName: 'Sucesso do cliente', deviations: [0.15, 0.02, -0.09, -0.21] },
  { areaId: 'produto', areaName: 'Produto', deviations: [-0.27, -0.14, -0.05, 0.01] },
  { areaId: 'operacoes', areaName: 'Operações', deviations: [0.01, -0.02, 0, 0.03] },
];
