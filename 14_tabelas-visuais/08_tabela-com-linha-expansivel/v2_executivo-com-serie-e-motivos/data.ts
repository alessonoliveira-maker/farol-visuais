/**
 * Executivos de vendas: receita reconhecida dos 12 meses até 2026-08 e o motivo de perda que
 * mais pesa no período. Dado fictício e fixo: nenhuma pessoa é real.
 */
export interface MonthlyRevenue {
  readonly month: string;
  readonly value: number;
}

export interface LossReason {
  readonly reason: string;
  readonly count: number;
}

export interface ExecutiveDetail {
  readonly id: string;
  readonly name: string;
  readonly revenueSeries: readonly MonthlyRevenue[];
  readonly reasons: readonly LossReason[];
}

const MONTHS = [
  '2025-09',
  '2025-10',
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
] as const;

function series(values: readonly number[]): readonly MonthlyRevenue[] {
  return MONTHS.map((month, index) => ({ month, value: values[index] ?? 0 }));
}

export const data: readonly ExecutiveDetail[] = [
  {
    id: 'exec-01',
    name: 'Talita V.',
    revenueSeries: series([
      182_000, 194_500, 168_900, 205_300, 221_000, 198_700, 233_400, 241_900, 219_800, 256_200, 248_100, 271_600,
    ]),
    reasons: [
      { reason: 'Optou pelo concorrente', count: 9 },
      { reason: 'Sem orçamento no ciclo', count: 4 },
      { reason: 'Fora do momento de compra', count: 3 },
      { reason: 'Projeto cancelado internamente', count: 2 },
    ],
  },
  {
    id: 'exec-02',
    name: 'Murilo C.',
    revenueSeries: series([
      96_400, 101_200, 88_700, 92_300, 110_500, 105_900, 98_400, 122_100, 118_600, 131_400, 126_800, 140_200,
    ]),
    reasons: [
      { reason: 'Sem orçamento no ciclo', count: 7 },
      { reason: 'Sem retorno após a proposta', count: 5 },
      { reason: 'Escopo não fechado', count: 2 },
    ],
  },
  {
    id: 'exec-03',
    name: 'Renan A.',
    revenueSeries: series([
      143_800, 139_200, 151_600, 148_300, 136_900, 142_400, 129_800, 133_500, 127_100, 121_900, 118_400, 112_700,
    ]),
    reasons: [
      { reason: 'Fora do momento de compra', count: 6 },
      { reason: 'Optou pelo concorrente', count: 6 },
      { reason: 'Sem orçamento no ciclo', count: 3 },
    ],
  },
  {
    id: 'exec-04',
    name: 'Bianca F.',
    revenueSeries: series([
      64_200, 71_900, 68_300, 75_600, 79_400, 82_100, 77_800, 88_300, 91_200, 86_700, 94_500, 99_100,
    ]),
    reasons: [
      { reason: 'Sem retorno após a proposta', count: 8 },
      { reason: 'Escopo não fechado', count: 3 },
    ],
  },
];

/** No preview, o painel de Talita V. já abre para mostrar a série e os motivos. */
export const expandedIds: readonly string[] = ['exec-01'];
