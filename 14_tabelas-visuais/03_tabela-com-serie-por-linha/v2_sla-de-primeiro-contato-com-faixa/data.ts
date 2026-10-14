/**
 * Tempo de primeiro contato, em minutos, por fila de atendimento, nas últimas 8 semanas. Dado
 * fictício e fixo. A faixa aceitável é de 0 a 15 minutos, comum a todas as filas.
 */
export interface WeeklyMinutes {
  readonly week: string;
  readonly minutes: number;
}

export interface QueueContactTime {
  readonly id: string;
  readonly name: string;
  readonly series: readonly WeeklyMinutes[];
}

const WEEKS = [
  '2026-07-20', '2026-07-27', '2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07',
] as const;

function series(values: readonly number[]): readonly WeeklyMinutes[] {
  return WEEKS.map((week, i) => ({ week, minutes: values[i] ?? 0 }));
}

export const data: readonly QueueContactTime[] = [
  { id: 'inbound-site', name: 'Inbound Site', series: series([5.4, 6.1, 7.2, 6.4, 8.0, 7.3, 6.6, 7.1]) },
  { id: 'mensageria-inbound', name: 'Mensageria Inbound', series: series([4.2, 5.0, 4.4, 6.1, 5.3, 4.6, 5.2, 4.5]) },
  { id: 'reativacao-fria', name: 'Reativação Fria', series: series([18.2, 22.4, 25.1, 19.6, 23.3, 26.0, 21.5, 24.8]) },
  { id: 'campanha-outbound', name: 'Campanha Outbound', series: series([12.4, 14.2, 16.5, 13.1, 17.8, 19.3, 14.6, 16.2]) },
  { id: 'indicacao-vip', name: 'Indicação VIP', series: series([3.1, 4.0, 3.4, 5.2, 4.1, 3.6, 4.4, 3.8]) },
  { id: 'evento-setembro', name: 'Evento Setembro', series: series([10.2, 9.4, 11.6, 10.8, 12.1, 10.5, 9.8, 11.3]) },
  { id: 'base-antiga', name: 'Base Antiga Reativação', series: series([20.4, 24.6, 28.2, 22.8, 26.5, 29.1, 23.7, 27.4]) },
  { id: 'lead-ads-redes', name: 'Lead Ads Redes Sociais', series: series([14.3, 13.8, 15.2, 13.6, 14.9, 15.4, 13.2, 14.6]) },
];
