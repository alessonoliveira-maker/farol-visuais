/**
 * Composição por origem de lead em cada etapa do funil de pré-vendas, agosto de 2026, em
 * volume absoluto de leads. Dado fictício e fixo: nenhuma pessoa, empresa ou campanha real.
 * A ordem das etapas é a ordem do processo (Lead a Ganho); a ordem das origens é fixa e
 * corresponde ao slot de cor 1, 3, 6, 5, 2, 4 (COR-8), com "Sem origem" sempre por último.
 */
export interface FunnelOriginStage {
  readonly stage: string;
  /** Indicação de cliente ou parceiro. */
  readonly referral: number;
  /** Mídia paga e orgânica em redes sociais. */
  readonly socialMedia: number;
  /** Busca paga (Google Ads e afins). */
  readonly paidSearch: number;
  /** Rede profissional (LinkedIn orgânico e mensagem direta). */
  readonly professionalNetwork: number;
  /** Tráfego orgânico do site e do blog. */
  readonly organic: number;
  /** Evento presencial ou webinar. */
  readonly event: number;
  /** Sem origem declarada no formulário ou no CRM: cobertura de dado, não uma origem real. */
  readonly noOrigin: number;
}

export const data: readonly FunnelOriginStage[] = [
  {
    stage: 'Lead',
    referral: 74,
    socialMedia: 471,
    paidSearch: 140,
    professionalNetwork: 90,
    organic: 80,
    event: 38,
    noOrigin: 347,
  },
  {
    stage: 'Qualificado',
    referral: 47,
    socialMedia: 100,
    paidSearch: 41,
    professionalNetwork: 27,
    organic: 20,
    event: 12,
    noOrigin: 71,
  },
  {
    stage: 'Agenda',
    referral: 23,
    socialMedia: 24,
    paidSearch: 14,
    professionalNetwork: 9,
    organic: 6,
    event: 4,
    noOrigin: 16,
  },
  {
    stage: 'Proposta',
    referral: 13,
    socialMedia: 8,
    paidSearch: 7,
    professionalNetwork: 4,
    organic: 2,
    event: 2,
    noOrigin: 5,
  },
  {
    stage: 'Ganho',
    referral: 7,
    socialMedia: 2,
    paidSearch: 3,
    professionalNetwork: 2,
    organic: 1,
    event: 1,
    noOrigin: 1,
  },
];
