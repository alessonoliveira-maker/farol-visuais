/**
 * Leads e oportunidades abertos de janeiro a agosto de 2026, por faixa de faturamento anual da
 * conta, em contagem. A ordem do array é a ordem natural das faixas, da menor para a maior.
 * `null` quer dizer faixa sem observação naquele lado, o que é diferente de zero: as oportunidades
 * acima de R$ 500 mi correm em outra mesa e não entram nesta base.
 * Dado fictício e fixo: nenhuma conta, pessoa ou empresa é real.
 */
export interface SizeBandVolume {
  readonly id: string;
  /** Faixa de faturamento anual da conta, como aparece na tela. */
  readonly band: string;
  readonly leads: number | null;
  readonly opportunities: number | null;
}

export const data: readonly SizeBandVolume[] = [
  { id: 'porte-ate-5mi', band: 'Até R$ 5 mi', leads: 4_180, opportunities: 9 },
  { id: 'porte-5-a-30mi', band: 'R$ 5 a 30 mi', leads: 3_264, opportunities: 23 },
  { id: 'porte-30-a-100mi', band: 'R$ 30 a 100 mi', leads: 1_702, opportunities: 28 },
  { id: 'porte-100-a-500mi', band: 'R$ 100 a 500 mi', leads: 894, opportunities: 21 },
  { id: 'porte-acima-500mi', band: 'Acima de R$ 500 mi', leads: 372, opportunities: null },
];
