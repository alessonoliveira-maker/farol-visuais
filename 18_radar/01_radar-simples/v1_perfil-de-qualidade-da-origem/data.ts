/**
 * Qualidade dos leads da origem formulário do site em 2026-08, em índice de 0 a 100 por dimensão
 * (parcela dos leads que cumpre o critério). A ordem das dimensões é a do registry e não muda
 * entre telas. Dado fictício e fixo.
 */
export interface QualityAxis {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

export const data: readonly QualityAxis[] = [
  { id: 'phone', label: 'Telefone', value: 58 },
  { id: 'email', label: 'E-mail corporativo', value: 41 },
  { id: 'role', label: 'Cargo', value: 36 },
  { id: 'fit', label: 'Fit', value: 62 },
  { id: 'reply', label: 'Resposta', value: 47 },
  { id: 'meeting', label: 'Agenda', value: 22 },
];

/** A origem que o perfil descreve, escrita como entra no meio de uma frase. */
export const subject = 'formulário do site';
