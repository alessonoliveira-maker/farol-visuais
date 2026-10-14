/**
 * Perdas comerciais de oportunidades no trimestre, por categoria, motivo e submotivo.
 * Dado fictício e fixo. Cada nó soma exatamente os filhos: nenhum valor é inventado no
 * componente, só reorganizado pela partição.
 */
export interface LossNode {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly children?: readonly LossNode[];
}

/**
 * Categoria de primeiro nível: além do nó comum, carrega o slot fixo de cor (COR-3, COR-8).
 * O slot pertence à categoria, não à posição no ranking: reordenar por valor nunca troca a cor.
 */
export interface LossCategory extends LossNode {
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export const data: readonly LossCategory[] = [
  {
    id: 'sem-perfil',
    label: 'Sem perfil financeiro',
    value: 58,
    slot: 1,
    children: [
      {
        id: 'patrimonio-abaixo',
        label: 'Patrimônio abaixo do mínimo',
        value: 34,
        children: [
          { id: 'ticket-abaixo-1mi', label: 'Ticket abaixo de R$ 1 milhão', value: 22 },
          { id: 'sem-info-patrimonio', label: 'Sem informação de patrimônio declarada', value: 12 },
        ],
      },
      {
        id: 'fora-publico-alvo',
        label: 'Perfil fora do público-alvo',
        value: 24,
        children: [
          { id: 'pj-sem-encaixe', label: 'Pessoa jurídica sem encaixe no modelo', value: 15 },
          { id: 'so-produto-avulso', label: 'Interesse só em produto avulso', value: 9 },
        ],
      },
    ],
  },
  {
    id: 'concorrencia',
    label: 'Concorrência',
    value: 47,
    slot: 3,
    children: [
      {
        id: 'outro-mfo',
        label: 'Optou por outro multi-family office',
        value: 29,
        children: [
          { id: 'relacao-previa', label: 'Relação prévia com o concorrente', value: 19 },
          { id: 'taxa-mais-baixa', label: 'Taxa de administração mais baixa', value: 10 },
        ],
      },
      {
        id: 'banco-tradicional',
        label: 'Optou por banco tradicional',
        value: 18,
        children: [
          { id: 'marca-conhecida', label: 'Preferência por marca já conhecida', value: 11 },
          { id: 'proposta-gerente', label: 'Recebeu proposta do gerente do banco', value: 7 },
        ],
      },
    ],
  },
  {
    id: 'sem-contato',
    label: 'Sem contato',
    value: 39,
    slot: 6,
    children: [
      {
        id: 'nao-retornou',
        label: 'Não retornou aos contatos da esteira',
        value: 27,
        children: [
          { id: 'sumiu-primeira-ligacao', label: 'Sumiu após a primeira ligação', value: 17 },
          { id: 'nao-atendeu-tentativas', label: 'Não atendeu em cinco tentativas', value: 10 },
        ],
      },
      {
        id: 'contato-invalido',
        label: 'Dados de contato inválidos',
        value: 12,
        children: [{ id: 'telefone-incorreto', label: 'Telefone incorreto ou desligado', value: 12 }],
      },
    ],
  },
  {
    id: 'timing',
    label: 'Timing da decisão',
    value: 20,
    slot: 5,
    children: [
      {
        id: 'adiou-decisao',
        label: 'Adiou a decisão para outro momento',
        value: 20,
        children: [
          { id: 'aguardando-liquidez', label: 'Aguardando evento de liquidez declarado', value: 13 },
          { id: 'outro-projeto', label: 'Priorizou outro projeto no período', value: 7 },
        ],
      },
    ],
  },
];

/** O que a soma do primeiro nível conta e o período, usado na frase acessível e na leitura. */
export const totalLabel = 'perdas comerciais de 2026-T3';
