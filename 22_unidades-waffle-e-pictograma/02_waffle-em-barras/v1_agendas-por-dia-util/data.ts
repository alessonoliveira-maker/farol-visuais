/**
 * Agendas marcadas pelo time de pré-vendas em cada dia útil de uma semana, contadas uma a uma.
 * Dado fictício e fixo: nenhum número é de operação real.
 *
 * O caso difícil está nos extremos: sexta-feira fecha com 7 agendas, que não completam uma linha de
 * três células, e quinta-feira com 24 enche oito linhas. Todas as colunas usam a mesma linha de três.
 */
export interface DayAgendas {
  readonly id: string;
  /** Nome do dia por extenso, usado na dica. */
  readonly weekday: string;
  /** Nome curto do dia, usado no eixo. */
  readonly shortName: string;
  /** Data do dia no formato YYYY-MM-DD. */
  readonly date: string;
  /** Agendas marcadas no dia. */
  readonly agendas: number;
}

export const data: readonly DayAgendas[] = [
  { id: 'dia-01', weekday: 'Segunda-feira', shortName: 'Segunda', date: '2026-09-14', agendas: 12 },
  { id: 'dia-02', weekday: 'Terça-feira', shortName: 'Terça', date: '2026-09-15', agendas: 17 },
  { id: 'dia-03', weekday: 'Quarta-feira', shortName: 'Quarta', date: '2026-09-16', agendas: 21 },
  { id: 'dia-04', weekday: 'Quinta-feira', shortName: 'Quinta', date: '2026-09-17', agendas: 24 },
  { id: 'dia-05', weekday: 'Sexta-feira', shortName: 'Sexta', date: '2026-09-18', agendas: 7 },
];
