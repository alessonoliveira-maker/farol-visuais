/**
 * Entradas de oportunidades em 2026-08, em contagem, decompostas até os ganhos do mês.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * `total` é coluna ancorada no zero; os demais tipos são saídas (valor negativo), cada uma
 * começando onde a anterior terminou. `discard` não chegou a ser oportunidade, `loss` foi
 * trabalhada e perdida, `open` ainda está em andamento: a diferença não vira perda.
 * Fechamento: 612 − 41 − 58 − 187 − 214 − 68 − 33 = 11.
 */
export type FlowKind = 'total' | 'discard' | 'loss' | 'open';

export interface FlowStep {
  readonly id: string;
  readonly label: string;
  readonly kind: FlowKind;
  readonly value: number;
}

export const data: readonly FlowStep[] = [
  { id: 'entradas', label: 'Entradas', kind: 'total', value: 612 },
  { id: 'duplicatas', label: 'Duplicatas', kind: 'discard', value: -41 },
  { id: 'fora-perimetro', label: 'Fora de perímetro', kind: 'discard', value: -58 },
  { id: 'sem-contato', label: 'Sem contato', kind: 'discard', value: -187 },
  { id: 'declinios', label: 'Declínios por fit', kind: 'loss', value: -214 },
  { id: 'perdas', label: 'Perdas na proposta', kind: 'loss', value: -68 },
  { id: 'andamento', label: 'Em andamento', kind: 'open', value: -33 },
  { id: 'ganhos', label: 'Ganhos', kind: 'total', value: 11 },
];
