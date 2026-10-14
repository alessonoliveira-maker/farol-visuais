/**
 * Teto de agendas por semana que a pré-vendas comporta, em número de agendas, de 2026-01-05 a
 * 2026-09-18. Dado fictício e fixo: cada mudança é uma contratação ou uma saída da equipe
 * fictícia de SDRs, nunca pessoa real. O teto vale a partir da data da mudança (stepAfter).
 */
export interface CapacityStep {
  readonly date: string;
  readonly value: number;
  readonly motivo: string;
}

export const data: readonly CapacityStep[] = [
  { date: '2026-01-05', value: 10, motivo: 'Equipe inicial de dois SDRs' },
  { date: '2026-03-02', value: 15, motivo: 'Contratação de um SDR' },
  { date: '2026-05-04', value: 12, motivo: 'Saída de um SDR' },
  { date: '2026-07-06', value: 18, motivo: 'Contratação de dois SDRs' },
];

/** Data de corte do gráfico: o último patamar vale até aqui. */
export const cutoffDate = '2026-09-18';
