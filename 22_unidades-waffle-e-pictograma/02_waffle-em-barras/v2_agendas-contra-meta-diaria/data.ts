/**
 * Agendas marcadas pelo time de pré-vendas em cada dia útil de uma semana e a meta diária de 18
 * agendas. Dado fictício e fixo: nenhum número é de operação real.
 *
 * O caso difícil está no meio: quinta-feira fecha em exatos 18 e bate a meta sem sobra, quarta-feira
 * passa dela com 21, e os outros três dias ficam abaixo, de 3 a 9 agendas a menos.
 */
export interface DayAgendas {
  readonly id: string;
  /** Nome do dia por extenso, usado na dica e na frase. */
  readonly weekday: string;
  /** Nome curto do dia, usado no eixo. */
  readonly shortName: string;
  /** Data do dia no formato YYYY-MM-DD. */
  readonly date: string;
  /** Agendas marcadas no dia. */
  readonly agendas: number;
}

export const data: readonly DayAgendas[] = [
  { id: 'dia-01', weekday: 'Segunda-feira', shortName: 'Segunda', date: '2026-09-14', agendas: 15 },
  { id: 'dia-02', weekday: 'Terça-feira', shortName: 'Terça', date: '2026-09-15', agendas: 13 },
  { id: 'dia-03', weekday: 'Quarta-feira', shortName: 'Quarta', date: '2026-09-16', agendas: 21 },
  { id: 'dia-04', weekday: 'Quinta-feira', shortName: 'Quinta', date: '2026-09-17', agendas: 18 },
  { id: 'dia-05', weekday: 'Sexta-feira', shortName: 'Sexta', date: '2026-09-18', agendas: 9 },
];

/** Meta diária de agendas, em agendas por dia útil. */
export const dailyGoal = 18;
