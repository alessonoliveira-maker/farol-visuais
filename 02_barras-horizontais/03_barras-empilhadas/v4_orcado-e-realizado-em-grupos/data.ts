/**
 * Investimento de mídia paga por plataforma no mês, orçado contra realizado, em reais, dividido
 * por tipo de campanha (prospecção e remarketing). Uma plataforma nova entrou sem orçado
 * aprovado ainda. Foto de 2026-09. Dado fictício e fixo: nenhuma marca real.
 */
export interface MediaPlatformRow {
  readonly id: string;
  readonly name: string;
  readonly hasBudget: boolean;
  readonly budgetProspecting: number;
  readonly budgetRemarketing: number;
  readonly realizedProspecting: number;
  readonly realizedRemarketing: number;
}

export const data: readonly MediaPlatformRow[] = [
  { id: 'plat-01', name: 'Rede social', hasBudget: true, budgetProspecting: 180_000, budgetRemarketing: 60_000, realizedProspecting: 205_400, realizedRemarketing: 54_100 },
  { id: 'plat-02', name: 'Busca paga', hasBudget: true, budgetProspecting: 150_000, budgetRemarketing: 40_000, realizedProspecting: 132_800, realizedRemarketing: 41_500 },
  { id: 'plat-03', name: 'Rede profissional', hasBudget: true, budgetProspecting: 90_000, budgetRemarketing: 20_000, realizedProspecting: 76_300, realizedRemarketing: 18_200 },
  { id: 'plat-04', name: 'Vídeo curto', hasBudget: false, budgetProspecting: 0, budgetRemarketing: 0, realizedProspecting: 32_000, realizedRemarketing: 8_400 },
];
