/**
 * Funil de pré-vendas de agosto de 2026, por origem de lead, em quatro etapas.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plataforma real.
 * "Reativação de base" tem qualificadas acima de contatadas de propósito: o reengajamento
 * qualifica direto quem já respondeu antes, sem passar por uma nova tentativa de contato.
 */
export interface OriginFunnelRow {
  readonly id: string;
  readonly origin: string;
  readonly entradas: number;
  readonly contatadas: number;
  readonly qualificadas: number;
  readonly agendadas: number;
}

export const data: readonly OriginFunnelRow[] = [
  { id: 'midia-social', origin: 'Mídia social', entradas: 412, contatadas: 355, qualificadas: 210, agendadas: 58 },
  { id: 'busca-paga', origin: 'Busca paga', entradas: 268, contatadas: 240, qualificadas: 122, agendadas: 30 },
  { id: 'busca-organica', origin: 'Busca orgânica', entradas: 154, contatadas: 140, qualificadas: 88, agendadas: 26 },
  { id: 'indicacao', origin: 'Indicação', entradas: 96, contatadas: 90, qualificadas: 78, agendadas: 41 },
  { id: 'rede-profissional', origin: 'Rede profissional', entradas: 88, contatadas: 80, qualificadas: 52, agendadas: 19 },
  { id: 'mensageria-direta', origin: 'Mensageria direta', entradas: 71, contatadas: 68, qualificadas: 41, agendadas: 17 },
  { id: 'formulario-site', origin: 'Formulário do site', entradas: 63, contatadas: 55, qualificadas: 29, agendadas: 9 },
  { id: 'evento', origin: 'Evento', entradas: 47, contatadas: 44, qualificadas: 30, agendadas: 14 },
  { id: 'reativacao-de-base', origin: 'Reativação de base', entradas: 40, contatadas: 18, qualificadas: 22, agendadas: 11 },
  { id: 'parceria', origin: 'Parceria', entradas: 39, contatadas: 35, qualificadas: 25, agendadas: 12 },
  { id: 'sem-origem', origin: 'Sem origem', entradas: 22, contatadas: 14, qualificadas: 6, agendadas: 2 },
  { id: 'webinar', origin: 'Webinar', entradas: 9, contatadas: 8, qualificadas: 4, agendadas: 1 },
];
