/**
 * Saldo mensal de clientes (novos menos perdidos), em 12 meses do calendário. Contagem líquida de
 * clientes, unidade "clientes". `balance: null` é mês sem apuração (caso difícil de ausência,
 * EIX-10); `balance: 0` é mês medido com saldo exatamente zero, que é diferente. Dado fictício e
 * fixo: nenhuma pessoa ou empresa real é citada.
 */
export interface MonthlyBalanceOrGap {
  readonly month: string;
  readonly balance: number | null;
}

export const data: readonly MonthlyBalanceOrGap[] = [
  { month: '2025-10', balance: 14 },
  { month: '2025-11', balance: -9 },
  { month: '2025-12', balance: null },
  { month: '2026-01', balance: 21 },
  { month: '2026-02', balance: 0 },
  { month: '2026-03', balance: 17 },
  { month: '2026-04', balance: -13 },
  { month: '2026-05', balance: 26 },
  { month: '2026-06', balance: 8 },
  { month: '2026-07', balance: -5 },
  { month: '2026-08', balance: 20 },
  { month: '2026-09', balance: 23 },
];
