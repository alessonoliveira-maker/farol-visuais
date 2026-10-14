/**
 * Participação de mercado em Operações Estruturadas, mensal, em fração de 0 a 1. `restricted`
 * é o perímetro restrito, medido todo mês. `broad` é o perímetro amplo, que depende de um dado
 * de mercado de terceiros e ficou sem atualização de maio a julho de 2026; nesses meses o
 * valor é `null`, nunca zero. Os dois perímetros seguem a mesma definição declarada da
 * v1_participacao-de-mercado-por-perimetro: restrito é só operações com garantia real, amplo
 * inclui também as sem garantia real. Dado fictício e fixo, jan a out de 2026.
 */
export interface MarketShareMonthPartial {
  readonly month: string;
  readonly restricted: number;
  readonly broad: number | null;
}

export const gapStart = '2026-05';
export const gapEnd = '2026-07';

export const data: readonly MarketShareMonthPartial[] = [
  { month: '2026-01', restricted: 0.123, broad: 0.181 },
  { month: '2026-02', restricted: 0.126, broad: 0.186 },
  { month: '2026-03', restricted: 0.129, broad: 0.19 },
  { month: '2026-04', restricted: 0.131, broad: 0.193 },
  { month: '2026-05', restricted: 0.134, broad: null },
  { month: '2026-06', restricted: 0.138, broad: null },
  { month: '2026-07', restricted: 0.141, broad: null },
  { month: '2026-08', restricted: 0.145, broad: 0.214 },
  { month: '2026-09', restricted: 0.148, broad: 0.219 },
  { month: '2026-10', restricted: 0.151, broad: 0.223 },
];
