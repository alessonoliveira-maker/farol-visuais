/**
 * Campanhas de mídia paga do trimestre: custo por lead (CPL) em reais no eixo X, taxa de
 * qualificação em fração de 0 a 1 no eixo Y e investimento total em reais, que vira a área de
 * cada bolha. O teto de CPL e a meta de qualificação são parâmetros do plano de mídia, não medida
 * da campanha, e por isso saem como constantes próprias.
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
  { id: 'camp-01', name: 'Busca institucional', cpl: 38, taxaQualificacao: 0.09, investimento: 54_000 },
  { id: 'camp-02', name: 'Busca cauda longa', cpl: 31, taxaQualificacao: 0.07, investimento: 22_000 },
  { id: 'camp-03', name: 'Display frio', cpl: 44, taxaQualificacao: 0.08, investimento: 31_000 },
  { id: 'camp-04', name: 'Vídeo topo de funil', cpl: 41, taxaQualificacao: 0.06, investimento: 27_000 },
  { id: 'camp-05', name: 'Carrossel de marca', cpl: 35, taxaQualificacao: 0.05, investimento: 18_000 },
  { id: 'camp-06', name: 'Stories engajamento', cpl: 47, taxaQualificacao: 0.10, investimento: 15_000 },
  { id: 'camp-07', name: 'Feed institucional', cpl: 52, taxaQualificacao: 0.12, investimento: 21_000 },
  { id: 'camp-08', name: 'Público semelhante amplo', cpl: 56, taxaQualificacao: 0.13, investimento: 39_000 },
  { id: 'camp-09', name: 'Busca comparativa', cpl: 49, taxaQualificacao: 0.11, investimento: 33_000 },
  { id: 'camp-10', name: 'Retargeting de 30 dias', cpl: 63, taxaQualificacao: 0.18, investimento: 25_000 },
  { id: 'camp-11', name: 'Carrossel de prova social', cpl: 59, taxaQualificacao: 0.16, investimento: 19_000 },
  { id: 'camp-12', name: 'Público semelhante médio', cpl: 72, taxaQualificacao: 0.21, investimento: 46_000 },
  { id: 'camp-13', name: 'Remarketing de site', cpl: 68, taxaQualificacao: 0.19, investimento: 28_000 },
  { id: 'camp-14', name: 'Stories de conversão', cpl: 77, taxaQualificacao: 0.23, investimento: 34_000 },
  { id: 'camp-15', name: 'Vídeo educativo', cpl: 83, taxaQualificacao: 0.24, investimento: 29_000 },
  { id: 'camp-16', name: 'Carrinho abandonado', cpl: 91, taxaQualificacao: 0.28, investimento: 24_000 },
  { id: 'camp-17', name: 'Criador de nicho', cpl: 96, taxaQualificacao: 0.26, investimento: 17_000 },
  { id: 'camp-18', name: 'Público semelhante fiel', cpl: 104, taxaQualificacao: 0.31, investimento: 58_000 },
  { id: 'camp-19', name: 'Régua de nutrição', cpl: 112, taxaQualificacao: 0.33, investimento: 20_000 },
  { id: 'camp-20', name: 'Portal de notícias', cpl: 118, taxaQualificacao: 0.30, investimento: 36_000 },
  { id: 'camp-21', name: 'Boletim setorial', cpl: 108, taxaQualificacao: 0.29, investimento: 6_000 },
  { id: 'camp-22', name: 'Webinar ao vivo', cpl: 132, taxaQualificacao: 0.41, investimento: 88_000 },
  { id: 'camp-23', name: 'Blog parceiro', cpl: 148, taxaQualificacao: 0.36, investimento: 62_000 },
  { id: 'camp-24', name: 'Evento presencial', cpl: 176, taxaQualificacao: 0.50, investimento: 96_000 },
];

/** Teto de CPL do plano de mídia, em reais por lead: acima dele a campanha entra em revisão. */
export const tetoCpl = 120;
/** Meta de qualificação do plano de mídia, em fração de 0 a 1. */
export const metaQualificacao = 0.3;
