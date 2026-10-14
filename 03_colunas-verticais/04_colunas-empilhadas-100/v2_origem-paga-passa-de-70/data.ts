/**
 * Leads mensais em duas origens, valores absolutos, últimos 6 meses.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * 2026-04 tem a menor fatia paga da série (7%), caso difícil que testa o rótulo de percentual
 * num segmento fino demais para o texto entrar dentro dele.
 */
export interface MonthlyPaidShare {
  readonly month: string;
  readonly pago: number;
  readonly outras: number;
}

export const data: readonly MonthlyPaidShare[] = [
  { month: '2026-04', pago: 40, outras: 520 },
  { month: '2026-05', pago: 120, outras: 430 },
  { month: '2026-06', pago: 230, outras: 350 },
  { month: '2026-07', pago: 340, outras: 260 },
  { month: '2026-08', pago: 460, outras: 175 },
  { month: '2026-09', pago: 505, outras: 140 },
];
