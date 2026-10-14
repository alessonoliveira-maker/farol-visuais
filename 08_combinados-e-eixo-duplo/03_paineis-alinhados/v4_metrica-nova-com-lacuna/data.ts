/**
 * Receita fechada por mês, em reais, e a taxa de conversão de oportunidade em venda do mesmo
 * mês, em contagem de oportunidades e de ganhos. Ano fictício de 2026.
 * Dado fictício e fixo: nenhuma pessoa e nenhuma empresa é real.
 *
 * O caso difícil que este dado exerce é a métrica que só passou a existir no meio do período: o
 * registro de estágio que permite contar oportunidade e ganho entrou em mai/26, então de jan a
 * abr não há contagem nenhuma. Ausência não é zero e não é interpolação, por isso os quatro
 * primeiros meses vêm com `null` nas duas contagens em vez de vir com `0`: taxa zero diria que
 * ninguém converteu, e o que houve foi mês sem instrumento de medição.
 */
export interface RevenueAndConversionMonth {
  readonly month: string;
  /** Receita fechada no mês, em reais. */
  readonly receita: number;
  /** Oportunidades no mês, ou `null` nos meses anteriores ao início da medição. */
  readonly oportunidades: number | null;
  /** Oportunidades ganhas no mês, ou `null` nos meses anteriores ao início da medição. */
  readonly ganhos: number | null;
}

export const data: readonly RevenueAndConversionMonth[] = [
  { month: '2026-01', receita: 1_236_000, oportunidades: null, ganhos: null },
  { month: '2026-02', receita: 1_324_000, oportunidades: null, ganhos: null },
  { month: '2026-03', receita: 1_410_000, oportunidades: null, ganhos: null },
  { month: '2026-04', receita: 1_482_000, oportunidades: null, ganhos: null },
  { month: '2026-05', receita: 1_596_000, oportunidades: 38, ganhos: 6 },
  { month: '2026-06', receita: 1_692_000, oportunidades: 41, ganhos: 7 },
  { month: '2026-07', receita: 1_804_000, oportunidades: 44, ganhos: 8 },
  { month: '2026-08', receita: 1_934_000, oportunidades: 46, ganhos: 9 },
  { month: '2026-09', receita: 2_096_000, oportunidades: 49, ganhos: 11 },
  { month: '2026-10', receita: 2_252_000, oportunidades: 52, ganhos: 12 },
  { month: '2026-11', receita: 2_488_000, oportunidades: 55, ganhos: 14 },
  { month: '2026-12', receita: 2_764_000, oportunidades: 56, ganhos: 16 },
];
