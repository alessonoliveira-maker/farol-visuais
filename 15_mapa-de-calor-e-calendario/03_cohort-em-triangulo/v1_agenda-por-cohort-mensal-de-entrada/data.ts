/**
 * Conversão de lead em agenda por cohort mensal de entrada, de janeiro a setembro de 2026. Dado
 * fictício e fixo. Cada cohort é o conjunto de leads que entrou naquele mês, e a taxa de cada coluna
 * é acumulada: M3 é a fração do cohort que já tinha agenda marcada até o terceiro mês de vida, não a
 * fração que marcou naquele mês. O triângulo nasce sozinho: um cohort de agosto ainda não viveu M2.
 *
 * O mês corrente é setembro de 2026, então a célula onde o mês de entrada mais os meses decorridos
 * cai em setembro está em curso e conta período incompleto. Nenhum nome é pessoa real.
 */

/** Mês de referência do recorte, congelado com o dado. Nunca ler o relógio da máquina. */
export const CURRENT_MONTH = '2026-09';

/** Colunas do triângulo: meses decorridos desde a entrada, de M0 a M6. */
export const ELAPSED_MONTHS = 7;

export interface CohortRow {
  /** Mês de entrada do cohort, em `YYYY-MM`. */
  readonly month: string;
  /** Leads que entraram no mês. */
  readonly size: number;
  /**
   * Taxa acumulada de agenda marcada, uma posição por mês decorrido a partir de M0. O array tem só
   * os períodos que já começaram: é ele que desenha o triângulo.
   */
  readonly cumulative: readonly number[];
}

export const data: readonly CohortRow[] = [
  { month: '2026-01', size: 412, cumulative: [0.081, 0.142, 0.171, 0.186, 0.193, 0.197, 0.199] },
  { month: '2026-02', size: 388, cumulative: [0.075, 0.131, 0.166, 0.182, 0.191, 0.195, 0.197] },
  { month: '2026-03', size: 455, cumulative: [0.092, 0.155, 0.188, 0.203, 0.211, 0.215, 0.217] },
  { month: '2026-04', size: 501, cumulative: [0.088, 0.149, 0.181, 0.198, 0.207, 0.211] },
  { month: '2026-05', size: 476, cumulative: [0.101, 0.168, 0.199, 0.214, 0.219] },
  { month: '2026-06', size: 523, cumulative: [0.096, 0.161, 0.192, 0.205] },
  { month: '2026-07', size: 549, cumulative: [0.104, 0.173, 0.201] },
  { month: '2026-08', size: 588, cumulative: [0.112, 0.181] },
  { month: '2026-09', size: 274, cumulative: [0.048] },
];
