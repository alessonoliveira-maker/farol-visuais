/**
 * Investimento de mídia paga do mês por plataforma, em reais, somado de todas as campanhas ativas.
 * Dado fictício e fixo: as plataformas têm nomes genéricos, nenhum é marca real.
 * São seis plataformas para o componente mostrar as três maiores e agregar o restante em outras;
 * a menor tem valor pequeno de propósito, para provar que ela entra em outras sem sair da soma.
 */
export interface PlatformSpend {
  readonly id: string;
  readonly label: string;
  /**
   * Posição fixa na paleta (1 a 6, que viram `--chart-1` a `--chart-6`), atribuída na ordem
   * 1, 3, 6, 5, 2, 4 (CONTRATO, COR-8). A cor é da plataforma, não do tamanho dela no mês.
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  /** Investimento no mês, em reais. */
  readonly spend: number;
}

export interface MonthlyInvestment {
  /** Mês de referência, no formato YYYY-MM. */
  readonly month: string;
  readonly platforms: readonly PlatformSpend[];
}

export const data: MonthlyInvestment = {
  month: '2026-08',
  platforms: [
    { id: 'busca-paga', label: 'Busca paga', slot: 1, spend: 71_840 },
    { id: 'redes-sociais', label: 'Redes sociais', slot: 3, spend: 52_310 },
    { id: 'rede-profissional', label: 'Rede profissional', slot: 6, spend: 33_960 },
    { id: 'video-online', label: 'Vídeo online', slot: 5, spend: 14_220 },
    { id: 'portais-parceiros', label: 'Portais parceiros', slot: 2, spend: 9_870 },
    { id: 'midia-programatica', label: 'Mídia programática', slot: 4, spend: 940 },
  ],
};
