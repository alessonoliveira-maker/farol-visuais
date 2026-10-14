/**
 * Atividades registradas por dia, em agosto de 2026, por seis pessoas fictícias da pré-vendas. Dado
 * fictício e fixo: uma posição por dia do mês, do dia 1 ao 31, com a contagem de atividades que a
 * pessoa registrou naquele dia. Nenhum nome é pessoa real.
 *
 * Zero é medido e quer dizer que a pessoa trabalhou e não registrou nada, o que é o caso de todo fim
 * de semana. Férias e feriado são outra coisa: são dias em que não havia trabalho a registrar, então
 * eles saem da classe zero e vão com contorno próprio, porque pintá-los de zero afirmaria ociosidade.
 *
 * O dado exercita o que a versão existe para comparar: uma pessoa que registra no começo da semana,
 * uma que deixa tudo para a sexta, duas semanas de férias no meio do mês e um feriado no dia 13.
 */

export interface SdrActivity {
  readonly id: string;
  readonly name: string;
  /** Uma posição por dia de agosto, do dia 1 ao 31, na ordem. */
  readonly counts: readonly number[];
  /** Dias de férias em `YYYY-MM-DD`, só dias úteis: o fim de semana não é férias de ninguém. */
  readonly vacation: readonly string[];
}

/** Primeiro dia desenhado, em `YYYY-MM-DD`. As colunas são as semanas de segunda a domingo que contêm o mês. */
export const FIRST_DAY = '2026-08-01';

/** Feriado do recorte, em `YYYY-MM-DD`. Vale para as seis pessoas. */
export const HOLIDAYS: readonly string[] = ['2026-08-13'];

export const data: readonly SdrActivity[] = [
  {
    id: 'sdr-01',
    name: 'Aline P.',
    counts: [0, 0, 4, 3, 1, 2, 1, 0, 0, 3, 2, 2, 0, 1, 0, 0, 3, 2, 3, 2, 1, 0, 0, 3, 2, 3, 2, 2, 0, 0, 5],
    vacation: [],
  },
  {
    id: 'sdr-02',
    name: 'Bruno T.',
    counts: [0, 0, 2, 2, 2, 2, 4, 0, 0, 3, 2, 3, 0, 2, 0, 0, 2, 4, 3, 2, 2, 0, 0, 3, 3, 2, 3, 3, 0, 0, 3],
    vacation: [],
  },
  {
    id: 'sdr-03',
    name: 'Caio M.',
    counts: [0, 0, 1, 1, 2, 3, 3, 0, 0, 1, 2, 2, 0, 3, 0, 0, 2, 1, 3, 4, 4, 0, 0, 2, 1, 2, 4, 4, 0, 0, 1],
    vacation: [],
  },
  {
    id: 'sdr-04',
    name: 'Dina R.',
    counts: [0, 0, 3, 4, 3, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 3],
    vacation: [
      '2026-08-10',
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
      '2026-08-17',
      '2026-08-18',
      '2026-08-19',
      '2026-08-20',
      '2026-08-21',
    ],
  },
  {
    id: 'sdr-05',
    name: 'Elis V.',
    counts: [0, 0, 2, 2, 2, 3, 4, 0, 0, 1, 2, 2, 0, 6, 0, 0, 1, 1, 2, 3, 8, 0, 0, 2, 1, 2, 2, 4, 0, 0, 2],
    vacation: [],
  },
  {
    id: 'sdr-06',
    name: 'Fábio S.',
    counts: [0, 0, 5, 2, 2, 2, 1, 0, 0, 8, 2, 2, 0, 1, 0, 0, 5, 3, 1, 2, 1, 0, 0, 6, 2, 1, 2, 2, 0, 0, 6],
    vacation: [],
  },
];
