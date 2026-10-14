/**
 * Receita reconhecida por produto e por mês, de 2024-10 a 2026-09 (24 meses), em reais.
 * Dado fictício e fixo: nenhum produto é real. Os valores vêm de quatro séries literais de 24
 * posições, e o maior mês do dado, dezembro de 2025 no Plano Plus, fecha em R$ 1,2 mi para provar
 * a anotação do maior círculo. Um produto tem meses de valor pequeno ao lado de picos (Implantação),
 * para o menor círculo continuar visível sem piso de área. Todo mês tem valor medido maior que zero.
 */
export interface MonthlyRevenue {
  readonly id: string;
  readonly product: string;
  /** Cor fixa do produto: número do token `--chart-N`, escolhido na ordem 1, 3, 6, 5 (COR-8). */
  readonly slot: number;
  /** Mês no formato `YYYY-MM`. */
  readonly month: string;
  readonly revenue: number;
}

interface ProductSeries {
  readonly product: string;
  readonly slot: number;
  /** Receita em milhares de reais, de 2024-10 a 2026-09. */
  readonly thousands: readonly number[];
}

const FIRST_YEAR = 2024;
const FIRST_MONTH = 10;

const SERIES: readonly ProductSeries[] = [
  { product: 'Plano Base', slot: 1, thousands: [310, 325, 420, 300, 305, 315, 330, 340, 352, 365, 378, 392, 405, 420, 548, 410, 415, 428, 440, 452, 466, 480, 495, 512] },
  { product: 'Plano Plus', slot: 3, thousands: [520, 560, 780, 540, 555, 580, 610, 640, 670, 700, 730, 760, 800, 860, 1200, 830, 850, 880, 910, 940, 970, 1000, 1030, 1060] },
  { product: 'Módulo de dados', slot: 6, thousands: [90, 95, 110, 100, 105, 110, 120, 135, 150, 170, 185, 200, 220, 240, 300, 260, 280, 300, 320, 345, 370, 395, 420, 450] },
  { product: 'Implantação', slot: 5, thousands: [60, 40, 120, 45, 90, 40, 150, 55, 65, 200, 50, 70, 95, 45, 260, 60, 110, 55, 180, 70, 85, 230, 48, 66] },
];

/** `YYYY-MM` do mês de índice `index` a partir de 2024-10. */
function monthAt(index: number): string {
  const total = FIRST_YEAR * 12 + (FIRST_MONTH - 1) + index;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${String(year)}-${String(month).padStart(2, '0')}`;
}

export const data: readonly MonthlyRevenue[] = SERIES.flatMap((series, seriesIndex) =>
  series.thousands.map((value, index) => ({
    id: `p${String(seriesIndex + 1)}-${monthAt(index)}`,
    product: series.product,
    slot: series.slot,
    month: monthAt(index),
    revenue: value * 1000,
  })),
);
