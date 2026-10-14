/**
 * Leads mensais por origem, últimos 6 meses, com cauda longa de 14 origens.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export interface MonthlyOriginTail {
  readonly month: string;
  readonly indicacao: number;
  readonly organico: number;
  readonly pago: number;
  readonly parceria: number;
  readonly evento: number;
  /** Soma das 9 origens menores da cauda longa. */
  readonly outros: number;
  /** Leads sem origem registrada no formulário de entrada. */
  readonly semOrigem: number;
}

export const data: readonly MonthlyOriginTail[] = [
  { month: '2026-04', indicacao: 140, organico: 60, pago: 210, parceria: 40, evento: 18, outros: 34, semOrigem: 12 },
  { month: '2026-05', indicacao: 150, organico: 55, pago: 240, parceria: 0, evento: 22, outros: 30, semOrigem: 9 },
  { month: '2026-06', indicacao: 132, organico: 70, pago: 195, parceria: 35, evento: 0, outros: 28, semOrigem: 15 },
  { month: '2026-07', indicacao: 128, organico: 58, pago: 180, parceria: 42, evento: 15, outros: 33, semOrigem: 0 },
  { month: '2026-08', indicacao: 145, organico: 64, pago: 230, parceria: 0, evento: 20, outros: 31, semOrigem: 11 },
  { month: '2026-09', indicacao: 160, organico: 72, pago: 205, parceria: 38, evento: 25, outros: 29, semOrigem: 14 },
];
