/**
 * Conversão de lead em agenda por cohort mensal de entrada, de janeiro a setembro de 2026, num recorte
 * escolhido para carregar todas as armadilhas de leitura de uma vez. Dado fictício e fixo: nenhum nome é
 * pessoa real.
 *
 * O dado guarda CONTAGEM ACUMULADA de agendas, não taxa: `booked[3]` é quantos leads daquele cohort já
 * tinham agenda marcada até o quarto mês de vida. Guardar a contagem é o que permite o alternador trocar
 * a unidade da célula sem recalcular nada, o que faz o volume viajar junto da taxa (DAD-1) e o que
 * transforma ausência de base em ausência de taxa em vez de zero (EST-1b).
 *
 * QUATRO SITUAÇÕES QUE NÃO PODEM SER LIDAS COMO A MESMA COISA convivem aqui de propósito:
 *
 * 1. Período que ainda não começou: a posição simplesmente não existe no array, e é isso que desenha o
 *    triângulo. Um cohort de agosto ainda não viveu o segundo mês.
 * 2. Período em curso: o mês de entrada mais os meses decorridos cai no mês corrente, então a célula
 *    conta dias que ainda não aconteceram e lê como queda sem ser queda.
 * 3. Período que existe e não foi medido: `null`, aqui em `2026-03`, cujo fechamento do terceiro mês se
 *    perdeu na troca do campo de origem. Não é zero e não é futuro.
 * 4. Zero medido: contagem zero com base existente, aqui no primeiro mês de `2026-02`. Houve conta e o
 *    resultado foi zero.
 *
 * E ainda duas fraquezas de base, que também não são ausência. `2026-02` recebeu doze leads, porque o
 * outbound ficou parado no mês: a taxa existe, é medida e não sustenta intensidade. `2026-04` não recebeu
 * nenhum lead, porque a fila inteira foi desviada para outra operação: aí não existe base, e sem base não
 * existe taxa nem zero.
 */

/** Mês de referência do recorte. Nunca ler o relógio: preview e teste desenham a mesma diagonal. */
export const CURRENT_MONTH = '2026-09';

/** Colunas do triângulo: meses decorridos desde a entrada, de M0 a M6. */
export const ELAPSED_MONTHS = 7;

/**
 * Piso de base para a célula receber intensidade de cor. Abaixo dele a taxa oscila mais do que o efeito
 * que se quer medir, então a cor deixa de afirmar ordem e o número passa a responder sozinho.
 */
export const MIN_SAMPLE = 30;

export interface CohortRow {
  /** Mês de entrada do cohort, em `YYYY-MM`. */
  readonly month: string;
  /** Leads que entraram no mês, a base de toda taxa da linha. Zero quer dizer sem base, nunca taxa zero. */
  readonly size: number;
  /**
   * Agendas marcadas, contagem ACUMULADA, uma posição por mês decorrido a partir de M0. O array tem só os
   * períodos que já começaram. Posição `null` é período que começou e cujo fechamento não foi medido.
   */
  readonly booked: readonly (number | null)[];
}

export const data: readonly CohortRow[] = [
  { month: '2026-01', size: 412, booked: [33, 57, 70, 77, 80, 81, 82] },
  { month: '2026-02', size: 12, booked: [0, 1, 2, 2, 3, 3, 3] },
  { month: '2026-03', size: 455, booked: [36, 65, null, 88, 92, 94, 95] },
  { month: '2026-04', size: 0, booked: [] },
  { month: '2026-05', size: 476, booked: [49, 100, 119, 128, 132] },
  { month: '2026-06', size: 523, booked: [56, 113, 134, 142] },
  { month: '2026-07', size: 549, booked: [60, 119, 140] },
  { month: '2026-08', size: 588, booked: [64, 127] },
  { month: '2026-09', size: 274, booked: [13] },
];
