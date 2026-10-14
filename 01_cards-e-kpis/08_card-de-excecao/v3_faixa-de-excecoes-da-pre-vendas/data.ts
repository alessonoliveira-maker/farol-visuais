/**
 * Réguas da pré-vendas avaliadas no dia e as que estouraram, na ordem em que o cálculo as devolveu
 * (não na ordem de ação). Cada régua conta casos na própria unidade (leads, agendas) e traz a base
 * quando é uma proporção; a régua de teto não tem base. Dado fictício e fixo: filas, limites e
 * caminhos são inventados.
 */
export type Severity = 'critical' | 'warning';

/** Limite numérico da régua; o componente o escreve com o formatador da unidade. */
export interface RuleLimit {
  readonly value: number;
  readonly unit: 'days' | 'hours' | 'leads';
}

export interface RuleBreach {
  readonly id: string;
  /** Nome curto da régua, impresso no cartão. */
  readonly label: string;
  readonly severity: Severity;
  /** Etapa da esteira (1 é a entrada); desempata réguas do mesmo nível. */
  readonly flowStep: number;
  /** Casos fora da régua. */
  readonly count: number;
  /** Base avaliada pela régua, ou `null` quando a régua é um teto e não uma proporção. */
  readonly base: number | null;
  /** Substantivo da contagem, no singular e no plural. */
  readonly noun: { readonly one: string; readonly other: string };
  /** Critério literal da régua; `{limit}` recebe o limite formatado. */
  readonly criterion: string;
  readonly limit: RuleLimit;
  /** Texto e caminho relativo da fila de trabalho no Farol. */
  readonly queueLabel: string;
  readonly queueHref: string;
}

export interface ExceptionStrip {
  /** Área da tela, impressa no cabeçalho da faixa. */
  readonly area: string;
  /** Dia da avaliação das réguas, YYYY-MM-DD. */
  readonly evaluatedOn: string;
  /** Réguas avaliadas nesta data, com ou sem caso. */
  readonly rulesEvaluated: number;
  readonly breaches: readonly RuleBreach[];
}

export const data: ExceptionStrip = {
  area: 'Pré-vendas',
  evaluatedOn: '2026-09-14',
  rulesEvaluated: 6,
  breaches: [
    {
      id: 'agendas-sem-desfecho',
      label: 'Agendas sem desfecho',
      severity: 'warning',
      flowStep: 4,
      count: 6,
      base: 19,
      noun: { one: 'agenda realizada', other: 'agendas realizadas' },
      criterion: 'sem desfecho registrado há mais de {limit} úteis',
      limit: { value: 2, unit: 'days' },
      queueLabel: 'Abrir as agendas',
      queueHref: '/pre-vendas/agendas?regua=sem-desfecho',
    },
    {
      id: 'fila-acima-do-teto',
      label: 'Fila de primeiro contato',
      severity: 'critical',
      flowStep: 1,
      count: 28,
      base: null,
      noun: { one: 'lead a mais', other: 'leads a mais' },
      criterion: 'acima do teto de {limit} em espera',
      limit: { value: 240, unit: 'leads' },
      queueLabel: 'Abrir a fila de entrada',
      queueHref: '/pre-vendas/fila?regua=teto',
    },
    {
      id: 'leads-sem-dono',
      label: 'Leads sem dono',
      severity: 'warning',
      flowStep: 2,
      count: 3,
      base: 41,
      noun: { one: 'lead', other: 'leads' },
      criterion: 'sem responsável {limit} depois da entrada',
      limit: { value: 24, unit: 'hours' },
      queueLabel: 'Atribuir os leads',
      queueHref: '/pre-vendas/fila?regua=sem-dono',
    },
    {
      id: 'sla-primeiro-contato',
      label: 'SLA de primeiro contato',
      severity: 'critical',
      flowStep: 3,
      count: 11,
      base: 64,
      noun: { one: 'lead', other: 'leads' },
      criterion: 'sem primeiro contato em até {limit} úteis da entrada',
      limit: { value: 4, unit: 'hours' },
      queueLabel: 'Abrir a fila do SLA',
      queueHref: '/pre-vendas/fila?regua=sla-primeiro-contato',
    },
  ],
};
