/**
 * Receita reconhecida no 3º trimestre de 2026 contra a meta do trimestre, em reais, na fotografia
 * do último dia fechado. Dado fictício e fixo: nenhuma empresa nem pessoa real.
 *
 * `realized: null` é trimestre sem coleta (o cartão escreve "indisponível", nunca zero) e
 * `goal: null` é trimestre sem meta declarada (o cartão não divide por zero nem inventa 100%).
 */
export interface QuarterGoal {
  /** Nome da métrica com o período, como a pessoa lê no topo do cartão. */
  readonly label: string;
  /** Último dia fechado da fotografia, YYYY-MM-DD. */
  readonly asOf: string;
  /** Receita reconhecida no período até `asOf`, ou `null` sem coleta. */
  readonly realized: number | null;
  /** Meta do período inteiro, ou `null` quando ainda não foi declarada. */
  readonly goal: number | null;
}

export const data: QuarterGoal = {
  label: 'Receita do 3º trimestre',
  asOf: '2026-08-31',
  realized: 412_380,
  goal: 600_000,
};
