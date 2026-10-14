/**
 * CPL qualificado do mês e a cobertura do campo que o sustenta: quantos leads do período têm
 * qualificação registrada. Valores em reais e contagens de leads. Dado fictício e fixo, de 2026-09.
 * `cpl` é null quando o indicador não pôde ser calculado (ausência não vira zero).
 */
export interface CoverageGauge {
  readonly label: string;
  readonly period: string;
  readonly cpl: number | null;
  readonly qualified: number;
  readonly total: number;
  /** Corte declarado: abaixo dele o número principal é rebaixado. Fração de 0 a 1. */
  readonly threshold: number;
}

export const data: CoverageGauge = {
  label: 'CPL qualificado',
  period: 'set/26',
  cpl: 48.3,
  qualified: 720,
  total: 1_240,
  threshold: 0.5,
};
