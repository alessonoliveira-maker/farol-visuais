/**
 * Movimento de 8 campanhas fictícias entre T2/2026 e T3/2026, em duas medidas: CPL em reais por
 * lead e taxa de qualificação. A taxa não vem pronta: o dado declara as contagens de leads e de
 * leads qualificados de cada período, e a taxa é derivada delas.
 *
 * O dado exercita de propósito os três casos em que a seta não existe ou não termina num ponto:
 * campanha sem período anterior (`before` nulo), campanha encerrada no fim do período corrente
 * (`ended`) e campanha que quase não se moveu, medida em pixels pelo componente.
 * Dado fictício e fixo: nenhuma campanha corresponde a plataforma ou criativo real.
 */
export interface CampaignPeriod {
  readonly cpl: number;
  readonly leads: number;
  readonly qualified: number;
}

export interface CampaignMovement {
  readonly id: string;
  readonly name: string;
  /** Nulo quando a campanha não existia no período anterior; ausência, não zero. */
  readonly before: CampaignPeriod | null;
  readonly after: CampaignPeriod;
  /** Verdadeiro quando a campanha foi encerrada no fim do período corrente. */
  readonly ended: boolean;
}

export const data: readonly CampaignMovement[] = [
  { id: 'video-curto', name: 'Vídeo curto', before: null, after: { cpl: 140, leads: 150, qualified: 36 }, ended: false },
  {
    id: 'remarketing',
    name: 'Remarketing de site',
    before: { cpl: 200, leads: 150, qualified: 30 },
    after: { cpl: 240, leads: 120, qualified: 18 },
    ended: true,
  },
  {
    id: 'institucional',
    name: 'Institucional sempre ativa',
    before: { cpl: 260, leads: 100, qualified: 25 },
    after: { cpl: 264, leads: 100, qualified: 25 },
    ended: false,
  },
  {
    id: 'busca-marca',
    name: 'Busca de marca',
    before: { cpl: 100, leads: 200, qualified: 36 },
    after: { cpl: 130, leads: 200, qualified: 30 },
    ended: false,
  },
  {
    id: 'conteudo',
    name: 'Conteúdo técnico',
    before: { cpl: 330, leads: 100, qualified: 16 },
    after: { cpl: 300, leads: 100, qualified: 23 },
    ended: false,
  },
  {
    id: 'parceria',
    name: 'Parceria de mídia',
    before: { cpl: 340, leads: 100, qualified: 11 },
    after: { cpl: 280, leads: 100, qualified: 19 },
    ended: false,
  },
  {
    id: 'indicacao',
    name: 'Indicação guiada',
    before: { cpl: 190, leads: 100, qualified: 34 },
    after: { cpl: 160, leads: 200, qualified: 72 },
    ended: false,
  },
  {
    id: 'webinar',
    name: 'Webinar de produto',
    before: { cpl: 230, leads: 100, qualified: 33 },
    after: { cpl: 300, leads: 100, qualified: 27 },
    ended: false,
  },
];

/** Rótulo dos dois momentos ligados pelas setas: nome de período, não é data de calendário. */
export const periodBeforeLabel = 'T2/2026';
export const periodAfterLabel = 'T3/2026';
