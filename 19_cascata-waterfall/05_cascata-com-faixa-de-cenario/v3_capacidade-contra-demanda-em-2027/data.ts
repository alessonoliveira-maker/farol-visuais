/**
 * Capacidade de pré-vendas em 2027, em entradas por mês (oportunidades que o time consegue
 * atender), contra a demanda projetada. Dado fictício e fixo: nenhuma empresa ou pessoa real.
 *
 * Cada item carrega mínimo, esperado e máximo; `basis` diz se o número é medido ou premissa.
 * A capacidade atual é medida e certa. Contratações são medidas (vagas aprovadas, só a data de
 * entrada varia); rampa e atrito são premissas. Nos passos, os valores são variações com sinal;
 * na saída, totais, e a faixa vem da simulação conjunta (`rule`), não da soma dos extremos
 * (que daria 205 a 315). Fechamento do esperado: 220 + 85 − 25 − 20 = 260.
 */
export interface ScenarioItem {
  readonly id: string;
  readonly label: string;
  readonly kind: 'base' | 'step' | 'result';
  readonly basis: 'medido' | 'premissa' | 'derivado';
  readonly low: number;
  readonly expected: number;
  readonly high: number;
}

export interface ScenarioBridge {
  readonly period: string;
  readonly unit: string;
  readonly rule: string;
  readonly demand: number;
  readonly items: readonly ScenarioItem[];
}

export const data: ScenarioBridge = {
  period: '2027',
  unit: 'entradas por mês',
  rule: 'simulação conjunta dos passos, percentis 10 e 90',
  demand: 290,
  items: [
    { id: 'capacidade', label: 'Capacidade atual', kind: 'base', basis: 'medido', low: 220, expected: 220, high: 220 },
    { id: 'contratacoes', label: 'Contratações', kind: 'step', basis: 'medido', low: 60, expected: 85, high: 110 },
    { id: 'rampa', label: 'Rampa', kind: 'step', basis: 'premissa', low: -40, expected: -25, high: -10 },
    { id: 'atrito', label: 'Atrito', kind: 'step', basis: 'premissa', low: -35, expected: -20, high: -5 },
    { id: 'saida', label: 'Capacidade 2027', kind: 'result', basis: 'derivado', low: 230, expected: 260, high: 300 },
  ],
};
