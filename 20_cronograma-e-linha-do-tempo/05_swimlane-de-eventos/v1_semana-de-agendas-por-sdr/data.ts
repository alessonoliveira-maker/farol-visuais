/**
 * Reuniões de 30 e 60 minutos agendadas por SDR na semana de 2026-11-09 a 2026-11-13, dentro do
 * expediente de 9h às 18h. Dado fictício e fixo: nenhum nome é pessoa real.
 *
 * O dado exercita o caso difícil da raia: o SDR 3 tem reuniões coladas e uma sobreposta, o SDR 5
 * tem duas reuniões que se cruzam na terça, e o SDR 4 agendou só três, uma delas no último
 * horário do dia. Os horários são `HH:MM`, com fim exclusivo.
 */
export interface Meeting {
  readonly id: string;
  readonly laneId: string;
  /** Dia em YYYY-MM-DD. */
  readonly day: string;
  readonly start: string;
  readonly end: string;
}

export interface AgendaLane {
  readonly id: string;
  readonly name: string;
}

export interface AgendaWeek {
  readonly days: readonly string[];
  readonly lanes: readonly AgendaLane[];
  readonly meetings: readonly Meeting[];
}

/** Expediente desenhado, em horas cheias. */
export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;

const m = (id: string, laneId: string, day: string, start: string, end: string): Meeting => ({
  id,
  laneId,
  day,
  start,
  end,
});

export const data: AgendaWeek = {
  days: ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'],
  lanes: [
    { id: 'sdr-1', name: 'SDR 1' },
    { id: 'sdr-2', name: 'SDR 2' },
    { id: 'sdr-3', name: 'SDR 3' },
    { id: 'sdr-4', name: 'SDR 4' },
    { id: 'sdr-5', name: 'SDR 5' },
  ],
  meetings: [
    m('r01', 'sdr-1', '2026-11-09', '09:00', '09:30'),
    m('r02', 'sdr-1', '2026-11-09', '10:00', '11:00'),
    m('r03', 'sdr-1', '2026-11-09', '14:00', '14:30'),
    m('r04', 'sdr-1', '2026-11-10', '09:30', '10:00'),
    m('r05', 'sdr-1', '2026-11-10', '11:00', '12:00'),
    m('r06', 'sdr-1', '2026-11-11', '15:00', '16:00'),
    m('r07', 'sdr-1', '2026-11-12', '09:00', '09:30'),
    m('r08', 'sdr-1', '2026-11-12', '13:00', '13:30'),
    m('r09', 'sdr-1', '2026-11-13', '10:00', '10:30'),
    m('r10', 'sdr-2', '2026-11-09', '09:30', '10:30'),
    m('r11', 'sdr-2', '2026-11-09', '16:00', '16:30'),
    m('r12', 'sdr-2', '2026-11-10', '10:00', '11:00'),
    m('r13', 'sdr-2', '2026-11-10', '14:00', '15:00'),
    m('r14', 'sdr-2', '2026-11-11', '09:00', '09:30'),
    m('r15', 'sdr-2', '2026-11-12', '11:00', '11:30'),
    m('r16', 'sdr-2', '2026-11-12', '14:30', '15:30'),
    m('r17', 'sdr-2', '2026-11-13', '09:00', '10:00'),
    m('r18', 'sdr-2', '2026-11-13', '15:00', '15:30'),
    m('r19', 'sdr-3', '2026-11-09', '09:00', '10:00'),
    m('r20', 'sdr-3', '2026-11-09', '10:00', '11:00'),
    m('r21', 'sdr-3', '2026-11-09', '10:30', '11:00'),
    m('r22', 'sdr-3', '2026-11-10', '09:00', '10:00'),
    m('r23', 'sdr-3', '2026-11-10', '10:00', '11:00'),
    m('r24', 'sdr-3', '2026-11-10', '14:00', '15:00'),
    m('r25', 'sdr-3', '2026-11-10', '15:00', '16:00'),
    m('r26', 'sdr-3', '2026-11-11', '09:00', '10:00'),
    m('r27', 'sdr-3', '2026-11-11', '13:00', '14:00'),
    m('r28', 'sdr-3', '2026-11-11', '14:00', '14:30'),
    m('r29', 'sdr-3', '2026-11-12', '10:00', '11:00'),
    m('r30', 'sdr-3', '2026-11-12', '15:00', '16:00'),
    m('r31', 'sdr-3', '2026-11-13', '09:30', '10:30'),
    m('r32', 'sdr-3', '2026-11-13', '11:00', '12:00'),
    m('r33', 'sdr-3', '2026-11-13', '17:00', '18:00'),
    m('r34', 'sdr-4', '2026-11-09', '11:00', '11:30'),
    m('r35', 'sdr-4', '2026-11-12', '16:30', '17:00'),
    m('r36', 'sdr-4', '2026-11-13', '17:30', '18:00'),
    m('r37', 'sdr-5', '2026-11-10', '09:00', '09:30'),
    m('r38', 'sdr-5', '2026-11-10', '09:15', '09:45'),
    m('r39', 'sdr-5', '2026-11-11', '11:00', '12:00'),
    m('r40', 'sdr-5', '2026-11-12', '09:00', '10:00'),
    m('r41', 'sdr-5', '2026-11-12', '10:00', '10:30'),
    m('r42', 'sdr-5', '2026-11-13', '14:00', '15:00'),
  ],
};
