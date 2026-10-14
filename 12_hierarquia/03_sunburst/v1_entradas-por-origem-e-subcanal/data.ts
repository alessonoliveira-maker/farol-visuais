/**
 * Entradas de pré-vendas por origem e subcanal em 2026-W37, contagem de leads.
 * Dado fictício e fixo: hierarquia de dois níveis, origem no anel interno e subcanal no anel
 * externo. A soma dos subcanais de cada origem fecha exatamente com o valor da origem.
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
   * A cor pertence à origem e não à posição no ranking por volume: trocar a semana não troca a
   * cor. O dicionário distribui na ordem 1, 3, 6, 5, 2, 4 (CONTRATO, COR-8), pela ordem de
   * entrada no dado, nunca pela ordem do ranking.
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly subcanais: readonly SubcanalEntrada[];
}

export const data: readonly OrigemEntradas[] = [
  {
    id: 'indicacao',
    name: 'Indicação',
    slot: 1,
    subcanais: [
      { id: 'cliente-atual', name: 'Cliente atual', value: 210 },
      { id: 'parceria-comercial', name: 'Parceria comercial', value: 110 },
    ],
  },
  {
    id: 'cliente-ativo',
    name: 'Cliente ativo',
    slot: 3,
    subcanais: [
      { id: 'upsell', name: 'Upsell', value: 160 },
      { id: 'reativacao', name: 'Reativação', value: 100 },
    ],
  },
  {
    id: 'midia-paga',
    name: 'Mídia paga',
    slot: 6,
    subcanais: [
      { id: 'busca-paga', name: 'Busca paga', value: 180 },
      { id: 'social-pago', name: 'Social pago', value: 100 },
      { id: 'display', name: 'Display', value: 60 },
    ],
  },
  {
    id: 'organico',
    name: 'Orgânico',
    slot: 5,
    subcanais: [
      { id: 'busca-organica', name: 'Busca orgânica', value: 120 },
      { id: 'direto', name: 'Direto', value: 60 },
    ],
  },
  {
    id: 'outbound',
    name: 'Outbound',
    slot: 2,
    subcanais: [
      { id: 'prospeccao', name: 'Prospecção', value: 50 },
      { id: 'evento', name: 'Evento', value: 30 },
    ],
  },
];
