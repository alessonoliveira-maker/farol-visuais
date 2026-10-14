/**
 * Perímetro de atuação vigente e a expansão proposta para 2027. Do perímetro vigente o dado traz as
 * UFs, a receita própria e o mercado de referência, em reais: a participação atual é MEDIDA e sai
 * derivada das duas parcelas no componente. Da expansão o dado traz as UFs que ela acrescenta, o
 * mercado de referência estimado delas, em reais, e a participação que o plano assume, em fração e
 * em faixa (piso e teto): é PREMISSA, por isso a taxa é declarada e a receita é que sai derivada.
 * Caso difícil: a faixa estimada fica inteira abaixo da participação atual, e o desenho não pode
 * deixar as duas lerem como o mesmo recorte. Dado fictício e fixo: nenhuma empresa, marca ou
 * cliente real; a geografia (as UFs do Brasil) é pública.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface HexPosition {
  readonly row: number;
  readonly column: number;
}

export interface CurrentPerimeter {
  readonly label: string;
  /** UFs do perímetro, em ordem alfabética de sigla. */
  readonly ufs: readonly UfCode[];
  /** Receita própria nas UFs do perímetro, em reais. */
  readonly revenue: number;
  /** Mercado de referência das mesmas UFs, em reais. */
  readonly market: number;
}

export interface ProposedExpansion {
  readonly label: string;
  /** UFs que a expansão acrescenta, em ordem alfabética de sigla. */
  readonly ufs: readonly UfCode[];
  /** Mercado de referência estimado das UFs novas, em reais. */
  readonly market: number;
  /** Piso e teto da participação que o plano assume nas UFs novas, em fração. */
  readonly shareLow: number;
  readonly shareHigh: number;
}

export interface PerimeterExpansionData {
  readonly current: CurrentPerimeter;
  readonly expansion: ProposedExpansion;
}

/**
 * Malha de hexágonos de 6 linhas, a mesma do coroplético desta família: desenhada à mão, NÃO é o
 * contorno real das UFs nem a malha do IBGE. As linhas ímpares (1, 3 e 5) deslocam meia célula para
 * a direita. Regras adotadas: Norte no alto, litoral do Nordeste à direita, as cinco macrorregiões
 * contíguas. O Sul fica deitado na última linha, de oeste para leste (RS, SC, PR), ao lado de SP e
 * RJ, com MG e ES logo acima; o Centro-Oeste (MT, GO, MS e DF) encosta nesse bloco por cima.
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

export const data: PerimeterExpansionData = {
  current: {
    label: 'Perímetro vigente',
    ufs: ['ES', 'MG', 'PR', 'RJ', 'RS', 'SC', 'SP'],
    revenue: 96_200_000,
    market: 1_300_000_000,
  },
  expansion: {
    label: 'Expansão proposta para 2027',
    ufs: ['DF', 'GO', 'MS', 'MT'],
    market: 280_000_000,
    shareLow: 0.051,
    shareHigh: 0.068,
  },
};
