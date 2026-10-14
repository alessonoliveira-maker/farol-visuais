/**
 * Pré-vendas em 2026-08, em unidades. Agenda realizada inclui agendas marcadas em julho, por
 * isso soma mais que Agenda marcada no mesmo mês: a série deixa de ser monotônica de propósito,
 * para exercitar a etapa maior que a anterior. Dado fictício e fixo.
 */
export interface FunnelStage {
  readonly id: string;
  readonly stage: string;
  readonly value: number;
}

export const data: readonly FunnelStage[] = [
  { id: 'entradas', stage: 'Entradas', value: 540 },
  { id: 'conectados', stage: 'Conectados', value: 372 },
  { id: 'agenda-marcada', stage: 'Agenda marcada', value: 248 },
  { id: 'agenda-realizada', stage: 'Agenda realizada', value: 260 },
  { id: 'handoff-aceito', stage: 'Handoff aceito', value: 205 },
];

/** Rótulo do mês mostrado no aviso e na leitura do topo. */
export const monthLabel = '2026-08';
