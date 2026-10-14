/**
 * Custo por lead (CPL) mensal do marketing, em reais, nos 12 meses até set/26.
 * Dado fictício e fixo. Casos difíceis de propósito: um mês sem coleta (`null`, nunca zero) e o
 * máximo repetido em dois meses (desempate pelo mais recente).
 */
export interface CplMonth {
  readonly month: string;
  readonly cpl: number | null;
}

export interface CplHistory {
  readonly label: string;
  /** Do mais antigo ao mais recente; o último é o mês atual, o que o marcador mostra. */
  readonly months: readonly CplMonth[];
}

export const data: CplHistory = {
  label: 'CPL',
  months: [
    { month: '2025-10', cpl: 47 },
    { month: '2025-11', cpl: 52 },
    { month: '2025-12', cpl: 61 },
    { month: '2026-01', cpl: null },
    { month: '2026-02', cpl: 38 },
    { month: '2026-03', cpl: 24 },
    { month: '2026-04', cpl: 29 },
    { month: '2026-05', cpl: 33 },
    { month: '2026-06', cpl: 61 },
    { month: '2026-07', cpl: 55 },
    { month: '2026-08', cpl: 48 },
    { month: '2026-09', cpl: 41 },
  ],
};
