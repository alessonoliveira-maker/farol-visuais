/**
 * Repasses de oportunidades entre quatro funções comerciais no terceiro trimestre de 2026, em
 * contagem de repasses (não valor financeiro). Dado fictício e fixo: nenhuma pessoa, equipe ou
 * empresa é real. `groups` fixa a ordem de leitura da roda e o slot de cor de cada função
 * (COR-8: 1, 3, 6, 5); `data` é a lista dos fluxos direcionais não nulos entre pares, sempre com
 * `from` e `to` um id de `groups`. Não existe célula de uma função para si mesma.
 */
export interface FlowGroup {
  readonly id: string;
  readonly label: string;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface FlowCell {
  readonly from: string;
  readonly to: string;
  readonly count: number;
}

/** Ordem fixa na paleta categórica (COR-8: 1, 3, 6, 5), a mesma para as quatro funções. */
export const groups: readonly FlowGroup[] = [
  { id: 'pre-vendas', label: 'Pré-vendas', slot: 1 },
  { id: 'executivo', label: 'Executivo', slot: 3 },
  { id: 'relacionamento', label: 'Relacionamento', slot: 6 },
  { id: 'especialista', label: 'Especialista de produto', slot: 5 },
];

/**
 * Soma 338 repasses. Pré-vendas para Executivo é o maior par isolado (110), mas nenhuma célula
 * sozinha passa de um quarto do total: o desenho fica legível com as quatro funções trocando
 * entre si, sem uma fita engolir a roda.
 */
export const data: readonly FlowCell[] = [
  { from: 'pre-vendas', to: 'executivo', count: 110 },
  { from: 'pre-vendas', to: 'relacionamento', count: 18 },
  { from: 'pre-vendas', to: 'especialista', count: 9 },
  { from: 'executivo', to: 'pre-vendas', count: 34 },
  { from: 'executivo', to: 'relacionamento', count: 42 },
  { from: 'executivo', to: 'especialista', count: 14 },
  { from: 'relacionamento', to: 'pre-vendas', count: 11 },
  { from: 'relacionamento', to: 'executivo', count: 25 },
  { from: 'relacionamento', to: 'especialista', count: 20 },
  { from: 'especialista', to: 'pre-vendas', count: 8 },
  { from: 'especialista', to: 'executivo', count: 16 },
  { from: 'especialista', to: 'relacionamento', count: 31 },
];
