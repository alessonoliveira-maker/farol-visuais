/**
 * Leads qualificados por mês e por UF, de jan/26 a ago/26, em contagem. Dado fictício e fixo.
 * Exercita a classificação por variação de jun/26 para ago/26: 8 UFs em alta, 7 em queda e 9 estáveis
 * (SP sobe 4,5%, abaixo do limiar de 5%, e fica estável), mais duas UFs sem base para comparar (RR com
 * zero em jun/26 e TO sem coleta em jun/26) e uma sem nenhum mês medido (AP, toda `null`). Há bases
 * pequenas de propósito: AC sobe de 6 para 7 e a variação é de 16,7%, que o tile escreve com o par.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface GridPosition {
  readonly row: number;
  readonly column: number;
}

/**
 * Grade de 7 colunas por 6 linhas, desenhada à mão para este catálogo; NÃO é a br_states_grid1 do
 * geofacet, que não foi verificada em fonte pública. Norte no alto e Sul na base; litoral do Nordeste
 * na coluna da direita, de RN a AL; DF encostado em GO e em MG; MS entre MT e PR; ES à direita de MG.
 * É a mesma vizinhança do modelo 23/01, sem a coluna vazia da esquerda.
 */
export const GRID_COLUMNS = 7;
export const GRID_ROWS = 6;
export const UF_GRID: Readonly<Record<UfCode, GridPosition>> = {
  RR: { row: 1, column: 2 }, AP: { row: 1, column: 3 },
  AM: { row: 2, column: 2 }, PA: { row: 2, column: 3 }, MA: { row: 2, column: 4 },
  PI: { row: 2, column: 5 }, CE: { row: 2, column: 6 }, RN: { row: 2, column: 7 },
  AC: { row: 3, column: 1 }, RO: { row: 3, column: 2 }, MT: { row: 3, column: 3 },
  TO: { row: 3, column: 4 }, BA: { row: 3, column: 5 }, PE: { row: 3, column: 6 },
  PB: { row: 3, column: 7 },
  MS: { row: 4, column: 3 }, GO: { row: 4, column: 4 }, DF: { row: 4, column: 5 },
  SE: { row: 4, column: 6 }, AL: { row: 4, column: 7 },
  PR: { row: 5, column: 3 }, SP: { row: 5, column: 4 }, MG: { row: 5, column: 5 },
  ES: { row: 5, column: 6 },
  RS: { row: 6, column: 2 }, SC: { row: 6, column: 3 }, RJ: { row: 6, column: 5 },
};

export const MONTHS: readonly string[] = [
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08',
];

export interface UfQualifiedSeries {
  readonly uf: UfCode;
  readonly name: string;
  /** Um valor por mês de MONTHS, na mesma ordem. `null` é mês sem coleta; 0 é zero medido. */
  readonly qualified: readonly (number | null)[];
}

export const data: readonly UfQualifiedSeries[] = [
  { uf: 'AC', name: 'Acre', qualified: [6, 6, 7, 7, 7, 6, 7, 7] },
  { uf: 'AL', name: 'Alagoas', qualified: [14, 14, 15, 15, 15, 15, 15, 15] },
  { uf: 'AP', name: 'Amapá', qualified: [null, null, null, null, null, null, null, null] },
  { uf: 'AM', name: 'Amazonas', qualified: [30, 31, 32, 33, 34, 34, 33, 33] },
  { uf: 'BA', name: 'Bahia', qualified: [95, 98, 100, 104, 108, 112, 118, 125] },
  { uf: 'CE', name: 'Ceará', qualified: [70, 72, 74, 75, 77, 80, 76, 72] },
  { uf: 'DF', name: 'Distrito Federal', qualified: [80, 82, 85, 88, 92, 96, 100, 108] },
  { uf: 'ES', name: 'Espírito Santo', qualified: [44, 46, 47, 48, 50, 52, 50, 47] },
  { uf: 'GO', name: 'Goiás', qualified: [80, 82, 84, 85, 84, 83, 80, 76] },
  { uf: 'MA', name: 'Maranhão', qualified: [20, 21, 21, 22, 22, 22, 22, 22] },
  { uf: 'MT', name: 'Mato Grosso', qualified: [58, 60, 62, 64, 66, 70, 74, 78] },
  { uf: 'MS', name: 'Mato Grosso do Sul', qualified: [38, 40, 41, 42, 42, 41, 40, 38] },
  { uf: 'MG', name: 'Minas Gerais', qualified: [150, 155, 158, 160, 162, 158, 152, 146] },
  { uf: 'PA', name: 'Pará', qualified: [30, 31, 31, 32, 33, 33, 34, 34] },
  { uf: 'PB', name: 'Paraíba', qualified: [20, 21, 21, 22, 22, 23, 24, 25] },
  { uf: 'PR', name: 'Paraná', qualified: [150, 160, 170, 180, 190, 200, 212, 224] },
  { uf: 'PE', name: 'Pernambuco', qualified: [58, 60, 60, 61, 62, 62, 61, 58] },
  { uf: 'PI', name: 'Piauí', qualified: [8, 9, 9, 9, 10, 10, 10, 10] },
  { uf: 'RJ', name: 'Rio de Janeiro', qualified: [150, 152, 155, 158, 160, 164, 160, 152] },
  { uf: 'RN', name: 'Rio Grande do Norte', qualified: [14, 15, 15, 15, 15, 16, 16, 16] },
  { uf: 'RS', name: 'Rio Grande do Sul', qualified: [140, 142, 146, 150, 152, 156, 162, 170] },
  { uf: 'RO', name: 'Rondônia', qualified: [7, 8, 8, 8, 8, 8, 8, 8] },
  { uf: 'RR', name: 'Roraima', qualified: [1, 0, 1, 1, 0, 0, 1, 1] },
  { uf: 'SC', name: 'Santa Catarina', qualified: [135, 138, 142, 146, 150, 156, 164, 176] },
  { uf: 'SP', name: 'São Paulo', qualified: [350, 365, 375, 385, 395, 400, 408, 418] },
  { uf: 'SE', name: 'Sergipe', qualified: [9, 9, 10, 10, 10, 10, 10, 10] },
  { uf: 'TO', name: 'Tocantins', qualified: [8, 8, 8, 9, 9, null, 9, 9] },
];
