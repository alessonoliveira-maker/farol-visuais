/**
 * Agendas marcadas por cada SDR de pré-vendas no mês, em contagem. Dado fictício e fixo: nenhum
 * nome é pessoa real. Há um empate no 2º lugar, um nome longo e um valor pequeno (3 agendas) para
 * a haste curta continuar legível ao lado do disco.
 */
export interface ScheduleRow {
  readonly id: string;
  readonly name: string;
  /** Agendas marcadas no mês. */
  readonly count: number;
}

/** Mês da contagem, em YYYY-MM. */
export const period = '2026-08';

export const data: readonly ScheduleRow[] = [
  { id: 'sdr-01', name: 'Talita V.', count: 41 },
  { id: 'sdr-02', name: 'Murilo C.', count: 36 },
  { id: 'sdr-03', name: 'Ana Beatriz Cavalcanti', count: 36 },
  { id: 'sdr-04', name: 'Renan A.', count: 29 },
  { id: 'sdr-05', name: 'Débora F.', count: 24 },
  { id: 'sdr-06', name: 'Heitor L.', count: 17 },
  { id: 'sdr-07', name: 'Lívia T.', count: 11 },
  { id: 'sdr-08', name: 'Gustavo R.', count: 3 },
];
