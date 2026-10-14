/**
 * Resultado de uma régua do funil de vendas na última avaliação: quantas oportunidades abertas
 * estão sem movimento de etapa além do limite escrito. Contagem de oportunidades, sem unidade de
 * moeda. Dado fictício e fixo.
 * `count: null` é régua que não pôde ser avaliada: o cartão escreve indisponível e nada vira zero.
 */
export interface ExceptionRule {
  readonly id: string;
  /** Onde a régua vive, impresso no cabeçalho do cartão. */
  readonly scope: string;
  /** Substantivo da contagem, no singular e no plural. */
  readonly noun: { readonly one: string; readonly other: string };
  /** Critério literal da régua, lido logo depois da contagem; `{limit}` recebe o limite em dias. */
  readonly criterion: string;
  /** Limite da régua em dias, escrito com formatDays. */
  readonly limitDays: number;
  /** Casos fora da régua; 0 é estado calmo medido, `null` é régua não avaliada. */
  readonly count: number | null;
  /** Dia da avaliação da régua, YYYY-MM-DD. */
  readonly evaluatedOn: string;
  /** Caminho relativo da lista dos casos no Farol. */
  readonly listHref: string;
}

export const data: ExceptionRule = {
  id: 'regua-sem-movimento-30-dias',
  scope: 'Funil de vendas',
  noun: { one: 'oportunidade aberta', other: 'oportunidades abertas' },
  criterion: 'sem movimento de etapa há mais de {limit}',
  limitDays: 30,
  count: 7,
  evaluatedOn: '2026-09-14',
  listHref: '/comercial/oportunidades?regua=sem-movimento-30-dias',
};
