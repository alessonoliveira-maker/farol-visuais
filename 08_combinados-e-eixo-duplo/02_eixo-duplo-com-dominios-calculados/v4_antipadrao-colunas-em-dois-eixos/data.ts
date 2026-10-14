/**
 * Investimento de mídia e leads recebidos por plataforma num trimestre. Investimento em reais;
 * leads em contagem de pessoas.
 *
 * As plataformas são tipos genéricos de veiculação, não produtos: nenhuma marca real aparece aqui.
 *
 * O recorte foi escolhido para que o antipadrão MINTA de forma verificável. O custo por lead vai de
 * R$ 52,90 a R$ 139,30, e três das cinco plataformas ficam entre R$ 75,00 e R$ 110,00, isto é, na
 * faixa em que o veredito visual de um gráfico de colunas em dois eixos depende só do teto que o
 * autor escolher para cada eixo. Duas delas trocam de lado quando o teto do eixo de leads sobe um
 * passo, sem nenhum número do dado mudar.
 *
 * Dado fictício e fixo: nenhuma campanha, veículo ou empresa real.
 */
export interface PlatformSpend {
  /** Tipo de veiculação, em texto genérico. */
  readonly platform: string;
  /** Investimento do trimestre, em reais. */
  readonly investment: number;
  /** Leads recebidos no trimestre. */
  readonly leads: number;
}

export const data: readonly PlatformSpend[] = [
  { platform: 'Busca paga', investment: 58_400, leads: 548 },
  { platform: 'Rede social', investment: 41_200, leads: 470 },
  { platform: 'Vídeo curto', investment: 29_800, leads: 340 },
  { platform: 'Display', investment: 18_600, leads: 163 },
  { platform: 'Newsletter', investment: 6_400, leads: 121 },
];
