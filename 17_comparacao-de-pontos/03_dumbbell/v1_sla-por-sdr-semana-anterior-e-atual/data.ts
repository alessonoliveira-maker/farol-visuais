/**
 * SLA de primeiro contato por SDR, em minutos: a mediana da semana passada e a da semana atual.
 * Dado fictício e fixo: nenhum nome é pessoa real. Há quem piorou, quem melhorou, um nome longo,
 * uma mudança de 2 min e uma semana igual à outra (variação zero medida).
 */
export interface SlaRow {
  readonly id: string;
  readonly name: string;
  /** Mediana da semana passada, em minutos. */
  readonly previous: number;
  /** Mediana da semana atual, em minutos. */
  readonly current: number;
}

export const data: readonly SlaRow[] = [
  { id: 'sdr-01', name: 'Talita V.', previous: 18, current: 12 },
  { id: 'sdr-02', name: 'Murilo C.', previous: 25, current: 31 },
  { id: 'sdr-03', name: 'Débora F.', previous: 22, current: 22 },
  { id: 'sdr-04', name: 'Renan A.', previous: 34, current: 27 },
  { id: 'sdr-05', name: 'Ana Beatriz Cavalcanti', previous: 21, current: 33 },
  { id: 'sdr-06', name: 'Heitor L.', previous: 40, current: 38 },
  { id: 'sdr-07', name: 'Lívia T.', previous: 15, current: 19 },
  { id: 'sdr-08', name: 'Gustavo R.', previous: 29, current: 24 },
];

/** Minutos que caem são bons: a cor do conector segue esta polaridade (COR-6). */
export const goodDirection = 'down' as const;
