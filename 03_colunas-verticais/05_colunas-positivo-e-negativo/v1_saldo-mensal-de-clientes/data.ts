/**
 * Saldo mensal de clientes (novos menos perdidos), nos últimos 12 meses do calendário. Contagem
 * líquida de clientes, unidade "clientes". Valor positivo é mês em que entrou mais gente do que
 * saiu; negativo é o contrário. Dado fictício e fixo: nenhuma pessoa ou empresa real é citada.
 */
export interface MonthlyClientBalance {
  readonly month: string;
  readonly balance: number;
}

export const data: readonly MonthlyClientBalance[] = [
  { month: '2025-10', balance: 12 },
  { month: '2025-11', balance: 18 },
  { month: '2025-12', balance: -6 },
  { month: '2026-01', balance: 24 },
  { month: '2026-02', balance: 31 },
  { month: '2026-03', balance: 9 },
  { month: '2026-04', balance: -4 },
  { month: '2026-05', balance: 15 },
  { month: '2026-06', balance: 22 },
  { month: '2026-07', balance: -11 },
  { month: '2026-08', balance: 28 },
  { month: '2026-09', balance: 34 },
];
