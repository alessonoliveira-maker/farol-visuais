/**
 * Investimento em mídia paga, em reais, e leads qualificados gerados, em contagem, por categoria
 * de plataforma no mês. O CPL qualificado não vem no dado: ele é derivado no componente, porque a
 * plataforma que não gerou lead nenhum tem divisor zero e CPL indisponível, nunca CPL zero. Dado
 * fictício e fixo: os nomes descrevem a categoria de mídia, nenhuma marca real.
 */
export interface MediaLeadSlice {
  readonly id: string;
  readonly name: string;
  /** Investimento do mês, em reais: codifica o ângulo do setor, mesmo sem lead qualificado. */
  readonly investimento: number;
  /** Leads qualificados do mês, em contagem: é o divisor do CPL, e pode ser zero. */
  readonly leadsQualificados: number;
  /** Slot categórico fixo, mapeado para a ordem 1, 3, 6, 5 da COR-8. */
  readonly slot: 0 | 1 | 2 | 3;
}

export const data: readonly MediaLeadSlice[] = [
  { id: 'busca-paga', name: 'Busca paga', investimento: 38_000, leadsQualificados: 74, slot: 0 },
  { id: 'redes-sociais', name: 'Redes sociais', investimento: 61_000, leadsQualificados: 52, slot: 1 },
  {
    id: 'rede-profissional',
    name: 'Rede profissional de contatos',
    investimento: 23_000,
    leadsQualificados: 9,
    slot: 2,
  },
  { id: 'portais', name: 'Portais de conteúdo', investimento: 12_000, leadsQualificados: 0, slot: 3 },
];
