/**
 * Agendas marcadas por SDR num mês fixo: leads trabalhados é o denominador e agendas é o
 * numerador da taxa de agenda. Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface SdrAgendaCount {
  readonly id: string;
  readonly name: string;
  readonly leadsTrabalhados: number;
  readonly agendas: number;
}

export const data: readonly SdrAgendaCount[] = [
  { id: 'sdr-01', name: 'Marina T.', leadsTrabalhados: 92, agendas: 28 },
  { id: 'sdr-02', name: 'Diego F.', leadsTrabalhados: 78, agendas: 17 },
  { id: 'sdr-03', name: 'Camila R.', leadsTrabalhados: 65, agendas: 19 },
  { id: 'sdr-04', name: 'Bruno A.', leadsTrabalhados: 54, agendas: 8 },
  { id: 'sdr-05', name: 'Larissa M.', leadsTrabalhados: 88, agendas: 24 },
  { id: 'sdr-06', name: 'Felipe S.', leadsTrabalhados: 41, agendas: 6 },
  { id: 'sdr-07', name: 'Patrícia N. de Oliveira Costa', leadsTrabalhados: 70, agendas: 18 },
  { id: 'sdr-08', name: 'Rodrigo V.', leadsTrabalhados: 29, agendas: 3 },
  { id: 'sdr-09', name: 'Juliana P.', leadsTrabalhados: 60, agendas: 15 },
];
