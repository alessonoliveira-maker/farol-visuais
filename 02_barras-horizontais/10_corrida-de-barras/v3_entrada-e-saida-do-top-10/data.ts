/**
 * Leads por campanha, por mês, ao longo de 9 meses. Dado fictício e fixo: nenhuma campanha
 * corresponde a um anúncio real. `null` marca mês sem coleta para aquela campanha, nunca zero.
 */
export type CampaignId =
  | 'prospeccao_fidc'
  | 'retargeting_site'
  | 'lookalike_mfo'
  | 'lancamento_imobiliario'
  | 'evento_regional'
  | 'parceria_contadores'
  | 'conteudo_linkedin'
  | 'reativacao_base'
  | 'concessionarias_sul'
  | 'indicacao_vip'
  | 'busca_paga_generica'
  | 'video_youtube';

export interface Campaign {
  readonly id: CampaignId;
  readonly label: string;
}

/** As 12 campanhas do período; só 10 cabem no topo a cada mês (TOP_N do Chart). */
export const campaigns: readonly Campaign[] = [
  { id: 'prospeccao_fidc', label: 'Prospecção FIDC Atacado' },
  { id: 'retargeting_site', label: 'Retargeting Site Institucional' },
  { id: 'lookalike_mfo', label: 'Lookalike Clientes MFO' },
  { id: 'lancamento_imobiliario', label: 'Lançamento Fundo Imobiliário' },
  { id: 'evento_regional', label: 'Evento Regional Sul' },
  { id: 'parceria_contadores', label: 'Parceria com Contadores' },
  { id: 'conteudo_linkedin', label: 'Conteúdo patrocinado em rede social B2B' },
  { id: 'reativacao_base', label: 'Reativação de Base Fria' },
  { id: 'concessionarias_sul', label: 'Concessionárias do Sul' },
  { id: 'indicacao_vip', label: 'Programa de Indicação VIP' },
  { id: 'busca_paga_generica', label: 'Busca Paga Genérica' },
  { id: 'video_youtube', label: 'Pré-roll em vídeo online' },
];

export interface CampaignRacePeriod {
  /** Mês de referência. */
  readonly period: string;
  /** Leads no mês, por campanha; `null` quando a campanha não teve coleta naquele mês. */
  readonly values: Readonly<Record<CampaignId, number | null>>;
}

export const data: readonly CampaignRacePeriod[] = [
  {
    period: '2025-11',
    values: {
      prospeccao_fidc: 180, retargeting_site: 90, lookalike_mfo: 40, lancamento_imobiliario: 300,
      evento_regional: 10, parceria_contadores: 30, conteudo_linkedin: 60, reativacao_base: 150,
      concessionarias_sul: 70, indicacao_vip: 20, busca_paga_generica: 200, video_youtube: 15,
    },
  },
  {
    period: '2025-12',
    values: {
      prospeccao_fidc: 190, retargeting_site: 95, lookalike_mfo: 55, lancamento_imobiliario: 260,
      evento_regional: 10, parceria_contadores: 35, conteudo_linkedin: 65, reativacao_base: 120,
      concessionarias_sul: 80, indicacao_vip: 22, busca_paga_generica: 205, video_youtube: 50,
    },
  },
  {
    period: '2026-01',
    values: {
      prospeccao_fidc: 205, retargeting_site: 100, lookalike_mfo: 70, lancamento_imobiliario: 150,
      evento_regional: 220, parceria_contadores: 38, conteudo_linkedin: 70, reativacao_base: 100,
      concessionarias_sul: null, indicacao_vip: 25, busca_paga_generica: 210, video_youtube: 180,
    },
  },
  {
    period: '2026-02',
    values: {
      prospeccao_fidc: 60, retargeting_site: 105, lookalike_mfo: 90, lancamento_imobiliario: 60,
      evento_regional: 180, parceria_contadores: 42, conteudo_linkedin: 75, reativacao_base: 80,
      concessionarias_sul: null, indicacao_vip: 28, busca_paga_generica: 150, video_youtube: 220,
    },
  },
  {
    period: '2026-03',
    values: {
      prospeccao_fidc: 70, retargeting_site: 110, lookalike_mfo: 115, lancamento_imobiliario: 20,
      evento_regional: 40, parceria_contadores: 45, conteudo_linkedin: 80, reativacao_base: 65,
      concessionarias_sul: 95, indicacao_vip: 32, busca_paga_generica: 140, video_youtube: 90,
    },
  },
  {
    period: '2026-04',
    values: {
      prospeccao_fidc: 80, retargeting_site: 108, lookalike_mfo: 140, lancamento_imobiliario: 10,
      evento_regional: 15, parceria_contadores: 48, conteudo_linkedin: 85, reativacao_base: 55,
      concessionarias_sul: 100, indicacao_vip: 36, busca_paga_generica: 130, video_youtube: 30,
    },
  },
  {
    period: '2026-05',
    values: {
      prospeccao_fidc: 95, retargeting_site: 112, lookalike_mfo: 160, lancamento_imobiliario: 5,
      evento_regional: 10, parceria_contadores: 50, conteudo_linkedin: 90, reativacao_base: 45,
      concessionarias_sul: 110, indicacao_vip: 40, busca_paga_generica: 120, video_youtube: 15,
    },
  },
  {
    period: '2026-06',
    values: {
      prospeccao_fidc: 110, retargeting_site: 115, lookalike_mfo: 175, lancamento_imobiliario: 5,
      evento_regional: 10, parceria_contadores: 52, conteudo_linkedin: 95, reativacao_base: 40,
      concessionarias_sul: 120, indicacao_vip: 44, busca_paga_generica: 110, video_youtube: 10,
    },
  },
  {
    period: '2026-07',
    values: {
      prospeccao_fidc: 130, retargeting_site: 120, lookalike_mfo: 190, lancamento_imobiliario: 5,
      evento_regional: 10, parceria_contadores: 55, conteudo_linkedin: 97, reativacao_base: 35,
      concessionarias_sul: 130, indicacao_vip: 48, busca_paga_generica: 100, video_youtube: 8,
    },
  },
];
