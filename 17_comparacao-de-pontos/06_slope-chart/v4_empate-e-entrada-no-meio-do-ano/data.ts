/**
 * Oportunidades ganhas e decididas de 9 executivos fictícios no 1º e no 2º semestre de 2026.
 * Dois empatam nos dois semestres (mesmo win rate nos dois) e um entrou em julho, então não tem
 * o 1º semestre: `first` é `null`, ausência que o componente nunca desenha como zero.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface HalfResult {
  readonly won: number;
  readonly decided: number;
}

export interface ExecutiveWinRate {
  readonly id: string;
  readonly name: string;
  /** `null` para quem ainda não atuava no 1º semestre. */
  readonly first: HalfResult | null;
  readonly second: HalfResult;
}

export const data: readonly ExecutiveWinRate[] = [
  { id: 'exec-01', name: 'Aline C.', first: { won: 18, decided: 30 }, second: { won: 21, decided: 30 } },
  { id: 'exec-02', name: 'Bruno T.', first: { won: 12, decided: 30 }, second: { won: 15, decided: 30 } },
  { id: 'exec-03', name: 'Carla M.', first: { won: 16, decided: 40 }, second: { won: 20, decided: 40 } },
  { id: 'exec-04', name: 'Diego P.', first: { won: 24, decided: 40 }, second: { won: 24, decided: 40 } },
  { id: 'exec-05', name: 'Elisa F.', first: { won: 10, decided: 40 }, second: { won: 14, decided: 40 } },
  { id: 'exec-06', name: 'Fábio R.', first: { won: 20, decided: 40 }, second: { won: 16, decided: 40 } },
  { id: 'exec-07', name: 'Gisele N.', first: { won: 6, decided: 30 }, second: { won: 9, decided: 30 } },
  { id: 'exec-08', name: 'Heitor L.', first: { won: 14, decided: 40 }, second: { won: 10, decided: 40 } },
  { id: 'exec-09', name: 'Iara Q.', first: null, second: { won: 9, decided: 20 } },
];

/** Mês de entrada de quem não tem o 1º semestre, em texto `YYYY-MM`. */
export const entryMonth = '2026-07';
