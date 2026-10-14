/**
 * Repasses de oportunidades entre quatro funções comerciais no terceiro trimestre de 2026, em
 * contagem de repasses (não valor financeiro). Dado fictício e fixo: nenhuma pessoa, equipe ou
 * empresa é real. `groups` fixa a ordem de leitura da roda, que NÃO muda com o foco, e o slot de
 * cor de cada função (COR-8: 1, 3, 6, 5); `data` é a lista dos fluxos direcionais não nulos entre
 * pares, sempre com `from` e `to` um id de `groups`. Não existe célula de uma função para si mesma.
 * `highlightId` é a função em foco: só as fitas que tocam nela ficam acesas.
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

/**
 * Ordem fixa de leitura e de cor, a mesma em qualquer filtro: o foco troca a cor das fitas, nunca a
 * posição dos grupos na roda, senão comparar dois recortes exigiria reaprender o desenho.
 */
export const groups: readonly FlowGroup[] = [
  { id: 'pre-vendas', label: 'Pré-vendas', slot: 1 },
  { id: 'executivo', label: 'Executivo', slot: 3 },
  { id: 'relacionamento', label: 'Relacionamento', slot: 6 },
  { id: 'especialista', label: 'Especialista de produto', slot: 5 },
];

/** A função em foco. Trocar este id acende outro grupo sem mexer na ordem da roda. */
export const highlightId = 'pre-vendas';

/**
 * Soma 629 repasses. A Pré-vendas envia 274 e recebe 60, e o par com o Executivo é o caso extremo
 * da assimetria: 186 num sentido contra 23 no outro. Os outros três pares existem com volume
 * parecido entre si, para o desenho mostrar o que fica apagado quando só um grupo acende.
 */
export const data: readonly FlowCell[] = [
  { from: 'pre-vendas', to: 'executivo', count: 186 },
  { from: 'pre-vendas', to: 'relacionamento', count: 57 },
  { from: 'pre-vendas', to: 'especialista', count: 31 },
  { from: 'executivo', to: 'pre-vendas', count: 23 },
  { from: 'executivo', to: 'relacionamento', count: 78 },
  { from: 'executivo', to: 'especialista', count: 41 },
  { from: 'relacionamento', to: 'pre-vendas', count: 21 },
  { from: 'relacionamento', to: 'executivo', count: 66 },
  { from: 'relacionamento', to: 'especialista', count: 34 },
  { from: 'especialista', to: 'pre-vendas', count: 16 },
  { from: 'especialista', to: 'executivo', count: 47 },
  { from: 'especialista', to: 'relacionamento', count: 29 },
];
