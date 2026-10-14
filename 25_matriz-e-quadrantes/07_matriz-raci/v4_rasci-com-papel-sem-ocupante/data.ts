/**
 * RASCI da redistribuição da fila de leads de pré-vendas: 6 etapas e 6 papéis, um deles sem
 * ocupante desde 2026-08-01 (`vacantSince`). `letters` tem uma entrada por papel, na ordem de
 * `roles`; lista vazia é papel fora da etapa. Letra: R executa, A responde em última instância,
 * S dá suporte, C é consultado, I é informado. Dado fictício e fixo: nenhum papel descreve pessoa real.
 */
export type RasciLetter = 'R' | 'A' | 'S' | 'C' | 'I';

export interface RasciRole {
  readonly id: string;
  readonly name: string;
  /** Data (`YYYY-MM-DD`) desde a qual o papel não tem ocupante; ausente quando o papel está ocupado. */
  readonly vacantSince?: string;
}

export interface RasciStep {
  readonly id: string;
  readonly name: string;
  readonly letters: readonly (readonly RasciLetter[])[];
}

export const roles: readonly RasciRole[] = [
  { id: 'sdr', name: 'SDR' },
  { id: 'coordenacao', name: 'Coordenação de pré-vendas' },
  { id: 'executivo', name: 'Executivo de contas' },
  { id: 'gerente', name: 'Gerente comercial' },
  { id: 'operacoes', name: 'Operações comerciais' },
  { id: 'dados', name: 'Analista de dados', vacantSince: '2026-08-01' },
];

export const data: readonly RasciStep[] = [
  { id: 'criterio', name: 'Definir o critério de redistribuição', letters: [['I'], ['A'], ['C'], ['R'], ['S'], ['C']] },
  { id: 'carga', name: 'Medir a carga de cada SDR', letters: [['I'], ['R'], [], ['I'], ['S'], ['A', 'R']] },
  { id: 'redistribuir', name: 'Redistribuir a fila de leads', letters: [['C'], ['A', 'R'], ['I'], ['C'], ['S'], []] },
  { id: 'avisar', name: 'Avisar SDRs e executivos da nova fila', letters: [['I'], ['A'], ['I'], [], ['R'], ['S']] },
  { id: 'conferir', name: 'Conferir o resultado em sete dias', letters: [['C'], ['R'], ['C'], ['A'], [], ['S']] },
  { id: 'decisao', name: 'Registrar a decisão no CRM', letters: [[], ['A', 'R'], ['I'], ['I'], ['S'], []] },
];
