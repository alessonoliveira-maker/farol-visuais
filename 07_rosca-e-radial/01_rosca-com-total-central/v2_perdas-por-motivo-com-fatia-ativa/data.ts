/**
 * Perdas comerciais do trimestre por motivo, em contagem de oportunidades.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real é citada.
 * `colorIndex` é o slot fixo em `--chart-1`..`--chart-8` (COR-3): a cor pertence ao motivo, não à
 * posição que ele ocupa depois de ordenado por contagem.
 */
export interface LossReasonCount {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly colorIndex: number;
}

export const data: readonly LossReasonCount[] = [
  { id: 'sem-fit', label: 'Sem fit de perfil', count: 86, colorIndex: 0 },
  { id: 'preco', label: 'Preço acima do orçamento', count: 54, colorIndex: 2 },
  { id: 'concorrente', label: 'Escolheu concorrente', count: 38, colorIndex: 5 },
  { id: 'sem-resposta', label: 'Sem resposta no follow-up', count: 22, colorIndex: 4 },
  { id: 'adiado', label: 'Projeto adiado', count: 12, colorIndex: 1 },
];

/** O motivo aberto por padrão ao montar: o maior, para o centro já nascer no item, não no total. */
export const activeId = 'sem-fit';
