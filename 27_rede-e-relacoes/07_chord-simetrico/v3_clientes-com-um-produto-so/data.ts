/**
 * Clientes por par de produtos e clientes com um produto só, em contagem de clientes. Dado
 * fictício e fixo: nenhum produto, cliente ou empresa é real. Cada par aparece UMA vez em `data`
 * ("A com B" é "B com A"), e a linha com `a` igual a `b` é a diagonal da matriz: clientes que
 * têm só aquele produto, sem outro. O par ausente é zero medido. `groups` fixa a ordem de leitura
 * da roda e o slot de cor (COR-8: 1, 3, 6, 5, 2, 4).
 */
export interface ProductGroup {
  readonly id: string;
  /** Nome de tela, com maiúscula inicial. */
  readonly label: string;
  /** Forma para dentro de frase, sem maiúscula no meio da oração. */
  readonly plain: string;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ProductPair {
  readonly a: string;
  readonly b: string;
  readonly count: number;
}

export const groups: readonly ProductGroup[] = [
  { id: 'consorcio', label: 'Consórcio', plain: 'consórcio', slot: 1 },
  { id: 'seguro', label: 'Seguro auto', plain: 'seguro auto', slot: 3 },
  { id: 'credito', label: 'Crédito estruturado', plain: 'crédito estruturado', slot: 6 },
  { id: 'financiamento', label: 'Financiamento', plain: 'financiamento', slot: 5 },
  { id: 'cartao', label: 'Cartão', plain: 'cartão', slot: 2 },
  { id: 'previdencia', label: 'Previdência', plain: 'previdência', slot: 4 },
];

/**
 * Previdência não tem nenhum par: só a diagonal (74), e o arco dela é todo da faixa neutra.
 * Crédito estruturado tem a menor diagonal (22), o caso de valor pequeno ao lado de arcos grandes.
 */
export const data: readonly ProductPair[] = [
  { a: 'consorcio', b: 'consorcio', count: 140 },
  { a: 'seguro', b: 'seguro', count: 95 },
  { a: 'credito', b: 'credito', count: 22 },
  { a: 'financiamento', b: 'financiamento', count: 60 },
  { a: 'cartao', b: 'cartao', count: 85 },
  { a: 'previdencia', b: 'previdencia', count: 74 },
  { a: 'consorcio', b: 'seguro', count: 80 },
  { a: 'consorcio', b: 'credito', count: 40 },
  { a: 'consorcio', b: 'financiamento', count: 70 },
  { a: 'consorcio', b: 'cartao', count: 25 },
  { a: 'seguro', b: 'financiamento', count: 38 },
  { a: 'seguro', b: 'cartao', count: 52 },
  { a: 'credito', b: 'financiamento', count: 56 },
  { a: 'financiamento', b: 'cartao', count: 33 },
];
