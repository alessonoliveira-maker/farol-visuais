/**
 * Participação de mercado no perímetro de atuação, no mês de referência: receita própria e mercado
 * de referência das UFs do perímetro, os dois em reais. O dado declara as duas parcelas e não a
 * taxa, então o percentual do cartão é derivado no componente e nunca diverge do par escrito.
 * Traz também as UFs do perímetro e a data desde a qual ele vale. Dado fictício e fixo: nenhuma
 * empresa, marca ou cliente real; a geografia (as UFs do Brasil) é pública.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export type Provenance = 'medido' | 'derivado' | 'premissa' | 'lacuna';

export interface HexPosition {
  readonly row: number;
  readonly column: number;
}

export interface PerimeterShare {
  readonly label: string;
  /** Nome do perímetro como a diretoria o chama; entra na legenda escrita sob o número. */
  readonly perimeterName: string;
  /** UFs do perímetro, em ordem alfabética de sigla. */
  readonly perimeter: readonly UfCode[];
  /** Receita própria nas UFs do perímetro, em reais. */
  readonly revenue: number;
  /** Mercado de referência das mesmas UFs, em reais. */
  readonly market: number;
  /** Data desde a qual o perímetro vale, `YYYY-MM-DD`. */
  readonly validSince: string;
  /** Mês de referência das duas parcelas, `YYYY-MM`. */
  readonly referenceMonth: string;
  readonly provenance: Provenance;
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

export const data: PerimeterShare = {
  label: 'Participação de mercado',
  perimeterName: 'Sul e Sudeste',
  perimeter: ['ES', 'MG', 'PR', 'RJ', 'RS', 'SC', 'SP'],
  revenue: 96_200_000,
  market: 1_300_000_000,
  validSince: '2026-03-01',
  referenceMonth: '2026-06',
  provenance: 'derivado',
};
