/**
 * Equipes internas que já dividiram oportunidades em 2026. Cada par de `pairs` teve pelo menos uma
 * oportunidade trabalhada pelas duas equipes no ano; a relação não tem direção nem peso, só
 * existência, e é por isso que o desenho usa linha de espessura única. Unidade da contagem ao lado
 * do nome: equipes parceiras. Dado fictício e fixo: as equipes são código de categoria e letra, e
 * nenhuma é equipe, pessoa ou empresa real.
 *
 * Equipe sem nenhum par é zero medido, não falta de dado: o registro de oportunidades cobre as 16
 * equipes. A ordem das equipes é a de cadastro; quem ordena por categoria e grau é o componente.
 * Casos difíceis: três equipes isoladas (Vendas F, Pós-venda D e Pós-venda E), duas delas vizinhas
 * na volta; quatro equipes com uma parceira só, para o singular; e dois empates de grau na mesma
 * categoria (Vendas B e Vendas C, Pós-venda A e Pós-venda B), desfeitos pelo nome.
 */
export interface TeamCategory {
  readonly id: string;
  readonly label: string;
}

export interface Team {
  readonly id: string;
  /** Nome próprio da equipe: categoria e letra. */
  readonly label: string;
  /** `id` de uma categoria de `categories`. */
  readonly category: string;
}

export interface SharedPair {
  readonly a: string;
  readonly b: string;
}

export interface TeamNetwork {
  /** Ano do recorte, em `YYYY`. */
  readonly year: string;
  /** Ordem das categorias na volta: a do processo comercial, em sentido horário. */
  readonly categories: readonly TeamCategory[];
  readonly teams: readonly Team[];
  readonly pairs: readonly SharedPair[];
}

export const data: TeamNetwork = {
  year: '2026',
  categories: [
    { id: 'pre-vendas', label: 'Pré-vendas' },
    { id: 'vendas', label: 'Vendas' },
    { id: 'pos-venda', label: 'Pós-venda' },
  ],
  teams: [
    { id: 'v-a', label: 'Vendas A', category: 'vendas' },
    { id: 'v-b', label: 'Vendas B', category: 'vendas' },
    { id: 'v-c', label: 'Vendas C', category: 'vendas' },
    { id: 'v-d', label: 'Vendas D', category: 'vendas' },
    { id: 'v-e', label: 'Vendas E', category: 'vendas' },
    { id: 'v-f', label: 'Vendas F', category: 'vendas' },
    { id: 'p-a', label: 'Pré-vendas A', category: 'pre-vendas' },
    { id: 'p-b', label: 'Pré-vendas B', category: 'pre-vendas' },
    { id: 'p-c', label: 'Pré-vendas C', category: 'pre-vendas' },
    { id: 'p-d', label: 'Pré-vendas D', category: 'pre-vendas' },
    { id: 'p-e', label: 'Pré-vendas E', category: 'pre-vendas' },
    { id: 's-a', label: 'Pós-venda A', category: 'pos-venda' },
    { id: 's-b', label: 'Pós-venda B', category: 'pos-venda' },
    { id: 's-c', label: 'Pós-venda C', category: 'pos-venda' },
    { id: 's-d', label: 'Pós-venda D', category: 'pos-venda' },
    { id: 's-e', label: 'Pós-venda E', category: 'pos-venda' },
  ],
  pairs: [
    { a: 'p-a', b: 'v-a' },
    { a: 'p-a', b: 'v-b' },
    { a: 'p-a', b: 'v-c' },
    { a: 'p-a', b: 'p-b' },
    { a: 'p-b', b: 'v-a' },
    { a: 'p-b', b: 'v-d' },
    { a: 'p-c', b: 'v-b' },
    { a: 'p-c', b: 'v-e' },
    { a: 'p-d', b: 'v-c' },
    { a: 'p-e', b: 'v-a' },
    { a: 'v-a', b: 'v-b' },
    { a: 'v-c', b: 'v-d' },
    { a: 'v-a', b: 's-a' },
    { a: 'v-a', b: 's-b' },
    { a: 'v-b', b: 's-a' },
    { a: 'v-c', b: 's-c' },
    { a: 'v-d', b: 's-b' },
    { a: 's-a', b: 's-b' },
  ],
};
