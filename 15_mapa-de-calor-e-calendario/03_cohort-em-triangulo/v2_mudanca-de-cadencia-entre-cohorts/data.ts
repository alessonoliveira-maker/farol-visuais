/**
 * Conversão de lead em agenda por cohort mensal de entrada, de janeiro a setembro de 2026, partida em
 * dois regimes de trabalho da pré-vendas. Dado fictício e fixo: nenhum nome é pessoa real.
 *
 * O dado guarda CONTAGEM ACUMULADA de agendas, não taxa: `booked[3]` é quantos leads daquele cohort já
 * tinham agenda marcada até o quarto mês de vida, e a taxa nasce da divisão por `size` no componente.
 * Guardar a contagem é o que permite a ausência de base virar ausência de taxa em vez de zero, e é o
 * que faz o volume viajar junto da taxa em toda leitura (DAD-1).
 *
 * O triângulo nasce do próprio dado: o array de um cohort de agosto ainda não tem posição para M2,
 * porque o mês não aconteceu. Isso é diferente de posição medida com valor zero e diferente de posição
 * que existe e não foi medida, e as três coisas convivem neste modelo.
 *
 * O mês de referência do recorte e o mês em que a nova cadência entrou vivem aqui, congelados com o
 * dado: o desenho da diagonal e a posição da divisória não podem depender do relógio da máquina.
 */

/** Mês de referência do recorte. Nunca ler o relógio: preview e teste desenham a mesma diagonal. */
export const CURRENT_MONTH = '2026-09';

/** Primeiro cohort que entrou já sob a nova cadência de pré-vendas. */
export const CADENCE_MONTH = '2026-05';

/** Colunas do triângulo: meses decorridos desde a entrada, de M0 a M6. */
export const ELAPSED_MONTHS = 7;

export interface CohortRow {
  /** Mês de entrada do cohort, em `YYYY-MM`. */
  readonly month: string;
  /** Leads que entraram no mês, a base de toda taxa da linha. */
  readonly size: number;
  /**
   * Agendas marcadas, contagem ACUMULADA, uma posição por mês decorrido a partir de M0. O array tem
   * só os períodos que já começaram, e é ele que desenha o triângulo. Posição `null` é período que
   * começou e cujo fechamento não foi medido, categoria distinta de contagem zero.
   */
  readonly booked: readonly (number | null)[];
}

export const data: readonly CohortRow[] = [
  { month: '2026-01', size: 412, booked: [33, 57, 70, 77, 80, 81, 82] },
  { month: '2026-02', size: 388, booked: [29, 52, 64, 71, 74, 76, 77] },
  { month: '2026-03', size: 455, booked: [36, 65, 80, 88, 92, 94, 95] },
  { month: '2026-04', size: 501, booked: [41, 72, 89, 98, 102, 104] },
  { month: '2026-05', size: 476, booked: [49, 100, 119, 128, 132] },
  { month: '2026-06', size: 523, booked: [56, 113, 134, 142] },
  { month: '2026-07', size: 549, booked: [60, 119, 140] },
  { month: '2026-08', size: 588, booked: [64, 127] },
  { month: '2026-09', size: 274, booked: [13] },
];
