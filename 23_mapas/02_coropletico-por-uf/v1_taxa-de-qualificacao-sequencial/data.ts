/**
 * Leads recebidos e leads qualificados por UF em 2026, com a UF identificada pelo código do IBGE,
 * que é como a linha chega da base. Dado fictício e fixo. O dado declara contagem, não taxa: a taxa
 * é derivada no componente, para o percentual do mapa e o volume da lista nunca divergirem.
 * Casos: empate exato na fronteira de um quantil (TO com 10 de 92 e AL com 15 de 138, os dois 5 em
 * 46), três UFs com a mesma taxa dentro de uma classe (AC, RN e SE em 12,5%), taxa de um dígito
 * (RR) e nome longo entre as cinco maiores taxas (Mato Grosso do Sul).
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface UfLeads {
  /** Código do IBGE da UF (35 é São Paulo). É a chave do casamento com o mapa. */
  readonly ibge: number;
  readonly leads: number;
  readonly qualified: number;
}

export interface UfInfo {
  readonly uf: UfCode;
  readonly name: string;
}

export interface HexPosition {
  readonly row: number;
  readonly column: number;
}

/** Tabela de código do IBGE para sigla e nome. Linha com código fora dela não entra no mapa. */
export const IBGE_TO_UF: Readonly<Record<number, UfInfo>> = {
  11: { uf: 'RO', name: 'Rondônia' },
  12: { uf: 'AC', name: 'Acre' },
  13: { uf: 'AM', name: 'Amazonas' },
  14: { uf: 'RR', name: 'Roraima' },
  15: { uf: 'PA', name: 'Pará' },
  16: { uf: 'AP', name: 'Amapá' },
  17: { uf: 'TO', name: 'Tocantins' },
  21: { uf: 'MA', name: 'Maranhão' },
  22: { uf: 'PI', name: 'Piauí' },
  23: { uf: 'CE', name: 'Ceará' },
  24: { uf: 'RN', name: 'Rio Grande do Norte' },
  25: { uf: 'PB', name: 'Paraíba' },
  26: { uf: 'PE', name: 'Pernambuco' },
  27: { uf: 'AL', name: 'Alagoas' },
  28: { uf: 'SE', name: 'Sergipe' },
  29: { uf: 'BA', name: 'Bahia' },
  31: { uf: 'MG', name: 'Minas Gerais' },
  32: { uf: 'ES', name: 'Espírito Santo' },
  33: { uf: 'RJ', name: 'Rio de Janeiro' },
  35: { uf: 'SP', name: 'São Paulo' },
  41: { uf: 'PR', name: 'Paraná' },
  42: { uf: 'SC', name: 'Santa Catarina' },
  43: { uf: 'RS', name: 'Rio Grande do Sul' },
  50: { uf: 'MS', name: 'Mato Grosso do Sul' },
  51: { uf: 'MT', name: 'Mato Grosso' },
  52: { uf: 'GO', name: 'Goiás' },
  53: { uf: 'DF', name: 'Distrito Federal' },
};

/**
 * Malha de hexágonos de 6 linhas, desenhada à mão para este modelo: NÃO é o contorno real das UFs
 * nem uma grade pública verificada. As linhas ímpares (1, 3 e 5) deslocam meia célula para a
 * direita. Regras adotadas: Norte no alto, litoral do Nordeste à direita, as cinco macrorregiões
 * contíguas e TO encostado em PA, MA, PI, MT e GO. O Sul fica deitado na última linha, de oeste
 * para leste (RS, SC, PR), porque a malha tem só 6 linhas. Vizinhanças reais que se perdem: TO e
 * BA, SE e BA, ES e BA, MT e PA, MT e AM, GO e MG, MS e SP, MS e MG, CE e PB. Vizinhanças que a
 * malha cria e o mapa não tem: AP e MA, PA e RO, TO e RO, MA e CE, RN e PE, PI e GO, PB e AL,
 * PB e SE, BA e DF, AL e MG, AL e ES, SE e ES, MS e SC, MS e DF, DF e PR, DF e SP.
 */
export const HEX_GRID: Readonly<Record<UfCode, HexPosition>> = {
  RR: { row: 1, column: 2 }, AP: { row: 1, column: 3 },
  AM: { row: 2, column: 2 }, PA: { row: 2, column: 3 }, MA: { row: 2, column: 4 },
  CE: { row: 2, column: 5 }, RN: { row: 2, column: 6 },
  AC: { row: 3, column: 1 }, RO: { row: 3, column: 2 }, TO: { row: 3, column: 3 },
  PI: { row: 3, column: 4 }, PE: { row: 3, column: 5 }, PB: { row: 3, column: 6 },
  MT: { row: 4, column: 3 }, GO: { row: 4, column: 4 }, BA: { row: 4, column: 5 },
  AL: { row: 4, column: 6 }, SE: { row: 4, column: 7 },
  MS: { row: 5, column: 3 }, DF: { row: 5, column: 4 }, MG: { row: 5, column: 5 },
  ES: { row: 5, column: 6 },
  RS: { row: 6, column: 2 }, SC: { row: 6, column: 3 }, PR: { row: 6, column: 4 },
  SP: { row: 6, column: 5 }, RJ: { row: 6, column: 6 },
};

export const data: readonly UfLeads[] = [
  { ibge: 11, leads: 88, qualified: 8 },
  { ibge: 12, leads: 96, qualified: 12 },
  { ibge: 13, leads: 210, qualified: 29 },
  { ibge: 14, leads: 80, qualified: 5 },
  { ibge: 15, leads: 280, qualified: 31 },
  { ibge: 16, leads: 84, qualified: 7 },
  { ibge: 17, leads: 92, qualified: 10 },
  { ibge: 21, leads: 190, qualified: 19 },
  { ibge: 22, leads: 112, qualified: 10 },
  { ibge: 23, leads: 420, qualified: 82 },
  { ibge: 24, leads: 120, qualified: 15 },
  { ibge: 25, leads: 150, qualified: 22 },
  { ibge: 26, leads: 390, qualified: 62 },
  { ibge: 27, leads: 138, qualified: 15 },
  { ibge: 28, leads: 104, qualified: 13 },
  { ibge: 29, leads: 640, qualified: 102 },
  { ibge: 31, leads: 1020, qualified: 172 },
  { ibge: 32, leads: 260, qualified: 51 },
  { ibge: 33, leads: 910, qualified: 164 },
  { ibge: 35, leads: 1840, qualified: 395 },
  { ibge: 41, leads: 780, qualified: 170 },
  { ibge: 42, leads: 650, qualified: 148 },
  { ibge: 43, leads: 720, qualified: 151 },
  { ibge: 50, leads: 230, qualified: 52 },
  { ibge: 51, leads: 300, qualified: 62 },
  { ibge: 52, leads: 450, qualified: 83 },
  { ibge: 53, leads: 380, qualified: 91 },
];
