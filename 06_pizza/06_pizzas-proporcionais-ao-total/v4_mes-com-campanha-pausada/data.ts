/**
 * Leads recebidos por mês e canal de entrada, em contagem de leads, de abril a agosto de 2026.
 * Dado fictício e fixo: os canais são genéricos e nenhum mês corresponde a um período real.
 *
 * O mês de julho tem a campanha pausada e fica com 12 leads, 40 vezes menos que o maior mês: na
 * escala comum do conjunto o diâmetro dele nasce abaixo do mínimo de 24 px, e a composição não
 * cabe. O mês de agosto não tem fatia nenhuma, que é ausência de coleta e não volume baixo: lista
 * vazia, nunca zero (EST-1b).
 */
export interface ChannelSlice {
  readonly id: 'busca' | 'social' | 'organico';
  readonly name: string;
  readonly value: number;
}

export interface MonthlyLeads {
  readonly monthId: string;
  /** Mês do dado, YYYY-MM. */
  readonly month: string;
  /** Ordem fixa dos canais: a mesma sequência e a mesma cor em todo mês (COR-3). */
  readonly slices: readonly ChannelSlice[];
}

export const data: readonly MonthlyLeads[] = [
  {
    monthId: '2026-04',
    month: '2026-04',
    slices: [
      { id: 'busca', name: 'Busca paga', value: 200 },
      { id: 'social', name: 'Rede social', value: 170 },
      { id: 'organico', name: 'Orgânico', value: 110 },
    ],
  },
  {
    monthId: '2026-05',
    month: '2026-05',
    slices: [
      { id: 'busca', name: 'Busca paga', value: 180 },
      { id: 'social', name: 'Rede social', value: 150 },
      { id: 'organico', name: 'Orgânico', value: 90 },
    ],
  },
  {
    monthId: '2026-06',
    month: '2026-06',
    slices: [
      { id: 'busca', name: 'Busca paga', value: 150 },
      { id: 'social', name: 'Rede social', value: 125 },
      { id: 'organico', name: 'Orgânico', value: 85 },
    ],
  },
  {
    monthId: '2026-07',
    month: '2026-07',
    slices: [
      { id: 'busca', name: 'Busca paga', value: 5 },
      { id: 'social', name: 'Rede social', value: 4 },
      { id: 'organico', name: 'Orgânico', value: 3 },
    ],
  },
  {
    monthId: '2026-08',
    month: '2026-08',
    slices: [],
  },
];
