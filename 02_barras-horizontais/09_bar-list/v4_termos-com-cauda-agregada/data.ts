/**
 * Termos citados nos motivos de perda do mês, contagem por documento que cita o termo (não por
 * ocorrência: um documento que cita o termo duas vezes conta uma vez). Dado fictício e fixo,
 * nenhuma pessoa ou empresa real. `unclassified` é o termo registrado sem categoria de motivo.
 * `tailCount` e `tailDocumentCount` somam os termos de cauda longa, fora da ordenação.
 */
export interface LossTerm {
  readonly id: string;
  readonly term: string;
  readonly documentCount: number;
  readonly unclassified?: boolean;
}

export interface LossTermBoard {
  readonly terms: readonly LossTerm[];
  readonly tailCount: number;
  readonly tailDocumentCount: number;
}

export const data: LossTermBoard = {
  terms: [
    { id: 't1', term: 'sem fit financeiro no momento', documentCount: 41 },
    { id: 't2', term: 'prazo de decisão muito curto', documentCount: 33 },
    { id: 't3', term: 'já tem outro gestor de patrimônio', documentCount: 27 },
    { id: 't4', term: 'sem retorno após o primeiro contato', documentCount: 21 },
    {
      id: 't5',
      term: 'preço acima do orçamento que a família reservou para consultoria patrimonial completa',
      documentCount: 18,
    },
    { id: 't6', term: 'família ainda decidindo entre manter capital líquido', documentCount: 15 },
    { id: 't7', term: 'contato não avançou para nova reunião', documentCount: 12 },
    { id: 't8', term: 'motivo registrado sem categoria', documentCount: 9, unclassified: true },
  ],
  tailCount: 23,
  tailDocumentCount: 25,
};
