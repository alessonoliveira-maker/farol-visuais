/**
 * Custo por lead (CPL) de cada plataforma de mídia paga em dois meses seguidos, em reais.
 * A variação não mora no dado: o componente calcula a partir dos dois CPLs.
 * Dado fictício e fixo: as plataformas são tipos genéricos de mídia, sem marca real.
 */
export interface PlatformCpl {
  readonly id: string;
  readonly platform: string;
  /** CPL do mês anterior, em reais; null quando a plataforma não rodou naquele mês. */
  readonly previousCpl: number | null;
  /** CPL do mês atual, em reais. */
  readonly currentCpl: number;
}

export const data: readonly PlatformCpl[] = [
  { id: 'plat-busca', platform: 'Busca paga', previousCpl: 186, currentCpl: 158 },
  { id: 'plat-social', platform: 'Rede social', previousCpl: 94, currentCpl: 101 },
  { id: 'plat-profissional', platform: 'Rede profissional', previousCpl: 212, currentCpl: 263 },
  { id: 'plat-display', platform: 'Display programático', previousCpl: 71, currentCpl: 64 },
  { id: 'plat-mensageria', platform: 'Mensageria patrocinada', previousCpl: 128, currentCpl: 127 },
  { id: 'plat-video', platform: 'Vídeo curto', previousCpl: null, currentCpl: 88 },
];

/** Mês atual e mês de comparação, em YYYY-MM. */
export const currentMonth = '2026-08';
export const previousMonth = '2026-07';
