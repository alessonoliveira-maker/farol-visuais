/**
 * Agenda de 2026-11-10 por SDR, em horário de relógio (`HH:MM`, fim exclusivo). Dado fictício e
 * fixo: nenhum nome é pessoa real.
 *
 * O dia exercita o que a grade precisa separar: o SDR 1 tem três reuniões que se cruzam, o SDR 3
 * tem uma reunião de 15 minutos e outra às 20h, fora do expediente de 9h às 18h, o SDR 4 está
 * ausente no dia todo e o SDR 5 está presente com a agenda vazia. Ausente e vazio não são a mesma
 * coisa: o primeiro não pode receber reunião, o segundo pode e não recebeu nenhuma.
 */
export interface DayMeeting {
  readonly id: string;
  readonly columnId: string;
  readonly start: string;
  readonly end: string;
}

export interface AgendaColumn {
  readonly id: string;
  readonly name: string;
  /** SDR fora no dia todo: a coluna não aceita reunião. Agenda vazia é `absent: false` e sem reuniões. */
  readonly absent: boolean;
}

export interface DayAgenda {
  readonly day: string;
  readonly columns: readonly AgendaColumn[];
  readonly meetings: readonly DayMeeting[];
}

/** Expediente, em horas cheias: o que fica fora dele leva aviso escrito. */
export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;

export const data: DayAgenda = {
  day: '2026-11-10',
  columns: [
    { id: 'sdr-1', name: 'SDR 1', absent: false },
    { id: 'sdr-2', name: 'SDR 2', absent: false },
    { id: 'sdr-3', name: 'SDR 3', absent: false },
    { id: 'sdr-4', name: 'SDR 4', absent: true },
    { id: 'sdr-5', name: 'SDR 5', absent: false },
  ],
  meetings: [
    { id: 'd01', columnId: 'sdr-1', start: '09:00', end: '09:30' },
    { id: 'd02', columnId: 'sdr-1', start: '10:00', end: '11:00' },
    { id: 'd03', columnId: 'sdr-1', start: '10:30', end: '11:30' },
    { id: 'd04', columnId: 'sdr-1', start: '10:45', end: '11:15' },
    { id: 'd05', columnId: 'sdr-1', start: '14:00', end: '15:00' },
    { id: 'd06', columnId: 'sdr-2', start: '09:30', end: '10:30' },
    { id: 'd07', columnId: 'sdr-2', start: '11:00', end: '11:30' },
    { id: 'd08', columnId: 'sdr-2', start: '13:00', end: '14:00' },
    { id: 'd09', columnId: 'sdr-2', start: '15:30', end: '16:30' },
    { id: 'd10', columnId: 'sdr-2', start: '16:30', end: '17:00' },
    { id: 'd11', columnId: 'sdr-3', start: '10:00', end: '10:30' },
    { id: 'd12', columnId: 'sdr-3', start: '14:00', end: '14:15' },
    { id: 'd13', columnId: 'sdr-3', start: '15:00', end: '16:00' },
    { id: 'd14', columnId: 'sdr-3', start: '20:00', end: '21:00' },
  ],
};
