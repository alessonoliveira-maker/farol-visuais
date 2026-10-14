/**
 * Leads contatados em 2026-08, contados pela faixa de horas entre a entrada e o primeiro contato
 * e pelo resultado da qualificação. Contagem de leads. Dado fictício e fixo: nenhum número vem
 * de base real. O x é contínuo (horas) cortado em faixas de limites declarados: `from` incluso e
 * `to` incluso, e `to: null` quer dizer sem teto. A regra de SLA do painel é de 1 hora, e a faixa
 * que termina nela é a única dentro do SLA. As faixas vêm na ordem do tempo, e o componente não
 * reordena.
 */
export interface ContactBand {
  readonly id: string;
  /** Limite inferior da faixa, em horas. */
  readonly from: number;
  /** Limite superior da faixa, em horas; `null` na faixa aberta. */
  readonly to: number | null;
  /** Leads qualificados: a parte da base, com linha de base comum entre colunas. */
  readonly qualified: number;
  /** Leads que não qualificaram: a parte de cima, o complemento. */
  readonly notQualified: number;
}

/** Prazo de primeiro contato do painel, em horas (regra de SLA). */
export const slaHours = 1;

export const data: readonly ContactBand[] = [
  { id: 'ate-1h', from: 0, to: 1, qualified: 77, notQualified: 109 },
  { id: '1-a-4h', from: 1, to: 4, qualified: 88, notQualified: 154 },
  { id: '4-a-24h', from: 4, to: 24, qualified: 63, notQualified: 135 },
  { id: 'acima-24h', from: 24, to: null, qualified: 21, notQualified: 83 },
];
