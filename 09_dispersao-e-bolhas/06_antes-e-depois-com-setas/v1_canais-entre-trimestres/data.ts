/**
 * Movimento de CPL e taxa de qualificação de 8 canais de aquisição fictícios entre dois
 * trimestres, T2/2026 e T3/2026. CPL em reais por lead; a taxa de qualificação não vem pronta: o dado declara leads e leads
 * qualificados de cada trimestre e o componente deriva a taxa, para o percentual nunca divergir do volume.
 * Dado fictício e fixo: nenhum canal corresponde a plataforma ou campanha real.
 */
export interface ChannelMovement {
  readonly id: string;
  readonly name: string;
  readonly cplBefore: number;
  readonly cplAfter: number;
  readonly leadsBefore: number;
  readonly qualifiedBefore: number;
  readonly leadsAfter: number;
  readonly qualifiedAfter: number;
}

export const data: readonly ChannelMovement[] = [
  { id: 'indicacao', name: 'Indicação', cplBefore: 180, cplAfter: 90, leadsBefore: 200, qualifiedBefore: 52, leadsAfter: 300, qualifiedAfter: 120 },
  { id: 'busca-paga', name: 'Busca paga', cplBefore: 130, cplAfter: 155, leadsBefore: 200, qualifiedBefore: 44, leadsAfter: 200, qualifiedAfter: 36 },
  { id: 'redes-sociais', name: 'Redes sociais', cplBefore: 260, cplAfter: 210, leadsBefore: 150, qualifiedBefore: 21, leadsAfter: 150, qualifiedAfter: 33 },
  { id: 'eventos', name: 'Eventos corporativos', cplBefore: 230, cplAfter: 300, leadsBefore: 100, qualifiedBefore: 33, leadsAfter: 100, qualifiedAfter: 27 },
  { id: 'outbound', name: 'Outbound direto', cplBefore: 340, cplAfter: 280, leadsBefore: 100, qualifiedBefore: 11, leadsAfter: 100, qualifiedAfter: 19 },
  { id: 'parcerias', name: 'Parcerias comerciais', cplBefore: 190, cplAfter: 160, leadsBefore: 100, qualifiedBefore: 34, leadsAfter: 200, qualifiedAfter: 72 },
  { id: 'midia', name: 'Mídia programática institucional', cplBefore: 390, cplAfter: 330, leadsBefore: 100, qualifiedBefore: 16, leadsAfter: 100, qualifiedAfter: 23 },
  { id: 'conteudo', name: 'Conteúdo orgânico', cplBefore: 100, cplAfter: 130, leadsBefore: 200, qualifiedBefore: 38, leadsAfter: 200, qualifiedAfter: 30 },
];

/** Rótulo dos dois momentos ligados pelas setas: nome do período, não é uma data de calendário. */
export const periodBeforeLabel = 'T2/2026';
export const periodAfterLabel = 'T3/2026';
