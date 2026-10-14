/**
 * Orçamento de mídia paga do mês por plataforma, planejado contra consumido, em reais. Uma
 * plataforma não teve veiculação no mês. Dado fictício e fixo.
 */
export interface MediaPlatformBudget {
  readonly id: string;
  readonly shortLabel: string;
  readonly fullLabel: string;
  readonly planned: number;
  readonly spent: number | null;
}

export interface MediaBudgetPanel {
  readonly month: string;
  readonly comfortFrom: number;
  readonly comfortTo: number;
  readonly platforms: readonly MediaPlatformBudget[];
}

export const data: MediaBudgetPanel = {
  month: '2026-08',
  comfortFrom: 85,
  comfortTo: 105,
  platforms: [
    { id: 'social', shortLabel: 'Social', fullLabel: 'Rede social paga', planned: 40_000, spent: 43_200 },
    { id: 'busca', shortLabel: 'Busca', fullLabel: 'Busca paga', planned: 35_000, spent: 33_600 },
    { id: 'profissional', shortLabel: 'Profissional', fullLabel: 'Rede profissional paga', planned: 18_000, spent: 14_200 },
    { id: 'display', shortLabel: 'Display', fullLabel: 'Display programática', planned: 12_000, spent: null },
  ],
};
