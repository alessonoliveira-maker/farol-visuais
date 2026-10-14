/**
 * Oportunidades perdidas no trimestre 2026-T3, em contagem, como árvore de três níveis: perdas por etapa,
 * motivos dentro da etapa e canal tentado dentro do motivo "sem contato". O filho soma o pai; onde não
 * soma (proposta, 13 perdas sem motivo), a diferença aparece como passo próprio.
 * Dado fictício e fixo. Todo id é único na árvore inteira, não só entre irmãos.
 */
export interface LossNode {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly children?: readonly LossNode[];
}

export interface LossTree {
  /** Trimestre do recorte, como o dado o entrega. */
  readonly period: string;
  readonly root: LossNode;
}

export const data: LossTree = {
  period: '2026-T3',
  root: {
    id: 'perdas',
    label: 'Perdas',
    value: 1_180,
    children: [
      {
        id: 'pre-venda',
        label: 'Pré-venda',
        value: 1_030,
        children: [
          {
            id: 'sem-contato',
            label: 'Sem contato',
            value: 460,
            children: [
              { id: 'canal-telefone', label: 'Telefone', value: 210 },
              { id: 'canal-email', label: 'E-mail', value: 140 },
              { id: 'canal-mensagem', label: 'Mensagem', value: 80 },
              { id: 'canal-visita', label: 'Visita', value: 30 },
            ],
          },
          { id: 'nao-fit', label: 'Não fit', value: 390 },
          { id: 'sem-orcamento', label: 'Sem orçamento', value: 120 },
          { id: 'duplicado', label: 'Duplicado', value: 60 },
        ],
      },
      {
        id: 'proposta',
        label: 'Proposta',
        value: 110,
        children: [
          { id: 'preco', label: 'Preço', value: 38 },
          { id: 'concorrencia', label: 'Concorrência', value: 29 },
          { id: 'prazo', label: 'Prazo', value: 21 },
          { id: 'sem-decisao', label: 'Sem decisão', value: 9 },
        ],
      },
      { id: 'negociacao', label: 'Negociação', value: 40 },
    ],
  },
};

/** Valor inicial do caminho: ids a descer a partir da raiz. */
export const initialPath: readonly string[] = ['pre-venda'];

/**
 * Seletor de caminho puro: desce pelos ids enquanto cada um existir entre os filhos do nó corrente e
 * devolve a trilha da raiz até o nível mostrado. Id desconhecido para a descida, nunca quebra.
 */
export function selectPath(root: LossNode, path: readonly string[]): readonly LossNode[] {
  const trail: LossNode[] = [root];
  for (const id of path) {
    const current = trail[trail.length - 1];
    const next = current?.children?.find((child) => child.id === id);
    if (!next) break;
    trail.push(next);
  }
  return trail;
}
