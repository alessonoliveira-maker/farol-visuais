/**
 * Leads captados no mês por origem, contados pela cobertura de dado de contato na chegada:
 * telefone e e-mail, só e-mail, só telefone, ou sem nenhum dos dois. Foto de 2026-09.
 * Dado fictício e fixo: nomes de origem genéricos, nenhuma campanha real.
 */
export interface LeadCoverageRow {
  readonly id: string;
  readonly name: string;
  readonly phoneAndEmail: number;
  readonly emailOnly: number;
  readonly phoneOnly: number;
  readonly noContact: number;
}

export const data: readonly LeadCoverageRow[] = [
  { id: 'origin-01', name: 'Rede social paga', phoneAndEmail: 21, emailOnly: 38, phoneOnly: 2, noContact: 61 },
  { id: 'origin-02', name: 'Busca paga', phoneAndEmail: 9, emailOnly: 14, phoneOnly: 1, noContact: 27 },
  { id: 'origin-03', name: 'Site institucional', phoneAndEmail: 58, emailOnly: 44, phoneOnly: 5, noContact: 9 },
  { id: 'origin-04', name: 'Indicação', phoneAndEmail: 42, emailOnly: 6, phoneOnly: 3, noContact: 1 },
  { id: 'origin-05', name: 'Evento presencial', phoneAndEmail: 2, emailOnly: 1, phoneOnly: 0, noContact: 0 },
];
