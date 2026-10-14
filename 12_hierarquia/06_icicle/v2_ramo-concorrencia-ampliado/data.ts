/**
 * Perdas comerciais de oportunidades no trimestre, por categoria, motivo e submotivo, em
 * ocorrências. Dado fictício e fixo: nenhum nome é pessoa nem empresa real. Cada nó soma
 * exatamente os filhos, então a partição só reorganiza o que já está aqui.
 *
 * A árvore repete a da `v1` de propósito, com uma correção: as duas versões precisam ser
 * comparáveis, porque o que muda entre elas é o recorte (a `v1` desenha a raiz inteira, esta amplia
 * um ramo), não o dado. A correção é o motivo "Dados de contato inválidos", que na `v1` tinha um
 * filho único de valor igual ao dele e por isso gastava uma coluna sem partição nenhuma, defeito
 * que a própria revisão da `v1` registrou; aqui ele se reparte em dois submotivos (7 mais 5).
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
        children: [
          { id: 'telefone-incorreto', label: 'Telefone incorreto ou desligado', value: 7 },
          { id: 'email-devolvido', label: 'E-mail devolvido pelo servidor', value: 5 },
        ],
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

/** Nome da raiz da hierarquia, escrito na primeira faixa de contexto. */
export const rootLabel = 'Todas as perdas comerciais de 2026-T3';

/** Substantivo da contagem, escrito ao lado de todo número (NUM-6). */
export const unitLabel = 'perdas';

/** Recorte de período, escrito no desenho e na frase acessível, nunca só na frase (DAD-9). */
export const periodLabel = '2026-T3';

/**
 * Caminho do ramo já ampliado quando o componente monta, de fora para dentro: aqui, a categoria
 * `concorrencia`. Declarado no dado, e não no componente, para o preview abrir já ampliado, porque
 * estado de interação não aparece no `preview.svg` (CONTRATO, seção 13). Caminho vazio desenha a
 * raiz inteira, com as três colunas.
 */
export const zoomedPath: readonly string[] = ['concorrencia'];
