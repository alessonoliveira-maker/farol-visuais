/**
 * Investimento em mídia paga e CPL (custo por lead) qualificado por categoria de plataforma no
 * mês, em reais, com o CPL alvo do mês. Dado fictício e fixo: os nomes descrevem a categoria de
 * mídia (busca paga, redes sociais, rede profissional de contatos, portais de conteúdo), nenhuma
 * marca real.
 */
export interface CplTargetSlice {
  readonly id: string;
  readonly name: string;
  /** Investimento do mês, em reais: codifica o ângulo do setor. */
  readonly investimento: number;
  /** CPL qualificado do mês, em reais: codifica o raio do setor. */
  readonly cplQualificado: number;
  /** Slot categórico fixo, mapeado para a ordem 1, 3, 6, 5 da COR-8. */
  readonly slot: 0 | 1 | 2 | 3;
}

export const data: readonly CplTargetSlice[] = [
  { id: 'busca-paga', name: 'Busca paga', investimento: 52_000, cplQualificado: 780, slot: 0 },
  { id: 'redes-sociais', name: 'Redes sociais', investimento: 74_000, cplQualificado: 1_900, slot: 1 },
  {
    id: 'rede-profissional',
    name: 'Rede profissional de contatos',
    investimento: 21_000,
    cplQualificado: 2_600,
    slot: 2,
  },
  { id: 'portais', name: 'Portais de conteúdo', investimento: 9_500, cplQualificado: 1_050, slot: 3 },
];

/** CPL qualificado alvo do mês, em reais: o raio do anel de referência. */
export const cplAlvo = 1_200;
