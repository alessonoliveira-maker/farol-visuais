/**
 * Fechamentos por quinzena no terceiro trimestre de 2026 (julho a setembro), em reais.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real. As duas últimas quinzenas ainda não
 * aconteceram e entram como `null`.
 */
export interface FortnightClosing {
  readonly periodEnd: string;
  readonly closedAmount: number | null;
}

export const data: readonly FortnightClosing[] = [
  { periodEnd: '2026-07-15', closedAmount: 280_000 },
  { periodEnd: '2026-07-31', closedAmount: 305_000 },
  { periodEnd: '2026-08-15', closedAmount: 260_000 },
  { periodEnd: '2026-08-31', closedAmount: 295_000 },
  { periodEnd: '2026-09-15', closedAmount: null },
  { periodEnd: '2026-09-30', closedAmount: null },
];

/** Meta do trimestre, não a anual: o terceiro trimestre de 2026 sozinho. */
export const quarterlyTarget = 2_400_000;
