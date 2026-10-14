/**
 * Receita reconhecida mensal de 2026, em reais, de janeiro a agosto. Agosto vem negativo: um
 * contrato fechado em julho foi cancelado e o estorno superou o que fechou no mês.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export interface MonthlyRevenue {
  readonly month: string;
  readonly revenueRecognized: number;
}

export const data: readonly MonthlyRevenue[] = [
  { month: '2026-01', revenueRecognized: 800_000 },
  { month: '2026-02', revenueRecognized: 760_000 },
  { month: '2026-03', revenueRecognized: 820_000 },
  { month: '2026-04', revenueRecognized: 795_000 },
  { month: '2026-05', revenueRecognized: 840_000 },
  { month: '2026-06', revenueRecognized: 865_000 },
  { month: '2026-07', revenueRecognized: 910_000 },
  { month: '2026-08', revenueRecognized: -380_000 },
];

/** Meta anual original, vigente até a revisão. */
export const originalAnnualTarget = 9_000_000;
/** Meta anual revisada, vigente a partir de `revisionMonth`. */
export const revisedAnnualTarget = 10_200_000;
/** Mês em que a meta passou a valer a nova trajetória. */
export const revisionMonth = '2026-07';
