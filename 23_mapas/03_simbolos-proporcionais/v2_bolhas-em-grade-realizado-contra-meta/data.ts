/**
 * Receita reconhecida e meta do 3º trimestre de 2026 por UF, em reais. Dado fictício e fixo. `achieved` é
 * `null` quando a UF tem meta e ainda não tem realizado apurado (Tocantins): ausência não é zero, e o
 * componente desenha só o círculo da meta, com a palavra indisponível. O dado traz casos de borda: Sergipe
 * fecha exatamente 100% da meta, Mato Grosso do Sul passa por 1%, e Roraima realiza 22 mil contra um
 * máximo de 5,3 milhões, o que dá um círculo de pouco mais de 1 px.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface UfRevenue {
  readonly uf: UfCode;
  readonly name: string;
  readonly target: number;
  readonly achieved: number | null;
}

export interface GridPosition {
  readonly row: number;
  readonly column: number;
}

/**
 * Grade de 8 colunas por 6 linhas, a mesma do tile grid do catálogo (23/01), desenhada à mão e NÃO a
 * br_states_grid1 do geofacet. Norte no alto, Sul na base, litoral do Nordeste na coluna da direita.
 * A vizinhança é aproximada: AC e AM, PA e TO, BA e GO, SP e RJ ficam só na diagonal.
 */
export const GRID_COLUMNS = 8;
export const GRID_ROWS = 6;
export const UF_GRID: Readonly<Record<UfCode, GridPosition>> = {
  RR: { row: 1, column: 3 }, AP: { row: 1, column: 4 },
  AM: { row: 2, column: 3 }, PA: { row: 2, column: 4 }, MA: { row: 2, column: 5 },
  PI: { row: 2, column: 6 }, CE: { row: 2, column: 7 }, RN: { row: 2, column: 8 },
  AC: { row: 3, column: 2 }, RO: { row: 3, column: 3 }, MT: { row: 3, column: 4 },
  TO: { row: 3, column: 5 }, BA: { row: 3, column: 6 }, PE: { row: 3, column: 7 },
  PB: { row: 3, column: 8 },
  MS: { row: 4, column: 4 }, GO: { row: 4, column: 5 }, DF: { row: 4, column: 6 },
  SE: { row: 4, column: 7 }, AL: { row: 4, column: 8 },
  PR: { row: 5, column: 4 }, SP: { row: 5, column: 5 }, MG: { row: 5, column: 6 },
  ES: { row: 5, column: 7 },
  RS: { row: 6, column: 3 }, SC: { row: 6, column: 4 }, RJ: { row: 6, column: 6 },
};

export const data: readonly UfRevenue[] = [
  { uf: 'AC', name: 'Acre', target: 60_000, achieved: 36_000 },
  { uf: 'AL', name: 'Alagoas', target: 240_000, achieved: 168_000 },
  { uf: 'AP', name: 'Amapá', target: 50_000, achieved: 53_000 },
  { uf: 'AM', name: 'Amazonas', target: 420_000, achieved: 336_000 },
  { uf: 'BA', name: 'Bahia', target: 1_200_000, achieved: 960_000 },
  { uf: 'CE', name: 'Ceará', target: 800_000, achieved: 704_000 },
  { uf: 'DF', name: 'Distrito Federal', target: 750_000, achieved: 810_000 },
  { uf: 'ES', name: 'Espírito Santo', target: 650_000, achieved: 676_000 },
  { uf: 'GO', name: 'Goiás', target: 1_000_000, achieved: 1_040_000 },
  { uf: 'MA', name: 'Maranhão', target: 380_000, achieved: 285_000 },
  { uf: 'MT', name: 'Mato Grosso', target: 620_000, achieved: 589_000 },
  { uf: 'MS', name: 'Mato Grosso do Sul', target: 500_000, achieved: 505_000 },
  { uf: 'MG', name: 'Minas Gerais', target: 2_400_000, achieved: 2_150_000 },
  { uf: 'PA', name: 'Pará', target: 540_000, achieved: 432_000 },
  { uf: 'PB', name: 'Paraíba', target: 300_000, achieved: 321_000 },
  { uf: 'PR', name: 'Paraná', target: 1_700_000, achieved: 1_751_000 },
  { uf: 'PE', name: 'Pernambuco', target: 900_000, achieved: 765_000 },
  { uf: 'PI', name: 'Piauí', target: 200_000, achieved: 150_000 },
  { uf: 'RJ', name: 'Rio de Janeiro', target: 2_100_000, achieved: 2_226_000 },
  { uf: 'RN', name: 'Rio Grande do Norte', target: 260_000, achieved: 234_000 },
  { uf: 'RS', name: 'Rio Grande do Sul', target: 1_500_000, achieved: 1_380_000 },
  { uf: 'RO', name: 'Rondônia', target: 150_000, achieved: 123_000 },
  { uf: 'RR', name: 'Roraima', target: 40_000, achieved: 22_000 },
  { uf: 'SC', name: 'Santa Catarina', target: 1_300_000, achieved: 1_443_000 },
  { uf: 'SP', name: 'São Paulo', target: 4_800_000, achieved: 5_320_000 },
  { uf: 'SE', name: 'Sergipe', target: 180_000, achieved: 180_000 },
  { uf: 'TO', name: 'Tocantins', target: 140_000, achieved: null },
];
