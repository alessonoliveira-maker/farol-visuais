/**
 * Investimento em mídia paga e CPL (custo por lead) qualificado por categoria de plataforma no
 * mês, em reais. Dado fictício e fixo: os nomes descrevem a categoria de mídia (busca paga,
 * redes sociais, rede profissional de contatos corporativos), nenhuma marca real.
 */
export interface MediaInvestmentSlice {
  readonly id: string;
  readonly name: string;
  /** Investimento do mês, em reais: codifica o ângulo do setor. */
  readonly investimento: number;
  /** CPL (custo por lead) qualificado do mês, em reais: codifica o raio do setor. */
  readonly cplQualificado: number;
  /** Slot categórico fixo (0, 1, 2), mapeado para a ordem 1, 3, 6 da COR-8. */
  readonly slot: 0 | 1 | 2;
}

export const data: readonly MediaInvestmentSlice[] = [
  { id: 'busca-paga', name: 'Busca paga', investimento: 42_000, cplQualificado: 500, slot: 0 },
  { id: 'redes-sociais', name: 'Redes sociais', investimento: 68_000, cplQualificado: 1_000, slot: 1 },
  {
    id: 'rede-profissional',
    name: 'Rede profissional de contatos corporativos',
    investimento: 15_000,
    cplQualificado: 2_500,
    slot: 2,
  },
];
