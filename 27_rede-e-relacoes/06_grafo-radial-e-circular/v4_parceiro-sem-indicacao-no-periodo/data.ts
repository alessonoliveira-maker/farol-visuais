/**
 * Indicações do parceiro fictício P12 e o trimestre em análise, o terceiro de 2026. Cada linha de
 * `referrals` é uma conta indicada pelo parceiro, com a data do registro. Unidade: contas. Dado
 * fictício e fixo: parceiro e contas aparecem só como código, e nenhum código é empresa ou pessoa
 * real.
 *
 * O caso que a versão existe para mostrar: a carteira de P12 foi carregada (`loaded` é verdadeiro,
 * com a data do último carregamento) e nenhuma indicação cai dentro do trimestre. Isso é zero
 * medido. Parceiro com `loaded` falso é outra coisa: não há dado para dizer se indicou ou não, e o
 * componente troca o cartão inteiro pelo estado de ausência de instrumento.
 *
 * As cinco indicações são de trimestres anteriores, em ordem de cadastro e não de data, de
 * propósito: quem acha a última e ordena o anel do histórico é o componente. Duas delas caem no
 * mesmo trimestre, e a mais antiga é de 2025, para o histórico atravessar a virada do ano.
 */
export interface PartnerReferral {
  /** Código da conta indicada. */
  readonly account: string;
  /** Data do registro da indicação, em `YYYY-MM-DD`. */
  readonly date: string;
}

export interface PartnerPeriod {
  /** Código do parceiro no centro do grafo. */
  readonly partner: string;
  /** Ano do trimestre em análise. */
  readonly year: number;
  /** Trimestre em análise, de 1 a 4. */
  readonly quarter: 1 | 2 | 3 | 4;
  /** A carteira do parceiro foi carregada? Falso é ausência de dado, nunca zero. */
  readonly loaded: boolean;
  /** Data do último carregamento da carteira, em `YYYY-MM-DD`. */
  readonly loadedUntil: string;
  /** Todas as indicações registradas do parceiro, de qualquer trimestre. */
  readonly referrals: readonly PartnerReferral[];
}

export const data: PartnerPeriod = {
  partner: 'P12',
  year: 2026,
  quarter: 3,
  loaded: true,
  loadedUntil: '2026-09-30',
  referrals: [
    { account: 'C58', date: '2026-02-03' },
    { account: 'C52', date: '2025-10-21' },
    { account: 'C63', date: '2026-05-14' },
    { account: 'C55', date: '2025-12-09' },
    { account: 'C61', date: '2026-03-18' },
  ],
};
