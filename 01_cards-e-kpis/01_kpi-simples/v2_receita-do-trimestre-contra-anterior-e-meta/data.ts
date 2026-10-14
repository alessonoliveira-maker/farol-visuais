/**
 * Receita reconhecida no trimestre fechado, em reais, com o trimestre anterior e a meta do
 * trimestre como âncoras, e a régua escrita que transforma o atingimento em status.
 * Dado fictício e fixo: nenhum valor vem de empresa real.
 *
 * O caso difícil é o status contra a variação: a receita cresceu sobre o trimestre anterior e,
 * mesmo assim, fica em atenção porque parou em 94,0% da meta, a um ponto do corte de 95%.
 */

/** Para onde aponta o "bom" da métrica; a cor da variação sobre o anterior sai daqui, nunca do sinal. */
export type Polarity = 'higher-is-better' | 'lower-is-better' | 'neutral';

export interface QuarterValue {
  /** Nome curto do trimestre, como aparece na tela. */
  readonly label: string;
  /** Valor medido em reais, ou `null` quando não houve medição. */
  readonly value: number | null;
}

/** Cortes do status como fração da meta; o corte pertence à faixa de cima. */
export interface StatusRule {
  readonly onTargetFrom: number;
  readonly attentionFrom: number;
}

export interface QuarterRevenueKpi {
  readonly label: string;
  readonly polarity: Polarity;
  readonly current: QuarterValue;
  /** Primeiro e último mês do trimestre atual, no formato YYYY-MM. */
  readonly firstMonth: string;
  readonly lastMonth: string;
  readonly previous: QuarterValue;
  /** Meta do trimestre atual em reais, ou `null` quando ainda não foi definida. */
  readonly target: number | null;
  readonly rule: StatusRule;
}

export const data: QuarterRevenueKpi = {
  label: 'Receita reconhecida',
  polarity: 'higher-is-better',
  current: { label: '3º tri/26', value: 2_257_000 },
  firstMonth: '2026-07',
  lastMonth: '2026-09',
  previous: { label: '2º tri/26', value: 2_118_400 },
  target: 2_400_000,
  rule: { onTargetFrom: 0.95, attentionFrom: 0.85 },
};
