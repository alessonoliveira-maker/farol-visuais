/**
 * Mídia paga de agosto de 2026 por plataforma: leads gerados e investimento do mês, em reais.
 * O CPL (custo por lead) não está no dado: o componente divide investimento por leads, e a área
 * de cada coluna (largura em leads vezes altura em CPL) volta a ser o investimento.
 * Dado fictício e fixo: nenhuma plataforma é marca real e nenhum número vem de base real.
 * A lista vem fora de ordem de propósito: quem ordena por CPL decrescente é o componente.
 * Busca patrocinada tem o nome mais longo, que precisa quebrar em duas linhas; Afiliados é a
 * coluna mais estreita e a de investimento menor, que não comporta o rótulo dentro da coluna.
 */
export interface PlatformSpend {
  readonly id: string;
  readonly label: string;
  /** Leads gerados no mês. */
  readonly leads: number;
  /** Investimento do mês, em reais. */
  readonly spend: number;
}

export const data: readonly PlatformSpend[] = [
  { id: 'afiliados', label: 'Afiliados', leads: 190, spend: 11_400 },
  { id: 'busca-patrocinada', label: 'Busca patrocinada em texto', leads: 300, spend: 54_000 },
  { id: 'video-curto', label: 'Vídeo curto', leads: 380, spend: 98_800 },
  { id: 'display', label: 'Rede de display', leads: 230, spend: 32_200 },
  { id: 'midia-social', label: 'Mídia social', leads: 200, spend: 25_000 },
];

/** Mês do dado, em `YYYY-MM`. */
export const period = '2026-08';
