/**
 * Entradas de leads por fila da pré-vendas em 13 semanas (contagem de leads que entraram na fila).
 * São 12 filas de volumes muito diferentes (de 2 a 96 por semana), uma com nome longo e uma
 * de volume tão baixo que a coluna encosta no piso. A semana de 2026-09-07 foi recesso e tem
 * zero medido em todas as filas. Dado fictício e fixo.
 */
export interface QueueEntries {
  readonly id: string;
  readonly name: string;
  /** Entradas por semana, na mesma ordem de `weeks`. */
  readonly entries: readonly number[];
}

export interface QueueTable {
  /** Segunda-feira de cada semana, no formato YYYY-MM-DD. */
  readonly weeks: readonly string[];
  /** Semanas de recesso, em que o zero é medido (a fila existe e ninguém entrou). */
  readonly recessWeeks: readonly string[];
  readonly rows: readonly QueueEntries[];
}

export const data: QueueTable = {
  weeks: [
    '2026-07-13',
    '2026-07-20',
    '2026-07-27',
    '2026-08-03',
    '2026-08-10',
    '2026-08-17',
    '2026-08-24',
    '2026-08-31',
    '2026-09-07',
    '2026-09-14',
    '2026-09-21',
    '2026-09-28',
    '2026-10-05',
  ],
  recessWeeks: ['2026-09-07'],
  rows: [
    { id: 'fila-01', name: 'Formulário do site', entries: [71, 74, 69, 78, 82, 77, 85, 88, 0, 91, 87, 96, 93] },
    { id: 'fila-02', name: 'Anúncios pagos', entries: [64, 58, 66, 71, 63, 69, 74, 70, 0, 76, 81, 79, 84] },
    { id: 'fila-03', name: 'Indicação de clientes ativos', entries: [28, 31, 27, 34, 36, 33, 38, 35, 0, 41, 39, 44, 42] },
    { id: 'fila-04', name: 'Mensagens diretas comerciais', entries: [47, 52, 49, 45, 51, 56, 53, 58, 0, 55, 60, 57, 62] },
    { id: 'fila-05', name: 'Eventos e feiras', entries: [12, 6, 18, 9, 22, 4, 15, 27, 0, 8, 31, 11, 19] },
    { id: 'fila-06', name: 'Reativação de base inativa e leads antigos', entries: [19, 17, 21, 16, 18, 22, 20, 17, 0, 23, 19, 21, 18] },
    { id: 'fila-07', name: 'Parcerias com revendas', entries: [14, 16, 13, 17, 15, 19, 18, 16, 0, 20, 17, 22, 21] },
    { id: 'fila-08', name: 'Webinars', entries: [3, 5, 2, 24, 7, 4, 3, 26, 0, 5, 3, 29, 6] },
    { id: 'fila-09', name: 'Chat do portal', entries: [33, 30, 35, 29, 32, 28, 31, 27, 0, 26, 25, 24, 22] },
    { id: 'fila-10', name: 'Telefone receptivo', entries: [9, 8, 10, 7, 9, 8, 6, 7, 0, 6, 5, 6, 4] },
    { id: 'fila-11', name: 'Programa de afiliados', entries: [5, 6, 4, 7, 5, 8, 6, 9, 0, 7, 10, 8, 11] },
    { id: 'fila-12', name: 'Cadastro manual da recepção', entries: [2, 1, 3, 2, 1, 2, 3, 1, 0, 2, 1, 2, 3] },
  ],
};
