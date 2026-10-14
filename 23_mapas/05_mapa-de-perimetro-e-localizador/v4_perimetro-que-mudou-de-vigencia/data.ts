/**
 * Perímetro de atuação antes e depois de uma mudança de vigência: as UFs de cada perímetro, a
 * receita própria e o mercado de referência de cada um, em reais, e a data em que o vigente passou
 * a valer. Para as UFs que mudaram de lado o dado traz as duas parcelas em cada perímetro, ou
 * `null` onde não houve medição: a UF que entrou não era medida antes, e a que saiu deixou de ser
 * medida depois. O dado declara parcelas e não taxas; as participações são derivadas no componente.
 * Caso difícil: o perímetro anterior e o vigente têm o mesmo número de UFs e uma só troca (sai uma
 * UF de participação alta, entra uma de participação baixa), o que derruba a participação do
 * perímetro sem que a operação tenha piorado em UF nenhuma. Dado fictício e fixo: nenhuma empresa,
 * marca ou cliente real; a geografia (as UFs do Brasil) é pública.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export type PerimeterId = 'current' | 'previous';

export interface HexPosition {
  readonly row: number;
  readonly column: number;
}

/** As duas parcelas de uma participação, em reais. */
export interface SharePair {
  readonly revenue: number;
  readonly market: number;
}

export interface PerimeterVersion extends SharePair {
  /** UFs do perímetro, em ordem alfabética de sigla. */
  readonly ufs: readonly UfCode[];
}

/** UF que entrou ou saiu: o nome por extenso e a medição em cada perímetro, `null` onde não houve. */
export interface ChangedUf {
  readonly uf: UfCode;
  readonly name: string;
  readonly previous: SharePair | null;
  readonly current: SharePair | null;
}

export interface PerimeterChangeData {
  /** Data em que o perímetro vigente passou a valer, `YYYY-MM-DD`. */
  readonly changedOn: string;
  readonly previous: PerimeterVersion;
  readonly current: PerimeterVersion;
  readonly changed: readonly ChangedUf[];
}

/**
 * Malha de hexágonos de 6 linhas, a mesma do coroplético desta família: desenhada à mão, NÃO é o
 * contorno real das UFs nem a malha do IBGE. As linhas ímpares (1, 3 e 5) deslocam meia célula para
 * a direita. Regras adotadas: Norte no alto, litoral do Nordeste à direita, as cinco macrorregiões
 * contíguas. O Sul fica deitado na última linha, de oeste para leste (RS, SC, PR), ao lado de SP e
 * RJ, com MG e ES logo acima e MS encostado em PR.
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

export const data: PerimeterChangeData = {
  changedOn: '2026-03-01',
  previous: {
    ufs: ['MG', 'MS', 'PR', 'RJ', 'RS', 'SC', 'SP'],
    revenue: 115_660_000,
    market: 1_400_000_000,
  },
  current: {
    ufs: ['ES', 'MG', 'PR', 'RJ', 'RS', 'SC', 'SP'],
    revenue: 96_200_000,
    market: 1_300_000_000,
  },
  changed: [
    { uf: 'ES', name: 'Espírito Santo', previous: null, current: { revenue: 840_000, market: 40_000_000 } },
    { uf: 'MS', name: 'Mato Grosso do Sul', previous: { revenue: 20_300_000, market: 140_000_000 }, current: null },
  ],
};
