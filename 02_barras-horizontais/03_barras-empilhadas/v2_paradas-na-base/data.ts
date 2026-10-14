/**
 * Valor das oportunidades abertas por executivo, em reais, na foto de 2026-09-14: quanto está
 * parado há mais de 30 dias sem mudar de estágio e quanto segue em andamento em cada estágio.
 * Uma oportunidade parada conta só no segmento parado, nunca também no estágio dela.
 * Dado fictício e fixo: os nomes são inventados, nenhum é pessoa real.
 */
export type ActiveStageKey = 'discovery' | 'proposal' | 'negotiation';

export interface StalledPipelineRow {
  readonly id: string;
  readonly name: string;
  /** Valor sem movimento há mais de `stalledAfterDays` dias, somando todos os estágios. */
  readonly stalled: number;
  readonly discovery: number;
  readonly proposal: number;
  readonly negotiation: number;
}

/** Estágio em andamento: a ordem do array é a ordem da pilha depois do segmento parado. */
export interface ActiveStageDefinition {
  readonly key: ActiveStageKey;
  readonly label: string;
}

export const stages: readonly ActiveStageDefinition[] = [
  { key: 'discovery', label: 'Descoberta' },
  { key: 'proposal', label: 'Proposta' },
  { key: 'negotiation', label: 'Negociação e assinatura' },
];

/** Regra de parada da página: dias sem mudança de estágio. */
export const stalledAfterDays = 30;

export const data: readonly StalledPipelineRow[] = [
  { id: 'exec-01', name: 'Talita V.', stalled: 96_300, discovery: 210_000, proposal: 188_000, negotiation: 310_000 },
  { id: 'exec-02', name: 'Murilo C.', stalled: 212_000, discovery: 120_000, proposal: 236_500, negotiation: 288_400 },
  { id: 'exec-03', name: 'Ingrid S.', stalled: 38_600, discovery: 74_500, proposal: 126_000, negotiation: 179_000 },
  { id: 'exec-04', name: 'Renan A.', stalled: 131_900, discovery: 96_000, proposal: 110_500, negotiation: 202_000 },
  { id: 'exec-05', name: 'Lorena B.', stalled: 246_800, discovery: 142_000, proposal: 64_600, negotiation: 53_200 },
  { id: 'exec-06', name: 'Maria Clara D.', stalled: 184_500, discovery: 58_300, proposal: 22_000, negotiation: 28_000 },
  { id: 'exec-07', name: 'Heitor M.', stalled: 0, discovery: 38_200, proposal: 52_000, negotiation: 12_500 },
];
