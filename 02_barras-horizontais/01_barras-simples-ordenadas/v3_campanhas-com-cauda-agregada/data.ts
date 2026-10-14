/**
 * Leads gerados por campanha em 2026-08, contagem de leads.
 * Dado fictício e fixo: nenhuma campanha, pessoa ou empresa real. Traz as 15 campanhas de maior
 * volume, das 40 do mês; a última tem nome longo e valor pequeno, para exercitar o rótulo que não
 * cabe dentro da barra. As 25 campanhas restantes entram como um total à parte (ver `otherCampaignsLeads`),
 * maior que oito das 15 campanhas listadas, para provar que a cauda pesa na escala sem furar o ranking.
 */
export interface CampaignLeads {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
}

export const data: readonly CampaignLeads[] = [
  { id: 'camp-01', name: 'Indicação de clientes atuais', leads: 512 },
  { id: 'camp-02', name: 'Busca paga institucional', leads: 448 },
  { id: 'camp-03', name: 'Reativação de base antiga', leads: 396 },
  { id: 'camp-04', name: 'Mídia social paga para gestores financeiros', leads: 351 },
  { id: 'camp-05', name: 'Retargeting do site institucional', leads: 298 },
  { id: 'camp-06', name: 'Webinar sobre sucessão patrimonial', leads: 264 },
  { id: 'camp-07', name: 'Newsletter mensal para a base', leads: 231 },
  { id: 'camp-08', name: 'Busca paga por termos de marca', leads: 198 },
  { id: 'camp-09', name: 'Vídeo institucional em plataforma de vídeo online', leads: 167 },
  { id: 'camp-10', name: 'Evento presencial em São Paulo', leads: 143 },
  { id: 'camp-11', name: 'Parceria com escritórios de contabilidade', leads: 118 },
  { id: 'camp-12', name: 'Anúncio em podcast de economia', leads: 94 },
  { id: 'camp-13', name: 'Feira do setor financeiro', leads: 71 },
  { id: 'camp-14', name: 'Campanha de topo de funil em rede social', leads: 52 },
  { id: 'camp-15', name: 'Prospecção fria para decisor financeiro', leads: 24 },
];

/** Quantas campanhas além das 15 listadas compõem a cauda do mês. */
export const otherCampaignsCount = 25;

/** Soma de leads das 25 campanhas da cauda: fica fora do ranking, mas soma mais que 8 das 15 acima. */
export const otherCampaignsLeads = 326;
