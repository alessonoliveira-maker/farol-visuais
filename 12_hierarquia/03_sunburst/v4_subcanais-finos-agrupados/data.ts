/**
 * Entradas de pré-vendas por origem e subcanal em 2026-W39, contagem de leads.
 * Dado fictício e fixo, com as duas imperfeições que esta versão precisa exercitar: 22 subcanais,
 * vários deles abaixo de 1% do total, e duas origens cujo total declarado é maior que a soma dos
 * subcanais declarados.
 *
 * `declaredTotal` é o total que a origem informa, e `subcanais` é o que se consegue atribuir.
 * Os dois não fecham sempre, e a diferença não é zero nem erro de digitação: é a parte da origem
 * que chegou sem subcanal. O componente a desenha como um filho "Não classificado", porque
 * escondê-la faria a soma dos filhos divergir do pai e a abertura angular do anel externo deixaria
 * de fechar com a do interno.
 *
 * Nenhum nó chega a mil, e isso é condição do desenho: o rótulo do `SunburstChart` imprime o valor
 * cru de cada nó, sem passar por `@/lib/format`, e abaixo de mil o texto cru coincide com o de
 * `formatInt`. Ver a nota do `meta.json`.
 */
export interface SubcanalEntrada {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

export interface OrigemEntradas {
  readonly id: string;
  readonly name: string;
  /**
   * Posição fixa da categoria na paleta (1 a 6, que viram `--chart-1` a `--chart-6`).
   * A cor pertence à origem e não à posição no ranking da semana. O dicionário distribui na ordem
   * 1, 3, 6, 5, 2, 4 (CONTRATO, COR-8).
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  /** Total que a origem informa, sempre maior ou igual à soma dos subcanais declarados. */
  readonly declaredTotal: number;
  readonly subcanais: readonly SubcanalEntrada[];
}

export const data: readonly OrigemEntradas[] = [
  {
    id: 'midia-paga',
    name: 'Mídia paga',
    slot: 1,
    declaredTotal: 349,
    subcanais: [
      { id: 'busca-paga', name: 'Busca paga', value: 126 },
      { id: 'social-pago', name: 'Social pago', value: 78 },
      { id: 'display', name: 'Display', value: 43 },
      { id: 'video', name: 'Vídeo', value: 23 },
      { id: 'remarketing', name: 'Remarketing', value: 14 },
      { id: 'afiliado', name: 'Afiliado', value: 9 },
    ],
  },
  {
    id: 'indicacao',
    name: 'Indicação',
    slot: 3,
    declaredTotal: 207,
    subcanais: [
      { id: 'cliente-atual', name: 'Cliente atual', value: 108 },
      { id: 'parceria-comercial', name: 'Parceria comercial', value: 57 },
      { id: 'colaborador', name: 'Colaborador', value: 28 },
      { id: 'evento-parceiro', name: 'Evento parceiro', value: 14 },
    ],
  },
  {
    id: 'organico',
    name: 'Orgânico',
    slot: 6,
    declaredTotal: 178,
    subcanais: [
      { id: 'busca-organica', name: 'Busca orgânica', value: 86 },
      { id: 'direto', name: 'Direto', value: 47 },
      { id: 'blog', name: 'Blog', value: 26 },
      { id: 'redes-sociais', name: 'Redes sociais', value: 12 },
      { id: 'newsletter', name: 'Newsletter', value: 7 },
    ],
  },
  {
    id: 'outbound',
    name: 'Outbound',
    slot: 5,
    declaredTotal: 164,
    subcanais: [
      { id: 'prospeccao', name: 'Prospecção', value: 61 },
      { id: 'evento', name: 'Evento', value: 34 },
      { id: 'lista-fria', name: 'Lista fria', value: 17 },
      { id: 'webinar', name: 'Webinar', value: 8 },
    ],
  },
  {
    id: 'cliente-ativo',
    name: 'Cliente ativo',
    slot: 2,
    declaredTotal: 98,
    subcanais: [
      { id: 'upsell', name: 'Upsell', value: 56 },
      { id: 'reativacao', name: 'Reativação', value: 29 },
      { id: 'cross-sell', name: 'Cross sell', value: 13 },
    ],
  },
];
