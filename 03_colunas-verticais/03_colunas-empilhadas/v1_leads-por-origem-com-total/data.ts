/**
 * Leads mensais por origem, últimos 6 meses.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export interface MonthlyOriginLeads {
  readonly month: string;
  readonly indicacao: number;
  readonly organico: number;
  readonly pago: number;
}

export const data: readonly MonthlyOriginLeads[] = [
  { month: '2026-04', indicacao: 120, organico: 95, pago: 260 },
  { month: '2026-05', indicacao: 110, organico: 88, pago: 310 },
  { month: '2026-06', indicacao: 135, organico: 102, pago: 340 },
  { month: '2026-07', indicacao: 128, organico: 76, pago: 298 },
  { month: '2026-08', indicacao: 142, organico: 9, pago: 355 },
  { month: '2026-09', indicacao: 118, organico: 84, pago: 401 },
];
