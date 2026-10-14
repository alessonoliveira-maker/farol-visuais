/**
 * Participação de mercado estimada da Somma em Operações Estruturadas (FIDC, CRI, CRA e
 * afins), mensal, em fração de 0 a 1. `restricted` é o perímetro restrito: só as operações com
 * garantia real sobre o total de emissões do mercado. `broad` é o perímetro amplo: inclui
 * também as operações sem garantia real. Os dois perímetros são definição declarada da área
 * de inteligência comercial, não estimativa estatística nem intervalo de confiança.
 * Dado fictício e fixo, jan a dez de 2026.
 */
export interface MarketShareMonth {
  readonly month: string;
  readonly restricted: number;
  readonly broad: number;
}

export const data: readonly MarketShareMonth[] = [
  { month: '2026-01', restricted: 0.123, broad: 0.181 },
  { month: '2026-02', restricted: 0.126, broad: 0.186 },
  { month: '2026-03', restricted: 0.129, broad: 0.19 },
  { month: '2026-04', restricted: 0.131, broad: 0.193 },
  { month: '2026-05', restricted: 0.134, broad: 0.197 },
  { month: '2026-06', restricted: 0.138, broad: 0.203 },
  { month: '2026-07', restricted: 0.141, broad: 0.208 },
  { month: '2026-08', restricted: 0.145, broad: 0.214 },
  { month: '2026-09', restricted: 0.148, broad: 0.219 },
  { month: '2026-10', restricted: 0.151, broad: 0.223 },
  { month: '2026-11', restricted: 0.154, broad: 0.227 },
  { month: '2026-12', restricted: 0.158, broad: 0.232 },
];
