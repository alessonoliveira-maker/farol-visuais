/**
 * Funil comercial do primeiro semestre, família (PF) contra empresa (PJ), por etapa. Empresa não
 * passa pela etapa Diagnóstico neste recorte: `companyValue` é `null`, não zero.
 * Dado fictício e fixo: nenhuma pessoa ou empresa é real.
 */
export interface ButterflyStage {
  readonly id: string;
  readonly stage: string;
  readonly familyValue: number;
  readonly companyValue: number | null;
}

export const data: readonly ButterflyStage[] = [
  { id: 'aberta', stage: 'Aberta', familyValue: 236, companyValue: 184 },
  { id: 'diagnostico', stage: 'Diagnóstico', familyValue: 151, companyValue: null },
  { id: 'proposta', stage: 'Proposta', familyValue: 82, companyValue: 97 },
  { id: 'negociacao', stage: 'Negociação', familyValue: 37, companyValue: 41 },
  { id: 'ganha', stage: 'Ganha', familyValue: 19, companyValue: 14 },
];

/** Rótulo do lado esquerdo, por extenso. */
export const familyLabel = 'Família (PF)';
/** Rótulo do lado direito, por extenso. */
export const companyLabel = 'Empresa (PJ)';
