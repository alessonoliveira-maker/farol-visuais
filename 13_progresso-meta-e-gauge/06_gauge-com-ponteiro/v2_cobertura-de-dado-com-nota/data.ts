/**
 * Cobertura de campos mínimos das oportunidades do funil comercial, em pontos percentuais.
 * Escala de 0 a 100, dividida em quatro estados nomeados por intensidade de um único tom.
 * Dado fictício e fixo, referente a 2026-08.
 */
export interface CoverageState {
  readonly id: string;
  readonly label: string;
  readonly from: number;
  readonly to: number;
}

export interface FunnelCoverageGauge {
  readonly label: string;
  readonly period: string;
  readonly min: number;
  readonly max: number;
  readonly value: number;
  readonly states: readonly CoverageState[];
  /** Id do estado usado como referência de distância na leitura (a faixa saudável). */
  readonly healthyId: string;
  /** Quem definiu os limiares e quando, para a legenda nunca inventar régua na hora. */
  readonly origin: string;
}

export const data: FunnelCoverageGauge = {
  label: 'Cobertura de campos mínimos das oportunidades',
  period: '2026-08',
  min: 0,
  max: 100,
  value: 52,
  states: [
    { id: 'critico', label: 'Crítico', from: 0, to: 30 },
    { id: 'atencao', label: 'Atenção', from: 30, to: 55 },
    { id: 'saudavel', label: 'Saudável', from: 55, to: 80 },
    { id: 'otimo', label: 'Ótimo', from: 80, to: 100 },
  ],
  healthyId: 'saudavel',
  origin: 'Faixas definidas pelo time de RevOps em 2026-07-01',
};
