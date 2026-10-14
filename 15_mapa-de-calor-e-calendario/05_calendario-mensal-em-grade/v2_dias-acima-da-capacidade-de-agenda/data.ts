/**
 * Agendas marcadas pela pré-vendas por dia em agosto de 2026, em contagem de agendas. Dado fictício e
 * fixo: uma entrada por dia do mês, na ordem, do dia 1 ao dia 31.
 *
 * `agendas: null` é dia sem expediente, que aqui são só os sábados e domingos: eles ficam fora do
 * total, fora da média e fora da contagem de dias acima do teto. Zero em dia útil é medição, e o dia
 * 14 existe para exercitar essa diferença: a equipe trabalhou e não marcou nada.
 *
 * O teto de 22 é a capacidade de atendimento declarada pelo time de vendas, não um número calculado
 * do próprio dado: ele entra como parâmetro porque é a régua contra a qual o mês se lê.
 */

/** Mês desenhado, em `YYYY-MM`. A grade sai daqui, nunca do relógio da máquina. */
export const MONTH = '2026-08';

/** Teto de agendas por dia útil que o time de vendas consegue atender. */
export const CAPACITY = 22;

export interface DayLoad {
  /** Dia do mês, de 1 ao último. */
  readonly day: number;
  /** Agendas marcadas no dia. Null é dia sem expediente e sai de toda conta. */
  readonly agendas: number | null;
}

export const data: readonly DayLoad[] = [
  { day: 1, agendas: null },
  { day: 2, agendas: null },
  { day: 3, agendas: 18 },
  { day: 4, agendas: 21 },
  { day: 5, agendas: 24 },
  { day: 6, agendas: 19 },
  { day: 7, agendas: 12 },
  { day: 8, agendas: null },
  { day: 9, agendas: null },
  { day: 10, agendas: 20 },
  { day: 11, agendas: 26 },
  { day: 12, agendas: 23 },
  { day: 13, agendas: 17 },
  { day: 14, agendas: 0 },
  { day: 15, agendas: null },
  { day: 16, agendas: null },
  { day: 17, agendas: 22 },
  { day: 18, agendas: 19 },
  { day: 19, agendas: 16 },
  { day: 20, agendas: 14 },
  { day: 21, agendas: 7 },
  { day: 22, agendas: null },
  { day: 23, agendas: null },
  { day: 24, agendas: 25 },
  { day: 25, agendas: 28 },
  { day: 26, agendas: 21 },
  { day: 27, agendas: 15 },
  { day: 28, agendas: 11 },
  { day: 29, agendas: null },
  { day: 30, agendas: null },
  { day: 31, agendas: 13 },
];
