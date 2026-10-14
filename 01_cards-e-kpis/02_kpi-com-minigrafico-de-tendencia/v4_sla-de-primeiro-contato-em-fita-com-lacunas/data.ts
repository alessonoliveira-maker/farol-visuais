/**
 * Cumprimento diário do SLA de primeiro contato em 60 dias corridos, um estado por dia.
 * `dentro` e `fora` são dias úteis avaliados; `sem_dado` é dia útil sem coleta da fonte
 * (não conta no denominador); `fim_de_semana` é dia não útil, também fora do denominador.
 * Dado fictício e fixo.
 */
export type SlaDayState = 'dentro' | 'fora' | 'sem_dado' | 'fim_de_semana';

export interface SlaDay {
  /** Data no formato YYYY-MM-DD. */
  readonly date: string;
  readonly state: SlaDayState;
}

export interface SlaTracker {
  readonly label: string;
  /** Prazo do SLA de primeiro contato, em horas. */
  readonly thresholdHours: number;
  readonly days: readonly SlaDay[];
}

export const data: SlaTracker = {
  label: 'SLA de primeiro contato',
  thresholdHours: 4,
  days: [
    { date: '2026-07-06', state: 'dentro' },
    { date: '2026-07-07', state: 'dentro' },
    { date: '2026-07-08', state: 'dentro' },
    { date: '2026-07-09', state: 'fora' },
    { date: '2026-07-10', state: 'dentro' },
    { date: '2026-07-11', state: 'fim_de_semana' },
    { date: '2026-07-12', state: 'fim_de_semana' },
    { date: '2026-07-13', state: 'dentro' },
    { date: '2026-07-14', state: 'dentro' },
    { date: '2026-07-15', state: 'dentro' },
    { date: '2026-07-16', state: 'dentro' },
    { date: '2026-07-17', state: 'dentro' },
    { date: '2026-07-18', state: 'fim_de_semana' },
    { date: '2026-07-19', state: 'fim_de_semana' },
    { date: '2026-07-20', state: 'dentro' },
    { date: '2026-07-21', state: 'dentro' },
    { date: '2026-07-22', state: 'fora' },
    { date: '2026-07-23', state: 'dentro' },
    { date: '2026-07-24', state: 'dentro' },
    { date: '2026-07-25', state: 'fim_de_semana' },
    { date: '2026-07-26', state: 'fim_de_semana' },
    { date: '2026-07-27', state: 'dentro' },
    { date: '2026-07-28', state: 'dentro' },
    { date: '2026-07-29', state: 'dentro' },
    { date: '2026-07-30', state: 'dentro' },
    { date: '2026-07-31', state: 'dentro' },
    { date: '2026-08-01', state: 'fim_de_semana' },
    { date: '2026-08-02', state: 'fim_de_semana' },
    { date: '2026-08-03', state: 'sem_dado' },
    { date: '2026-08-04', state: 'sem_dado' },
    { date: '2026-08-05', state: 'sem_dado' },
    { date: '2026-08-06', state: 'sem_dado' },
    { date: '2026-08-07', state: 'sem_dado' },
    { date: '2026-08-08', state: 'fim_de_semana' },
    { date: '2026-08-09', state: 'fim_de_semana' },
    { date: '2026-08-10', state: 'sem_dado' },
    { date: '2026-08-11', state: 'sem_dado' },
    { date: '2026-08-12', state: 'sem_dado' },
    { date: '2026-08-13', state: 'sem_dado' },
    { date: '2026-08-14', state: 'sem_dado' },
    { date: '2026-08-15', state: 'fim_de_semana' },
    { date: '2026-08-16', state: 'fim_de_semana' },
    { date: '2026-08-17', state: 'dentro' },
    { date: '2026-08-18', state: 'dentro' },
    { date: '2026-08-19', state: 'dentro' },
    { date: '2026-08-20', state: 'dentro' },
    { date: '2026-08-21', state: 'dentro' },
    { date: '2026-08-22', state: 'fim_de_semana' },
    { date: '2026-08-23', state: 'fim_de_semana' },
    { date: '2026-08-24', state: 'dentro' },
    { date: '2026-08-25', state: 'dentro' },
    { date: '2026-08-26', state: 'fora' },
    { date: '2026-08-27', state: 'dentro' },
    { date: '2026-08-28', state: 'dentro' },
    { date: '2026-08-29', state: 'fim_de_semana' },
    { date: '2026-08-30', state: 'fim_de_semana' },
    { date: '2026-08-31', state: 'dentro' },
    { date: '2026-09-01', state: 'dentro' },
    { date: '2026-09-02', state: 'dentro' },
    { date: '2026-09-03', state: 'dentro' },
  ],
};
