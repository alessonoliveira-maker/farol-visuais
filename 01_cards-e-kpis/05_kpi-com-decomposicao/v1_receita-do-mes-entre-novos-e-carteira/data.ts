/**
 * Receita reconhecida no mês, em reais, e as partes que a formam por soma: clientes novos e carteira.
 * Dado fictício e fixo: nenhum valor é de empresa real.
 *
 * O caso difícil está no tamanho: clientes novos são uma parte pequena (menos de 7% do total), que
 * precisa continuar legível ao lado da carteira. Se as partes não fecharem o total, o cartão escreve o
 * resto como "Sem classificação" em vez de deixar o buraco calado.
 */
export interface RevenuePart {
  readonly id: string;
  readonly label: string;
  /** Valor em reais; as partes somadas precisam chegar ao total. */
  readonly value: number;
}

export interface RevenueComposition {
  readonly label: string;
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Total do mês em reais, ou `null` quando não houve coleta. */
  readonly total: number | null;
  /** Partes na ordem da configuração da métrica, não do valor. */
  readonly parts: readonly RevenuePart[];
}

export const data: RevenueComposition = {
  label: 'Receita reconhecida',
  month: '2026-08',
  total: 612_490,
  parts: [
    { id: 'new-clients', label: 'Clientes novos', value: 41_380 },
    { id: 'portfolio', label: 'Carteira', value: 571_110 },
  ],
};
