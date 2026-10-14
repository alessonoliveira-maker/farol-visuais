/**
 * Funil de leads de agosto por origem: o gasto em reais, os leads captados e os leads aceitos pelo
 * comercial. O CPL bruto é gasto sobre leads e o qualificado é gasto sobre qualificados, então a
 * distância entre os dois nasce da taxa de qualificação. Dado fictício e fixo. Casos difíceis: uma
 * origem com 100% de leads qualificados (a faixa tem largura zero), faixas estreitas, empate de
 * volume de leads e uma origem cuja distância é 4,1 vezes o bruto.
 */
export interface LeadOriginCost {
  readonly id: string;
  readonly origin: string;
  /** Gasto da origem em agosto, em reais. */
  readonly spend: number;
  /** Leads captados, todos. */
  readonly leads: number;
  /** Leads aceitos pelo comercial. */
  readonly qualifiedLeads: number;
}

export const data: readonly LeadOriginCost[] = [
  { id: 'orig-01', origin: 'Redes sociais pagas', spend: 4_920, leads: 410, qualifiedLeads: 100 },
  { id: 'orig-02', origin: 'Busca paga', spend: 9_600, leads: 320, qualifiedLeads: 160 },
  { id: 'orig-03', origin: 'Representantes comerciais', spend: 6_150, leads: 150, qualifiedLeads: 90 },
  { id: 'orig-04', origin: 'Lista fria enriquecida', spend: 2_940, leads: 300, qualifiedLeads: 100 },
  { id: 'orig-05', origin: 'Mídia exterior', spend: 5_700, leads: 150, qualifiedLeads: 100 },
  { id: 'orig-06', origin: 'Parcerias comerciais', spend: 3_795, leads: 150, qualifiedLeads: 90 },
  { id: 'orig-07', origin: 'Webinários', spend: 4_520, leads: 200, qualifiedLeads: 120 },
  { id: 'orig-08', origin: 'Portais de anúncio', spend: 3_410, leads: 100, qualifiedLeads: 80 },
  { id: 'orig-09', origin: 'Eventos presenciais', spend: 6_650, leads: 100, qualifiedLeads: 95 },
  { id: 'orig-10', origin: 'E-mail marketing', spend: 920, leads: 100, qualifiedLeads: 65 },
  { id: 'orig-11', origin: 'Conteúdo orgânico', spend: 640, leads: 100, qualifiedLeads: 75 },
  { id: 'orig-12', origin: 'Newsletter de clientes', spend: 780, leads: 100, qualifiedLeads: 80 },
  { id: 'orig-13', origin: 'Marketplaces parceiros', spend: 1_800, leads: 100, qualifiedLeads: 92 },
  { id: 'orig-14', origin: 'Indicação de clientes', spend: 1_400, leads: 100, qualifiedLeads: 100 },
];
