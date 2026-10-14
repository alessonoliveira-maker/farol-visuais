/**
 * Leads semanais gerados por campanha em 2026 (52 semanas), em contagem de leads. Seis campanhas
 * nomeadas mais "outras" (agregação fixa de 6 campanhas menores, o volume de cada semana varia,
 * a contagem de campanhas agregadas não). Padrão sazonal com dois picos: busca paga sobe em
 * março com o lançamento do fundo, e webinar mais evento presencial dominam setembro com a
 * temporada de captação do segundo semestre. Dado fictício e fixo.
 */
export interface CampaignWeek {
  readonly week: string;
  readonly buscaPaga: number;
  readonly socialPago: number;
  readonly nutricaoEmail: number;
  readonly webinar: number;
  readonly parceriaCanal: number;
  readonly eventoPresencial: number;
  readonly outras: number;
}

/** Número de campanhas menores agregadas em "outras": fixo, não varia por semana. */
export const outrasCount = 6;

export const data: readonly CampaignWeek[] = [
  { week: '2026-01-05', buscaPaga: 47, socialPago: 26, nutricaoEmail: 16, webinar: 6, parceriaCanal: 7, eventoPresencial: 5, outras: 10 },
  { week: '2026-01-12', buscaPaga: 52, socialPago: 27, nutricaoEmail: 17, webinar: 6, parceriaCanal: 7, eventoPresencial: 5, outras: 11 },
  { week: '2026-01-19', buscaPaga: 57, socialPago: 28, nutricaoEmail: 19, webinar: 6, parceriaCanal: 7, eventoPresencial: 5, outras: 11 },
  { week: '2026-01-26', buscaPaga: 60, socialPago: 29, nutricaoEmail: 20, webinar: 7, parceriaCanal: 7, eventoPresencial: 5, outras: 12 },
  { week: '2026-02-02', buscaPaga: 62, socialPago: 30, nutricaoEmail: 20, webinar: 7, parceriaCanal: 7, eventoPresencial: 5, outras: 12 },
  { week: '2026-02-09', buscaPaga: 64, socialPago: 31, nutricaoEmail: 21, webinar: 8, parceriaCanal: 7, eventoPresencial: 5, outras: 12 },
  { week: '2026-02-16', buscaPaga: 66, socialPago: 33, nutricaoEmail: 21, webinar: 8, parceriaCanal: 7, eventoPresencial: 5, outras: 11 },
  { week: '2026-02-23', buscaPaga: 69, socialPago: 34, nutricaoEmail: 20, webinar: 8, parceriaCanal: 7, eventoPresencial: 5, outras: 11 },
  { week: '2026-03-02', buscaPaga: 72, socialPago: 36, nutricaoEmail: 19, webinar: 9, parceriaCanal: 7, eventoPresencial: 19, outras: 10 },
  { week: '2026-03-09', buscaPaga: 76, socialPago: 38, nutricaoEmail: 18, webinar: 9, parceriaCanal: 7, eventoPresencial: 19, outras: 9 },
  { week: '2026-03-16', buscaPaga: 78, socialPago: 39, nutricaoEmail: 17, webinar: 9, parceriaCanal: 8, eventoPresencial: 19, outras: 8 },
  { week: '2026-03-23', buscaPaga: 78, socialPago: 40, nutricaoEmail: 15, webinar: 9, parceriaCanal: 8, eventoPresencial: 19, outras: 8 },
  { week: '2026-03-30', buscaPaga: 77, socialPago: 39, nutricaoEmail: 14, webinar: 9, parceriaCanal: 8, eventoPresencial: 5, outras: 8 },
  { week: '2026-04-06', buscaPaga: 73, socialPago: 38, nutricaoEmail: 13, webinar: 8, parceriaCanal: 8, eventoPresencial: 5, outras: 8 },
  { week: '2026-04-13', buscaPaga: 67, socialPago: 36, nutricaoEmail: 12, webinar: 8, parceriaCanal: 8, eventoPresencial: 5, outras: 9 },
  { week: '2026-04-20', buscaPaga: 62, socialPago: 34, nutricaoEmail: 11, webinar: 8, parceriaCanal: 8, eventoPresencial: 5, outras: 9 },
  { week: '2026-04-27', buscaPaga: 58, socialPago: 31, nutricaoEmail: 11, webinar: 7, parceriaCanal: 8, eventoPresencial: 5, outras: 10 },
  { week: '2026-05-04', buscaPaga: 56, socialPago: 28, nutricaoEmail: 12, webinar: 7, parceriaCanal: 8, eventoPresencial: 5, outras: 11 },
  { week: '2026-05-11', buscaPaga: 54, socialPago: 26, nutricaoEmail: 12, webinar: 6, parceriaCanal: 8, eventoPresencial: 5, outras: 12 },
  { week: '2026-05-18', buscaPaga: 53, socialPago: 24, nutricaoEmail: 13, webinar: 6, parceriaCanal: 8, eventoPresencial: 5, outras: 12 },
  { week: '2026-05-25', buscaPaga: 52, socialPago: 23, nutricaoEmail: 15, webinar: 6, parceriaCanal: 9, eventoPresencial: 5, outras: 12 },
  { week: '2026-06-01', buscaPaga: 50, socialPago: 23, nutricaoEmail: 16, webinar: 6, parceriaCanal: 9, eventoPresencial: 5, outras: 12 },
  { week: '2026-06-08', buscaPaga: 47, socialPago: 23, nutricaoEmail: 17, webinar: 5, parceriaCanal: 9, eventoPresencial: 5, outras: 11 },
  { week: '2026-06-15', buscaPaga: 45, socialPago: 24, nutricaoEmail: 19, webinar: 5, parceriaCanal: 9, eventoPresencial: 5, outras: 10 },
  { week: '2026-06-22', buscaPaga: 45, socialPago: 26, nutricaoEmail: 20, webinar: 6, parceriaCanal: 9, eventoPresencial: 5, outras: 10 },
  { week: '2026-06-29', buscaPaga: 46, socialPago: 27, nutricaoEmail: 21, webinar: 6, parceriaCanal: 9, eventoPresencial: 5, outras: 9 },
  { week: '2026-07-06', buscaPaga: 50, socialPago: 28, nutricaoEmail: 21, webinar: 6, parceriaCanal: 9, eventoPresencial: 5, outras: 8 },
  { week: '2026-07-13', buscaPaga: 55, socialPago: 29, nutricaoEmail: 21, webinar: 6, parceriaCanal: 9, eventoPresencial: 5, outras: 8 },
  { week: '2026-07-20', buscaPaga: 61, socialPago: 30, nutricaoEmail: 20, webinar: 7, parceriaCanal: 9, eventoPresencial: 5, outras: 8 },
  { week: '2026-07-27', buscaPaga: 66, socialPago: 31, nutricaoEmail: 19, webinar: 7, parceriaCanal: 9, eventoPresencial: 5, outras: 8 },
  { week: '2026-08-03', buscaPaga: 71, socialPago: 33, nutricaoEmail: 18, webinar: 8, parceriaCanal: 10, eventoPresencial: 5, outras: 9 },
  { week: '2026-08-10', buscaPaga: 74, socialPago: 35, nutricaoEmail: 17, webinar: 9, parceriaCanal: 10, eventoPresencial: 5, outras: 10 },
  { week: '2026-08-17', buscaPaga: 76, socialPago: 37, nutricaoEmail: 15, webinar: 9, parceriaCanal: 10, eventoPresencial: 5, outras: 10 },
  { week: '2026-08-24', buscaPaga: 79, socialPago: 40, nutricaoEmail: 14, webinar: 16, parceriaCanal: 10, eventoPresencial: 5, outras: 11 },
  { week: '2026-08-31', buscaPaga: 82, socialPago: 42, nutricaoEmail: 13, webinar: 16, parceriaCanal: 10, eventoPresencial: 15, outras: 12 },
  { week: '2026-09-07', buscaPaga: 85, socialPago: 44, nutricaoEmail: 12, webinar: 16, parceriaCanal: 10, eventoPresencial: 15, outras: 12 },
  { week: '2026-09-14', buscaPaga: 88, socialPago: 45, nutricaoEmail: 11, webinar: 16, parceriaCanal: 10, eventoPresencial: 15, outras: 12 },
  { week: '2026-09-21', buscaPaga: 89, socialPago: 46, nutricaoEmail: 11, webinar: 16, parceriaCanal: 10, eventoPresencial: 15, outras: 12 },
  { week: '2026-09-28', buscaPaga: 88, socialPago: 45, nutricaoEmail: 12, webinar: 16, parceriaCanal: 10, eventoPresencial: 5, outras: 11 },
  { week: '2026-10-05', buscaPaga: 84, socialPago: 43, nutricaoEmail: 12, webinar: 16, parceriaCanal: 10, eventoPresencial: 5, outras: 10 },
  { week: '2026-10-12', buscaPaga: 78, socialPago: 40, nutricaoEmail: 13, webinar: 9, parceriaCanal: 11, eventoPresencial: 5, outras: 9 },
  { week: '2026-10-19', buscaPaga: 72, socialPago: 37, nutricaoEmail: 15, webinar: 9, parceriaCanal: 11, eventoPresencial: 5, outras: 9 },
  { week: '2026-10-26', buscaPaga: 65, socialPago: 33, nutricaoEmail: 16, webinar: 8, parceriaCanal: 11, eventoPresencial: 5, outras: 8 },
  { week: '2026-11-02', buscaPaga: 60, socialPago: 30, nutricaoEmail: 18, webinar: 7, parceriaCanal: 11, eventoPresencial: 5, outras: 8 },
  { week: '2026-11-09', buscaPaga: 57, socialPago: 27, nutricaoEmail: 19, webinar: 7, parceriaCanal: 11, eventoPresencial: 5, outras: 8 },
  { week: '2026-11-16', buscaPaga: 54, socialPago: 26, nutricaoEmail: 20, webinar: 6, parceriaCanal: 11, eventoPresencial: 5, outras: 8 },
  { week: '2026-11-23', buscaPaga: 52, socialPago: 24, nutricaoEmail: 21, webinar: 6, parceriaCanal: 11, eventoPresencial: 5, outras: 9 },
  { week: '2026-11-30', buscaPaga: 50, socialPago: 24, nutricaoEmail: 21, webinar: 6, parceriaCanal: 11, eventoPresencial: 5, outras: 10 },
  { week: '2026-12-07', buscaPaga: 47, socialPago: 23, nutricaoEmail: 21, webinar: 5, parceriaCanal: 11, eventoPresencial: 5, outras: 11 },
  { week: '2026-12-14', buscaPaga: 43, socialPago: 23, nutricaoEmail: 20, webinar: 5, parceriaCanal: 11, eventoPresencial: 5, outras: 11 },
  { week: '2026-12-21', buscaPaga: 40, socialPago: 23, nutricaoEmail: 19, webinar: 5, parceriaCanal: 12, eventoPresencial: 5, outras: 12 },
  { week: '2026-12-28', buscaPaga: 37, socialPago: 22, nutricaoEmail: 18, webinar: 5, parceriaCanal: 12, eventoPresencial: 5, outras: 12 },
];
