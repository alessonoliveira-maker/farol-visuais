/**
 * Movimento de 12 origens de lead fictícias entre ago/26 e set/26, em duas medidas: volume de
 * leads recebidos e taxa de qualificação. A taxa não vem pronta: o dado declara as contagens de
 * leads e de leads qualificados de cada mês, e a taxa é derivada delas, para o percentual escrito
 * nunca divergir do volume escrito.
 * Dado fictício e fixo: nenhuma origem corresponde a plataforma ou parceiro real.
 */
export interface OriginMovement {
  readonly id: string;
  readonly name: string;
  readonly leadsBefore: number;
  readonly qualifiedBefore: number;
  readonly leadsAfter: number;
  readonly qualifiedAfter: number;
}

export const data: readonly OriginMovement[] = [
  { id: 'indicacao', name: 'Indicação', leadsBefore: 120, qualifiedBefore: 42, leadsAfter: 150, qualifiedAfter: 54 },
  { id: 'busca-paga', name: 'Busca paga', leadsBefore: 260, qualifiedBefore: 75, leadsAfter: 300, qualifiedAfter: 54 },
  { id: 'redes-sociais', name: 'Redes sociais', leadsBefore: 340, qualifiedBefore: 51, leadsAfter: 380, qualifiedAfter: 114 },
  { id: 'eventos', name: 'Eventos corporativos', leadsBefore: 80, qualifiedBefore: 24, leadsAfter: 70, qualifiedAfter: 14 },
  { id: 'outbound', name: 'Outbound direto', leadsBefore: 420, qualifiedBefore: 42, leadsAfter: 460, qualifiedAfter: 60 },
  { id: 'parcerias', name: 'Parcerias comerciais', leadsBefore: 110, qualifiedBefore: 33, leadsAfter: 130, qualifiedAfter: 43 },
  { id: 'midia', name: 'Mídia programática institucional', leadsBefore: 500, qualifiedBefore: 60, leadsAfter: 520, qualifiedAfter: 73 },
  { id: 'conteudo', name: 'Conteúdo orgânico', leadsBefore: 220, qualifiedBefore: 44, leadsAfter: 240, qualifiedAfter: 72 },
  { id: 'email', name: 'E-mail próprio', leadsBefore: 180, qualifiedBefore: 50, leadsAfter: 160, qualifiedAfter: 30 },
  { id: 'webinar', name: 'Webinar técnico', leadsBefore: 90, qualifiedBefore: 18, leadsAfter: 110, qualifiedAfter: 30 },
  { id: 'marketplace', name: 'Marketplace de parceiros', leadsBefore: 300, qualifiedBefore: 36, leadsAfter: 330, qualifiedAfter: 43 },
  { id: 'feira', name: 'Feira setorial', leadsBefore: 60, qualifiedBefore: 21, leadsAfter: 50, qualifiedAfter: 16 },
];

/** A divisória: taxa de qualificação mínima acordada, a mesma nos dois meses. Abaixo dela a origem
 *  está na faixa crítica. */
export const metaQualification = 0.25;

/** Os dois momentos ligados pelas setas, em formato de dado; a tela imprime por formatMonthShort. */
export const periodBefore = '2026-08';
export const periodAfter = '2026-09';
