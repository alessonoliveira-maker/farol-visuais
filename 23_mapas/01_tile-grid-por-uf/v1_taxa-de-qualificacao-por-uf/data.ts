/**
 * Leads recebidos e leads qualificados por UF no primeiro semestre de 2026. Dado fictício e fixo.
 * O dado declara contagem, não taxa: a taxa é derivada no componente, para que o percentual escrito
 * no tile e o volume da dica nunca possam divergir. Há um empate exato (AC e RN em 12,5%), três UFs
 * com menos de 50 leads (RR, AP e AC) e uma UF com taxa de um dígito e amostra de 24 leads (RR).
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface UfLeads {
  readonly uf: UfCode;
  readonly name: string;
  readonly leads: number;
  readonly qualified: number;
}

export interface GridPosition {
  readonly row: number;
  readonly column: number;
}

/**
 * Grade de 8 colunas por 6 linhas, desenhada à mão para este catálogo. NÃO é a br_states_grid1 do
 * geofacet: o arquivo público não foi verificado (README do catálogo, Lacunas conhecidas), então a
 * vizinhança abaixo é a adotada aqui, declarada para quem revisar com o painel. Regras adotadas:
 * Norte no alto e Sul na base; o litoral do Nordeste na coluna da direita, de RN a AL; DF encostado
 * em GO e em MG; MS entre MT e PR; ES à direita de MG e RJ abaixo de MG. Pares vizinhos no mapa real
 * que ficam só na diagonal: AC e AM, PA e TO, BA e GO, GO e MG, SP e RJ, SE e BA, PE e AL. BA e MG
 * ficam separados pelo DF, a perda de adjacência mais visível da grade.
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

export const data: readonly UfLeads[] = [
  { uf: 'AC', name: 'Acre', leads: 48, qualified: 6 },
  { uf: 'AL', name: 'Alagoas', leads: 118, qualified: 14 },
  { uf: 'AP', name: 'Amapá', leads: 36, qualified: 3 },
  { uf: 'AM', name: 'Amazonas', leads: 210, qualified: 29 },
  { uf: 'BA', name: 'Bahia', leads: 640, qualified: 102 },
  { uf: 'CE', name: 'Ceará', leads: 420, qualified: 76 },
  { uf: 'DF', name: 'Distrito Federal', leads: 380, qualified: 91 },
  { uf: 'ES', name: 'Espírito Santo', leads: 260, qualified: 51 },
  { uf: 'GO', name: 'Goiás', leads: 450, qualified: 83 },
  { uf: 'MA', name: 'Maranhão', leads: 190, qualified: 21 },
  { uf: 'MT', name: 'Mato Grosso', leads: 300, qualified: 62 },
  { uf: 'MS', name: 'Mato Grosso do Sul', leads: 230, qualified: 41 },
  { uf: 'MG', name: 'Minas Gerais', leads: 1020, qualified: 163 },
  { uf: 'PA', name: 'Pará', leads: 280, qualified: 31 },
  { uf: 'PB', name: 'Paraíba', leads: 150, qualified: 22 },
  { uf: 'PR', name: 'Paraná', leads: 780, qualified: 168 },
  { uf: 'PE', name: 'Pernambuco', leads: 390, qualified: 62 },
  { uf: 'PI', name: 'Piauí', leads: 96, qualified: 9 },
  { uf: 'RJ', name: 'Rio de Janeiro', leads: 910, qualified: 164 },
  { uf: 'RN', name: 'Rio Grande do Norte', leads: 120, qualified: 15 },
  { uf: 'RS', name: 'Rio Grande do Sul', leads: 720, qualified: 151 },
  { uf: 'RO', name: 'Rondônia', leads: 88, qualified: 8 },
  { uf: 'RR', name: 'Roraima', leads: 24, qualified: 1 },
  { uf: 'SC', name: 'Santa Catarina', leads: 650, qualified: 148 },
  { uf: 'SP', name: 'São Paulo', leads: 1840, qualified: 395 },
  { uf: 'SE', name: 'Sergipe', leads: 84, qualified: 10 },
  { uf: 'TO', name: 'Tocantins', leads: 72, qualified: 8 },
];
