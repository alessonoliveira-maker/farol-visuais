/**
 * Receita reconhecida no trimestre por executivo, lida contra a meta individual do mesmo
 * trimestre, as duas em reais. Casos limite: executivo sem meta cadastrada, executivo muito
 * acima da própria meta e um estorno que deixa o realizado negativo.
 * Dado fictício e fixo: nomes inventados, nenhum é pessoa real.
 */
export interface ExecutiveTargetGap {
  readonly id: string;
  readonly name: string;
  /** Receita reconhecida no trimestre, em reais; pode ser negativa num estorno. */
  readonly actual: number;
  /** Meta individual do trimestre, em reais; null quando o executivo não tem meta cadastrada. */
  readonly target: number | null;
}

export const data: readonly ExecutiveTargetGap[] = [
  { id: 'exec-21', name: 'Talita V.', actual: 312_400, target: 400_000 },
  { id: 'exec-22', name: 'Otavio R.', actual: 254_500, target: 250_000 },
  { id: 'exec-23', name: 'Murilo C.', actual: 531_000, target: 450_000 },
  { id: 'exec-24', name: 'Renan A.', actual: 1_125_000, target: 450_000 },
  { id: 'exec-25', name: 'Ingrid S.', actual: 198_700, target: null },
  { id: 'exec-26', name: 'Heitor M.', actual: -45_200, target: 380_000 },
];
