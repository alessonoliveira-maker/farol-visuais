/**
 * Fila de pré-vendas de outra unidade, semana de 2026-09-07, em leads abertos. Abre a segunda com 76
 * leads; cada dia tem entradas (valor positivo) e saídas (valor negativo) em passos separados. Na
 * quarta um disparo trouxe 96 entradas e levou a fila de 80 para 142, acima do teto de capacidade de
 * 120; a quinta fecha em 124, ainda acima, e a sexta fecha com 104. Totais ficam ancorados no zero.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Fechamento: 76 + (22 + 20 + 96 + 18 + 16) entradas − (18 + 20 + 34 + 36 + 36) saídas = 104.
 */
export interface CeilingStep {
  readonly id: string;
  /** Texto do eixo: o dia nos dois passos dele, "Início" e "Fim" nos totais. */
  readonly label: string;
  readonly kind: 'total' | 'entry' | 'exit';
  readonly value: number;
}

export const weekStart = '2026-09-07';

/** Teto de capacidade da fila, em leads abertos. */
export const ceiling = 120;
/** O passo que explica o estouro: a entrada do disparo de quarta. */
export const highlightId = 'qua-entrada';

export const data: readonly CeilingStep[] = [
  { id: 'inicio', label: 'Início', kind: 'total', value: 76 },
  { id: 'seg-entrada', label: 'Segunda', kind: 'entry', value: 22 },
  { id: 'seg-saida', label: 'Segunda', kind: 'exit', value: -18 },
  { id: 'ter-entrada', label: 'Terça', kind: 'entry', value: 20 },
  { id: 'ter-saida', label: 'Terça', kind: 'exit', value: -20 },
  { id: 'qua-entrada', label: 'Quarta', kind: 'entry', value: 96 },
  { id: 'qua-saida', label: 'Quarta', kind: 'exit', value: -34 },
  { id: 'qui-entrada', label: 'Quinta', kind: 'entry', value: 18 },
  { id: 'qui-saida', label: 'Quinta', kind: 'exit', value: -36 },
  { id: 'sex-entrada', label: 'Sexta', kind: 'entry', value: 16 },
  { id: 'sex-saida', label: 'Sexta', kind: 'exit', value: -36 },
  { id: 'fim', label: 'Fim', kind: 'total', value: 104 },
];
