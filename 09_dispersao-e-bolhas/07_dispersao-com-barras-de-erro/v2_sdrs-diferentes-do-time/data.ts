/**
 * Agendas marcadas por SDR num mês fixo: `leadsTrabalhados` é o denominador e `agendas` é o
 * numerador da taxa de agenda. A taxa do time não vem digitada aqui; ela é a soma das agendas
 * sobre a soma dos leads, calculada no componente, porque média de taxas dá peso igual a quem
 * trabalhou 45 leads e a quem trabalhou 140.
 *
 * Dado fictício e fixo: nenhum nome é pessoa real. Duas linhas existem para o caso difícil:
 * `sdr-02` e `sdr-04` têm a MESMA taxa, 13,8%, e vereditos opostos, porque o intervalo de quem
 * trabalhou 58 leads cruza a taxa do time e o de quem trabalhou 130 não cruza.
 */
export interface SdrAgendaCount {
  readonly id: string;
  readonly name: string;
  readonly leadsTrabalhados: number;
  readonly agendas: number;
}

export const data: readonly SdrAgendaCount[] = [
  { id: 'sdr-01', name: 'Marina T. de Alencar', leadsTrabalhados: 140, agendas: 48 },
  { id: 'sdr-02', name: 'Diego F.', leadsTrabalhados: 130, agendas: 18 },
  { id: 'sdr-03', name: 'Camila R.', leadsTrabalhados: 62, agendas: 17 },
  { id: 'sdr-04', name: 'Bruno A.', leadsTrabalhados: 58, agendas: 8 },
  { id: 'sdr-05', name: 'Larissa M.', leadsTrabalhados: 76, agendas: 25 },
  { id: 'sdr-06', name: 'Felipe S.', leadsTrabalhados: 45, agendas: 6 },
  { id: 'sdr-07', name: 'Patrícia N. de Oliveira Costa', leadsTrabalhados: 104, agendas: 24 },
  { id: 'sdr-08', name: 'Rodrigo V.', leadsTrabalhados: 96, agendas: 13 },
];

/** O nível de confiança do intervalo desenhado, e é ele que o cartão precisa nomear. */
export const confidence = 0.95;
