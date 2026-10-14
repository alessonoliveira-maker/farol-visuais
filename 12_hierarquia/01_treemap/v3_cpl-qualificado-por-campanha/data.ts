/**
 * Investimento em mídia paga e custo por lead qualificado por campanha, em reais, no mês de
 * 2026-08 contra 2026-07. Dado fictício e fixo: nomes de campanha genéricos, nenhuma pessoa,
 * nenhuma plataforma nomeada por marca real e nenhuma conta real.
 * A área do treemap sai de `investment` e a cor sai da variação entre `cplQualified` e
 * `cplQualifiedPrevious`, que é o par medido; campanha sem mês anterior fica com `null` e não
 * recebe variação inventada.
 * O índice de string satisfaz o TreemapDataType do Recharts (children opcional mais
 * [key: string]: unknown), exigido pelo genérico de Treemap e não pelos demais gráficos.
 */
export interface CampaignCost {
  readonly id: string;
  readonly name: string;
  /** Investimento do mês corrente, 2026-08. É o que a área codifica. */
  readonly investment: number;
  /** Custo por lead qualificado no mês corrente. */
  readonly cplQualified: number;
  /** Custo por lead qualificado em 2026-07. `null` em campanha que estreou no mês. */
  readonly cplQualifiedPrevious: number | null;
  readonly [key: string]: unknown;
}

export const data: readonly CampaignCost[] = [
  { id: 'camp-01', name: 'Busca marca', investment: 48_200, cplQualified: 182, cplQualifiedPrevious: 164 },
  { id: 'camp-02', name: 'Busca genérica FIDC', investment: 42_600, cplQualified: 411, cplQualifiedPrevious: 296 },
  { id: 'camp-03', name: 'Remarketing site', investment: 31_400, cplQualified: 156, cplQualifiedPrevious: 168 },
  { id: 'camp-04', name: 'Público semelhante', investment: 28_900, cplQualified: 524, cplQualifiedPrevious: 362 },
  { id: 'camp-05', name: 'Cargo diretor', investment: 24_300, cplQualified: 688, cplQualifiedPrevious: 742 },
  { id: 'camp-06', name: 'Interesse patrimônio', investment: 19_700, cplQualified: 398, cplQualifiedPrevious: 452 },
  { id: 'camp-07', name: 'Busca concorrência', investment: 16_500, cplQualified: 592, cplQualifiedPrevious: 401 },
  { id: 'camp-08', name: 'Setor indústria', investment: 13_800, cplQualified: 512, cplQualifiedPrevious: 806 },
  { id: 'camp-09', name: 'Vídeo institucional', investment: 11_200, cplQualified: 267, cplQualifiedPrevious: 231 },
  { id: 'camp-10', name: 'Display retargeting', investment: 8_400, cplQualified: 344, cplQualifiedPrevious: 298 },
  { id: 'camp-11', name: 'Documento patrocinado', investment: 5_600, cplQualified: 456, cplQualifiedPrevious: null },
  { id: 'camp-12', name: 'Busca cauda longa', investment: 2_100, cplQualified: 289, cplQualifiedPrevious: 402 },
];
