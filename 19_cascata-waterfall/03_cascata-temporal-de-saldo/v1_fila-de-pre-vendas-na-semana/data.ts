/**
 * Fila de pré-vendas na semana de 2026-09-07, em leads abertos. A fila abre a segunda com 84 leads;
 * cada dia tem dois passos separados, entradas (valor positivo) e saídas (valor negativo), e a fila
 * fecha a sexta com 72. Totais (`kind: 'total'`) ficam ancorados no zero; passos nascem onde o
 * anterior terminou. Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Fechamento: 84 + 140 entradas − 152 saídas = 72.
 */
export interface QueueStep {
  readonly id: string;
  /** Texto do eixo: o dia nos dois passos dele, "Início" e "Fim" nos totais. */
  readonly label: string;
  readonly kind: 'total' | 'entry' | 'exit';
  readonly value: number;
}

export const weekStart = '2026-09-07';

export const data: readonly QueueStep[] = [
  { id: 'inicio', label: 'Início', kind: 'total', value: 84 },
  { id: 'seg-entrada', label: 'Segunda', kind: 'entry', value: 30 },
  { id: 'seg-saida', label: 'Segunda', kind: 'exit', value: -34 },
  { id: 'ter-entrada', label: 'Terça', kind: 'entry', value: 28 },
  { id: 'ter-saida', label: 'Terça', kind: 'exit', value: -30 },
  { id: 'qua-entrada', label: 'Quarta', kind: 'entry', value: 26 },
  { id: 'qua-saida', label: 'Quarta', kind: 'exit', value: -32 },
  { id: 'qui-entrada', label: 'Quinta', kind: 'entry', value: 32 },
  { id: 'qui-saida', label: 'Quinta', kind: 'exit', value: -28 },
  { id: 'sex-entrada', label: 'Sexta', kind: 'entry', value: 24 },
  { id: 'sex-saida', label: 'Sexta', kind: 'exit', value: -28 },
  { id: 'fim', label: 'Fim', kind: 'total', value: 72 },
];
