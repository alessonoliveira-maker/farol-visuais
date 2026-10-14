/**
 * Agendas marcadas por SDR na semana de 2026-09-07 a 2026-09-11, em contagem.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface SdrAgendas {
  readonly id: string;
  readonly name: string;
  readonly count: number;
}

export const data: readonly SdrAgendas[] = [
  { id: 'sdr-01', name: 'Marina T.', count: 23 },
  { id: 'sdr-02', name: 'Bruno K.', count: 19 },
  { id: 'sdr-03', name: 'Camila R.', count: 16 },
  { id: 'sdr-04', name: 'Diego F.', count: 14 },
  { id: 'sdr-05', name: 'Isabela do Nascimento N.', count: 9 },
  { id: 'sdr-06', name: 'Rafael W.', count: 5 },
];

/** A SDR em foco quando o painel abre: a que está com a sessão aberta. */
export const highlightId = 'sdr-04';
