/**
 * Status diário de SLA por fila, nos últimos 30 dias corridos. Dado fictício e fixo.
 * Cada caractere do padrão é um dia, do mais antigo ao mais recente: D dentro do SLA, A atenção,
 * E estouro. Sem dias de calendário irregular aqui (ver a versão com calendário irregular).
 */
export interface QueueDailySla {
  readonly id: string;
  readonly name: string;
  /** 30 caracteres, um por dia: D dentro, A atenção, E estouro. */
  readonly pattern: string;
}

export const data: readonly QueueDailySla[] = [
  { id: 'base-fria', name: 'Base Fria', pattern: 'EEADDD'.repeat(5) },
  { id: 'contas-estrategicas', name: 'Contas Estratégicas', pattern: 'EEDDDD'.repeat(5) },
  { id: 'reativacao', name: 'Reativação', pattern: 'EAADDD'.repeat(5) },
  { id: 'sdr-outbound', name: 'SDR Outbound', pattern: 'EADDDD'.repeat(5) },
  { id: 'eventos', name: 'Eventos', pattern: 'EDDDDD'.repeat(5) },
  { id: 'parcerias', name: 'Parcerias', pattern: 'AADDDD'.repeat(5) },
  { id: 'indicacao', name: 'Indicação', pattern: 'ADDDDD'.repeat(5) },
  { id: 'sdr-inbound', name: 'SDR Inbound', pattern: 'DDDDDD'.repeat(5) },
];

/** Data de hoje (o último dia do padrão), usada só para o rótulo do último bloco. */
export const today = '2026-09-14';
