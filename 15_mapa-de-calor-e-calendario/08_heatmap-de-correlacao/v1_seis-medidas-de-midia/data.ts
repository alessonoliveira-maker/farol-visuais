/**
 * Correlação de Pearson entre seis medidas semanais de mídia, sobre 52 semanas fechadas de 2026.
 * Dado fictício e fixo. A matriz é simétrica, então só o triângulo inferior é desenhado: repetir a
 * metade de cima dobraria a tinta sem acrescentar informação.
 *
 * O caso que o dado exercita é o que separa volume de resultado: investimento anda quase colado com
 * impressão e clique, anda pouco com lead qualificado, e a relação entre lead qualificado e custo
 * por lead qualificado é a única forte e negativa da matriz.
 */
export interface MeasureDefinition {
  readonly id: string;
  readonly label: string;
}

/** Ordem importa: a leitura do triângulo é posicional, e a ordem é a do funil de mídia. */
export const MEASURES: readonly MeasureDefinition[] = [
  { id: 'investimento', label: 'Investimento' },
  { id: 'impressoes', label: 'Impressões' },
  { id: 'cliques', label: 'Cliques' },
  { id: 'leads', label: 'Leads' },
  { id: 'qualificados', label: 'Leads qualificados' },
  { id: 'cpl-qualificado', label: 'CPL qualificado' },
];

/** Observações por par. Abaixo de umas 12, o coeficiente não sustenta leitura. */
export const OBSERVATIONS = 52;

/**
 * Triângulo inferior, linha a linha, de cima para baixo. A linha `i` traz os coeficientes das
 * colunas `0` até `i - 1`, então a primeira medida não abre linha e a última não abre coluna.
 */
export const data: readonly (readonly number[])[] = [
  [0.94],
  [0.88, 0.91],
  [0.62, 0.58, 0.73],
  [0.21, 0.17, 0.28, 0.44],
  [-0.57, -0.49, -0.33, 0.12, -0.71],
];
