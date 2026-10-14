/**
 * Combinações de campos preenchidos em 8.400 leads fictícios de um trimestre: cada linha diz
 * quais campos vieram preenchidos e quantos leads têm exatamente essa combinação. A ordem de
 * `fieldIds` pode variar de uma linha para outra; o componente monta a chave canônica.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou contato real.
 */
export interface LeadField {
  readonly id: string;
  readonly name: string;
}

export interface FieldCombination {
  readonly id: string;
  readonly fieldIds: readonly string[];
  readonly leads: number;
}

export const fields: readonly LeadField[] = [
  { id: 'email', name: 'E-mail' },
  { id: 'nome', name: 'Nome' },
  { id: 'telefone', name: 'Telefone' },
  { id: 'empresa', name: 'Empresa' },
  { id: 'cargo', name: 'Cargo' },
  { id: 'utm', name: 'UTM' },
];

export const data: readonly FieldCombination[] = [
  { id: 'c01', fieldIds: ['nome', 'email'], leads: 3100 },
  { id: 'c02', fieldIds: ['email', 'nome', 'telefone'], leads: 1480 },
  { id: 'c03', fieldIds: ['email', 'empresa', 'nome'], leads: 960 },
  { id: 'c04', fieldIds: ['email', 'nome', 'telefone', 'empresa'], leads: 780 },
  { id: 'c05', fieldIds: ['email', 'nome', 'utm'], leads: 520 },
  { id: 'c06', fieldIds: ['cargo', 'email', 'nome', 'telefone', 'empresa'], leads: 410 },
  { id: 'c07', fieldIds: ['email', 'nome', 'empresa', 'cargo'], leads: 330 },
  { id: 'c08', fieldIds: ['email', 'nome', 'telefone', 'utm'], leads: 240 },
  { id: 'c09', fieldIds: ['email'], leads: 190 },
  { id: 'c10', fieldIds: ['nome', 'telefone'], leads: 120 },
  { id: 'c11', fieldIds: ['email', 'nome', 'telefone', 'empresa', 'cargo', 'utm'], leads: 110 },
  { id: 'c12', fieldIds: ['email', 'nome', 'empresa', 'utm'], leads: 80 },
  { id: 'c13', fieldIds: ['telefone'], leads: 50 },
  { id: 'c14', fieldIds: ['email', 'nome', 'cargo'], leads: 30 },
];
