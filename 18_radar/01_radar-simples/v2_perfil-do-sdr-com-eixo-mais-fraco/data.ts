/**
 * Perfil do SDR 04 em 2026-T3, em índice de 0 a 100 por dimensão (parcela do critério cumprida
 * no trimestre). A ordem das dimensões é a do registry e não muda entre telas. Dado fictício e
 * fixo.
 */
export interface SkillScore {
  readonly id: string;
  readonly label: string;
  /** O nome como entra no meio de uma frase (sigla mantém a caixa). */
  readonly phrase: string;
  readonly value: number;
}

export const data: readonly SkillScore[] = [
  { id: 'reply-time', label: 'Tempo de resposta', phrase: 'tempo de resposta', value: 72 },
  { id: 'attempts', label: 'Tentativas', phrase: 'tentativas', value: 68 },
  { id: 'qualification', label: 'Qualificação', phrase: 'qualificação', value: 64 },
  { id: 'meeting', label: 'Agenda', phrase: 'agenda', value: 58 },
  { id: 'attendance', label: 'Comparecimento', phrase: 'comparecimento', value: 31 },
  { id: 'crm', label: 'Registro no CRM', phrase: 'registro no CRM', value: 77 },
];

/** Quem o perfil descreve, escrito como entra no meio de uma frase. */
export const subject = 'SDR 04';
