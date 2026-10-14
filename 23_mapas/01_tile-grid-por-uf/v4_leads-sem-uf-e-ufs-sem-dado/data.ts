/**
 * Cobertura de UF na base de leads do primeiro semestre de 2026. Dado fictício e fixo. Casos: duas UFs
 * com zero lead medido (AC e SE), três UFs sem coleta (AP, RR e TO, `null`) que não valem zero, e
 * 1.240 leads sem UF que não pertencem a nenhuma UF. As UFs com UF preenchida somam 5.650 leads, então
 * os leads sem UF são 18% do total de 6.890.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface GridPosition {
  readonly row: number;
  readonly column: number;
}

export interface UfCoverage {
  readonly uf: UfCode;
  readonly name: string;
  /** Leads com UF preenchida. `0` é zero medido; `null` é UF sem coleta, nunca zero. */
  readonly leads: number | null;
}

/**
 * Grade de 7 colunas por 6 linhas, a mesma do modelo deslocada uma coluna para a esquerda (AC passa
 * à coluna 1), para caber ao lado do card de cobertura. Desenhada à mão e NÃO é a br_states_grid2 do
 * geofacet: o arquivo público não foi verificado (README do catálogo), então a vizinhança abaixo é a
 * adotada aqui e pede revisão com quem lê o painel. Norte no alto e Sul na base; o litoral do
 * Nordeste na coluna da direita, de RN a AL; DF encostado em GO e em MG; MS entre MT e PR. Pares
 * vizinhos no mapa real que ficam só na diagonal: AC e AM, PA e TO, BA e GO, GO e MG, SP e RJ, SE e BA,
 * PE e AL. BA e MG ficam separados pelo DF.
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

/** Leads que chegaram sem UF preenchida: ficam fora do mapa e fora da distribuição entre as UFs. */
export const leadsWithoutUf = 1240;

export const data: readonly UfCoverage[] = [
  { uf: 'AC', name: 'Acre', leads: 0 },
  { uf: 'AL', name: 'Alagoas', leads: 50 },
  { uf: 'AP', name: 'Amapá', leads: null },
  { uf: 'AM', name: 'Amazonas', leads: 100 },
  { uf: 'BA', name: 'Bahia', leads: 310 },
  { uf: 'CE', name: 'Ceará', leads: 180 },
  { uf: 'DF', name: 'Distrito Federal', leads: 230 },
  { uf: 'ES', name: 'Espírito Santo', leads: 150 },
  { uf: 'GO', name: 'Goiás', leads: 260 },
  { uf: 'MA', name: 'Maranhão', leads: 80 },
  { uf: 'MT', name: 'Mato Grosso', leads: 140 },
  { uf: 'MS', name: 'Mato Grosso do Sul', leads: 110 },
  { uf: 'MG', name: 'Minas Gerais', leads: 610 },
  { uf: 'PA', name: 'Pará', leads: 90 },
  { uf: 'PB', name: 'Paraíba', leads: 70 },
  { uf: 'PR', name: 'Paraná', leads: 430 },
  { uf: 'PE', name: 'Pernambuco', leads: 190 },
  { uf: 'PI', name: 'Piauí', leads: 40 },
  { uf: 'RJ', name: 'Rio de Janeiro', leads: 520 },
  { uf: 'RN', name: 'Rio Grande do Norte', leads: 60 },
  { uf: 'RS', name: 'Rio Grande do Sul', leads: 380 },
  { uf: 'RO', name: 'Rondônia', leads: 30 },
  { uf: 'RR', name: 'Roraima', leads: null },
  { uf: 'SC', name: 'Santa Catarina', leads: 340 },
  { uf: 'SP', name: 'São Paulo', leads: 1280 },
  { uf: 'SE', name: 'Sergipe', leads: 0 },
  { uf: 'TO', name: 'Tocantins', leads: null },
];
