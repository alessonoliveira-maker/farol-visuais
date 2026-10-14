/**
 * Leads mensais por origem, valores absolutos, últimos 6 meses.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * O mês de 2026-08 tem orgânico quase zerado (9), caso difícil que testa o segmento minúsculo
 * no meio da pilha, onde o modelo é mais fraco (nenhuma ponta comum entre colunas).
 */
export interface MonthlyOriginCount {
  readonly month: string;
  readonly pago: number;
  readonly organico: number;
  readonly indicacao: number;
}

export const data: readonly MonthlyOriginCount[] = [
  { month: '2026-04', pago: 214, organico: 96, indicacao: 118 },
  { month: '2026-05', pago: 248, organico: 84, indicacao: 132 },
  { month: '2026-06', pago: 301, organico: 71, indicacao: 96 },
  { month: '2026-07', pago: 336, organico: 58, indicacao: 140 },
  { month: '2026-08', pago: 402, organico: 9, indicacao: 89 },
  { month: '2026-09', pago: 458, organico: 67, indicacao: 121 },
];
