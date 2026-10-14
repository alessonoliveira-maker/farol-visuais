/**
 * Plano de 2027 em seis alavancas, em índice de 0 a 100 contra a meta de cada alavanca, para o
 * cenário pessimista, o base (o escolhido) e o otimista. No ciclo de venda o índice é invertido:
 * ciclo mais curto dá índice maior. A ordem das alavancas é a do registry. Dado fictício e fixo.
 */
export interface LeverRow {
  readonly id: string;
  readonly label: string;
  /** O nome como entra no meio de uma frase. */
  readonly phrase: string;
  readonly low: number;
  readonly base: number;
  readonly high: number;
  /** Verdadeiro quando o menor valor original dá o índice maior (ciclo de venda). */
  readonly inverted?: boolean;
}

export interface Scenario {
  readonly name: string;
  /** Slot fixo da cor de série: a cor vem da categoria, não da posição no array. */
  readonly slot: 1 | 3 | 6;
}

export interface Scenarios {
  readonly low: Scenario;
  readonly base: Scenario;
  readonly high: Scenario;
}

export const scenarios: Scenarios = {
  low: { name: 'Pessimista', slot: 3 },
  base: { name: 'Base', slot: 1 },
  high: { name: 'Otimista', slot: 6 },
};

export const data: readonly LeverRow[] = [
  { id: 'revenue', label: 'Receita', phrase: 'receita', low: 48, base: 62, high: 78 },
  { id: 'closings', label: 'Fechamentos', phrase: 'fechamentos', low: 52, base: 66, high: 81 },
  { id: 'ticket', label: 'Ticket médio', phrase: 'ticket médio', low: 58, base: 60, high: 70 },
  { id: 'cycle', label: 'Ciclo de venda', phrase: 'ciclo de venda', low: 45, base: 58, high: 74, inverted: true },
  { id: 'win-rate', label: 'Win rate', phrase: 'win rate', low: 50, base: 59, high: 72 },
  { id: 'retention', label: 'Retenção', phrase: 'retenção', low: 61, base: 80, high: 85 },
];
