/**
 * Receita mensal e estornos de três produtos, de 2026-01 a 2026-09, em reais. Dado fictício e fixo:
 * nenhum produto é real. O dado exercita os quatro estados de propósito: receita medida, estorno
 * (valor negativo), zero medido (Módulo de dados em 2026-05) e mês sem coleta (2026-03 e 2026-07,
 * `revenue: null`, que não é zero). Em 2026-08 o estorno do Módulo de dados é maior que a receita
 * do mês, para o contorno vazado passar do círculo cheio.
 */
export interface MonthlyResult {
  readonly id: string;
  readonly product: string;
  /** Mês no formato `YYYY-MM`. */
  readonly month: string;
  /** Receita do mês em reais; `null` quando o mês não foi coletado. Zero é zero medido. */
  readonly revenue: number | null;
  /** Estorno do mês em reais, sempre zero ou negativo; zero quer dizer sem estorno. */
  readonly refund: number;
}

export const data: readonly MonthlyResult[] = [
  { id: 'base-2026-01', product: 'Plano Base', month: '2026-01', revenue: 240_000, refund: 0 },
  { id: 'base-2026-02', product: 'Plano Base', month: '2026-02', revenue: 255_000, refund: 0 },
  { id: 'base-2026-03', product: 'Plano Base', month: '2026-03', revenue: null, refund: 0 },
  { id: 'base-2026-04', product: 'Plano Base', month: '2026-04', revenue: 262_000, refund: 0 },
  { id: 'base-2026-05', product: 'Plano Base', month: '2026-05', revenue: 270_000, refund: 0 },
  { id: 'base-2026-06', product: 'Plano Base', month: '2026-06', revenue: 280_000, refund: -21_500 },
  { id: 'base-2026-07', product: 'Plano Base', month: '2026-07', revenue: null, refund: 0 },
  { id: 'base-2026-08', product: 'Plano Base', month: '2026-08', revenue: 295_000, refund: 0 },
  { id: 'base-2026-09', product: 'Plano Base', month: '2026-09', revenue: 310_000, refund: 0 },
  { id: 'plus-2026-01', product: 'Plano Plus', month: '2026-01', revenue: 410_000, refund: 0 },
  { id: 'plus-2026-02', product: 'Plano Plus', month: '2026-02', revenue: 430_000, refund: -38_000 },
  { id: 'plus-2026-03', product: 'Plano Plus', month: '2026-03', revenue: null, refund: 0 },
  { id: 'plus-2026-04', product: 'Plano Plus', month: '2026-04', revenue: 455_000, refund: 0 },
  { id: 'plus-2026-05', product: 'Plano Plus', month: '2026-05', revenue: 470_000, refund: 0 },
  { id: 'plus-2026-06', product: 'Plano Plus', month: '2026-06', revenue: 485_000, refund: 0 },
  { id: 'plus-2026-07', product: 'Plano Plus', month: '2026-07', revenue: null, refund: 0 },
  { id: 'plus-2026-08', product: 'Plano Plus', month: '2026-08', revenue: 520_000, refund: -64_000 },
  { id: 'plus-2026-09', product: 'Plano Plus', month: '2026-09', revenue: 540_000, refund: 0 },
  { id: 'modulo-2026-01', product: 'Módulo de dados', month: '2026-01', revenue: 52_000, refund: 0 },
  { id: 'modulo-2026-02', product: 'Módulo de dados', month: '2026-02', revenue: 60_000, refund: 0 },
  { id: 'modulo-2026-03', product: 'Módulo de dados', month: '2026-03', revenue: null, refund: 0 },
  { id: 'modulo-2026-04', product: 'Módulo de dados', month: '2026-04', revenue: 66_000, refund: 0 },
  { id: 'modulo-2026-05', product: 'Módulo de dados', month: '2026-05', revenue: 0, refund: 0 },
  { id: 'modulo-2026-06', product: 'Módulo de dados', month: '2026-06', revenue: 71_000, refund: 0 },
  { id: 'modulo-2026-07', product: 'Módulo de dados', month: '2026-07', revenue: null, refund: 0 },
  { id: 'modulo-2026-08', product: 'Módulo de dados', month: '2026-08', revenue: 12_000, refund: -15_000 },
  { id: 'modulo-2026-09', product: 'Módulo de dados', month: '2026-09', revenue: 78_000, refund: 0 },
];
