/**
 * Funil comercial de uma unidade com cadastro incompleto, 2026-T3: parte da perda não tem
 * motivo registrado no CRM. Dado fictício e fixo, em número de oportunidades.
 *
 * Fechamento auditado a mão: advanced + Sem perfil + Timing + Concorrência + noReason +
 * inProgress = entered; e o entered de uma etapa é o advanced da etapa anterior. No total das
 * quatro etapas, noReason soma 91 de 239 perdidos, 38,1%: a lacuna de cadastro, não um motivo.
 */
export interface StageUnknownLossRow {
  readonly id: string;
  readonly stage: string;
  readonly entered: number;
  readonly advanced: number;
  readonly inProgress: number;
  readonly noProfile: number;
  readonly timing: number;
  readonly competition: number;
  /** Perdido sem motivo registrado no CRM: lacuna de cadastro, nunca um motivo real. */
  readonly noReason: number;
}

export const data: readonly StageUnknownLossRow[] = [
  { id: 'aberta', stage: 'Aberta', entered: 340, advanced: 210, inProgress: 38, noProfile: 22, timing: 20, competition: 16, noReason: 34 },
  { id: 'diagnostico', stage: 'Diagnóstico', entered: 210, advanced: 118, inProgress: 18, noProfile: 15, timing: 16, competition: 14, noReason: 29 },
  { id: 'proposta', stage: 'Proposta', entered: 118, advanced: 58, inProgress: 13, noProfile: 10, timing: 11, competition: 11, noReason: 15 },
  { id: 'negociacao', stage: 'Negociação', entered: 58, advanced: 24, inProgress: 8, noProfile: 4, timing: 5, competition: 4, noReason: 13 },
];
