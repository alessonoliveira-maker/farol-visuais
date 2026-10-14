/**
 * Agendas de pré-vendas da semana de 2026-08-31 a 2026-09-04, por canal, contra a meta semanal
 * combinada de inbound e outbound. Dado fictício e fixo: nenhuma pessoa ou empresa é real.
 */
export interface AgendaSemanaCanal {
  readonly inbound: number;
  readonly outbound: number;
}

export const data: readonly AgendaSemanaCanal[] = [{ inbound: 45, outbound: 59 }];

/** Meta semanal de agendas, somando os dois canais. */
export const meta = 90;
