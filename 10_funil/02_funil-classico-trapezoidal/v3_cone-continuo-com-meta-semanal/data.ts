/**
 * Esteira de pré-vendas na semana 2026 W37: entradas até handoff aceito, contra a meta semanal
 * de cada etapa, em unidades. Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export interface FunnelStageWithTarget {
  readonly id: string;
  readonly stage: string;
  readonly value: number;
  readonly target: number;
}

export const data: readonly FunnelStageWithTarget[] = [
  { id: 'entradas', stage: 'Entradas', value: 1_180, target: 1_100 },
  { id: 'conectados', stage: 'Conectados', value: 742, target: 780 },
  { id: 'qualificados', stage: 'Qualificados', value: 468, target: 520 },
  { id: 'agenda-marcada', stage: 'Agenda marcada', value: 301, target: 360 },
  { id: 'agenda-realizada', stage: 'Agenda realizada', value: 238, target: 260 },
  { id: 'handoff-aceito', stage: 'Handoff aceito', value: 142, target: 190 },
];

/** Rótulo da semana mostrado na leitura do topo. */
export const weekLabel = '2026 W37';
