/**
 * Os três números do sumário da Diretoria: receita contra meta, entradas previstas contra o teto de
 * capacidade e o cenário de 2027 em faixa. Dado fictício e fixo: nenhum valor vem de empresa real.
 *
 * O caso difícil é o cenário: ele é uma premissa, então a frase escreve a faixa inteira e nunca o
 * ponto médio. A razão de entradas contra o teto é calculada (1.488 contra 480 dá 3,1x), e qualquer
 * campo `null` vira o estado de indisponível na frase certa, nunca um zero.
 */

export interface ExecutiveSummaryInput {
  /** Mês da receita medida, no formato YYYY-MM. */
  readonly revenueMonth: string;
  /** Receita reconhecida no mês, em reais, ou `null` sem fechamento. */
  readonly revenueActual: number | null;
  /** Meta de receita do mesmo mês, em reais, ou `null` sem meta. */
  readonly revenueTarget: number | null;
  /** Mês das entradas previstas, no formato YYYY-MM. */
  readonly intakeMonth: string;
  /** Agendas previstas por semana no mês, ou `null` sem previsão. */
  readonly intakeForecast: number | null;
  /** Teto de capacidade da pré-vendas em agendas por semana, ou `null` sem teto declarado. */
  readonly intakeCapacity: number | null;
  /** Ano do cenário, em texto (YYYY). */
  readonly scenarioYear: string;
  /** Extremos do cenário em reais, ou `null` sem cenário. */
  readonly scenarioLow: number | null;
  readonly scenarioHigh: number | null;
}

export const data: ExecutiveSummaryInput = {
  revenueMonth: '2026-09',
  revenueActual: 4_118_400,
  revenueTarget: 4_400_000,
  intakeMonth: '2026-10',
  intakeForecast: 1_488,
  intakeCapacity: 480,
  scenarioYear: '2027',
  scenarioLow: 8_400_000,
  scenarioHigh: 10_100_000,
};
