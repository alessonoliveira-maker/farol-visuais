/**
 * Receita reconhecida do mês contra a meta, com a fração do mês já decorrida até a data de corte.
 * Dado fictício e fixo.
 */
export interface ReceitaDoMes {
  readonly month: string;
  readonly reconhecida: number;
  readonly meta: number;
  /** De 0 a 1: dias já passados sobre os dias do mês, calculado fora do componente. */
  readonly fracaoDecorrida: number;
}

export const data: ReceitaDoMes = {
  month: '2026-07',
  reconhecida: 2_220_000,
  meta: 3_000_000,
  fracaoDecorrida: 0.6,
};
