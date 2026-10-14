/**
 * Executivo 07 em 2026-T3 contra a média dos 11 executivos do time, em índice de 0 a 100 por
 * dimensão do processo. A média é arredondada ao inteiro e não inclui o executivo. A ordem das
 * dimensões é a do registry e não muda entre telas. Dado fictício e fixo.
 */
export interface ProcessAxis {
  readonly id: string;
  readonly label: string;
  /** O nome como entra no meio de uma frase (sigla mantém a caixa). */
  readonly phrase: string;
  readonly value: number;
  readonly reference: number;
}

export const data: readonly ProcessAxis[] = [
  { id: 'discovery', label: 'Descoberta', phrase: 'descoberta', value: 64, reference: 58 },
  { id: 'qualification', label: 'Qualificação de oportunidades', phrase: 'qualificação de oportunidades', value: 58, reference: 61 },
  { id: 'proposal', label: 'Proposta', phrase: 'proposta', value: 71, reference: 60 },
  { id: 'negotiation', label: 'Negociação', phrase: 'negociação', value: 47, reference: 59 },
  { id: 'follow-up', label: 'Follow up', phrase: 'follow up', value: 38, reference: 55 },
  { id: 'crm', label: 'Registro no CRM', phrase: 'registro no CRM', value: 84, reference: 62 },
  { id: 'forecast', label: 'Precisão de forecast', phrase: 'precisão de forecast', value: 52, reference: 57 },
  { id: 'coverage', label: 'Cobertura de contas', phrase: 'cobertura de contas', value: 66, reference: 64 },
];

/** Quem o perfil descreve, escrito como entra no meio de uma frase. */
export const subject = 'Executivo 07';

/** Quantos executivos formam a média. */
export const teamSize = 11;
