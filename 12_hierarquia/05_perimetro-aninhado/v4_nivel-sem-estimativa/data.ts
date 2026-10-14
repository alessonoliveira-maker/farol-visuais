/**
 * Perímetro de mercado aninhado em que um dos níveis não tem estimativa: o mercado total e a fatia
 * endereçável estão medidos, a participação está medida na base própria, e o alcançável, que é o
 * denominador natural da participação, nunca foi estimado. Valores em reais.
 * Dado fictício e fixo: nenhuma empresa, cliente ou região real.
 *
 * POR QUE O VALOR É OPCIONAL NO TIPO, e não um número combinado com zero ou com um chute central: dar
 * valor ao nível sem estimativa é a ausência virando número, que é a DAD-2, e ela chegaria ao desenho
 * como um quadrado de tamanho inventado. Sem valor, o nível não recebe lado: ele aparece por contorno
 * tracejado no limite que se conhece, e o percentual que dependia dele sai por `formatUnavailable()`.
 *
 * O QUE SE SABE DO NÍVEL AUSENTE, e é só isto: ele está contido no nível acima. Então o contorno
 * tracejado marca esse limite, não o tamanho do nível, e o texto ao lado diz que ali não há estimativa.
 * Os níveis medidos ficam no lado que o valor deles manda, sem redistribuir espaço para o vazio parecer
 * menor do que é.
 */
export type Provenance = 'medido' | 'derivado' | 'lacuna';

export interface PerimeterLevel {
  readonly id: string;
  readonly label: string;
  /** Ausente no nível sem estimativa: sem medição não há lado a desenhar. */
  readonly value?: number;
  readonly provenance: Provenance;
  /** De onde o número vem, ou o que falta nele, escrito ao lado da etiqueta. */
  readonly source: string;
}

export interface MissingLevelPerimeterData {
  /** Do mais amplo (índice 0, o mercado total) ao mais estreito (índice 3, a participação). */
  readonly levels: readonly [PerimeterLevel, PerimeterLevel, PerimeterLevel, PerimeterLevel];
  /** O que se sabe do nível sem estimativa, colado ao visual. */
  readonly boundNote: string;
  /** O que entra no perímetro e o que fica fora. */
  readonly perimeterNote: string;
}

export const data: MissingLevelPerimeterData = {
  levels: [
    { id: 'mercado-total', label: 'Mercado total', value: 120_000_000_000, provenance: 'medido', source: 'fonte pública' },
    { id: 'enderecavel', label: 'Endereçável', value: 18_000_000_000, provenance: 'derivado', source: 'do mercado total' },
    { id: 'alcancavel', label: 'Alcançável', provenance: 'lacuna', source: 'sem estimativa' },
    { id: 'participacao', label: 'Participação', value: 96_000_000, provenance: 'medido', source: 'base própria' },
  ],
  boundNote: 'Do alcançável só se sabe que cabe no endereçável, e o tracejado marca esse limite.',
  perimeterNote: 'Perímetro: patrimônio financeiro de família nas regiões com estrutura comercial própria.',
};
