/**
 * Campanhas de mídia paga do trimestre: custo por lead (CPL) em reais no eixo X, taxa de
 * qualificação em fração de 0 a 1 no eixo Y e investimento total em reais, que vira a área de
 * cada bolha.
 * Dado fictício e fixo: nenhum nome é campanha, marca ou empresa real.
 */
export interface Campaign {
  readonly id: string;
  readonly name: string;
  readonly cpl: number;
  readonly taxaQualificacao: number;
  readonly investimento: number;
}

export const data: readonly Campaign[] = [
  { id: 'camp-01', name: 'Busca paga marca institucional', cpl: 42, taxaQualificacao: 0.08, investimento: 62_000 },
  { id: 'camp-02', name: 'Busca paga genérica de concorrência', cpl: 38, taxaQualificacao: 0.06, investimento: 48_000 },
  { id: 'camp-03', name: 'Display prospecção fria', cpl: 51, taxaQualificacao: 0.09, investimento: 35_000 },
  { id: 'camp-04', name: 'Retargeting carrinho abandonado', cpl: 96, taxaQualificacao: 0.31, investimento: 28_000 },
  { id: 'camp-05', name: 'Lookalike 1% clientes atuais', cpl: 118, taxaQualificacao: 0.34, investimento: 74_000 },
  { id: 'camp-06', name: 'Lookalike 3% base ampliada', cpl: 89, taxaQualificacao: 0.22, investimento: 52_000 },
  { id: 'camp-07', name: 'Vídeo topo de funil', cpl: 47, taxaQualificacao: 0.07, investimento: 31_000 },
  { id: 'camp-08', name: 'Vídeo meio de funil educativo', cpl: 76, taxaQualificacao: 0.19, investimento: 26_000 },
  { id: 'camp-09', name: 'Carrossel awareness de marca', cpl: 40, taxaQualificacao: 0.05, investimento: 18_000 },
  { id: 'camp-10', name: 'Carrossel prova social', cpl: 63, taxaQualificacao: 0.16, investimento: 22_000 },
  { id: 'camp-11', name: 'Stories conversão direta', cpl: 71, taxaQualificacao: 0.24, investimento: 39_000 },
  { id: 'camp-12', name: 'Stories engajamento', cpl: 44, taxaQualificacao: 0.10, investimento: 15_000 },
  { id: 'camp-13', name: 'Busca paga marca concorrente', cpl: 55, taxaQualificacao: 0.13, investimento: 41_000 },
  { id: 'camp-14', name: 'Feed estático institucional', cpl: 60, taxaQualificacao: 0.14, investimento: 19_000 },
  { id: 'camp-15', name: 'Nativo em portal de notícias', cpl: 132, taxaQualificacao: 0.29, investimento: 46_000 },
  { id: 'camp-16', name: 'Podcast patrocinado B2B', cpl: 168, taxaQualificacao: 0.41, investimento: 33_000 },
  { id: 'camp-17', name: 'Newsletter patrocinada setorial', cpl: 145, taxaQualificacao: 0.38, investimento: 21_000 },
  { id: 'camp-18', name: 'Parceria com criador de nicho', cpl: 108, taxaQualificacao: 0.27, investimento: 24_000 },
  { id: 'camp-19', name: 'Parceria com criador generalista', cpl: 84, taxaQualificacao: 0.15, investimento: 58_000 },
  { id: 'camp-20', name: 'Display remarketing de site', cpl: 66, taxaQualificacao: 0.21, investimento: 27_000 },
  { id: 'camp-21', name: 'Busca paga cauda longa', cpl: 33, taxaQualificacao: 0.05, investimento: 9_000 },
  { id: 'camp-22', name: 'Busca paga comparativo de preço', cpl: 49, taxaQualificacao: 0.11, investimento: 36_000 },
  { id: 'camp-23', name: 'Lookalike 5% frio', cpl: 58, taxaQualificacao: 0.12, investimento: 44_000 },
  { id: 'camp-24', name: 'Conteúdo patrocinado em blog parceiro', cpl: 152, taxaQualificacao: 0.36, investimento: 29_000 },
  { id: 'camp-25', name: 'Webinar ao vivo qualificado', cpl: 187, taxaQualificacao: 0.48, investimento: 37_000 },
  { id: 'camp-26', name: 'E-book régua de nutrição', cpl: 122, taxaQualificacao: 0.33, investimento: 20_000 },
  { id: 'camp-27', name: 'Comparador de ofertas', cpl: 45, taxaQualificacao: 0.09, investimento: 16_000 },
  { id: 'camp-28', name: 'Feed vídeo curto viral', cpl: 30, taxaQualificacao: 0.04, investimento: 12_000 },
  { id: 'camp-29', name: 'Busca paga institucional regional', cpl: 53, taxaQualificacao: 0.14, investimento: 68_000 },
  { id: 'camp-30', name: 'Retargeting visitantes 30 dias', cpl: 79, taxaQualificacao: 0.20, investimento: 31_000 },
  { id: 'camp-31', name: 'Retargeting visitantes 7 dias', cpl: 92, taxaQualificacao: 0.28, investimento: 42_000 },
  { id: 'camp-32', name: 'Lookalike compradores recentes', cpl: 137, taxaQualificacao: 0.39, investimento: 89_000 },
  { id: 'camp-33', name: 'Coprodução de conteúdo com parceiro', cpl: 175, taxaQualificacao: 0.44, investimento: 15_000 },
  { id: 'camp-34', name: 'Evento presencial patrocinado', cpl: 210, taxaQualificacao: 0.52, investimento: 182_000 },
  { id: 'camp-35', name: 'Anúncio em rádio digital', cpl: 27, taxaQualificacao: 0.03, investimento: 5_200 },
  { id: 'camp-36', name: 'Painel digital em aeroporto', cpl: 245, taxaQualificacao: 0.46, investimento: 158_000 },
];
