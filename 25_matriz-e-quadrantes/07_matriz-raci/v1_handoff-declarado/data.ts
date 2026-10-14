/**
 * RACI declarado do handoff de pré-vendas para vendas: 8 etapas na ordem do processo e 5 papéis.
 * `letters` tem uma entrada por papel, na ordem de `roles`; lista vazia é papel fora da etapa.
 * Letra: R executa, A responde em última instância, C é consultado, I é informado.
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
  { id: 'contexto', name: 'Registrar o contexto da conversa no CRM', letters: [['A', 'R'], ['I'], [], ['C'], []] },
  { id: 'agendar', name: 'Agendar a reunião de passagem', letters: [['R'], ['A'], ['I'], [], []] },
  { id: 'conduzir', name: 'Conduzir a reunião de passagem', letters: [['C'], ['A', 'R'], ['I'], [], []] },
  { id: 'orcamento', name: 'Validar o orçamento estimado com o cliente e com a operação comercial', letters: [['C'], ['R'], ['A'], ['C'], []] },
  { id: 'aceitar', name: 'Aceitar a oportunidade', letters: [['I'], ['R'], ['A'], [], []] },
  { id: 'proposta', name: 'Montar a proposta comercial', letters: [[], ['R'], ['A'], ['C'], ['I']] },
  { id: 'resultado', name: 'Registrar o ganho ou a perda', letters: [['I'], ['R'], ['A'], ['C'], ['I']] },
];
