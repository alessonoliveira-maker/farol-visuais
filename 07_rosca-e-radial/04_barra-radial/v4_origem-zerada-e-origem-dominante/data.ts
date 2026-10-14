/**
 * Leads do mês de 2026-08 por origem declarada, em contagem.
 * Dado fictício e fixo: Indicação domina a base (quase 8 vezes a segunda) e Reativação não
 * gerou nenhum lead no mês, um caso limite do formato.
 */
export interface OriginLeads {
  readonly id: string;
  readonly name: string;
  readonly count: number;
}

export const data: readonly OriginLeads[] = [
  { id: 'indicacao', name: 'Indicação', count: 342 },
  { id: 'midia-paga', name: 'Mídia paga', count: 44 },
  { id: 'organico', name: 'Orgânico', count: 33 },
  { id: 'parceria', name: 'Parceria', count: 19 },
  { id: 'outbound', name: 'Outbound', count: 12 },
  { id: 'evento', name: 'Evento', count: 6 },
  { id: 'reativacao', name: 'Reativação', count: 0 },
];
