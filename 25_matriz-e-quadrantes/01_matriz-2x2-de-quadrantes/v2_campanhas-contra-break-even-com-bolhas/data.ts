/**
 * 30 campanhas de mídia paga do mês: investimento em reais, leads gerados e leads qualificados, em
 * contagem. `leads` zero quer dizer que a campanha gastou e não gerou lead, caso em que o CPL e a
 * taxa de qualificação não existem. Dado fictício e fixo: nenhuma campanha corresponde a uma real.
 */
export interface CampaignMonth {
  readonly id: string;
  readonly name: string;
  readonly investimentoReais: number;
  readonly leads: number;
  readonly qualificados: number;
}

/** Premissa de custo: o CPL máximo que ainda se paga, segundo a conta de margem. */
export const breakEvenCpl = 4.2;
/** Meta de qualificação do mês, em fração dos leads. */
export const qualificationGoal = 0.18;

export const data: readonly CampaignMonth[] = [
  { id: 'camp-01', name: 'Busca institucional', investimentoReais: 42_000, leads: 14_483, qualificados: 3_910 },
  { id: 'camp-02', name: 'Busca por concorrência', investimentoReais: 18_500, leads: 3_190, qualificados: 670 },
  { id: 'camp-03', name: 'Remarketing 30 dias', investimentoReais: 9_800, leads: 4_455, qualificados: 535 },
  { id: 'camp-04', name: 'Remarketing 90 dias', investimentoReais: 7_400, leads: 2_387, qualificados: 215 },
  { id: 'camp-05', name: 'Vídeo curto de marca', investimentoReais: 61_000, leads: 15_641, qualificados: 1_721 },
  { id: 'camp-06', name: 'Vídeo longo de produto', investimentoReais: 33_000, leads: 6_346, qualificados: 888 },
  { id: 'camp-07', name: 'Redes sociais, lookalike', investimentoReais: 48_000, leads: 14_118, qualificados: 3_247 },
  { id: 'camp-08', name: 'Redes sociais, interesse amplo', investimentoReais: 72_000, leads: 18_947, qualificados: 1_516 },
  { id: 'camp-09', name: 'Redes sociais, base própria', investimentoReais: 14_500, leads: 5_577, qualificados: 1_729 },
  { id: 'camp-10', name: 'Display em portais', investimentoReais: 27_000, leads: 4_737, qualificados: 521 },
  { id: 'camp-11', name: 'Display em aplicativos', investimentoReais: 11_800, leads: 2_565, qualificados: 180 },
  { id: 'camp-12', name: 'Parceria com portal', investimentoReais: 22_500, leads: 4_592, qualificados: 1_194 },
  { id: 'camp-13', name: 'Newsletter patrocinada', investimentoReais: 8_600, leads: 2_389, qualificados: 478 },
  { id: 'camp-14', name: 'Webinário de lançamento', investimentoReais: 36_000, leads: 6_429, qualificados: 1_864 },
  { id: 'camp-15', name: 'Webinário recorrente', investimentoReais: 12_200, leads: 4_357, qualificados: 828 },
  { id: 'camp-16', name: 'Conteúdo patrocinado', investimentoReais: 19_500, leads: 4_432, qualificados: 576 },
  { id: 'camp-17', name: 'Anúncio local', investimentoReais: 6_200, leads: 1_879, qualificados: 188 },
  { id: 'camp-18', name: 'Rádio digital', investimentoReais: 15_800, leads: 2_290, qualificados: 344 },
  { id: 'camp-19', name: 'Marketplace, categoria A', investimentoReais: 54_000, leads: 13_171, qualificados: 2_239 },
  { id: 'camp-20', name: 'Marketplace, categoria B', investimentoReais: 24_800, leads: 8_267, qualificados: 1_819 },
  { id: 'camp-21', name: 'Marketplace, categoria C', investimentoReais: 9_400, leads: 1_741, qualificados: 435 },
  { id: 'camp-22', name: 'Influenciador regional', investimentoReais: 31_000, leads: 5_082, qualificados: 1_220 },
  { id: 'camp-23', name: 'Cadastro em feira', investimentoReais: 5_200, leads: 1_083, qualificados: 325 },
  { id: 'camp-24', name: 'Indicação premiada', investimentoReais: 13_400, leads: 5_583, qualificados: 1_563 },
  { id: 'camp-25', name: 'Mídia exterior digital', investimentoReais: 80_000, leads: 15_385, qualificados: 1_846 },
  { id: 'camp-26', name: 'Busca de cauda longa', investimentoReais: 16_900, leads: 4_829, qualificados: 773 },
  { id: 'camp-27', name: 'Afiliados', investimentoReais: 28_500, leads: 7_703, qualificados: 1_078 },
  { id: 'camp-28', name: 'Guia de compra', investimentoReais: 10_600, leads: 2_650, qualificados: 556 },
  { id: 'camp-29', name: 'Campanha de reativação', investimentoReais: 7_900, leads: 1_837, qualificados: 331 },
  { id: 'camp-30', name: 'Teste de anúncio interativo', investimentoReais: 4_800, leads: 0, qualificados: 0 },
];
