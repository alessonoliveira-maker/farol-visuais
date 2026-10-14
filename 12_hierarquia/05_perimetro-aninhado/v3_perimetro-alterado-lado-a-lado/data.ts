/**
 * Perímetro de mercado aninhado medido de duas formas: o perímetro atual e o perímetro novo, que passa
 * a incluir outra região. Cada nível é um subconjunto do nível acima, e cada um traz o valor nos dois
 * recortes, em reais, mais a procedência do número.
 * Dado fictício e fixo: nenhuma empresa, cliente ou região real.
 *
 * O PONTO DA VERSÃO, e por isso a participação repete o mesmo valor nas duas colunas: a venda não
 * mudou. Só o denominador mudou, e a participação cai de 4,0% para 3,0% sem uma única venda a menos.
 * Quem lê o percentual sozinho conclui piora de desempenho; quem lê os dois quadros vê mudança de
 * régua. É o caso em que o número derivado se move porque a definição se moveu.
 *
 * POR QUE A PROCEDÊNCIA É POR NÍVEL, e não uma etiqueta só do cartão: a cascata mistura graus de
 * confiança bem diferentes. O mercado total vem de estatística publicada, o endereçável é conta feita
 * sobre ele, o alcançável é premissa de cobertura comercial e a participação é a única linha medida na
 * própria base. A etiqueta do `VisualCard` diria um grau só para as quatro (ANO-6), e o grau único
 * seria o mais fraco da cascata ou, pior, o mais forte.
 *
 * "medido" aparece em dois níveis, com fontes diferentes escritas ao lado, porque o Farol não tem
 * token de procedência para "fonte pública": estatística publicada e medição na própria base têm o
 * mesmo grau de confiança, e o que as separa é a fonte, que vai escrita.
 */
export type Provenance = 'medido' | 'derivado' | 'premissa';

export interface PerimeterLevel {
  readonly id: string;
  readonly label: string;
  /** Valor no perímetro atual e no perímetro novo, em reais. */
  readonly before: number;
  readonly after: number;
  readonly provenance: Provenance;
  /** De onde o número vem, escrito ao lado da etiqueta: "fonte pública", "base própria". */
  readonly source: string;
}

export interface PerimeterChangeData {
  /** Do mais amplo (índice 0, o mercado total) ao mais estreito (índice 3, a participação). */
  readonly levels: readonly [PerimeterLevel, PerimeterLevel, PerimeterLevel, PerimeterLevel];
  readonly beforeLabel: string;
  readonly afterLabel: string;
  /** O que passou a entrar no perímetro, e o que não mudou, colado ao visual. */
  readonly changeNote: string;
}

export const data: PerimeterChangeData = {
  levels: [
    {
      id: 'mercado-total',
      label: 'Mercado total',
      before: 120_000_000_000,
      after: 138_000_000_000,
      provenance: 'medido',
      source: 'fonte pública',
    },
    {
      id: 'enderecavel',
      label: 'Endereçável',
      before: 18_000_000_000,
      after: 24_000_000_000,
      provenance: 'derivado',
      source: 'do mercado total',
    },
    {
      id: 'alcancavel',
      label: 'Alcançável',
      before: 2_400_000_000,
      after: 3_200_000_000,
      provenance: 'premissa',
      source: 'cobertura comercial',
    },
    {
      id: 'participacao',
      label: 'Participação',
      before: 96_000_000,
      after: 96_000_000,
      provenance: 'medido',
      source: 'base própria',
    },
  ],
  beforeLabel: 'perímetro atual',
  afterLabel: 'perímetro novo',
  changeNote: 'Passou a entrar uma região vizinha, com estrutura comercial já instalada. Nada saiu do perímetro.',
};
