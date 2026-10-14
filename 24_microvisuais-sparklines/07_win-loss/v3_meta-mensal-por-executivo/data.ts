/**
 * Meta mensal de 12 executivos comerciais em 12 meses seguidos, de 2025-10 a 2026-09. `win` é o mês
 * em que a meta foi batida e `loss` o mês em que não foi; todos os meses têm meta e coleta, então
 * não há `tie` nem `null` aqui. Nomes inventados, com inicial de sobrenome; há um nome longo para
 * provar que a coluna não corta. Dado fictício e fixo.
 */
export type Outcome = 'win' | 'loss' | 'tie' | null;

export interface ExecutiveMonths {
  readonly id: string;
  readonly name: string;
  /** Um resultado por mês, do mais antigo ao mais recente. */
  readonly months: readonly Outcome[];
}

/** Primeiro mês de cada linha. */
export const FIRST_MONTH = '2025-10';

/** Executivo destacado em peso 700: o mais regular do período. */
export const highlightId = 'exec-01';

/** Lê o padrão de 12 letras: O é mês com meta batida e X é mês sem a meta. */
const row = (id: string, name: string, pattern: string): ExecutiveMonths => ({
  id,
  name,
  months: pattern.split('').map((letter): Outcome => (letter === 'O' ? 'win' : 'loss')),
});

export const data: readonly ExecutiveMonths[] = [
  row('exec-01', 'Larissa B.', 'OOOOXOOOOOOO'),
  row('exec-02', 'Rodrigo S.', 'OOXOOOOOOXOO'),
  row('exec-03', 'Camila F.', 'OOOOOOOXOOXO'),
  row('exec-04', 'Henrique T.', 'OXOOOXOOOXOO'),
  row('exec-05', 'Ana Beatriz de Albuquerque M.', 'OOOOOOXXOXOX'),
  row('exec-06', 'Marcelo P.', 'OOOOOOOXXXXX'),
  row('exec-07', 'Vitória C.', 'XXXXXXOOOOOO'),
  row('exec-08', 'Gustavo N.', 'OOOOOOXXXXXX'),
  row('exec-09', 'Patrícia D.', 'XOXXOXOXOXXO'),
  row('exec-10', 'Felipe A.', 'XXOXOXXOXOXX'),
  row('exec-11', 'Daniela R.', 'XXXOXXXOXXOX'),
  row('exec-12', 'Otávio L.', 'XXXXOXXXXXXO'),
];
