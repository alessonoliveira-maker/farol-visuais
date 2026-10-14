/**
 * Desvio diário do CTR contra a meta, em pontos percentuais, para 10 campanhas fictícias de
 * e-mail marketing nos últimos 14 dias. Positivo é dia acima da meta (bom), negativo é dia
 * abaixo (atenção): a polaridade é o oposto do desvio de custo. Dado fictício e fixo.
 */
export interface CtrDeviationSeries {
  readonly id: string;
  readonly name: string;
  readonly deviations: readonly number[];
}

export const data: readonly CtrDeviationSeries[] = [
  {
    id: 'onboarding-boas-vindas',
    name: 'Onboarding Boas Vindas',
    deviations: [0.2, 0.3, 0.1, 0.4, 0.2, 0.3, 0.1, 0.2, 0.4, 0.3, 0.2, 0.1, 0.3, 0.2],
  },
  {
    id: 'reengajamento-90-dias',
    name: 'Reengajamento 90 Dias',
    deviations: [-0.3, -0.4, -0.2, -0.5, -0.3, -0.2, -0.4, -0.3, -0.2, -0.4, -0.3, -0.5, -0.2, -0.3],
  },
  {
    id: 'newsletter-semanal',
    name: 'Newsletter Semanal',
    deviations: [0.1, -0.1, 0.2, 0.0, -0.2, 0.1, 0.0, 0.2, -0.1, 0.1, 0.0, -0.1, 0.2, 0.0],
  },
  {
    id: 'convite-webinar',
    name: 'Convite para Webinar',
    deviations: [0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.8, 0.7, 0.9, 0.8, 1.0, 0.9, 1.1, 1.0],
  },
  {
    id: 'carrinho-abandonado',
    name: 'Carrinho Abandonado',
    deviations: [-0.6, -0.7, -0.8, -0.7, -0.9, -0.8, -1.0, -0.9, -1.1, -1.0, -1.2, -1.1, -1.3, -1.2],
  },
  {
    id: 'aniversario-cliente',
    name: 'Aniversário do Cliente',
    deviations: [0.1, 0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.3, 0.1, 0.2, 0.1, 0.3, 0.2, 0.1],
  },
  {
    id: 'upsell-consultoria',
    name: 'Upsell de Consultoria',
    deviations: [-0.1, -0.2, 0.0, -0.1, -0.2, -0.1, 0.0, -0.2, -0.1, 0.0, -0.1, -0.2, -0.1, 0.0],
  },
  {
    id: 'pesquisa-nps',
    name: 'Pesquisa de NPS',
    deviations: [0.0, 0.1, -0.1, 0.0, 0.1, 0.0, -0.1, 0.1, 0.0, -0.1, 0.0, 0.1, 0.0, -0.1],
  },
  {
    id: 'lancamento-fundo',
    name: 'Lançamento Fundo Norte',
    deviations: [1.4, 0.8, -0.6, 1.8, -1.1, 0.5, -1.5, 1.2, 0.3, -0.9, 1.6, -1.3, 0.9, -0.4],
  },
  {
    id: 'alerta-vencimento',
    name: 'Alerta de Vencimento',
    deviations: [0.2, 0.1, 0.3, 0.2, 0.1, 0.4, 0.2, 0.1, 0.3, 0.2, 0.1, 0.4, 0.2, 0.1],
  },
];

/** Passo comum a todas as campanhas, em pontos percentuais de CTR. */
export const passo = 0.5;

/** A campanha aberta em área comum por padrão: a mais volátil, a que justifica o detalhe. */
export const expandedId = 'lancamento-fundo';
