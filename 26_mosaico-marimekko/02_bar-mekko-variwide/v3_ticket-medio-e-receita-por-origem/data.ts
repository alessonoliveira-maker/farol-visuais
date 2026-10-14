/**
 * Vitórias comerciais de 2026 até agosto por origem do lead, com a receita reconhecida de cada
 * origem, em reais. O ticket médio não está no dado: o componente divide receita por vitórias, e a
 * área de cada coluna (vitórias vezes ticket) volta a ser a receita.
 * Dado fictício e fixo: nenhuma origem é marca ou plataforma real e nenhum número vem de base real.
 * A lista vem fora de ordem de propósito: quem ordena por ticket decrescente é o componente.
 * Parcerias estratégicas tem 7 vitórias e o maior ticket, a coluna alta e estreita que não cabe
 * em rótulo próprio; Busca paga sustenta a maior receita no volume, com ticket abaixo da média.
 */
export interface OriginRevenue {
  readonly id: string;
  readonly label: string;
  /** Vitórias no período. */
  readonly wins: number;
  /** Receita reconhecida das vitórias, em reais. */
  readonly revenue: number;
}

export const data: readonly OriginRevenue[] = [
  { id: 'busca-paga', label: 'Busca paga', wins: 142, revenue: 458_900 },
  { id: 'organico', label: 'Orgânico', wins: 118, revenue: 281_700 },
  { id: 'indicacao', label: 'Indicação de cliente', wins: 74, revenue: 413_800 },
  { id: 'parcerias', label: 'Parcerias estratégicas', wins: 7, revenue: 151_200 },
  { id: 'redes-sociais', label: 'Redes sociais', wins: 96, revenue: 203_600 },
  { id: 'evento', label: 'Evento', wins: 41, revenue: 262_400 },
  { id: 'prospeccao', label: 'Prospecção ativa', wins: 29, revenue: 231_100 },
];

/** Período do dado: de janeiro a agosto de 2026, em `YYYY-MM`. */
export const period = { from: '2026-01', to: '2026-08' } as const;
