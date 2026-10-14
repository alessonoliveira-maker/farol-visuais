/**
 * Perímetro de mercado aninhado, do mais amplo ao mais estreito, com a meta de participação sobre o
 * nível alcançável. Os quatro níveis são os mesmos da `v1`, para que as duas versões falem do mesmo
 * cenário: mercado total elegível, fatia endereçável pela operação, fatia alcançável no ano corrente
 * e participação já conquistada dentro dela. Valores em reais; a meta em fração do alcançável.
 * Dado fictício e fixo: nenhuma empresa ou cliente real.
 *
 * POR QUE A META VEM EM FRAÇÃO, e não em reais: a meta é de PARTICIPAÇÃO, então ela se move com o
 * denominador. Guardá-la em reais congelaria o valor de hoje e a distância deixaria de fechar no dia
 * em que o alcançável mudasse de tamanho, que é justamente o assunto da `v3`.
 */
export interface PerimeterLevel {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

export interface ZoomPerimeterData {
  /** Do mais amplo (índice 0, o mercado total) ao mais estreito (índice 3, a participação). */
  readonly levels: readonly [PerimeterLevel, PerimeterLevel, PerimeterLevel, PerimeterLevel];
  /** Meta de participação sobre o nível alcançável, em fração: 0,06 são 6% dele. */
  readonly targetShare: number;
  /** O que entra no perímetro e o que fica fora, para ficar colado ao visual. */
  readonly perimeterNote: string;
}

export const data: ZoomPerimeterData = {
  levels: [
    { id: 'mercado-total', label: 'Mercado total', value: 120_000_000_000 },
    { id: 'enderecavel', label: 'Endereçável', value: 18_000_000_000 },
    { id: 'alcancavel', label: 'Alcançável', value: 2_400_000_000 },
    { id: 'participacao', label: 'Participação', value: 96_000_000 },
  ],
  targetShare: 0.06,
  perimeterNote: 'Perímetro: patrimônio financeiro líquido de família nas regiões com estrutura comercial própria.',
};
