/**
 * Funil da pré-vendas na semana de 2026-09-07, por etapa do processo.
 * Dado fictício e fixo: nenhuma pessoa ou organização real.
 */
export interface FunnelStage {
  readonly id: string;
  readonly label: string;
  /** Substantivo da contagem desta etapa, para a unidade acompanhar todo número (NUM-6). */
  readonly noun: string;
  readonly value: number;
}

export const data: readonly FunnelStage[] = [
  { id: 'entradas', label: 'Entradas', noun: 'entradas', value: 1180 },
  { id: 'tentativa', label: 'Tentativa', noun: 'tentativas', value: 1020 },
  { id: 'conexao', label: 'Conexão', noun: 'conexões', value: 612 },
  { id: 'agenda-marcada', label: 'Agenda marcada', noun: 'agendas marcadas', value: 248 },
  { id: 'agenda-realizada', label: 'Agenda realizada', noun: 'agendas realizadas', value: 187 },
  { id: 'handoff', label: 'Handoff aceito', noun: 'handoffs aceitos', value: 142 },
];
