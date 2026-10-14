/**
 * Leads recebidos e qualificados por UF no segundo trimestre de 2026, contra a meta de qualificação.
 * Dado fictício e fixo; a taxa é derivada no componente a partir das contagens. Casos que o visual
 * precisa aguentar: 7 UFs acima da meta, MS exatamente na meta (18,0%, não conta como acima), três
 * UFs empatadas em 20,0% (ES, MT e RS), e um empate em 17,0% (BA e SP) que cruza o corte do ranking
 * das 10 maiores, desempatado pelo maior volume de leads.
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
 * Grade de 8 colunas por 6 linhas, a mesma do modelo, desenhada à mão para este catálogo. NÃO é a br_states_grid1 do
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

/** Meta de qualificação, em fração. Fictícia. */
export const QUALIFICATION_TARGET = 0.18;

/** UF acesa no ranking e no mapa quando o Farol não passa outra. */
export const highlightId: UfCode = 'PR';

export const data: readonly UfLeads[] = [
  { uf: 'AC', name: 'Acre', leads: 52, qualified: 6 },
  { uf: 'AL', name: 'Alagoas', leads: 130, qualified: 17 },
  { uf: 'AP', name: 'Amapá', leads: 40, qualified: 4 },
  { uf: 'AM', name: 'Amazonas', leads: 220, qualified: 34 },
  { uf: 'BA', name: 'Bahia', leads: 700, qualified: 119 },
  { uf: 'CE', name: 'Ceará', leads: 440, qualified: 82 },
  { uf: 'DF', name: 'Distrito Federal', leads: 400, qualified: 98 },
  { uf: 'ES', name: 'Espírito Santo', leads: 280, qualified: 56 },
  { uf: 'GO', name: 'Goiás', leads: 470, qualified: 82 },
  { uf: 'MA', name: 'Maranhão', leads: 200, qualified: 22 },
  { uf: 'MT', name: 'Mato Grosso', leads: 320, qualified: 64 },
  { uf: 'MS', name: 'Mato Grosso do Sul', leads: 250, qualified: 45 },
  { uf: 'MG', name: 'Minas Gerais', leads: 1050, qualified: 168 },
  { uf: 'PA', name: 'Pará', leads: 300, qualified: 36 },
  { uf: 'PB', name: 'Paraíba', leads: 160, qualified: 25 },
  { uf: 'PR', name: 'Paraná', leads: 800, qualified: 176 },
  { uf: 'PE', name: 'Pernambuco', leads: 410, qualified: 66 },
  { uf: 'PI', name: 'Piauí', leads: 100, qualified: 12 },
  { uf: 'RJ', name: 'Rio de Janeiro', leads: 930, qualified: 158 },
  { uf: 'RN', name: 'Rio Grande do Norte', leads: 125, qualified: 19 },
  { uf: 'RS', name: 'Rio Grande do Sul', leads: 740, qualified: 148 },
  { uf: 'RO', name: 'Rondônia', leads: 90, qualified: 10 },
  { uf: 'RR', name: 'Roraima', leads: 28, qualified: 3 },
  { uf: 'SC', name: 'Santa Catarina', leads: 670, qualified: 154 },
  { uf: 'SP', name: 'São Paulo', leads: 1900, qualified: 323 },
  { uf: 'SE', name: 'Sergipe', leads: 90, qualified: 11 },
  { uf: 'TO', name: 'Tocantins', leads: 76, qualified: 9 },
];
