/**
 * Executivo 07 em 2026-T3 contra a faixa dos 11 executivos do time, em índice de 0 a 100 por
 * dimensão do processo. `min` e `max` são o menor e o maior valor do time em cada dimensão (o
 * próprio executivo incluso). A ordem das dimensões é a do registry. Dado fictício e fixo.
 */
export interface ProcessAxis {
  readonly id: string;
  readonly label: string;
  /** O nome como entra no meio de uma frase (sigla mantém a caixa). */
  readonly phrase: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
}

export const data: readonly ProcessAxis[] = [
  { id: 'discovery', label: 'Descoberta', phrase: 'descoberta', value: 64, min: 48, max: 81 },
  { id: 'qualification', label: 'Qualificação de oportunidades', phrase: 'qualificação de oportunidades', value: 58, min: 44, max: 76 },
  { id: 'proposal', label: 'Proposta', phrase: 'proposta', value: 71, min: 52, max: 79 },
  { id: 'negotiation', label: 'Negociação', phrase: 'negociação', value: 47, min: 51, max: 83 },
  { id: 'follow-up', label: 'Follow up', phrase: 'follow up', value: 38, min: 41, max: 74 },
  { id: 'crm', label: 'Registro no CRM em dia', phrase: 'registro no CRM em dia', value: 84, min: 55, max: 78 },
  { id: 'forecast', label: 'Precisão de forecast', phrase: 'precisão de forecast', value: 52, min: 39, max: 72 },
  { id: 'coverage', label: 'Cobertura de contas', phrase: 'cobertura de contas', value: 66, min: 47, max: 69 },
];

/** Quem o perfil descreve, escrito como entra no meio de uma frase. */
export const subject = 'Executivo 07';

/** Tamanho do time que forma a faixa, o executivo incluso. */
export const teamSize = 11;
