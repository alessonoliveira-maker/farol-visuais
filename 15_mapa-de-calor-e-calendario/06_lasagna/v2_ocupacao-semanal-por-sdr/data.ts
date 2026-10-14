/**
 * Horas de agenda ocupadas por SDR e por semana, nas 26 semanas iniciadas em 2026-04-06. Dado
 * fictício e fixo, em horas. Nenhum nome é pessoa real.
 *
 * A ocupação é a razão entre estas horas e a capacidade da semana, e a capacidade sai de dois
 * números declarados abaixo, não de uma constante escondida no componente: assim mudar a jornada
 * muda a leitura sem tocar no desenho.
 *
 * `null` é semana sem agenda registrada, e por isso sem ocupação a medir. Não é zero e não é
 * folga: é ausência de instrumento, e sai hachurada. Semana com zero hora agendada seria zero
 * medido, e apareceria como o degrau de folga mais fundo, com a marca desenhada.
 *
 * A última posição é a semana em curso, incompleta: ela tem menos dias decorridos e por isso
 * capacidade menor, o que mantém a ocupação comparável com as semanas fechadas.
 */

/** Segunda-feira da primeira semana da janela, em `YYYY-MM-DD`. As demais seguem de sete em sete. */
export const WEEK_ONE = '2026-04-06';

/** Horas de agenda que cabem num dia útil. */
export const CAPACITY_HOURS_PER_DAY = 6;

/** Dias úteis de uma semana fechada. */
export const WORKDAYS_PER_WEEK = 5;

/** Dias úteis já decorridos na semana em curso, que é a última posição de `booked`. */
export const CURRENT_WEEK_ELAPSED_DAYS = 2;

export interface SdrWeeks {
  readonly id: string;
  readonly name: string;
  /** Horas ocupadas, uma posição por semana. Null é semana sem agenda registrada. */
  readonly booked: readonly (number | null)[];
}

export const data: readonly SdrWeeks[] = [
  { id: 'rafaela-t', name: 'Rafaela T.', booked: [36.6, 35.8, 33.6, 35.6, 35.7, 35.2, 32.7, 35.9, 35.2, 35.6, 35.8, 35.9, 35.5, 34.1, 38.2, 33.5, 35.7, 35.7, 38, 37.9, 37.8, 33.6, 35.6, 35.1, 32.4, 13.2] },
  { id: 'ana-beatriz-l', name: 'Ana Beatriz L.', booked: [35, 33.4, 29.3, 32.5, 29.6, 33.3, 34.4, 33.4, 31.6, 31.3, 31.7, 30.8, 31.1, 33.1, 33.8, 34.5, 34.4, 33.6, 35.1, 32.4, 31, 28.9, 31.4, 34.1, 30.4, 11.9] },
  { id: 'gustavo-d', name: 'Gustavo D.', booked: [30.8, 28.5, 31.2, 32.4, 27.5, 29.7, 29.2, 29.4, 28.3, 26.8, 30.5, 30.2, 32.6, 31.7, 30.3, 31.3, 31.8, 31.9, 30, 32.2, 32.8, 28.4, 32.5, 31.2, 32.6, 11.9] },
  { id: 'helena-c', name: 'Helena C.', booked: [27.9, 28, 29.6, 29.2, 27.3, 28.2, 29.1, 27.4, 30, 26.6, 28.4, null, 28.5, 30.2, 27.5, 30.3, 30.4, 28.4, 30.5, 28.7, 30.8, 26, 26.5, 30.3, 29, 11.7] },
  { id: 'solange-r', name: 'Solange R.', booked: [26.2, 27.1, 25.9, 27.4, 27.1, 25.4, 26.9, 26.1, 26.7, 23.5, 28.3, 27.6, 28.6, 26.9, 27.3, 26.4, 29.3, 27.7, 29.9, 28.1, 25.8, 26.7, 26.1, 25.8, 25.6, 10.4] },
  { id: 'bruno-l', name: 'Bruno L.', booked: [23.1, 26.6, 23.2, 23.2, 23.4, 22.6, 24.6, 22.9, 22.8, 22.9, 24.4, 26.9, 22.9, 26, 24.5, 23.4, 25.6, 27.2, null, null, 26.9, 24.6, 24, 21.9, 27.2, 10.8] },
  { id: 'nubia-f', name: 'Núbia F.', booked: [21.4, 24.6, 22.6, 24.1, 22.3, 23.3, 24.3, 24.5, 23.5, 23, 20.7, 23.9, 21.8, 21.9, 24.1, 22.4, 21.9, 23.1, 23.8, 25.9, 24.6, 23.5, 24.2, 23.9, 23.6, 9.3] },
  { id: 'pedro-a', name: 'Pedro A.', booked: [21.6, 20.4, 17.3, 19.4, 19, 19.2, 22.1, 18.1, 17.6, 19, 19.4, 20.2, 22.3, 22, 22.3, 22.3, 23.9, 23.2, 21.1, 23.6, 19.4, 17.3, 21.6, 18.9, 17.7, 8.8] },
  { id: 'ivan-p', name: 'Ivan P.', booked: [13.3, 19.2, 16.3, 18.2, 17.3, 18.7, 17.9, 14.7, 17.9, 15, 14.1, 13.9, 13.8, 17.9, 19.3, 15, 20.4, 17.1, 20, 15.3, 14.5, 18.2, 13.4, 19.1, 19.3, 5.9] },
];
