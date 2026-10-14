/**
 * Dias corridos entre o primeiro contato e a primeira reunião, uma linha por oportunidade do mês.
 * Dado fictício e fixo: nenhum nome é pessoa real e nenhum prazo saiu da base.
 *
 * O wheat plot pede o valor exato de cada caso, nunca a contagem por faixa, e é essa diferença que
 * faz a lacuna aparecer: agregado em barras, o vão de dias sem nenhuma reunião fica dentro de uma
 * coluna e desaparece.
 *
 * A ordem das linhas aqui é a de cadastro, embaralhada de propósito. O empilhamento é calculado no
 * componente, então dado já ordenado esconderia se a ordenação está mesmo acontecendo.
 */

export interface Opportunity {
  readonly id: string;
  readonly client: string;
  /** Dias corridos até a primeira reunião. */
  readonly days: number;
}

export const data: readonly Opportunity[] = [
  { id: 'opp-01', client: 'Talita V.', days: 7 },
  { id: 'opp-02', client: 'Murilo C.', days: 2 },
  { id: 'opp-03', client: 'Renan A.', days: 19 },
  { id: 'opp-04', client: 'Bianca F.', days: 5 },
  { id: 'opp-05', client: 'Otávio L.', days: 12 },
  { id: 'opp-06', client: 'Simone R.', days: 3 },
  { id: 'opp-07', client: 'Caio M.', days: 9 },
  { id: 'opp-08', client: 'Helena P.', days: 17 },
  { id: 'opp-09', client: 'Vitor S.', days: 1 },
  { id: 'opp-10', client: 'Lívia N.', days: 6 },
  { id: 'opp-11', client: 'Danilo T.', days: 22 },
  { id: 'opp-12', client: 'Aline B.', days: 4 },
  { id: 'opp-13', client: 'Rafael Q.', days: 10 },
  { id: 'opp-14', client: 'Marina D.', days: 8 },
  { id: 'opp-15', client: 'Igor G.', days: 15 },
  { id: 'opp-16', client: 'Paula E.', days: 3 },
  { id: 'opp-17', client: 'Thiago H.', days: 27 },
  { id: 'opp-18', client: 'Camila I.', days: 6 },
  { id: 'opp-19', client: 'Bruno J.', days: 11 },
  { id: 'opp-20', client: 'Nayara K.', days: 20 },
  { id: 'opp-21', client: 'Eduardo O.', days: 4 },
  { id: 'opp-22', client: 'Sofia U.', days: 9 },
  { id: 'opp-23', client: 'Leandro W.', days: 16 },
  { id: 'opp-24', client: 'Iara X.', days: 2 },
  { id: 'opp-25', client: 'Gustavo Y.', days: 24 },
  { id: 'opp-26', client: 'Bruna Z.', days: 7 },
  { id: 'opp-27', client: 'Felipe A.', days: 10 },
  { id: 'opp-28', client: 'Tatiana C.', days: 5 },
  { id: 'opp-29', client: 'Rodrigo F.', days: 18 },
  { id: 'opp-30', client: 'Larissa G.', days: 3 },
  { id: 'opp-31', client: 'André H.', days: 29 },
  { id: 'opp-32', client: 'Juliana I.', days: 8 },
  { id: 'opp-33', client: 'Marcelo J.', days: 10 },
  { id: 'opp-34', client: 'Priscila L.', days: 21 },
  { id: 'opp-35', client: 'Alan M.', days: 6 },
  { id: 'opp-36', client: 'Cristina N.', days: 15 },
  { id: 'opp-37', client: 'Diego O.', days: 4 },
  { id: 'opp-38', client: 'Elisa P.', days: 12 },
  { id: 'opp-39', client: 'Fábio R.', days: 9 },
  { id: 'opp-40', client: 'Gisele S.', days: 26 },
  { id: 'opp-41', client: 'Hugo T.', days: 7 },
  { id: 'opp-42', client: 'Isabel V.', days: 17 },
  { id: 'opp-43', client: 'João B.', days: 23 },
  { id: 'opp-44', client: 'Karina D.', days: 10 },
  { id: 'opp-45', client: 'Lucas E.', days: 19 },
  { id: 'opp-46', client: 'Mariana F.', days: 31 },
];

/** Largura do intervalo de empilhamento, em dias. Um ponto sobe um nível por vizinho no intervalo. */
export const BIN_WIDTH = 5;

/**
 * O que houve na lacuna. O vão em si sai do dado, medido pelo componente; o motivo não se calcula de
 * prazo nenhum e por isso vem declarado aqui, onde quem conhece o mês pode corrigir.
 */
export const GAP_REASON = 'semana de feriado';
