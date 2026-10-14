/**
 * Receita reconhecida por produto no trimestre, em reais. MFO fictício, sem relação com a
 * operação real da Somma: nomes de produto genéricos, nenhuma pessoa e nenhuma marca real.
 * O índice de string satisfaz o TreemapDataType do Recharts (children opcional mais
 * [key: string]: unknown), exigido pelo genérico de Treemap e não pelos demais gráficos.
 */
export interface ProductRevenue {
  readonly id: string;
  readonly name: string;
  readonly revenue: number;
  /** Motivo da exclusão do desenho, só em produto com valor zero ou negativo. */
  readonly note?: string;
  readonly [key: string]: unknown;
}

export const data: readonly ProductRevenue[] = [
  { id: 'prod-01', name: 'Gestão patrimonial', revenue: 1_700_000 },
  { id: 'prod-02', name: 'Renda fixa', revenue: 1_050_000 },
  { id: 'prod-03', name: 'Consultoria sucessória', revenue: 550_000 },
  { id: 'prod-04', name: 'Imobiliário', revenue: 520_000 },
  { id: 'prod-05', name: 'Previdência', revenue: 400_000 },
  { id: 'prod-06', name: 'Seguros', revenue: 260_000 },
  { id: 'prod-07', name: 'Câmbio', revenue: 90_000 },
  { id: 'prod-08', name: 'Estruturação de FIDC', revenue: 30_000 },
  { id: 'prod-09', name: 'Consultoria tributária', revenue: 0, note: 'sem receita reconhecida no trimestre' },
  { id: 'prod-10', name: 'Family office digital', revenue: -18_500, note: 'estorno de contrato cancelado' },
];
