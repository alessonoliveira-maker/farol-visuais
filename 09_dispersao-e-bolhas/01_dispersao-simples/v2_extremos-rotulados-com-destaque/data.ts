/**
 * Executivos comerciais no trimestre: ticket médio das oportunidades ganhas em reais no eixo X e
 * win rate no eixo Y. O win rate não vem pronto; vem como o par `ganhas` sobre `oportunidades`,
 * porque taxa publicada sem o volume esconde que 1 de 2 e 50 de 100 não são a mesma coisa.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface ExecutiveWinRate {
  readonly id: string;
  readonly name: string;
  /** Ticket médio em reais; `null` quando o executivo não tem ganha com valor registrado. */
  readonly ticketMedio: number | null;
  readonly ganhas: number;
  /** Oportunidades fechadas no trimestre; zero significa win rate sem base, não win rate zero. */
  readonly oportunidades: number;
}

export const data: readonly ExecutiveWinRate[] = [
  { id: 'exec-01', name: 'Murilo C.', ticketMedio: 468_000, ganhas: 13, oportunidades: 21 },
  { id: 'exec-02', name: 'Talita V.', ticketMedio: 512_000, ganhas: 11, oportunidades: 19 },
  { id: 'exec-03', name: 'Renan A.', ticketMedio: 236_000, ganhas: 16, oportunidades: 29 },
  { id: 'exec-04', name: 'Bianca L.', ticketMedio: 305_000, ganhas: 12, oportunidades: 25 },
  { id: 'exec-05', name: 'Otávio M.', ticketMedio: 402_000, ganhas: 9, oportunidades: 20 },
  { id: 'exec-06', name: 'Priscila F.', ticketMedio: 178_000, ganhas: 14, oportunidades: 32 },
  { id: 'exec-07', name: 'Gustavo R.', ticketMedio: 351_000, ganhas: 8, oportunidades: 19 },
  { id: 'exec-08', name: 'Helena S.', ticketMedio: 143_000, ganhas: 15, oportunidades: 36 },
  { id: 'exec-09', name: 'Tarcísio B.', ticketMedio: 289_000, ganhas: 10, oportunidades: 25 },
  { id: 'exec-10', name: 'Marina D.', ticketMedio: 96_000, ganhas: 13, oportunidades: 34 },
  { id: 'exec-11', name: 'Vicente P.', ticketMedio: 431_000, ganhas: 7, oportunidades: 19 },
  { id: 'exec-12', name: 'Camila T.', ticketMedio: 205_000, ganhas: 11, oportunidades: 31 },
  { id: 'exec-13', name: 'Rodrigo N.', ticketMedio: 124_000, ganhas: 9, oportunidades: 27 },
  { id: 'exec-14', name: 'Juliana E.', ticketMedio: 376_000, ganhas: 8, oportunidades: 25 },
  { id: 'exec-15', name: 'Fabrício O.', ticketMedio: 268_000, ganhas: 6, oportunidades: 22 },
  { id: 'exec-16', name: 'Letícia G.', ticketMedio: 158_000, ganhas: 7, oportunidades: 30 },
  { id: 'exec-17', name: 'Wagner C.', ticketMedio: 487_000, ganhas: 5, oportunidades: 26 },
  { id: 'exec-18', name: 'Sônia H.', ticketMedio: 112_000, ganhas: 4, oportunidades: 33 },
  { id: 'exec-19', name: 'Ivan Q.', ticketMedio: null, ganhas: 6, oportunidades: 24 },
  { id: 'exec-20', name: 'Dora W.', ticketMedio: 197_000, ganhas: 0, oportunidades: 0 },
];
