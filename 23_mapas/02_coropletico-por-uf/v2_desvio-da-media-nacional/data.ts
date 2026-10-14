/**
 * Leads recebidos e leads qualificados por UF em 2026. Dado fictício e fixo. O dado declara
 * contagem: a taxa de cada UF e a média nacional (1.798 qualificados em 10.945 leads, 16,4%) são
 * derivadas no componente, e o desvio é a diferença entre as duas, em pontos percentuais.
 * Casos: uma UF exatamente na média (MG, desvio 0,0 e sem sinal), dois desvios em cima do limite
 * de classe (SP com −2,0 e PA com −5,0), o maior desvio para cima (DF, +7,5) maior que o maior
 * para baixo (RR, −7,1) e pares com o mesmo desvio escrito (PI e AP, PB e RN).
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

export interface HexPosition {
  readonly row: number;
  readonly column: number;
}

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
  { uf: 'AC', name: 'Acre', leads: 110, qualified: 17 },
  { uf: 'AL', name: 'Alagoas', leads: 140, qualified: 17 },
  { uf: 'AP', name: 'Amapá', leads: 90, qualified: 9 },
  { uf: 'AM', name: 'Amazonas', leads: 220, qualified: 31 },
  { uf: 'BA', name: 'Bahia', leads: 650, qualified: 94 },
  { uf: 'CE', name: 'Ceará', leads: 430, qualified: 78 },
  { uf: 'DF', name: 'Distrito Federal', leads: 380, qualified: 91 },
  { uf: 'ES', name: 'Espírito Santo', leads: 250, qualified: 44 },
  { uf: 'GO', name: 'Goiás', leads: 460, qualified: 85 },
  { uf: 'MA', name: 'Maranhão', leads: 200, qualified: 21 },
  { uf: 'MT', name: 'Mato Grosso', leads: 310, qualified: 64 },
  { uf: 'MS', name: 'Mato Grosso do Sul', leads: 240, qualified: 45 },
  { uf: 'MG', name: 'Minas Gerais', leads: 1040, qualified: 171 },
  { uf: 'PA', name: 'Pará', leads: 290, qualified: 33 },
  { uf: 'PB', name: 'Paraíba', leads: 160, qualified: 27 },
  { uf: 'PR', name: 'Paraná', leads: 790, qualified: 146 },
  { uf: 'PE', name: 'Pernambuco', leads: 400, qualified: 60 },
  { uf: 'PI', name: 'Piauí', leads: 120, qualified: 12 },
  { uf: 'RJ', name: 'Rio de Janeiro', leads: 900, qualified: 133 },
  { uf: 'RN', name: 'Rio Grande do Norte', leads: 130, qualified: 22 },
  { uf: 'RS', name: 'Rio Grande do Sul', leads: 730, qualified: 137 },
  { uf: 'RO', name: 'Rondônia', leads: 100, qualified: 13 },
  { uf: 'RR', name: 'Roraima', leads: 75, qualified: 7 },
  { uf: 'SC', name: 'Santa Catarina', leads: 660, qualified: 142 },
  { uf: 'SP', name: 'São Paulo', leads: 1860, qualified: 268 },
  { uf: 'SE', name: 'Sergipe', leads: 110, qualified: 19 },
  { uf: 'TO', name: 'Tocantins', leads: 100, qualified: 12 },
];
