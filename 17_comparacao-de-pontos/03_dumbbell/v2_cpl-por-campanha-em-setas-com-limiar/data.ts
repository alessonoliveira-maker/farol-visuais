/**
 * Custo por lead (CPL) de 22 campanhas em jul/26 e em ago/26, em reais por lead.
 * Dado fictício e fixo: nenhuma campanha corresponde a plataforma ou anunciante real. Nove delas
 * mudaram mais de 15%; uma mudou exatamente 15% (fica fora, o limiar é estrito), uma não mudou
 * nada, e algumas têm haste curta e nome longo.
 */
export interface CampaignCpl {
  readonly id: string;
  readonly name: string;
  /** CPL de jul/26, em reais por lead. */
  readonly july: number;
  /** CPL de ago/26, em reais por lead. */
  readonly august: number;
}

export const monthBefore = '2026-07';
export const monthAfter = '2026-08';

/** Mudança relativa acima da qual a seta ganha cor, em pontos percentuais inteiros: 15%. */
export const thresholdPercent = 15;

export const data: readonly CampaignCpl[] = [
  { id: 'camp-01', name: 'Busca de marca', july: 38, august: 31 },
  { id: 'camp-02', name: 'Remarketing de carrinho', july: 52, august: 67 },
  { id: 'camp-03', name: 'Lookalike de clientes', july: 64, august: 58 },
  { id: 'camp-04', name: 'Vídeo de lançamento', july: 88, august: 104 },
  { id: 'camp-05', name: 'Webinar de abertura', july: 47, august: 47 },
  { id: 'camp-06', name: 'Busca por categoria', july: 41, august: 42 },
  { id: 'camp-07', name: 'Newsletter de parceiros', july: 29, august: 24 },
  { id: 'camp-08', name: 'Carrossel em feed', july: 73, august: 70 },
  { id: 'camp-09', name: 'Display institucional ampliado', july: 95, august: 82 },
  { id: 'camp-10', name: 'Indicação premiada', july: 33, august: 27 },
  { id: 'camp-11', name: 'Eventos regionais', july: 110, august: 96 },
  { id: 'camp-12', name: 'Conteúdo patrocinado', july: 56, august: 64 },
  { id: 'camp-13', name: 'Social impulsionado', july: 61, august: 70 },
  { id: 'camp-14', name: 'Busca de concorrentes', july: 78, august: 93 },
  { id: 'camp-15', name: 'Afiliados', july: 44, august: 38 },
  { id: 'camp-16', name: 'Podcast patrocinado', july: 69, august: 80 },
  { id: 'camp-17', name: 'Mala direta digital', july: 36, august: 42 },
  { id: 'camp-18', name: 'Rádio online', july: 58, august: 55 },
  { id: 'camp-19', name: 'Retargeting de blog', july: 27, august: 32 },
  { id: 'camp-20', name: 'Oferta sazonal', july: 50, august: 57 },
  { id: 'camp-21', name: 'Encontro de clientes', july: 40, august: 46 },
  { id: 'camp-22', name: 'Pesquisa por voz', july: 85, august: 87 },
];
