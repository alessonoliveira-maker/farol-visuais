/**
 * Receita reconhecida por produto e por trimestre, de T4/25 a T3/26, em reais, nas UFs do perímetro
 * (9 de 27). Dado fictício e fixo; os três produtos são genéricos. Exercita: UF fora do perímetro sem
 * dado nenhum (18 UFs), MG com a Linha Corporativa em zero medido nos dois primeiros trimestres, DF com
 * zero medido em T2/26, GO com o trimestre T4/25 sem coleta (`null`) e ES sem nenhum trimestre medido.
 * Zero medido é número; `null` é lacuna.
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

export type ProductId = 'base' | 'plus' | 'corp';

export interface Product {
  readonly id: ProductId;
  readonly name: string;
  /** Slot fixo de --chart-N: a cor pertence ao produto, não à posição (COR-3), na ordem 1, 3, 6 da COR-8. */
  readonly slot: 1 | 3 | 6;
}

/** Do produto da base da pilha ao do topo. */
export const PRODUCTS: readonly Product[] = [
  { id: 'base', name: 'Linha Base', slot: 1 },
  { id: 'plus', name: 'Linha Plus', slot: 3 },
  { id: 'corp', name: 'Linha Corporativa', slot: 6 },
];

export const QUARTERS: readonly string[] = ['T4/25', 'T1/26', 'T2/26', 'T3/26'];

export interface UfRevenue {
  readonly uf: UfCode;
  readonly name: string;
  readonly inPerimeter: boolean;
  /** Um valor por trimestre de QUARTERS. Vazio fora do perímetro; `null` é trimestre sem coleta; 0 é zero medido. */
  readonly revenue: Readonly<Record<ProductId, readonly (number | null)[]>>;
}

const OUT: UfRevenue['revenue'] = { base: [], plus: [], corp: [] };
const NONE: UfRevenue['revenue'] = {
  base: [null, null, null, null],
  plus: [null, null, null, null],
  corp: [null, null, null, null],
};

export const data: readonly UfRevenue[] = [
  { uf: 'AC', name: 'Acre', inPerimeter: false, revenue: OUT },
  { uf: 'AL', name: 'Alagoas', inPerimeter: false, revenue: OUT },
  { uf: 'AP', name: 'Amapá', inPerimeter: false, revenue: OUT },
  { uf: 'AM', name: 'Amazonas', inPerimeter: false, revenue: OUT },
  { uf: 'BA', name: 'Bahia', inPerimeter: false, revenue: OUT },
  { uf: 'CE', name: 'Ceará', inPerimeter: false, revenue: OUT },
  {
    uf: 'DF', name: 'Distrito Federal', inPerimeter: true,
    revenue: { base: [300_000, 310_000, 320_000, 330_000], plus: [150_000, 160_000, 165_000, 170_000], corp: [60_000, 55_000, 0, 45_000] },
  },
  { uf: 'ES', name: 'Espírito Santo', inPerimeter: true, revenue: NONE },
  {
    uf: 'GO', name: 'Goiás', inPerimeter: true,
    revenue: { base: [null, 380_000, 390_000, 400_000], plus: [null, 170_000, 180_000, 190_000], corp: [null, 70_000, 75_000, 80_000] },
  },
  { uf: 'MA', name: 'Maranhão', inPerimeter: false, revenue: OUT },
  { uf: 'MT', name: 'Mato Grosso', inPerimeter: false, revenue: OUT },
  { uf: 'MS', name: 'Mato Grosso do Sul', inPerimeter: false, revenue: OUT },
  {
    uf: 'MG', name: 'Minas Gerais', inPerimeter: true,
    revenue: { base: [820_000, 850_000, 900_000, 930_000], plus: [400_000, 420_000, 450_000, 470_000], corp: [0, 0, 60_000, 90_000] },
  },
  { uf: 'PA', name: 'Pará', inPerimeter: false, revenue: OUT },
  { uf: 'PB', name: 'Paraíba', inPerimeter: false, revenue: OUT },
  {
    uf: 'PR', name: 'Paraná', inPerimeter: true,
    revenue: { base: [700_000, 740_000, 800_000, 860_000], plus: [320_000, 340_000, 380_000, 410_000], corp: [110_000, 130_000, 150_000, 180_000] },
  },
  { uf: 'PE', name: 'Pernambuco', inPerimeter: false, revenue: OUT },
  { uf: 'PI', name: 'Piauí', inPerimeter: false, revenue: OUT },
  {
    uf: 'RJ', name: 'Rio de Janeiro', inPerimeter: true,
    revenue: { base: [980_000, 1_000_000, 1_050_000, 1_100_000], plus: [520_000, 540_000, 580_000, 600_000], corp: [210_000, 200_000, 230_000, 250_000] },
  },
  { uf: 'RN', name: 'Rio Grande do Norte', inPerimeter: false, revenue: OUT },
  {
    uf: 'RS', name: 'Rio Grande do Sul', inPerimeter: true,
    revenue: { base: [600_000, 610_000, 640_000, 650_000], plus: [280_000, 290_000, 300_000, 310_000], corp: [120_000, 115_000, 118_000, 120_000] },
  },
  { uf: 'RO', name: 'Rondônia', inPerimeter: false, revenue: OUT },
  { uf: 'RR', name: 'Roraima', inPerimeter: false, revenue: OUT },
  {
    uf: 'SC', name: 'Santa Catarina', inPerimeter: true,
    revenue: { base: [520_000, 560_000, 600_000, 640_000], plus: [250_000, 270_000, 300_000, 330_000], corp: [90_000, 100_000, 120_000, 140_000] },
  },
  {
    uf: 'SP', name: 'São Paulo', inPerimeter: true,
    revenue: { base: [1_800_000, 1_900_000, 2_000_000, 2_100_000], plus: [900_000, 1_000_000, 1_100_000, 1_200_000], corp: [400_000, 450_000, 520_000, 600_000] },
  },
  { uf: 'SE', name: 'Sergipe', inPerimeter: false, revenue: OUT },
  { uf: 'TO', name: 'Tocantins', inPerimeter: false, revenue: OUT },
];
