/**
 * Resultado das agendas comerciais em quatro semanas consecutivas, por desfecho.
 * Dado fictício e fixo: nenhuma semana corresponde a uma semana real de calendário.
 */
export interface AgendaOutcome {
  readonly id: 'realizada' | 'remarcada' | 'nao-compareceu';
  readonly name: string;
  readonly count: number;
}

export interface WeeklyAgendaOutcomes {
  readonly weekId: string;
  readonly weekLabel: string;
  /** Início da semana, YYYY-MM-DD. */
  readonly startDate: string;
  /** Ordem fixa dos desfechos: a mesma sequência e a mesma cor em toda semana (COR-3). */
  readonly outcomes: readonly AgendaOutcome[];
}

export const data: readonly WeeklyAgendaOutcomes[] = [
  {
    weekId: 'sem-1',
    weekLabel: 'Sem 1',
    startDate: '2026-08-04',
    outcomes: [
      { id: 'realizada', name: 'Realizada', count: 17 },
      { id: 'remarcada', name: 'Remarcada', count: 4 },
      { id: 'nao-compareceu', name: 'Não compareceu', count: 3 },
    ],
  },
  {
    weekId: 'sem-2',
    weekLabel: 'Sem 2',
    startDate: '2026-08-11',
    outcomes: [
      { id: 'realizada', name: 'Realizada', count: 19 },
      { id: 'remarcada', name: 'Remarcada', count: 3 },
      { id: 'nao-compareceu', name: 'Não compareceu', count: 5 },
    ],
  },
  {
    weekId: 'sem-3',
    weekLabel: 'Sem 3',
    startDate: '2026-08-18',
    outcomes: [
      { id: 'realizada', name: 'Realizada', count: 15 },
      { id: 'remarcada', name: 'Remarcada', count: 6 },
      { id: 'nao-compareceu', name: 'Não compareceu', count: 4 },
    ],
  },
  {
    weekId: 'sem-4',
    weekLabel: 'Sem 4',
    startDate: '2026-08-25',
    outcomes: [
      { id: 'realizada', name: 'Realizada', count: 18 },
      { id: 'remarcada', name: 'Remarcada', count: 5 },
      { id: 'nao-compareceu', name: 'Não compareceu', count: 2 },
    ],
  },
];
