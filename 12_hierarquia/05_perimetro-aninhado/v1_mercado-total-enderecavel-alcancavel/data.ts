/**
 * Perímetro de mercado aninhado, do mais amplo ao mais estreito: mercado total elegível, fatia
 * endereçável pela operação, fatia alcançável no ano corrente e participação já conquistada
 * dentro dela. Cada nível é um subconjunto do nível anterior; o lado do quadrado de cada nível é
 * proporcional à raiz quadrada do valor, para a área comparar de verdade (regra transversal 7 da
 * família 12). Valores em reais. Dado fictício e fixo: nenhuma empresa ou cliente real.
 */
export interface PerimeterLevel {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

export interface NestedPerimeterData {
  /** Do mais amplo (índice 0, o mercado total) ao mais estreito (índice 3, a participação). */
  readonly levels: readonly [PerimeterLevel, PerimeterLevel, PerimeterLevel, PerimeterLevel];
  /** O que entra no perímetro e o que fica fora, para ficar colado ao visual. */
  readonly perimeterNote: string;
}

export const data: NestedPerimeterData = {
  levels: [
    { id: 'mercado-total', label: 'Mercado total', value: 120_000_000_000 },
    { id: 'enderecavel', label: 'Endereçável', value: 18_000_000_000 },
    { id: 'alcancavel', label: 'Alcançável', value: 2_400_000_000 },
    { id: 'participacao', label: 'Participação', value: 96_000_000 },
  ],
  perimeterNote:
    'Perímetro: patrimônio financeiro líquido de família, nas praças com estrutura comercial própria. Fica fora: patrimônio imobiliário e praças ainda sem estrutura comercial.',
};
