/**
 * CPL bruto e CPL qualificado por mês, em reais, de 2026-01 a 2026-08.
 * Dado fictício e fixo: nenhuma campanha ou plataforma real.
 */
export interface MonthlyCplPair {
  readonly month: string;
  readonly rawCpl: number;
  readonly qualifiedCpl: number;
}

export const data: readonly MonthlyCplPair[] = [
  { month: '2026-01', rawCpl: 214.3, qualifiedCpl: 268.9 },
  { month: '2026-02', rawCpl: 198.7, qualifiedCpl: 251.4 },
  { month: '2026-03', rawCpl: 226.8, qualifiedCpl: 259.1 },
  { month: '2026-04', rawCpl: 205.5, qualifiedCpl: 238.6 },
  { month: '2026-05', rawCpl: 189.9, qualifiedCpl: 224.3 },
  { month: '2026-06', rawCpl: 201.2, qualifiedCpl: 219.8 },
  { month: '2026-07', rawCpl: 193.4, qualifiedCpl: 205.7 },
  { month: '2026-08', rawCpl: 187.4, qualifiedCpl: 191.9 },
];
