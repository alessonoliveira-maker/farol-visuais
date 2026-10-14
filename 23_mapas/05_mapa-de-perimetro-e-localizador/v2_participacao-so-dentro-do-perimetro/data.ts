/**
 * Receita própria e mercado de referência de cada UF do perímetro de atuação, os dois em reais, no
 * mesmo período. O dado declara as duas parcelas e não a taxa: a participação de cada UF e a do
 * perímetro inteiro são derivadas no componente, para o percentual escrito no mapa nunca divergir
 * do par que a dica mostra. Só entram as UFs do perímetro: as outras 20 não são medidas e não têm
 * linha. Casos: nome longo (Rio Grande do Sul), receita pequena em mercado pequeno (Espírito Santo,
 * R$ 840 mil em R$ 40 mi), uma classe com uma UF só (Rio Grande do Sul) e a maior receita fora da
 * maior participação (São Paulo). Dado fictício e fixo: nenhuma empresa, marca ou cliente real.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface UfMarket {
  readonly uf: UfCode;
  readonly name: string;
  /** Receita própria na UF, em reais. */
  readonly revenue: number;
  /** Mercado de referência da UF, em reais. */
  readonly market: number;
}

export interface HexPosition {
  readonly row: number;
  readonly column: number;
}

/**
 * Malha de hexágonos de 6 linhas, a mesma do coroplético desta família: desenhada à mão, NÃO é o
 * contorno real das UFs nem a malha do IBGE. As linhas ímpares (1, 3 e 5) deslocam meia célula para
 * a direita. Regras adotadas: Norte no alto, litoral do Nordeste à direita, as cinco macrorregiões
 * contíguas. O Sul fica deitado na última linha, de oeste para leste (RS, SC, PR), ao lado de SP e
 * RJ, e MG e ES ficam logo acima: é o que faz o perímetro Sul e Sudeste sair como um bloco só.
 * Vizinhanças que a malha cria e o mapa não tem: MS e SC, DF e PR, DF e SP. Vizinhanças reais que
 * se perdem: MS e SP, MS e MG, GO e MG, ES e BA.
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

export const data: readonly UfMarket[] = [
  { uf: 'ES', name: 'Espírito Santo', revenue: 840_000, market: 40_000_000 },
  { uf: 'MG', name: 'Minas Gerais', revenue: 9_690_000, market: 180_000_000 },
  { uf: 'PR', name: 'Paraná', revenue: 16_520_000, market: 140_000_000 },
  { uf: 'RJ', name: 'Rio de Janeiro', revenue: 5_890_000, market: 190_000_000 },
  { uf: 'RS', name: 'Rio Grande do Sul', revenue: 12_480_000, market: 120_000_000 },
  { uf: 'SC', name: 'Santa Catarina', revenue: 13_860_000, market: 110_000_000 },
  { uf: 'SP', name: 'São Paulo', revenue: 36_920_000, market: 520_000_000 },
];
