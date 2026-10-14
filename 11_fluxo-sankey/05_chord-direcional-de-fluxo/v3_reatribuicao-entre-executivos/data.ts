/**
 * Reatribuições de oportunidades entre oito executivos no terceiro trimestre de 2026, em contagem
 * de oportunidades que trocaram de dono (não valor financeiro). Dado fictício e fixo: nenhuma
 * pessoa é real, e o nome é uma letra de posição, nunca inicial de gente.
 *
 * `groups` está na ordem DECRESCENTE de volume enviado, que é a ordem de leitura da roda: vizinho
 * de tamanho parecido reduz o cruzamento das fitas. `slot` é o slot categórico da COR-8, na ordem
 * 1, 3, 6, 5, 2, 4; do sétimo grupo em diante ele é `null`, porque a COR-4 põe teto de seis
 * categorias coloridas, e aí quem identifica o arco é o nome escrito ao lado dele.
 *
 * `data` traz os fluxos direcionais não nulos. Par sem nenhuma célula não existe; par cuja soma
 * dos dois sentidos fica abaixo do limiar do componente continua somando no arco e não vira fita.
 */
export interface FlowGroup {
  readonly id: string;
  readonly label: string;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6 | null;
}

export interface FlowCell {
  readonly from: string;
  readonly to: string;
  readonly count: number;
}

export const groups: readonly FlowGroup[] = [
  { id: 'exec-a', label: 'Executivo A', slot: 1 },
  { id: 'exec-b', label: 'Executivo B', slot: 3 },
  { id: 'exec-c', label: 'Executivo C', slot: 6 },
  { id: 'exec-d', label: 'Executivo D', slot: 5 },
  { id: 'exec-e', label: 'Executivo E', slot: 2 },
  { id: 'exec-f', label: 'Executivo F', slot: 4 },
  { id: 'exec-g', label: 'Executivo G', slot: null },
  { id: 'exec-h', label: 'Executivo H', slot: null },
];

/**
 * Soma 137 reatribuições. A carteira tem dois núcleos: A a E trocam bastante entre si, e F, G e H
 * formam um segundo grupo ligado ao primeiro por E. Seis pares somam 1 ou 2 reatribuições nos dois
 * sentidos, o que exercita o corte de fita fraca, e há pares sem nenhuma troca.
 */
export const data: readonly FlowCell[] = [
  { from: 'exec-a', to: 'exec-b', count: 12 },
  { from: 'exec-a', to: 'exec-c', count: 8 },
  { from: 'exec-a', to: 'exec-d', count: 5 },
  { from: 'exec-a', to: 'exec-e', count: 3 },
  { from: 'exec-a', to: 'exec-f', count: 1 },
  { from: 'exec-b', to: 'exec-a', count: 9 },
  { from: 'exec-b', to: 'exec-c', count: 7 },
  { from: 'exec-b', to: 'exec-d', count: 4 },
  { from: 'exec-b', to: 'exec-e', count: 2 },
  { from: 'exec-b', to: 'exec-f', count: 1 },
  { from: 'exec-b', to: 'exec-g', count: 1 },
  { from: 'exec-c', to: 'exec-a', count: 6 },
  { from: 'exec-c', to: 'exec-b', count: 6 },
  { from: 'exec-c', to: 'exec-d', count: 5 },
  { from: 'exec-c', to: 'exec-e', count: 2 },
  { from: 'exec-c', to: 'exec-f', count: 1 },
  { from: 'exec-d', to: 'exec-a', count: 4 },
  { from: 'exec-d', to: 'exec-b', count: 3 },
  { from: 'exec-d', to: 'exec-c', count: 4 },
  { from: 'exec-d', to: 'exec-e', count: 4 },
  { from: 'exec-d', to: 'exec-f', count: 1 },
  { from: 'exec-d', to: 'exec-g', count: 1 },
  { from: 'exec-e', to: 'exec-a', count: 2 },
  { from: 'exec-e', to: 'exec-b', count: 2 },
  { from: 'exec-e', to: 'exec-c', count: 3 },
  { from: 'exec-e', to: 'exec-d', count: 3 },
  { from: 'exec-e', to: 'exec-f', count: 4 },
  { from: 'exec-e', to: 'exec-g', count: 1 },
  { from: 'exec-f', to: 'exec-b', count: 1 },
  { from: 'exec-f', to: 'exec-c', count: 1 },
  { from: 'exec-f', to: 'exec-d', count: 2 },
  { from: 'exec-f', to: 'exec-e', count: 5 },
  { from: 'exec-f', to: 'exec-g', count: 3 },
  { from: 'exec-f', to: 'exec-h', count: 1 },
  { from: 'exec-g', to: 'exec-b', count: 1 },
  { from: 'exec-g', to: 'exec-d', count: 1 },
  { from: 'exec-g', to: 'exec-e', count: 2 },
  { from: 'exec-g', to: 'exec-f', count: 4 },
  { from: 'exec-g', to: 'exec-h', count: 3 },
  { from: 'exec-h', to: 'exec-e', count: 1 },
  { from: 'exec-h', to: 'exec-f', count: 2 },
  { from: 'exec-h', to: 'exec-g', count: 5 },
];
