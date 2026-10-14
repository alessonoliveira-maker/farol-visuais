/**
 * Custo por lead qualificado (CPL), em reais, por plataforma de mídia paga e mês de 2026.
 * Uma linha é uma plataforma; as 6 colunas são os meses do primeiro semestre. Dado fictício e fixo.
 * `null` é mês sem veiculação (a plataforma pausou a campanha), nunca lido como CPL zero.
 */
export interface PlatformMonthlyCpl {
  readonly platformId: string;
  readonly platformName: string;
  readonly cpl: readonly (number | null)[];
}

/** As 6 colunas, em ordem, no formato YYYY-MM. */
export const MONTHS: readonly string[] = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

/** Teto de CPL qualificado aceito pelo time de marketing, em reais. */
export const CPL_CEILING = 180;

export const data: readonly PlatformMonthlyCpl[] = [
  { platformId: 'rede-busca-paga', platformName: 'Rede de busca paga', cpl: [112, 105, 121, 134, 129, 118] },
  { platformId: 'rede-social-ampla', platformName: 'Rede social ampla', cpl: [98, 143, 176, 188, 165, 151] },
  { platformId: 'rede-profissional-b2b', platformName: 'Rede profissional B2B', cpl: [210, 198, 231, 256, 224, 205] },
  { platformId: 'video-social-curto', platformName: 'Vídeo social curto', cpl: [null, null, 71, 84, 79, 92] },
  { platformId: 'display-programatica', platformName: 'Display em rede programática', cpl: [138, 152, 147, 55, 161, 172] },
];
