/**
 * Agendas realizadas pela pré-vendas por mês em 2026, em número de agendas. Janeiro a agosto estão
 * fechados, setembro está em curso até 2026-09-18 e outubro a dezembro ainda não existem, por isso
 * o valor é null e nunca zero. A ordem é a do calendário: dezembro fica ao lado de janeiro no ciclo.
 * Dado fictício e fixo.
 */
export type MonthStatus = 'closed' | 'partial' | 'absent';

export interface MonthMeetings {
  readonly id: string;
  /** Mês no formato do dado, `YYYY-MM`. */
  readonly month: string;
  /** Nome curto do mês, como entra no rótulo do eixo. */
  readonly label: string;
  /** Nome do mês por extenso, como entra no meio de uma frase. */
  readonly name: string;
  /** Agendas realizadas no mês, ou null quando o mês ainda não existe. */
  readonly value: number | null;
  readonly status: MonthStatus;
}

export const data: readonly MonthMeetings[] = [
  { id: 'm01', month: '2026-01', label: 'jan', name: 'janeiro', value: 41, status: 'closed' },
  { id: 'm02', month: '2026-02', label: 'fev', name: 'fevereiro', value: 38, status: 'closed' },
  { id: 'm03', month: '2026-03', label: 'mar', name: 'março', value: 52, status: 'closed' },
  { id: 'm04', month: '2026-04', label: 'abr', name: 'abril', value: 47, status: 'closed' },
  { id: 'm05', month: '2026-05', label: 'mai', name: 'maio', value: 55, status: 'closed' },
  { id: 'm06', month: '2026-06', label: 'jun', name: 'junho', value: 49, status: 'closed' },
  { id: 'm07', month: '2026-07', label: 'jul', name: 'julho', value: 58, status: 'closed' },
  { id: 'm08', month: '2026-08', label: 'ago', name: 'agosto', value: 61, status: 'closed' },
  { id: 'm09', month: '2026-09', label: 'set', name: 'setembro', value: 27, status: 'partial' },
  { id: 'm10', month: '2026-10', label: 'out', name: 'outubro', value: null, status: 'absent' },
  { id: 'm11', month: '2026-11', label: 'nov', name: 'novembro', value: null, status: 'absent' },
  { id: 'm12', month: '2026-12', label: 'dez', name: 'dezembro', value: null, status: 'absent' },
];

/** A data até a qual o mês em curso está contado, no formato do dado. */
export const asOf = '2026-09-18';
