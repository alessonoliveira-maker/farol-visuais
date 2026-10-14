/**
 * Leads recebidos, leads qualificados e investimento em mídia paga por UF no terceiro trimestre de
 * 2026, em reais. Dado fictício e fixo. O dado declara contagem e valor: a taxa de qualificação
 * (qualificados sobre leads) e o CPL qualificado (investimento sobre leads qualificados) são
 * derivados no componente, para os dois números nunca divergirem do volume.
 * Casos: três UFs sem mídia paga (TO, RO e AP, `spend` nulo: o CPL não existe e nunca vale zero),
 * três UFs com menos de 30 leads (AC, RR e AP), uma UF nas duas situações (AP), empate em cima do
 * limite de um tercil (CE e RN com CPL de R$ 95; RN, SE e RR com taxa de 12,5%) e as nove
 * combinações de classe ocupadas, com uma só UF no canto alto e alto (DF).
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface UfMedia {
  readonly uf: UfCode;
  readonly name: string;
  readonly leads: number;
  readonly qualified: number;
  /** Investimento em mídia paga, em reais. `null` é UF sem mídia paga: o CPL não é medido. */
  readonly spend: number | null;
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

export const data: readonly UfMedia[] = [
  { uf: 'AC', name: 'Acre', leads: 27, qualified: 4, spend: 520 },
  { uf: 'AL', name: 'Alagoas', leads: 138, qualified: 15, spend: 2_775 },
  { uf: 'AP', name: 'Amapá', leads: 18, qualified: 2, spend: null },
  { uf: 'AM', name: 'Amazonas', leads: 210, qualified: 29, spend: 4_930 },
  { uf: 'BA', name: 'Bahia', leads: 640, qualified: 90, spend: 14_400 },
  { uf: 'CE', name: 'Ceará', leads: 420, qualified: 82, spend: 7_790 },
  { uf: 'DF', name: 'Distrito Federal', leads: 380, qualified: 91, spend: 15_288 },
  { uf: 'ES', name: 'Espírito Santo', leads: 260, qualified: 45, spend: 4_140 },
  { uf: 'GO', name: 'Goiás', leads: 450, qualified: 83, spend: 9_130 },
  { uf: 'MA', name: 'Maranhão', leads: 190, qualified: 19, spend: 4_028 },
  { uf: 'MT', name: 'Mato Grosso', leads: 300, qualified: 62, spend: 8_990 },
  { uf: 'MS', name: 'Mato Grosso do Sul', leads: 230, qualified: 52, spend: 4_420 },
  { uf: 'MG', name: 'Minas Gerais', leads: 1020, qualified: 172, spend: 20_640 },
  { uf: 'PA', name: 'Pará', leads: 280, qualified: 31, spend: 5_890 },
  { uf: 'PB', name: 'Paraíba', leads: 150, qualified: 18, spend: 1_980 },
  { uf: 'PR', name: 'Paraná', leads: 780, qualified: 168, spend: 13_440 },
  { uf: 'PE', name: 'Pernambuco', leads: 390, qualified: 58, spend: 8_700 },
  { uf: 'PI', name: 'Piauí', leads: 112, qualified: 10, spend: 2_240 },
  { uf: 'RJ', name: 'Rio de Janeiro', leads: 910, qualified: 150, spend: 22_500 },
  { uf: 'RN', name: 'Rio Grande do Norte', leads: 120, qualified: 15, spend: 1_425 },
  { uf: 'RS', name: 'Rio Grande do Sul', leads: 720, qualified: 151, spend: 13_590 },
  { uf: 'RO', name: 'Rondônia', leads: 88, qualified: 9, spend: null },
  { uf: 'RR', name: 'Roraima', leads: 24, qualified: 3, spend: 294 },
  { uf: 'SC', name: 'Santa Catarina', leads: 650, qualified: 148, spend: 11_100 },
  { uf: 'SP', name: 'São Paulo', leads: 1840, qualified: 386, spend: 38_600 },
  { uf: 'SE', name: 'Sergipe', leads: 104, qualified: 13, spend: 1_118 },
  { uf: 'TO', name: 'Tocantins', leads: 92, qualified: 10, spend: null },
];
