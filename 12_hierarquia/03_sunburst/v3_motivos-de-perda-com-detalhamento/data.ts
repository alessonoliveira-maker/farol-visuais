/**
 * Perdas do funil comercial no 3º trimestre de 2026, contagem de oportunidades perdidas,
 * organizadas em categoria de perda e submotivo.
 * Dado fictício e fixo. A soma dos submotivos fecha exatamente com a categoria, porque num
 * sunburst a abertura angular do anel externo precisa fechar com a do interno por construção.
 *
 * Nenhum nó chega a mil, e isso é condição do desenho: o rótulo do `SunburstChart` imprime o valor
 * cru de cada nó, sem passar por `@/lib/format`, e abaixo de mil o texto cru coincide com o de
 * `formatInt`. Ver a nota do `meta.json`.
 */
export interface SubmotivoPerda {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

export interface CategoriaPerda {
  readonly id: string;
  readonly name: string;
  /**
   * Posição fixa da categoria na paleta (1 a 6, que viram `--chart-1` a `--chart-6`).
   * A cor pertence à categoria e não à posição no ranking do trimestre: trocar o recorte não troca
   * a cor. O dicionário distribui na ordem 1, 3, 6, 5, 2, 4 (CONTRATO, COR-8).
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly submotivos: readonly SubmotivoPerda[];
}

export const data: readonly CategoriaPerda[] = [
  {
    id: 'sem-perfil',
    name: 'Sem perfil',
    slot: 1,
    submotivos: [
      { id: 'patrimonio-abaixo', name: 'Patrimônio abaixo do piso', value: 148 },
      { id: 'decisor-nao-identificado', name: 'Decisor não identificado', value: 71 },
      { id: 'fora-da-regiao', name: 'Fora da região atendida', value: 34 },
    ],
  },
  {
    id: 'sem-contato',
    name: 'Sem contato',
    slot: 3,
    submotivos: [
      { id: 'nao-respondeu', name: 'Não respondeu', value: 132 },
      { id: 'telefone-invalido', name: 'Telefone inválido', value: 43 },
    ],
  },
  {
    id: 'concorrencia',
    name: 'Concorrência',
    slot: 6,
    submotivos: [
      { id: 'proposta-de-terceiro', name: 'Proposta de terceiro', value: 61 },
      { id: 'ja-tem-assessoria', name: 'Já tem assessoria', value: 38 },
    ],
  },
  {
    id: 'momento',
    name: 'Momento',
    slot: 5,
    submotivos: [
      { id: 'decisao-adiada', name: 'Decisão adiada', value: 57 },
      { id: 'sem-orcamento', name: 'Sem orçamento', value: 24 },
    ],
  },
  {
    id: 'produto',
    name: 'Produto',
    slot: 2,
    submotivos: [
      { id: 'sem-interesse', name: 'Sem interesse na oferta', value: 29 },
      { id: 'pediu-outro-produto', name: 'Pediu outro produto', value: 18 },
    ],
  },
];

/**
 * Caminho aberto na montagem, por id, do nível mais alto para o mais fundo. Existe para o preview
 * abrir dentro de "Sem perfil", que é o que esta versão precisa demonstrar; uma lista vazia abre
 * na raiz, com os dois anéis desenhados.
 */
export const initialPath: readonly string[] = ['sem-perfil'];
