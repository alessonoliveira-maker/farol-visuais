/**
 * Mídia paga de agosto de 2026 por plataforma: leads gerados e investimento do mês, em reais, e o
 * CPL alvo do mês. O CPL não está no dado: o componente divide investimento por leads, e a parte
 * da área de cada coluna acima do alvo é o investimento pago além de leads vezes o alvo.
 * Dado fictício e fixo: nenhuma plataforma é marca real e nenhum número vem de base real.
 * A lista vem fora de ordem de propósito: quem ordena por CPL decrescente é o componente.
 * Três plataformas ficam acima do alvo, com excedentes de ordens de grandeza diferentes (o menor
 * é de poucos milhares); Rede de display fica a R$ 5 do alvo e Afiliados bem abaixo, e as duas
 * saem sem parte destacada, com o CPL escrito.
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
  { id: 'afiliados', label: 'Afiliados', leads: 190, spend: 22_800 },
  { id: 'busca-patrocinada', label: 'Busca patrocinada', leads: 300, spend: 64_500 },
  { id: 'video-curto', label: 'Vídeo curto', leads: 380, spend: 98_800 },
  { id: 'display', label: 'Rede de display', leads: 200, spend: 35_000 },
  { id: 'midia-social', label: 'Mídia social', leads: 230, spend: 43_700 },
];

/** CPL alvo do mês, em reais por lead. */
export const target = 180;

/** Mês do dado, em `YYYY-MM`. */
export const period = '2026-08';
