/**
 * Taxa de ganho acumulada de oportunidades por mês de criação, de abril de 2025 a setembro de 2026.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 *
 * O dado guarda CONTAGEM ACUMULADA de negócios ganhos, não taxa: `won[6]` é quantas oportunidades
 * daquele mês de criação já tinham sido ganhas até o sétimo mês de vida, e a taxa nasce da divisão por
 * `size` no componente. Guardar a contagem é o que faz o volume viajar junto da taxa (DAD-1) e o que
 * permite ausência de base virar ausência de taxa em vez de zero (EST-1b).
 *
 * O triângulo nasce do próprio dado, com dois cortes. O de baixo é o tempo: um mês de criação de agosto
 * de 2026 ainda não viveu o segundo mês. O de cima é o recorte da pergunta: a leitura para em doze meses
 * decorridos, então os cohorts de 2025 têm o array truncado em M12 mesmo tendo vivido mais.
 *
 * Ganho no próprio mês de criação é raro, e é por isso que sete linhas começam com zero medido: zero é
 * medida e não ausência, e no desenho ele tem tratamento próprio (EST-3, DAD-2).
 */

/** Mês de referência do recorte. Nunca ler o relógio: preview e teste desenham a mesma diagonal. */
export const CURRENT_MONTH = '2026-09';

/** Colunas do triângulo: meses decorridos desde a criação, de M0 a M12. */
export const ELAPSED_MONTHS = 13;

/** Os meses de vida em que a leitura para para conferir o amadurecimento. */
export const MILESTONES: readonly number[] = [3, 6, 12];

export interface CohortRow {
  /** Mês de criação do cohort, em `YYYY-MM`. */
  readonly month: string;
  /** Oportunidades criadas no mês, a base de toda taxa da linha. */
  readonly size: number;
  /**
   * Negócios ganhos, contagem ACUMULADA, uma posição por mês decorrido a partir de M0. O array tem só
   * os períodos que já começaram dentro do recorte de doze meses, e é ele que desenha o triângulo.
   */
  readonly won: readonly (number | null)[];
}

export const data: readonly CohortRow[] = [
  { month: '2025-04', size: 96, won: [0, 2, 5, 7, 9, 10, 11, 12, 12, 13, 13, 13, 13] },
  { month: '2025-05', size: 88, won: [0, 1, 4, 6, 8, 9, 10, 10, 11, 11, 11, 12, 12] },
  { month: '2025-06', size: 104, won: [1, 3, 6, 9, 11, 12, 13, 14, 14, 15, 15, 15, 15] },
  { month: '2025-07', size: 112, won: [0, 2, 6, 9, 12, 13, 14, 15, 16, 16, 16, 17, 17] },
  { month: '2025-08', size: 97, won: [1, 3, 5, 8, 10, 11, 12, 12, 13, 13, 14, 14, 14] },
  { month: '2025-09', size: 121, won: [0, 3, 7, 11, 14, 16, 17, 18, 19, 19, 20, 20, 20] },
  { month: '2025-10', size: 118, won: [1, 4, 8, 11, 14, 16, 17, 18, 19, 19, 20, 20] },
  { month: '2025-11', size: 109, won: [0, 3, 7, 10, 12, 14, 15, 16, 16, 17, 17] },
  { month: '2025-12', size: 94, won: [0, 2, 5, 8, 10, 11, 12, 13, 13, 14] },
  { month: '2026-01', size: 127, won: [1, 4, 9, 13, 16, 18, 19, 20, 21] },
  { month: '2026-02', size: 115, won: [0, 3, 8, 12, 15, 17, 18, 19] },
  { month: '2026-03', size: 133, won: [2, 6, 12, 17, 21, 23, 24] },
  { month: '2026-04', size: 141, won: [1, 6, 13, 18, 22, 24] },
  { month: '2026-05', size: 126, won: [2, 7, 14, 19, 22] },
  { month: '2026-06', size: 149, won: [1, 8, 16, 21] },
  { month: '2026-07', size: 138, won: [2, 9, 17] },
  { month: '2026-08', size: 156, won: [1, 10] },
  { month: '2026-09', size: 71, won: [2] },
];
