/**
 * Mídia paga de agosto de 2026 por plataforma: leads gerados e investimento do mês, em reais.
 * O CPL não está no dado: o componente divide investimento por leads, e a área de cada coluna
 * (leads vezes CPL) volta a ser o investimento.
 * Dado fictício e fixo: nenhuma plataforma é marca real e nenhum número vem de base real.
 * Três casos de borda de propósito. Vídeo longo gastou R$ 8 mil e gerou zero lead: o CPL é
 * indefinido, a coluna não tem largura nem altura finita, e ela vira marcador fora da escala.
 * Newsletter patrocinada tem leads e custo `null`, que quer dizer custo não coletado, e não
 * zero. Indicação tem custo zero medido: CPL de R$ 0, coluna de altura nula que
 * ainda se desenha e se escreve.
 * A lista vem fora de ordem de propósito: quem ordena por CPL decrescente é o componente.
 */
export interface PlatformSpend {
  readonly id: string;
  readonly label: string;
  /** Leads gerados no mês; zero medido é zero. */
  readonly leads: number;
  /** Investimento do mês em reais; `null` quer dizer custo não coletado, nunca zero. */
  readonly spend: number | null;
}

export const data: readonly PlatformSpend[] = [
  { id: 'afiliados', label: 'Afiliados', leads: 190, spend: 11_400 },
  { id: 'video-longo', label: 'Vídeo longo', leads: 0, spend: 8_000 },
  { id: 'newsletter', label: 'Newsletter patrocinada', leads: 250, spend: null },
  { id: 'video-curto', label: 'Vídeo curto', leads: 330, spend: 85_800 },
  { id: 'indicacao', label: 'Indicação', leads: 190, spend: 0 },
  { id: 'busca-patrocinada', label: 'Busca patrocinada', leads: 270, spend: 48_600 },
  { id: 'midia-social', label: 'Mídia social', leads: 210, spend: 26_250 },
];

/** Mês do dado, em `YYYY-MM`. */
export const period = '2026-08';
