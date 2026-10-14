/**
 * Receita reconhecida do trimestre, em reais: de 2026-T2 para 2026-T3, em quatro passos.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Totais (`kind: 'total'`) são valores ancorados no zero; passos (`kind: 'step'`) são variações
 * com sinal, cada uma começando onde a anterior terminou. O reajuste vale 0 de propósito: zero
 * medido é zero e precisa continuar no desenho.
 * Fechamento: 1.720.000 + 214.000 + 96.000 + 0 − 138.000 = 1.892.000.
 */
export interface BridgeItem {
  readonly id: string;
  readonly label: string;
  readonly kind: 'total' | 'step';
  readonly value: number;
}

export const data: readonly BridgeItem[] = [
  { id: 'inicio', label: '2026-T2', kind: 'total', value: 1_720_000 },
  { id: 'novos', label: 'Novos contratos', kind: 'step', value: 214_000 },
  { id: 'expansao', label: 'Expansão', kind: 'step', value: 96_000 },
  { id: 'reajuste', label: 'Reajuste', kind: 'step', value: 0 },
  { id: 'cancelamentos', label: 'Cancelamentos', kind: 'step', value: -138_000 },
  { id: 'fim', label: '2026-T3', kind: 'total', value: 1_892_000 },
];
