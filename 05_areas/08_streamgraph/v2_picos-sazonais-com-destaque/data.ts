/**
 * Leads semanais por campanha em 2026 (52 semanas), em contagem de leads. Cinco campanhas: quatro
 * de aquisição contínua (busca paga, social pago, nutrição por email, evento presencial) e uma de
 * pico (webinar de setembro). O primeiro pico, em março, é difuso: as quatro campanhas contínuas
 * sobem juntas com o lançamento do fundo. O segundo, em setembro, é concentrado: o webinar sozinho
 * carrega quase três quartos do volume daquela semana. Dado fictício e fixo.
 */
export interface CampaignPeakWeek {
  readonly week: string;
  readonly buscaPaga: number;
  readonly socialPago: number;
  readonly nutricaoEmail: number;
  readonly eventoPresencial: number;
  readonly webinarSetembro: number;
}

/** Campanha em destaque por padrão: a que carrega o segundo pico. */
export const highlightId = 'webinarSetembro';

export const data: readonly CampaignPeakWeek[] = [
  { week: '2026-01-05', buscaPaga: 21, socialPago: 17, nutricaoEmail: 10, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-01-12', buscaPaga: 23, socialPago: 17, nutricaoEmail: 11, eventoPresencial: 7, webinarSetembro: 6 },
  { week: '2026-01-19', buscaPaga: 24, socialPago: 17, nutricaoEmail: 11, eventoPresencial: 7, webinarSetembro: 6 },
  { week: '2026-01-26', buscaPaga: 26, socialPago: 17, nutricaoEmail: 12, eventoPresencial: 8, webinarSetembro: 6 },
  { week: '2026-02-02', buscaPaga: 27, socialPago: 17, nutricaoEmail: 12, eventoPresencial: 9, webinarSetembro: 6 },
  { week: '2026-02-09', buscaPaga: 28, socialPago: 18, nutricaoEmail: 13, eventoPresencial: 10, webinarSetembro: 6 },
  { week: '2026-02-16', buscaPaga: 29, socialPago: 19, nutricaoEmail: 14, eventoPresencial: 11, webinarSetembro: 6 },
  { week: '2026-02-23', buscaPaga: 30, socialPago: 20, nutricaoEmail: 14, eventoPresencial: 12, webinarSetembro: 6 },
  { week: '2026-03-02', buscaPaga: 32, socialPago: 21, nutricaoEmail: 15, eventoPresencial: 14, webinarSetembro: 6 },
  { week: '2026-03-09', buscaPaga: 35, socialPago: 22, nutricaoEmail: 15, eventoPresencial: 15, webinarSetembro: 6 },
  { week: '2026-03-16', buscaPaga: 37, socialPago: 24, nutricaoEmail: 15, eventoPresencial: 15, webinarSetembro: 6 },
  { week: '2026-03-23', buscaPaga: 39, socialPago: 25, nutricaoEmail: 15, eventoPresencial: 16, webinarSetembro: 6 },
  { week: '2026-03-30', buscaPaga: 39, socialPago: 25, nutricaoEmail: 14, eventoPresencial: 15, webinarSetembro: 6 },
  { week: '2026-04-06', buscaPaga: 38, socialPago: 25, nutricaoEmail: 14, eventoPresencial: 15, webinarSetembro: 6 },
  { week: '2026-04-13', buscaPaga: 36, socialPago: 25, nutricaoEmail: 13, eventoPresencial: 14, webinarSetembro: 6 },
  { week: '2026-04-20', buscaPaga: 33, socialPago: 23, nutricaoEmail: 12, eventoPresencial: 12, webinarSetembro: 6 },
  { week: '2026-04-27', buscaPaga: 29, socialPago: 22, nutricaoEmail: 12, eventoPresencial: 11, webinarSetembro: 6 },
  { week: '2026-05-04', buscaPaga: 26, socialPago: 20, nutricaoEmail: 11, eventoPresencial: 10, webinarSetembro: 6 },
  { week: '2026-05-11', buscaPaga: 23, socialPago: 19, nutricaoEmail: 11, eventoPresencial: 9, webinarSetembro: 6 },
  { week: '2026-05-18', buscaPaga: 22, socialPago: 17, nutricaoEmail: 10, eventoPresencial: 8, webinarSetembro: 6 },
  { week: '2026-05-25', buscaPaga: 21, socialPago: 15, nutricaoEmail: 10, eventoPresencial: 7, webinarSetembro: 6 },
  { week: '2026-06-01', buscaPaga: 22, socialPago: 14, nutricaoEmail: 10, eventoPresencial: 7, webinarSetembro: 6 },
  { week: '2026-06-08', buscaPaga: 22, socialPago: 13, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-06-15', buscaPaga: 22, socialPago: 12, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-06-22', buscaPaga: 22, socialPago: 12, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-06-29', buscaPaga: 21, socialPago: 12, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-07-06', buscaPaga: 20, socialPago: 13, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-07-13', buscaPaga: 19, socialPago: 14, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 7 },
  { week: '2026-07-20', buscaPaga: 18, socialPago: 14, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 9 },
  { week: '2026-07-27', buscaPaga: 18, socialPago: 15, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 15 },
  { week: '2026-08-03', buscaPaga: 19, socialPago: 16, nutricaoEmail: 10, eventoPresencial: 6, webinarSetembro: 26 },
  { week: '2026-08-10', buscaPaga: 20, socialPago: 16, nutricaoEmail: 10, eventoPresencial: 6, webinarSetembro: 46 },
  { week: '2026-08-17', buscaPaga: 21, socialPago: 16, nutricaoEmail: 10, eventoPresencial: 6, webinarSetembro: 73 },
  { week: '2026-08-24', buscaPaga: 22, socialPago: 16, nutricaoEmail: 10, eventoPresencial: 6, webinarSetembro: 103 },
  { week: '2026-08-31', buscaPaga: 22, socialPago: 15, nutricaoEmail: 9, eventoPresencial: 6, webinarSetembro: 127 },
  { week: '2026-09-07', buscaPaga: 22, socialPago: 14, nutricaoEmail: 9, eventoPresencial: 6, webinarSetembro: 136 },
  { week: '2026-09-14', buscaPaga: 21, socialPago: 13, nutricaoEmail: 9, eventoPresencial: 6, webinarSetembro: 127 },
  { week: '2026-09-21', buscaPaga: 20, socialPago: 13, nutricaoEmail: 9, eventoPresencial: 6, webinarSetembro: 103 },
  { week: '2026-09-28', buscaPaga: 19, socialPago: 12, nutricaoEmail: 9, eventoPresencial: 6, webinarSetembro: 73 },
  { week: '2026-10-05', buscaPaga: 18, socialPago: 12, nutricaoEmail: 9, eventoPresencial: 6, webinarSetembro: 46 },
  { week: '2026-10-12', buscaPaga: 18, socialPago: 12, nutricaoEmail: 9, eventoPresencial: 6, webinarSetembro: 26 },
  { week: '2026-10-19', buscaPaga: 19, socialPago: 12, nutricaoEmail: 10, eventoPresencial: 6, webinarSetembro: 15 },
  { week: '2026-10-26', buscaPaga: 20, socialPago: 13, nutricaoEmail: 10, eventoPresencial: 6, webinarSetembro: 9 },
  { week: '2026-11-02', buscaPaga: 21, socialPago: 14, nutricaoEmail: 10, eventoPresencial: 6, webinarSetembro: 7 },
  { week: '2026-11-09', buscaPaga: 22, socialPago: 15, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-11-16', buscaPaga: 22, socialPago: 15, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-11-23', buscaPaga: 21, socialPago: 16, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-11-30', buscaPaga: 20, socialPago: 16, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-12-07', buscaPaga: 19, socialPago: 16, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-12-14', buscaPaga: 18, socialPago: 15, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-12-21', buscaPaga: 18, socialPago: 15, nutricaoEmail: 11, eventoPresencial: 6, webinarSetembro: 6 },
  { week: '2026-12-28', buscaPaga: 19, socialPago: 14, nutricaoEmail: 10, eventoPresencial: 6, webinarSetembro: 6 },
];
