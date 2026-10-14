/**
 * Leads qualificados de 6 canais de aquisição fictícios em 2025 e em 2026, em contagem de leads.
 * A participação não vem pronta: o componente deriva o percentual do total de cada ano, para o
 * número nunca divergir do volume. O `slot` é a cor fixa da categoria (COR-3), atribuído na ordem
 * 1, 3, 6, 5, 2, 4 da COR-8. Dado fictício e fixo: nenhum canal é plataforma ou campanha real.
 */
export interface ChannelQualified {
  readonly id: string;
  readonly name: string;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly qualifiedBefore: number;
  readonly qualifiedAfter: number;
}

export const periodBefore = '2025';
export const periodAfter = '2026';

export const data: readonly ChannelQualified[] = [
  { id: 'indicacao', name: 'Indicação', slot: 1, qualifiedBefore: 120, qualifiedAfter: 270 },
  { id: 'busca-paga', name: 'Busca paga', slot: 3, qualifiedBefore: 310, qualifiedAfter: 240 },
  { id: 'redes-sociais', name: 'Redes sociais', slot: 6, qualifiedBefore: 180, qualifiedAfter: 150 },
  { id: 'email', name: 'E-mail', slot: 5, qualifiedBefore: 150, qualifiedAfter: 140 },
  { id: 'eventos', name: 'Eventos', slot: 2, qualifiedBefore: 140, qualifiedAfter: 90 },
  { id: 'parcerias', name: 'Parcerias', slot: 4, qualifiedBefore: 100, qualifiedAfter: 110 },
];
