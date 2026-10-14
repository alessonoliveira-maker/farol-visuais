/**
 * Leads e oportunidades abertos no 3º trimestre de 2026, por faixa de faturamento anual da conta,
 * em contagem. A ordem do array é a ordem natural das faixas, da menor para a maior.
 * Dado fictício e fixo: nenhuma conta, pessoa ou empresa é real.
 */
export interface SizeBandFunnel {
  readonly id: string;
  /** Faixa de faturamento anual da conta, como aparece na tela. */
  readonly band: string;
  readonly leads: number;
  readonly opportunities: number;
}

export const data: readonly SizeBandFunnel[] = [
  { id: 'porte-ate-5mi', band: 'Até R$ 5 mi', leads: 142, opportunities: 11 },
  { id: 'porte-5-a-30mi', band: 'R$ 5 a 30 mi', leads: 118, opportunities: 29 },
  { id: 'porte-30-a-100mi', band: 'R$ 30 a 100 mi', leads: 86, opportunities: 43 },
  { id: 'porte-100-a-500mi', band: 'R$ 100 a 500 mi', leads: 49, opportunities: 36 },
  { id: 'porte-acima-500mi', band: 'Acima de R$ 500 mi', leads: 21, opportunities: 19 },
];
