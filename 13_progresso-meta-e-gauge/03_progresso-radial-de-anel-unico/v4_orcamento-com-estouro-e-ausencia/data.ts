/**
 * Consumo do orçamento de mídia paga do mês, por plataforma, contra o planejado de cada uma.
 * Dado fictício e fixo: nenhuma plataforma é conta real.
 */
export interface ConsumoPlataforma {
  readonly id: string;
  readonly label: string;
  readonly planejado: number;
  /** null quando a plataforma não tem coleta no mês; nunca 0 nesse caso. */
  readonly consumido: number | null;
}

export interface OrcamentoDoMes {
  readonly month: string;
  readonly plataformas: readonly ConsumoPlataforma[];
}

export const data: OrcamentoDoMes = {
  month: '2026-08',
  plataformas: [
    { id: 'social', label: 'Rede social paga', planejado: 40_000, consumido: 44_800 },
    { id: 'busca', label: 'Busca paga', planejado: 25_000, consumido: 0 },
    { id: 'profissional', label: 'Rede profissional paga', planejado: 15_000, consumido: null },
  ],
};
