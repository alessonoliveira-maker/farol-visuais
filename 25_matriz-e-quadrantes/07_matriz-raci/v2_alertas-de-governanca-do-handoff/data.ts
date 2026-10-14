/**
 * RACI declarado das 8 etapas do handoff de vendas, com dois defeitos de governança plantados:
 * "Aprovar desconto acima da alçada" tem dois A e "Registrar a perda" não tem nenhum.
 * `letters` tem uma entrada por papel, na ordem de `roles`; lista vazia é papel fora da etapa.
 * Dado fictício e fixo: nenhum papel ou etapa descreve pessoa ou empresa real.
 */
export type RaciLetter = 'R' | 'A' | 'C' | 'I';

export interface RaciRole {
  readonly id: string;
  readonly name: string;
}

export interface RaciStep {
  readonly id: string;
  readonly name: string;
  readonly letters: readonly (readonly RaciLetter[])[];
}

export const roles: readonly RaciRole[] = [
  { id: 'sdr', name: 'SDR' },
  { id: 'executivo', name: 'Executivo de contas' },
  { id: 'gerente', name: 'Gerente comercial' },
  { id: 'operacoes', name: 'Operações comerciais' },
  { id: 'marketing', name: 'Marketing' },
];

export const data: readonly RaciStep[] = [
  { id: 'qualificar', name: 'Qualificar o lead', letters: [['A', 'R'], ['I'], [], ['C'], ['C']] },
  { id: 'contexto', name: 'Registrar o contexto no CRM', letters: [['A', 'R'], ['I'], [], ['C'], []] },
  { id: 'conduzir', name: 'Conduzir a reunião de passagem', letters: [['C'], ['R'], ['A'], [], []] },
  { id: 'orcamento', name: 'Validar o orçamento estimado', letters: [['C'], ['R'], ['A'], ['C'], []] },
  { id: 'proposta', name: 'Montar a proposta comercial', letters: [[], ['R'], ['A'], ['C'], ['I']] },
  { id: 'desconto', name: 'Aprovar desconto acima da alçada', letters: [[], ['R'], ['A'], ['A'], []] },
  { id: 'ganho', name: 'Registrar o ganho', letters: [[], ['A', 'R'], ['I'], ['C'], []] },
  { id: 'perda', name: 'Registrar a perda', letters: [['I'], ['R'], [], ['C'], ['I']] },
];
