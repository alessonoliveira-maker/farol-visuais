/**
 * Agendas marcadas por fila de pré-vendas na semana de 2026-09-07 a 2026-09-11, em reuniões.
 * `null` é fila sem coleta na semana (a integração parou): indisponível, que é diferente de zero medido.
 * Dado fictício e fixo: nenhuma fila, pessoa ou empresa real. Exercita empate no topo, zero e lacuna.
 */
export interface QueueAgendas {
  readonly id: string;
  readonly name: string;
  readonly agendas: number | null;
}

export const data: readonly QueueAgendas[] = [
  { id: 'fila-inbound', name: 'Inbound patrimonial', agendas: 14 },
  { id: 'fila-reativacao', name: 'Reativação de base antiga', agendas: 3 },
  { id: 'fila-parcerias', name: 'Parcerias com contadores', agendas: null },
  { id: 'fila-indicacao', name: 'Indicação de clientes', agendas: 14 },
  { id: 'fila-eventos', name: 'Eventos e webinars', agendas: 0 },
  { id: 'fila-outbound', name: 'Outbound operações estruturadas', agendas: 9 },
];
