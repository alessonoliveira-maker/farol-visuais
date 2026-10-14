/**
 * Passagens do handoff da oportunidade OP-0412 com a data de cada etapa alcançada
 * (`YYYY-MM-DD`), o limite de SLA por passagem em dias e a data de referência que fecha a conta
 * do passo atual. A data de referência vem do dado, nunca do relógio. Dado fictício e fixo.
 */
export interface TimedStep {
  readonly id: string;
  readonly label: string;
  readonly reachedOn: string | null;
}

export interface TimedHandoff {
  readonly opportunity: string;
  readonly slaDays: number;
  readonly referenceDate: string;
  readonly steps: readonly TimedStep[];
}

export const data: TimedHandoff = {
  opportunity: 'OP-0412',
  slaDays: 2,
  referenceDate: '2026-10-06',
  steps: [
    { id: 'lead-qualificado', label: 'Lead qualificado', reachedOn: '2026-09-22' },
    { id: 'reuniao-agendada', label: 'Reunião agendada', reachedOn: '2026-09-24' },
    { id: 'reuniao-realizada', label: 'Reunião realizada', reachedOn: '2026-09-29' },
    { id: 'proposta-enviada', label: 'Proposta enviada', reachedOn: '2026-10-01' },
    { id: 'aceite-do-executivo', label: 'Aceite do executivo', reachedOn: null },
  ],
};
