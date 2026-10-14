/**
 * Receita reconhecida no 3º trimestre de 2026 contra a meta, com o calendário de dias úteis do
 * trimestre, em reais. Fotografia do último dia útil fechado. Dado fictício e fixo: nenhuma empresa
 * nem pessoa real.
 *
 * `businessDaysElapsed: 0` é o primeiro dia do período: ainda não há ritmo medido, nada se projeta e
 * o cartão não divide por zero. `realized: null` é período sem coleta; `goal: null`, sem meta.
 */
export interface PacedGoal {
  /** Nome da métrica com o período, como a pessoa lê no topo do cartão. */
  readonly label: string;
  /** Último dia útil fechado, YYYY-MM-DD. */
  readonly asOf: string;
  /** Realizado acumulado até `asOf`, ou `null` sem coleta. */
  readonly realized: number | null;
  /** Meta do período inteiro, ou `null` quando ainda não foi declarada. */
  readonly goal: number | null;
  /** Dias úteis fechados até `asOf`, inclusive. */
  readonly businessDaysElapsed: number;
  /** Dias úteis do período inteiro, pelo calendário da praça. */
  readonly businessDaysTotal: number;
}

export const data: PacedGoal = {
  label: 'Receita reconhecida no 3º trimestre',
  asOf: '2026-08-31',
  realized: 345_000,
  goal: 600_000,
  businessDaysElapsed: 44,
  businessDaysTotal: 63,
};
