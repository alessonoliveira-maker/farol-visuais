/**
 * Taxa de conversão de cada transição do funil comercial, mês a mês em 2026, em fração (0 a 1).
 * Uma linha é uma transição de etapa; as 12 colunas são os meses do ano. Dado fictício e fixo.
 * `null` é mês sem medição (mudança de processo em julho), nunca lido como 0%.
 */
export interface StageMonthlyRate {
  readonly stageId: string;
  readonly stageName: string;
  readonly rates: readonly (number | null)[];
}

/** As 12 colunas, em ordem, no formato YYYY-MM. */
export const MONTHS: readonly string[] = [
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
  '2026-11',
  '2026-12',
];

export const data: readonly StageMonthlyRate[] = [
  { stageId: 'lead-mql', stageName: 'Lead para MQL', rates: [0.41, 0.44, 0.39, 0.46, 0.5, 0.52, 0.48, 0.55, 0.58, 0.53, 0.5, 0.57] },
  { stageId: 'mql-sql', stageName: 'MQL para SQL', rates: [0.28, 0.3, 0.27, 0.31, 0.33, 0.35, 0.32, 0.37, 0.4, 0.36, 0.34, 0.39] },
  {
    stageId: 'sql-oportunidade',
    stageName: 'SQL para oportunidade',
    rates: [0.19, 0.21, 0.18, 0.22, 0.24, 0.26, 0.23, 0.29, 0.31, 0.27, 0.25, 0.3],
  },
  {
    stageId: 'oportunidade-proposta',
    stageName: 'Oportunidade para proposta',
    rates: [0.62, 0.6, 0.58, 0.63, 0.65, 0.67, 0.61, 0.7, 0.72, 0.66, 0.64, 0.69],
  },
  {
    stageId: 'proposta-negociacao',
    stageName: 'Proposta para negociação',
    rates: [0.44, 0.42, 0.4, 0.45, 0.47, 0.49, null, 0.5, 0.52, 0.46, 0.43, 0.48],
  },
  {
    stageId: 'negociacao-fechamento',
    stageName: 'Negociação para fechamento de contrato',
    rates: [0.09, 0.1, 0.08, 0.11, 0.12, 0.14, 0.1, 0.15, 0.17, 0.13, 0.11, 0.03],
  },
];
