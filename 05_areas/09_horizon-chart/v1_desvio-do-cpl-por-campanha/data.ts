/**
 * Desvio diário do CPL (custo por lead) contra a própria média móvel de 30 dias, em reais,
 * para 12 campanhas fictícias de mídia paga nos últimos 14 dias. Positivo é dia caro (CPL
 * acima da média), negativo é dia barato (CPL abaixo da média). Dado fictício e fixo.
 */
export interface CplDeviationSeries {
  readonly id: string;
  readonly name: string;
  readonly deviations: readonly number[];
}

export const data: readonly CplDeviationSeries[] = [
  {
    id: 'busca-paga',
    name: 'Busca Paga Institucional',
    deviations: [0.3, 0.5, 0.2, -0.1, 0.4, 0.6, 0.3, 0.1, -0.2, 0.2, 0.5, 0.3, 0.1, -0.1],
  },
  {
    id: 'display-retargeting',
    name: 'Display Retargeting',
    deviations: [-0.2, -0.4, -0.3, -0.5, -0.2, -0.1, -0.3, -0.4, -0.2, -0.3, -0.5, -0.2, -0.1, -0.3],
  },
  {
    id: 'video-prospeccao',
    name: 'Vídeo Prospecção',
    deviations: [0.1, -0.3, 0.8, -0.6, 0.2, -0.1, 1.1, -0.4, 0.3, -0.2, 0.9, -0.5, 0.2, -0.1],
  },
  {
    id: 'social-awareness',
    name: 'Social Awareness',
    deviations: [0.0, 0.1, -0.1, 0.2, 0.0, -0.2, 0.1, 0.0, 0.1, -0.1, 0.2, 0.0, -0.1, 0.1],
  },
  {
    id: 'search-marca',
    name: 'Search Marca',
    deviations: [-0.5, -0.6, -0.4, -0.7, -0.5, -0.6, -0.8, -0.5, -0.6, -0.4, -0.7, -0.5, -0.6, -0.7],
  },
  {
    id: 'native-conteudo',
    name: 'Native Conteúdo',
    deviations: [0.4, 0.3, 0.5, 0.2, 0.4, 0.6, 0.3, 0.5, 0.4, 0.2, 0.5, 0.3, 0.4, 0.6],
  },
  {
    id: 'email-patrocinado',
    name: 'Email Patrocinado',
    deviations: [0.1, -0.1, 0.0, 0.2, -0.1, 0.1, 0.0, -0.2, 0.1, 0.0, 0.1, -0.1, 0.0, 0.2],
  },
  {
    id: 'parceria-portal',
    name: 'Parceria de Portal',
    deviations: [0.6, 0.8, 0.9, 1.1, 1.3, 1.2, 1.5, 1.4, 1.6, 1.5, 1.7, 1.6, 1.8, 1.7],
  },
  {
    id: 'programatica-display',
    name: 'Programática Display',
    deviations: [1.0, 1.2, 1.4, 1.3, 1.5, 1.7, 1.6, 1.8, 1.7, 1.9, 1.8, 2.0, 1.9, 2.1],
  },
  {
    id: 'podcast-patrocinado',
    name: 'Podcast Patrocinado',
    deviations: [0.1, -0.2, 0.1, -0.1, 0.2, -0.3, 0.1, 2.2, -0.1, 0.0, 0.1, -0.2, 0.1, -0.1],
  },
  {
    id: 'influenciador-nano',
    name: 'Influenciador Nano',
    deviations: [-0.1, -0.2, 0.0, -0.1, -0.3, -0.1, 0.0, -0.2, -0.1, 0.0, -0.2, -0.1, 0.0, -0.1],
  },
  {
    id: 'newsletter-setorial',
    name: 'Newsletter Setorial',
    deviations: [0.2, 0.1, 0.3, 0.0, 0.2, 0.1, -0.1, 0.2, 0.1, 0.3, 0.0, 0.2, 0.1, -0.1],
  },
];

/** Passo comum a todas as campanhas: o tamanho de uma faixa de intensidade, em reais. */
export const passo = 0.8;
