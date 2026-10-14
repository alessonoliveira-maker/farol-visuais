/**
 * Etapas do handoff de uma oportunidade de pré-vendas para o executivo. Cada etapa traz a data
 * em que foi alcançada (`YYYY-MM-DD`) ou `null` quando ainda não aconteceu. Dado fictício e fixo.
 */
export interface HandoffStep {
  readonly id: string;
  readonly label: string;
  readonly reachedOn: string | null;
}

export interface HandoffProgress {
  readonly opportunity: string;
  readonly steps: readonly HandoffStep[];
}

export const data: HandoffProgress = {
  opportunity: 'OP-0412',
  steps: [
    { id: 'lead-qualificado', label: 'Lead qualificado', reachedOn: '2026-09-22' },
    { id: 'reuniao-agendada', label: 'Reunião agendada', reachedOn: '2026-09-29' },
    { id: 'reuniao-realizada', label: 'Reunião realizada', reachedOn: '2026-10-05' },
    { id: 'aceite-do-executivo', label: 'Aceite do executivo', reachedOn: null },
  ],
};
