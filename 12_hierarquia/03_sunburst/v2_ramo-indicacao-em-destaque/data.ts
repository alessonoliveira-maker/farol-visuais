/**
 * Entradas de pré-vendas por origem e subcanal em 2026-W38, contagem de leads.
 * Dado fictício e fixo: hierarquia de dois níveis, origem no anel interno e subcanal no anel
 * externo. A soma dos subcanais de cada origem fecha exatamente com o valor da origem, porque é
 * essa igualdade que mantém a abertura angular dos dois anéis consistente.
 *
 * Nenhum nó tem valor de mil ou mais, e isso é condição do desenho, não coincidência: o rótulo do
 * `SunburstChart` imprime o valor cru de cada nó, sem passar por `@/lib/format`, e abaixo de mil o
 * texto cru coincide com o de `formatInt`. Ver a nota do `meta.json`.
 */
export interface SubcanalEntrada {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

export interface OrigemEntradas {
  readonly id: string;
  readonly name: string;
  readonly subcanais: readonly SubcanalEntrada[];
}

export const data: readonly OrigemEntradas[] = [
  {
    id: 'indicacao',
    name: 'Indicação',
    subcanais: [
      { id: 'cliente-atual', name: 'Cliente atual', value: 168 },
      { id: 'parceria-comercial', name: 'Parceria comercial', value: 96 },
      { id: 'colaborador', name: 'Colaborador', value: 41 },
    ],
  },
  {
    id: 'midia-paga',
    name: 'Mídia paga',
    subcanais: [
      { id: 'busca-paga', name: 'Busca paga', value: 121 },
      { id: 'social-pago', name: 'Social pago', value: 74 },
      { id: 'display', name: 'Display', value: 38 },
    ],
  },
  {
    id: 'organico',
    name: 'Orgânico',
    subcanais: [
      { id: 'busca-organica', name: 'Busca orgânica', value: 88 },
      { id: 'direto', name: 'Direto', value: 47 },
    ],
  },
  {
    id: 'cliente-ativo',
    name: 'Cliente ativo',
    subcanais: [
      { id: 'upsell', name: 'Upsell', value: 71 },
      { id: 'reativacao', name: 'Reativação', value: 37 },
    ],
  },
  {
    id: 'outbound',
    name: 'Outbound',
    subcanais: [
      { id: 'prospeccao', name: 'Prospecção', value: 62 },
      { id: 'evento', name: 'Evento', value: 29 },
    ],
  },
];

/**
 * Ramo aceso, por id. Vem do dado e nunca do ranking do período: a pergunta da versão é o peso da
 * indicação, então o destaque continua na indicação mesmo na semana em que ela não lidera.
 */
export const highlightId = 'indicacao';
