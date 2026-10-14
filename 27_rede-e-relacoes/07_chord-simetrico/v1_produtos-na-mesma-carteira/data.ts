/**
 * Clientes que têm dois produtos ao mesmo tempo na carteira, em contagem de clientes, por par de
 * produtos da oferta. Dado fictício e fixo: nenhum produto, cliente ou empresa é real. A relação é
 * simétrica: cada par aparece UMA vez em `data`, e "A com B" é o mesmo que "B com A". O par
 * ausente é zero medido (nenhum cliente com os dois). `groups` fixa a ordem de leitura da roda e o
 * slot de cor (COR-8: 1, 3, 6, 5, 2, 4); o sétimo produto é o agrupamento neutro "Outros".
 */
export interface ProductGroup {
  readonly id: string;
  /** Nome de tela, com maiúscula inicial. */
  readonly label: string;
  /** Forma para dentro de frase, sem maiúscula no meio da oração. */
  readonly plain: string;
  /** Slot da paleta categórica; null é o agrupamento neutro. */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6 | null;
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
  { id: 'conta', label: 'Conta digital', plain: 'conta digital', slot: 2 },
  { id: 'cartao', label: 'Cartão', plain: 'cartão', slot: 4 },
  { id: 'outros', label: 'Outros', plain: 'outros produtos', slot: null },
];

/** 20 dos 21 pares possíveis: crédito estruturado com outros é o menor (3), e o par ausente não existe. */
export const data: readonly ProductPair[] = [
  { a: 'consorcio', b: 'seguro', count: 120 },
  { a: 'consorcio', b: 'credito', count: 64 },
  { a: 'consorcio', b: 'financiamento', count: 88 },
  { a: 'consorcio', b: 'conta', count: 30 },
  { a: 'consorcio', b: 'cartao', count: 22 },
  { a: 'consorcio', b: 'outros', count: 9 },
  { a: 'seguro', b: 'credito', count: 41 },
  { a: 'seguro', b: 'financiamento', count: 56 },
  { a: 'seguro', b: 'conta', count: 18 },
  { a: 'seguro', b: 'cartao', count: 35 },
  { a: 'seguro', b: 'outros', count: 6 },
  { a: 'credito', b: 'financiamento', count: 72 },
  { a: 'credito', b: 'conta', count: 12 },
  { a: 'credito', b: 'cartao', count: 8 },
  { a: 'credito', b: 'outros', count: 3 },
  { a: 'financiamento', b: 'conta', count: 15 },
  { a: 'financiamento', b: 'cartao', count: 27 },
  { a: 'financiamento', b: 'outros', count: 5 },
  { a: 'conta', b: 'cartao', count: 94 },
  { a: 'cartao', b: 'outros', count: 14 },
];
