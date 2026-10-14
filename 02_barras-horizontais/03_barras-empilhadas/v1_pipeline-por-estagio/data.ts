/**
 * Valor das oportunidades abertas por executivo e estágio do funil de vendas, em reais, na
 * foto de 2026-09-14. Dado fictício e fixo: os nomes são inventados, nenhum é pessoa real.
 */
export type StageKey = 'discovery' | 'proposal' | 'negotiation' | 'signature';

export interface PipelineRow {
  readonly id: string;
  readonly name: string;
  readonly discovery: number;
  readonly proposal: number;
  readonly negotiation: number;
  readonly signature: number;
}

/** Estágio da pilha: a ordem do array é a ordem da base para a ponta e a ordem da legenda. */
export interface StageDefinition {
  readonly key: StageKey;
  readonly label: string;
  /** Slot categórico fixo do estágio (1 a 6), para a cor não mudar quando o recorte muda. */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export const stages: readonly StageDefinition[] = [
  { key: 'discovery', label: 'Descoberta', slot: 1 },
  { key: 'proposal', label: 'Proposta', slot: 3 },
  { key: 'negotiation', label: 'Negociação', slot: 6 },
  { key: 'signature', label: 'Assinatura', slot: 5 },
];

export const data: readonly PipelineRow[] = [
  { id: 'exec-01', name: 'Talita V.', discovery: 240_000, proposal: 198_300, negotiation: 154_000, signature: 212_000 },
  { id: 'exec-02', name: 'Murilo C.', discovery: 180_000, proposal: 312_500, negotiation: 268_000, signature: 96_400 },
  { id: 'exec-03', name: 'Ingrid S.', discovery: 74_500, proposal: 126_000, negotiation: 98_700, signature: 118_900 },
  { id: 'exec-04', name: 'Renan A.', discovery: 96_000, proposal: 141_800, negotiation: 302_600, signature: 0 },
  { id: 'exec-05', name: 'Lorena B.', discovery: 312_000, proposal: 88_400, negotiation: 61_200, signature: 45_000 },
  { id: 'exec-06', name: 'Maria Clara D.', discovery: 205_700, proposal: 64_300, negotiation: 0, signature: 22_800 },
  { id: 'exec-07', name: 'Heitor M.', discovery: 38_200, proposal: 52_000, negotiation: 12_500, signature: 0 },
];
