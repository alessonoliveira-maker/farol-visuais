/**
 * Agendas marcadas e comparecimentos por semana em 26 semanas, de abril a setembro de 2026, em
 * contagem de reuniões. A semana é nomeada pela segunda-feira em que começa.
 *
 * O recorte exercita de propósito os dois modos de a taxa NÃO existir, que é o que esta versão
 * ensina, e eles têm causas diferentes apesar de produzirem o mesmo vão no desenho:
 *
 * 1. A semana de 2026-05-18 não teve nenhuma agenda. O zero das agendas é MEDIDO, então a coluna
 *    se desenha e escreve zero; a taxa, que precisaria dividir por ele, não existe.
 * 2. A semana de 2026-08-17 registrou mais comparecimentos que agendas, o que é impossível: é erro
 *    de dado na origem, não uma taxa acima de 100%. A semana fica sem taxa e a coluna sai marcada.
 *
 * Dado fictício e fixo: nenhuma pessoa, empresa ou operação real.
 */
export interface WeeklyBooking {
  /** Segunda-feira da semana, em YYYY-MM-DD. */
  readonly week: string;
  /** Agendas marcadas na semana. */
  readonly booked: number;
  /** Agendas em que o convidado compareceu. */
  readonly attended: number;
}

export const data: readonly WeeklyBooking[] = [
  { week: '2026-04-06', booked: 22, attended: 16 },
  { week: '2026-04-13', booked: 26, attended: 18 },
  { week: '2026-04-20', booked: 31, attended: 19 },
  { week: '2026-04-27', booked: 28, attended: 18 },
  { week: '2026-05-04', booked: 34, attended: 20 },
  { week: '2026-05-11', booked: 30, attended: 19 },
  { week: '2026-05-18', booked: 0, attended: 0 },
  { week: '2026-05-25', booked: 24, attended: 17 },
  { week: '2026-06-01', booked: 29, attended: 19 },
  { week: '2026-06-08', booked: 33, attended: 19 },
  { week: '2026-06-15', booked: 36, attended: 20 },
  { week: '2026-06-22', booked: 31, attended: 19 },
  { week: '2026-06-29', booked: 20, attended: 15 },
  { week: '2026-07-06', booked: 30, attended: 19 },
  { week: '2026-07-13', booked: 38, attended: 20 },
  { week: '2026-07-20', booked: 35, attended: 20 },
  { week: '2026-07-27', booked: 18, attended: 14 },
  { week: '2026-08-03', booked: 29, attended: 19 },
  { week: '2026-08-10', booked: 22, attended: 16 },
  { week: '2026-08-17', booked: 30, attended: 31 },
  { week: '2026-08-24', booked: 33, attended: 19 },
  { week: '2026-08-31', booked: 26, attended: 18 },
  { week: '2026-09-07', booked: 16, attended: 13 },
  { week: '2026-09-14', booked: 30, attended: 19 },
  { week: '2026-09-21', booked: 25, attended: 17 },
  { week: '2026-09-28', booked: 31, attended: 19 },
];
