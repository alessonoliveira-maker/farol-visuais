/**
 * RACI declarado (PREMISSA) contra o executado no CRM (MEDIDO) nas 8 etapas do handoff, no
 * trimestre 2026-07 a 2026-09. `letters` e `shares` têm uma entrada por papel, na ordem de `roles`.
 * `shares` é o percentual, de 0 a 100, dos registros da etapa feitos pelo papel; `records` é o
 * volume de registros da etapa (base do percentual). Etapa sem registro tem `shares` nulos.
 * Dado fictício e fixo: nenhum papel ou etapa descreve pessoa ou empresa real.
 */
export type RaciLetter = 'R' | 'A' | 'C' | 'I';

export interface RaciRole {
  readonly id: string;
  readonly name: string;
}

export interface RaciStepExecution {
  readonly id: string;
  readonly name: string;
  readonly records: number;
  readonly letters: readonly (readonly RaciLetter[])[];
  readonly shares: readonly (number | null)[];
}

export const roles: readonly RaciRole[] = [
  { id: 'sdr', name: 'SDR' },
  { id: 'executivo', name: 'Executivo de contas' },
  { id: 'gerente', name: 'Gerente comercial' },
  { id: 'operacoes', name: 'Operações comerciais' },
  { id: 'marketing', name: 'Marketing' },
];

export const data: readonly RaciStepExecution[] = [
  { id: 'qualificar', name: 'Qualificar o lead', records: 212, letters: [['A', 'R'], ['I'], [], ['C'], ['C']], shares: [91, 3, 0, 6, 0] },
  { id: 'contexto', name: 'Registrar o contexto no CRM', records: 188, letters: [['A', 'R'], ['I'], [], ['C'], []], shares: [52, 36, 0, 12, 0] },
  { id: 'agendar', name: 'Agendar a reunião de passagem', records: 143, letters: [['R'], ['A'], ['I'], [], []], shares: [78, 14, 0, 8, 0] },
  { id: 'conduzir', name: 'Conduzir a reunião de passagem', records: 97, letters: [['C'], ['A', 'R'], ['I'], [], []], shares: [12, 74, 14, 0, 0] },
  { id: 'orcamento', name: 'Validar o orçamento estimado', records: 64, letters: [['C'], ['R'], ['A'], [], []], shares: [0, 41, 8, 51, 0] },
  { id: 'aceitar', name: 'Aceitar a oportunidade', records: 0, letters: [['I'], ['R'], ['A'], [], []], shares: [null, null, null, null, null] },
  { id: 'proposta', name: 'Montar a proposta comercial', records: 71, letters: [[], ['R'], ['A'], ['C'], ['I']], shares: [0, 66, 6, 28, 0] },
  { id: 'resultado', name: 'Registrar o ganho ou a perda', records: 117, letters: [['I'], ['R'], ['A'], ['C'], ['I']], shares: [5, 83, 2, 10, 0] },
];
