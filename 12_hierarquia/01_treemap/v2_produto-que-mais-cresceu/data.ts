/**
 * Receita reconhecida por produto em dois trimestres seguidos, em reais: 2026-T3 corrente e
 * 2026-T2 como base de comparação. MFO fictício e fixo, sem relação com a operação real:
 * nomes de produto genéricos, nenhuma pessoa e nenhuma marca real.
 * O índice de string satisfaz o TreemapDataType do Recharts (children opcional mais
 * [key: string]: unknown), exigido pelo genérico de Treemap e não pelos demais gráficos.
 */
export interface ProductGrowth {
  readonly id: string;
  readonly name: string;
  /** Receita reconhecida no trimestre corrente, 2026-T3. */
  readonly revenue: number;
  /** Receita do 2026-T2. `null` quando o produto não existia e não há base para comparar. */
  readonly revenuePrevious: number | null;
  /** Motivo da saída do desenho, só em produto com valor zero ou negativo no corrente. */
  readonly note?: string;
  readonly [key: string]: unknown;
}

export const data: readonly ProductGrowth[] = [
  { id: 'prod-01', name: 'Gestão patrimonial', revenue: 1_700_000, revenuePrevious: 1_640_000 },
  { id: 'prod-02', name: 'Renda fixa', revenue: 1_050_000, revenuePrevious: 1_120_000 },
  { id: 'prod-03', name: 'Consultoria sucessória', revenue: 550_000, revenuePrevious: 480_000 },
  { id: 'prod-04', name: 'Imobiliário', revenue: 520_000, revenuePrevious: 320_000 },
  { id: 'prod-05', name: 'Previdência', revenue: 400_000, revenuePrevious: 395_000 },
  { id: 'prod-06', name: 'Seguros', revenue: 260_000, revenuePrevious: 250_000 },
  { id: 'prod-07', name: 'Crédito estruturado', revenue: 120_000, revenuePrevious: null },
  { id: 'prod-08', name: 'Câmbio', revenue: 90_000, revenuePrevious: 96_000 },
  { id: 'prod-09', name: 'Estruturação de FIDC', revenue: 30_000, revenuePrevious: 44_000 },
  {
    id: 'prod-10',
    name: 'Consultoria tributária',
    revenue: 0,
    revenuePrevious: 62_000,
    note: 'sem receita reconhecida no trimestre',
  },
];

/**
 * Destaque escolhido no dado, nunca inferido no render: quem acende é decisão de quem monta a
 * tela, e inferir o maior crescimento aqui faria a cor mudar sozinha a cada recorte novo.
 */
export const highlightId = 'prod-04';
