/**
 * Leads por origem, mês a mês, de 2025-01 a 2026-12 (24 meses), em contagem de leads. Seis origens
 * nomeadas mais "Outras", que agrega quatro origens menores e completa as dez origens do caso de
 * uso sem passar do teto de seis cores.
 *
 * A ordem por tamanho muda oito vezes no período, e cada troca cai num par de meses diferente:
 * busca paga sai do 7º posto em 2025-01 e chega ao 1º em 2026-04, passando por parceria, outras,
 * evento, conteúdo, social pago e indicação, nesta sequência; depois social pago e conteúdo também
 * passam indicação, que cai do 1º ao 4º posto.
 *
 * Dois meses trazem empate de valor, que é onde a regra de desempate se vê: evento e busca paga com
 * 31 leads em 2025-07, e indicação e social pago com 59 leads em 2026-06. Nos dois casos o mês
 * anterior decide quem fica mais perto da base e a troca de posto só acontece no mês seguinte.
 *
 * Dado fictício e fixo: nenhuma origem nomeia plataforma, empresa ou pessoa real.
 */
export interface MonthlyOriginRank {
  readonly month: string;
  readonly referral: number;
  readonly paidSearch: number;
  readonly paidSocial: number;
  readonly content: number;
  readonly event: number;
  readonly partnership: number;
  readonly others: number;
}

/** Quantas origens menores entram em "Outras": fixo, não varia por mês. */
export const othersCount = 4;

export const data: readonly MonthlyOriginRank[] = [
  { month: '2025-01', referral: 88, paidSearch: 12, paidSocial: 50, content: 44, event: 34, partnership: 16, others: 26 },
  { month: '2025-02', referral: 87, paidSearch: 14, paidSocial: 51, content: 45, event: 34, partnership: 16, others: 26 },
  { month: '2025-03', referral: 85, paidSearch: 17, paidSocial: 51, content: 45, event: 33, partnership: 15, others: 25 },
  { month: '2025-04', referral: 84, paidSearch: 22, paidSocial: 52, content: 46, event: 33, partnership: 15, others: 25 },
  { month: '2025-05', referral: 82, paidSearch: 27, paidSocial: 52, content: 46, event: 32, partnership: 15, others: 25 },
  { month: '2025-06', referral: 81, paidSearch: 29, paidSocial: 53, content: 47, event: 32, partnership: 14, others: 24 },
  { month: '2025-07', referral: 79, paidSearch: 31, paidSocial: 53, content: 47, event: 31, partnership: 14, others: 24 },
  { month: '2025-08', referral: 78, paidSearch: 33, paidSocial: 54, content: 47, event: 31, partnership: 14, others: 24 },
  { month: '2025-09', referral: 76, paidSearch: 38, paidSocial: 54, content: 47, event: 30, partnership: 13, others: 23 },
  { month: '2025-10', referral: 75, paidSearch: 44, paidSocial: 55, content: 47, event: 30, partnership: 13, others: 23 },
  { month: '2025-11', referral: 73, paidSearch: 49, paidSocial: 55, content: 48, event: 29, partnership: 13, others: 23 },
  { month: '2025-12', referral: 71, paidSearch: 52, paidSocial: 56, content: 48, event: 29, partnership: 13, others: 22 },
  { month: '2026-01', referral: 69, paidSearch: 54, paidSocial: 57, content: 49, event: 28, partnership: 12, others: 22 },
  { month: '2026-02', referral: 67, paidSearch: 59, paidSocial: 57, content: 49, event: 28, partnership: 12, others: 22 },
  { month: '2026-03', referral: 65, paidSearch: 61, paidSocial: 58, content: 50, event: 27, partnership: 12, others: 21 },
  { month: '2026-04', referral: 63, paidSearch: 64, paidSocial: 58, content: 50, event: 27, partnership: 12, others: 21 },
  { month: '2026-05', referral: 61, paidSearch: 70, paidSocial: 58, content: 51, event: 26, partnership: 11, others: 21 },
  { month: '2026-06', referral: 59, paidSearch: 76, paidSocial: 59, content: 51, event: 26, partnership: 11, others: 20 },
  { month: '2026-07', referral: 57, paidSearch: 82, paidSocial: 59, content: 52, event: 25, partnership: 11, others: 20 },
  { month: '2026-08', referral: 55, paidSearch: 88, paidSocial: 60, content: 52, event: 25, partnership: 11, others: 20 },
  { month: '2026-09', referral: 53, paidSearch: 93, paidSocial: 60, content: 52, event: 24, partnership: 10, others: 19 },
  { month: '2026-10', referral: 51, paidSearch: 98, paidSocial: 61, content: 53, event: 24, partnership: 10, others: 19 },
  { month: '2026-11', referral: 49, paidSearch: 102, paidSocial: 61, content: 53, event: 23, partnership: 10, others: 18 },
  { month: '2026-12', referral: 47, paidSearch: 106, paidSocial: 62, content: 54, event: 22, partnership: 10, others: 18 },
];
