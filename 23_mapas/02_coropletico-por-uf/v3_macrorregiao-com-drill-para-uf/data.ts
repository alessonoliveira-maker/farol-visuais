/**
 * Receita recorrente de 2026-09 por UF, em reais, com a base de clientes ativos e quantos deles têm
 * receita apurada no mês. Dado fictício e fixo. A receita média por cliente é derivada no componente
 * (receita sobre clientes com receita apurada), assim como o agregado de cada macrorregião, que é a
 * média ponderada das UFs e nunca a média das médias.
 * Casos: uma UF sem nenhum cliente com receita apurada (PI, 0 de 41: a média não existe e nunca
 * vale zero), uma UF de cobertura rasa (AL, 38 de 74), empate na posição nacional (MA e GO, as duas
 * com R$ 655) e nome longo na tabela (Rio Grande do Norte).
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export type Region = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

export interface RegionInfo {
  readonly id: Region;
  readonly label: string;
}

export interface UfRevenue {
  readonly uf: UfCode;
  readonly name: string;
  readonly region: Region;
  /** Clientes ativos na base. */
  readonly clients: number;
  /** Clientes com receita apurada no mês: é a cobertura do dado. Zero deixa a média sem valor. */
  readonly billedClients: number;
  /** Receita somada dos clientes com receita apurada, em reais. */
  readonly revenue: number;
}

export interface HexPosition {
  readonly row: number;
  readonly column: number;
}

export const REGIONS: readonly RegionInfo[] = [
  { id: 'norte', label: 'Norte' },
  { id: 'nordeste', label: 'Nordeste' },
  { id: 'centro-oeste', label: 'Centro-Oeste' },
  { id: 'sudeste', label: 'Sudeste' },
  { id: 'sul', label: 'Sul' },
];

/**
 * Região aberta no preview do catálogo. A visão padrão do componente é a de macrorregiões (`null`);
 * o catálogo abre a região líder porque o preview é um retrato parado e sem isso o drill não aparece.
 */
export const selectedRegion: Region | null = 'nordeste';

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

export const data: readonly UfRevenue[] = [
  { uf: 'AC', name: 'Acre', region: 'norte', clients: 38, billedClients: 24, revenue: 11_280 },
  { uf: 'AL', name: 'Alagoas', region: 'nordeste', clients: 74, billedClients: 38, revenue: 26_144 },
  { uf: 'AP', name: 'Amapá', region: 'norte', clients: 31, billedClients: 19, revenue: 8_588 },
  { uf: 'AM', name: 'Amazonas', region: 'norte', clients: 142, billedClients: 108, revenue: 63_720 },
  { uf: 'BA', name: 'Bahia', region: 'nordeste', clients: 412, billedClients: 350, revenue: 296_100 },
  { uf: 'CE', name: 'Ceará', region: 'nordeste', clients: 248, billedClients: 221, revenue: 193_154 },
  { uf: 'DF', name: 'Distrito Federal', region: 'centro-oeste', clients: 236, billedClients: 219, revenue: 177_828 },
  { uf: 'ES', name: 'Espírito Santo', region: 'sudeste', clients: 214, billedClients: 188, revenue: 125_584 },
  { uf: 'GO', name: 'Goiás', region: 'centro-oeste', clients: 318, billedClients: 274, revenue: 179_566 },
  { uf: 'MA', name: 'Maranhão', region: 'nordeste', clients: 132, billedClients: 97, revenue: 63_504 },
  { uf: 'MT', name: 'Mato Grosso', region: 'centro-oeste', clients: 226, billedClients: 190, revenue: 131_100 },
  { uf: 'MS', name: 'Mato Grosso do Sul', region: 'centro-oeste', clients: 164, billedClients: 139, revenue: 84_790 },
  { uf: 'MG', name: 'Minas Gerais', region: 'sudeste', clients: 820, billedClients: 731, revenue: 515_355 },
  { uf: 'PA', name: 'Pará', region: 'norte', clients: 188, billedClients: 131, revenue: 71_788 },
  { uf: 'PB', name: 'Paraíba', region: 'nordeste', clients: 88, billedClients: 61, revenue: 44_591 },
  { uf: 'PR', name: 'Paraná', region: 'sul', clients: 540, billedClients: 497, revenue: 364_798 },
  { uf: 'PE', name: 'Pernambuco', region: 'nordeste', clients: 276, billedClients: 243, revenue: 221_616 },
  { uf: 'PI', name: 'Piauí', region: 'nordeste', clients: 41, billedClients: 0, revenue: 0 },
  { uf: 'RJ', name: 'Rio de Janeiro', region: 'sudeste', clients: 690, billedClients: 628, revenue: 465_976 },
  { uf: 'RN', name: 'Rio Grande do Norte', region: 'nordeste', clients: 96, billedClients: 71, revenue: 56_232 },
  { uf: 'RS', name: 'Rio Grande do Sul', region: 'sul', clients: 512, billedClients: 461, revenue: 323_622 },
  { uf: 'RO', name: 'Rondônia', region: 'norte', clients: 66, billedClients: 49, revenue: 25_088 },
  { uf: 'RR', name: 'Roraima', region: 'norte', clients: 27, billedClients: 15, revenue: 6_465 },
  { uf: 'SC', name: 'Santa Catarina', region: 'sul', clients: 468, billedClients: 442, revenue: 336_362 },
  { uf: 'SP', name: 'São Paulo', region: 'sudeste', clients: 1480, billedClients: 1392, revenue: 1_110_816 },
  { uf: 'SE', name: 'Sergipe', region: 'nordeste', clients: 52, billedClients: 44, revenue: 26_576 },
  { uf: 'TO', name: 'Tocantins', region: 'norte', clients: 58, billedClients: 40, revenue: 19_800 },
];
