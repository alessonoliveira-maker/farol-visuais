/**
 * Reuniões de pré-vendas da semana de 2026-11-09 a 2026-11-13, com a situação de cada uma e, nas
 * que o lead faltou, para quando e para quem a remarcação foi empurrada. Dado fictício e fixo:
 * nenhum nome é pessoa real.
 *
 * Casos que o desenho precisa separar: ausência remarcada na mesma raia, ausência remarcada para
 * outra SDR, ausência ainda sem nova data, e uma raia sem nenhuma ausência (zero medido, e não
 * raia sem dado). Os horários são `HH:MM`, com fim exclusivo.
 */
export interface Reschedule {
  /** Raia que recebe a reunião nova; igual à raia de origem quando a SDR é a mesma. */
  readonly laneId: string;
  readonly day: string;
  readonly start: string;
}

export interface AgendaMeeting {
  readonly id: string;
  readonly laneId: string;
  readonly day: string;
  readonly start: string;
  readonly end: string;
  /** `held` aconteceu ou está marcada; `no-show` é ausência do lead. */
  readonly status: 'held' | 'no-show';
  /** Só para `no-show`. Null é ausência ainda sem nova data. */
  readonly rescheduledTo: Reschedule | null;
}

export interface AgendaLane {
  readonly id: string;
  readonly name: string;
}

export interface AgendaWeek {
  readonly days: readonly string[];
  readonly lanes: readonly AgendaLane[];
  readonly meetings: readonly AgendaMeeting[];
}

/** Expediente desenhado, em horas cheias. */
export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;

const held = (id: string, laneId: string, day: string, start: string, end: string): AgendaMeeting => ({
  id,
  laneId,
  day,
  start,
  end,
  status: 'held',
  rescheduledTo: null,
});

const absent = (
  id: string,
  laneId: string,
  day: string,
  start: string,
  end: string,
  rescheduledTo: Reschedule | null,
): AgendaMeeting => ({ id, laneId, day, start, end, status: 'no-show', rescheduledTo });

export const data: AgendaWeek = {
  days: ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'],
  lanes: [
    { id: 'sdr-1', name: 'SDR 1' },
    { id: 'sdr-2', name: 'SDR 2' },
    { id: 'sdr-3', name: 'SDR 3' },
    { id: 'sdr-4', name: 'SDR 4' },
  ],
  meetings: [
    held('a01', 'sdr-1', '2026-11-09', '09:00', '09:30'),
    absent('a02', 'sdr-1', '2026-11-09', '10:30', '11:30', { laneId: 'sdr-1', day: '2026-11-11', start: '10:30' }),
    held('a03', 'sdr-1', '2026-11-10', '14:00', '15:00'),
    held('a04', 'sdr-1', '2026-11-12', '09:30', '10:00'),
    absent('a05', 'sdr-1', '2026-11-13', '09:00', '09:30', null),
    absent('a06', 'sdr-2', '2026-11-09', '14:00', '15:00', null),
    absent('a07', 'sdr-2', '2026-11-10', '10:00', '11:00', { laneId: 'sdr-3', day: '2026-11-11', start: '15:00' }),
    held('a08', 'sdr-2', '2026-11-11', '09:00', '09:30'),
    absent('a09', 'sdr-2', '2026-11-12', '11:00', '11:30', { laneId: 'sdr-2', day: '2026-11-13', start: '11:00' }),
    held('a10', 'sdr-2', '2026-11-13', '15:00', '16:00'),
    held('a11', 'sdr-3', '2026-11-09', '09:30', '10:30'),
    held('a12', 'sdr-3', '2026-11-10', '15:00', '15:30'),
    absent('a13', 'sdr-3', '2026-11-12', '14:00', '14:30', { laneId: 'sdr-4', day: '2026-11-13', start: '10:00' }),
    held('a14', 'sdr-3', '2026-11-13', '14:30', '15:00'),
    held('a15', 'sdr-4', '2026-11-09', '11:00', '12:00'),
    held('a16', 'sdr-4', '2026-11-11', '13:00', '13:30'),
    held('a17', 'sdr-4', '2026-11-12', '16:00', '17:00'),
  ],
};
