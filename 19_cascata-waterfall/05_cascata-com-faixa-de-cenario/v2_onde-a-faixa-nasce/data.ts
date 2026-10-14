/**
 * Receita reconhecida de 2026-T4 em reais, projetada em faixa. Dado fictício e fixo: nenhuma
 * empresa ou pessoa real.
 *
 * Cada item carrega mínimo, esperado e máximo. A base contratada é certa (os três valores
 * iguais). Nos passos, os valores são variações com sinal. Na saída (`kind: 'result'`) são
 * totais, e a faixa dela vem da simulação conjunta dos passos (`rule`), não da soma dos
 * extremos: somar os extremos daria 1.510.000 a 1.830.000, mais largo que a faixa declarada.
 * Fechamento do esperado: 1.520.000 + 150.000 + 50.000 − 70.000 = 1.650.000.
 */
export interface ScenarioItem {
  readonly id: string;
  readonly label: string;
  readonly kind: 'base' | 'step' | 'result';
  readonly low: number;
  readonly expected: number;
  readonly high: number;
}

export interface ScenarioBridge {
  readonly period: string;
  readonly rule: string;
  readonly items: readonly ScenarioItem[];
}

export const data: ScenarioBridge = {
  period: '2026-T4',
  rule: 'simulação conjunta dos passos, percentis 10 e 90',
  items: [
    { id: 'base', label: 'Base contratada', kind: 'base', low: 1_520_000, expected: 1_520_000, high: 1_520_000 },
    { id: 'novos', label: 'Novos contratos', kind: 'step', low: 80_000, expected: 150_000, high: 240_000 },
    { id: 'expansao', label: 'Expansão', kind: 'step', low: 20_000, expected: 50_000, high: 90_000 },
    { id: 'cancelamentos', label: 'Cancelamentos', kind: 'step', low: -110_000, expected: -70_000, high: -20_000 },
    { id: 'saida', label: 'Saída 2026-T4', kind: 'result', low: 1_560_000, expected: 1_650_000, high: 1_780_000 },
  ],
};
