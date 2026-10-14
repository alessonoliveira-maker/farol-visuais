/**
 * Receita reconhecida de 2027-T1 em reais, projetada em faixa contra o teto de atendimento medido.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 *
 * Cada item carrega mínimo, esperado e máximo. A base contratada é certa. Nos passos, os valores
 * são variações com sinal; na saída, totais, e a faixa vem da simulação conjunta dos passos
 * (`rule`), não da soma dos extremos (que daria 1.700.000 a 2.450.000). O teto de atendimento
 * (`ceiling`) é medido: o time atual entrega até 2.100.000 no trimestre, e a parte da faixa
 * acima disso não é entregável. O esperado (2.050.000) cai a 50.000 do teto, de propósito.
 * Fechamento do esperado: 1.550.000 + 400.000 + 200.000 − 100.000 = 2.050.000.
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
  readonly ceiling: number;
  readonly items: readonly ScenarioItem[];
}

export const data: ScenarioBridge = {
  period: '2027-T1',
  rule: 'simulação conjunta dos passos, percentis 10 e 90',
  ceiling: 2_100_000,
  items: [
    { id: 'base', label: 'Base contratada', kind: 'base', low: 1_550_000, expected: 1_550_000, high: 1_550_000 },
    { id: 'novos', label: 'Novos contratos', kind: 'step', low: 250_000, expected: 400_000, high: 650_000 },
    { id: 'expansao', label: 'Expansão', kind: 'step', low: 100_000, expected: 200_000, high: 300_000 },
    { id: 'cancelamentos', label: 'Cancelamentos', kind: 'step', low: -200_000, expected: -100_000, high: -50_000 },
    { id: 'saida', label: 'Saída 2027-T1', kind: 'result', low: 1_800_000, expected: 2_050_000, high: 2_400_000 },
  ],
};
