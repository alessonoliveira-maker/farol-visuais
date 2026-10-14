/**
 * Receita acumulada desde o início da série, por linha de negócio, ao fim de cada trimestre,
 * em reais. Dado fictício e fixo: nenhuma linha corresponde a um resultado real da casa.
 */
export type BusinessLineId = 'mfo' | 'estruturadas' | 'consultoria' | 'imobiliaria';

export interface BusinessLine {
  readonly id: BusinessLineId;
  readonly label: string;
}

/** As quatro linhas de negócio da corrida, nome longo de propósito (TIP-7). */
export const businessLines: readonly BusinessLine[] = [
  { id: 'mfo', label: 'Multi Family Office' },
  { id: 'estruturadas', label: 'Operações Estruturadas' },
  { id: 'consultoria', label: 'Consultoria Patrimonial' },
  { id: 'imobiliaria', label: 'Gestão Imobiliária' },
];

export interface RevenueRacePeriod {
  /** Mês de fechamento do trimestre. */
  readonly period: string;
  /** Receita acumulada desde o início da série, por linha, em reais. */
  readonly values: Readonly<Record<BusinessLineId, number>>;
  /** Texto curto exibido quando a corrida passa por este trimestre. */
  readonly milestone?: string;
}

export const data: readonly RevenueRacePeriod[] = [
  { period: '2024-03', values: { mfo: 4_200_000, estruturadas: 1_800_000, consultoria: 0, imobiliaria: 900_000 } },
  {
    period: '2024-06',
    values: { mfo: 8_900_000, estruturadas: 4_100_000, consultoria: 0, imobiliaria: 1_950_000 },
    milestone: 'Abertura do escritório em São Paulo',
  },
  { period: '2024-09', values: { mfo: 13_600_000, estruturadas: 7_400_000, consultoria: 0, imobiliaria: 3_100_000 } },
  { period: '2024-12', values: { mfo: 19_800_000, estruturadas: 11_200_000, consultoria: 0, imobiliaria: 4_450_000 } },
  {
    period: '2025-03',
    values: { mfo: 25_100_000, estruturadas: 15_600_000, consultoria: 1_100_000, imobiliaria: 5_800_000 },
    milestone: 'Lançamento da vertical de Consultoria Patrimonial',
  },
  { period: '2025-06', values: { mfo: 31_400_000, estruturadas: 20_300_000, consultoria: 2_900_000, imobiliaria: 7_250_000 } },
  { period: '2025-09', values: { mfo: 38_200_000, estruturadas: 25_100_000, consultoria: 5_200_000, imobiliaria: 8_900_000 } },
  {
    period: '2025-12',
    values: { mfo: 45_600_000, estruturadas: 30_400_000, consultoria: 8_100_000, imobiliaria: 10_700_000 },
    milestone: 'Fechamento do ano com as quatro linhas em recorde de acumulado',
  },
];
