/**
 * Custo por lead (CPL) do mês contra a régua qualitativa de custo, definida na revisão de
 * 2026-06-01. Polaridade invertida: quanto menor o CPL, melhor. Valores em reais, sem
 * centavo. Dado fictício e fixo.
 */
export interface CostBand {
  readonly name: string;
  readonly from: number;
  readonly to: number;
}

export interface MonthlyCplBullet {
  readonly label: string;
  readonly month: string;
  readonly previousMonth: string;
  readonly value: number;
  readonly previousValue: number;
  readonly target: number;
  readonly policyDate: string;
  readonly bands: readonly CostBand[];
}

export const data: MonthlyCplBullet = {
  label: 'CPL, mídia paga',
  month: '2026-08',
  previousMonth: '2026-07',
  value: 429,
  previousValue: 402,
  target: 350,
  policyDate: '2026-06-01',
  bands: [
    { name: 'Boa', from: 0, to: 350 },
    { name: 'Aceitável', from: 350, to: 450 },
    { name: 'Ruim', from: 450, to: 650 },
  ],
};
