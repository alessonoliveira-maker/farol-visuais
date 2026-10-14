/**
 * Oportunidades ganhas e oportunidades decididas de 14 executivos fictícios no 1º e no 2º semestre
 * de 2026. O win rate não vem pronto: o componente divide ganhas por decididas, e o volume por
 * semestre vai de 20 a 50 oportunidades. Os valores de win rate vão de 10% a 70%.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface ExecutiveHalves {
  readonly id: string;
  readonly name: string;
  readonly wonFirst: number;
  readonly decidedFirst: number;
  readonly wonSecond: number;
  readonly decidedSecond: number;
}

export const data: readonly ExecutiveHalves[] = [
  { id: 'exec-01', name: 'Talita V.', wonFirst: 14, decidedFirst: 40, wonSecond: 22, decidedSecond: 44 },
  { id: 'exec-02', name: 'Murilo C.', wonFirst: 21, decidedFirst: 30, wonSecond: 18, decidedSecond: 30 },
  { id: 'exec-03', name: 'Renan A.', wonFirst: 9, decidedFirst: 36, wonSecond: 14, decidedSecond: 40 },
  { id: 'exec-04', name: 'Beatriz S.', wonFirst: 6, decidedFirst: 30, wonSecond: 3, decidedSecond: 30 },
  { id: 'exec-05', name: 'Caio M.', wonFirst: 12, decidedFirst: 40, wonSecond: 18, decidedSecond: 40 },
  { id: 'exec-06', name: 'Daniela R.', wonFirst: 16, decidedFirst: 32, wonSecond: 15, decidedSecond: 30 },
  { id: 'exec-07', name: 'Eduardo F.', wonFirst: 10, decidedFirst: 50, wonSecond: 21, decidedSecond: 50 },
  { id: 'exec-08', name: 'Fabiana G.', wonFirst: 18, decidedFirst: 36, wonSecond: 27, decidedSecond: 45 },
  { id: 'exec-09', name: 'Gustavo H.', wonFirst: 8, decidedFirst: 40, wonSecond: 6, decidedSecond: 40 },
  { id: 'exec-10', name: 'Helena J.', wonFirst: 24, decidedFirst: 48, wonSecond: 28, decidedSecond: 40 },
  { id: 'exec-11', name: 'Igor K.', wonFirst: 7, decidedFirst: 35, wonSecond: 11, decidedSecond: 44 },
  { id: 'exec-12', name: 'Joana L.', wonFirst: 10, decidedFirst: 20, wonSecond: 8, decidedSecond: 25 },
  { id: 'exec-13', name: 'Lucas P.', wonFirst: 20, decidedFirst: 40, wonSecond: 14, decidedSecond: 35 },
  { id: 'exec-14', name: 'Mariana Q.', wonFirst: 5, decidedFirst: 50, wonSecond: 12, decidedSecond: 40 },
];
