/**
 * Faixa de exceções num dia sem régua de negócio estourada e com uma régua de mídia paga que não pôde
 * ser avaliada porque a fonte não carregou. Contagem de casos, limite em reais e datas YYYY-MM-DD.
 * Dado fictício e fixo: fontes, limites e caminhos são inventados.
 * `casesOutside: 0` é o calmo medido; régua sem carga fica no grupo de saúde dos dados e nunca entra
 * na contagem de negócio como zero.
 */
export interface BusinessRules {
  /** Onde as réguas vivem, impresso no cabeçalho do cartão calmo. */
  readonly scope: string;
  /** Nomes das réguas de negócio avaliadas no dia, na ordem da esteira. */
  readonly rules: readonly string[];
  /** Casos fora das réguas somados; 0 é medido, não ausência. */
  readonly casesOutside: number;
  /** Próxima avaliação agendada, YYYY-MM-DD. */
  readonly nextEvaluationOn: string;
}

export interface UnevaluatedRule {
  readonly id: string;
  /** Fonte que não carregou, impressa no cabeçalho do cartão. */
  readonly source: string;
  /** Critério literal da régua; `{limit}` recebe o limite em moeda. */
  readonly criterion: string;
  readonly limitBrl: number;
  /** Dia da última carga completa da fonte, YYYY-MM-DD. */
  readonly lastLoadOn: string;
  /** Texto e caminho relativo da tela de coleta no Farol. */
  readonly healthLabel: string;
  readonly healthHref: string;
}

export interface CalmBand {
  /** Dia da avaliação das réguas, YYYY-MM-DD. */
  readonly evaluatedOn: string;
  readonly business: BusinessRules;
  /** Réguas que não puderam ser avaliadas por falta de dado. */
  readonly unevaluated: readonly UnevaluatedRule[];
}

export const data: CalmBand = {
  evaluatedOn: '2026-09-14',
  business: {
    scope: 'Comercial e pré-vendas',
    rules: ['oportunidades paradas', 'teto da fila', 'SLA de primeiro contato', 'agendas sem desfecho', 'leads sem dono'],
    casesOutside: 0,
    nextEvaluationOn: '2026-09-15',
  },
  unevaluated: [
    {
      id: 'midia-custo-por-lead-qualificado',
      source: 'Mídia paga',
      criterion: 'custo por lead qualificado acima de {limit} na semana',
      limitBrl: 250,
      lastLoadOn: '2026-09-11',
      healthLabel: 'Ver a coleta da mídia paga',
      healthHref: '/dados/coleta?fonte=midia-paga',
    },
  ],
};
