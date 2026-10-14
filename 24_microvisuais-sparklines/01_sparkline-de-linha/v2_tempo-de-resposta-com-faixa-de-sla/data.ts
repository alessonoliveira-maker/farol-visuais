/**
 * Tempo da primeira resposta ao lead, em horas, por dia útil, nos últimos 20 dias úteis de Pré-vendas.
 * A faixa do SLA contratado vai de 0 a `slaLimitHours`: o dia que fecha exatamente em 4,0 h está
 * dentro (empate no limite), e três dias passam dele. Dado fictício e fixo.
 */
export interface ResponseDayPoint {
  /** Dia útil no formato YYYY-MM-DD. */
  readonly date: string;
  /** Tempo mediano da primeira resposta no dia, em horas, ou `null` quando o dia não foi medido. */
  readonly hours: number | null;
}

export interface ResponseSlaTrend {
  readonly label: string;
  /** Limite superior do SLA contratado, em horas. */
  readonly slaLimitHours: number;
  readonly series: readonly ResponseDayPoint[];
}

export const data: ResponseSlaTrend = {
  label: 'Primeira resposta ao lead',
  slaLimitHours: 4,
  series: [
    { date: '2026-09-07', hours: 2.8 },
    { date: '2026-09-08', hours: 3.1 },
    { date: '2026-09-09', hours: 2.6 },
    { date: '2026-09-10', hours: 3.4 },
    { date: '2026-09-11', hours: 3.9 },
    { date: '2026-09-14', hours: 2.7 },
    { date: '2026-09-15', hours: 4.6 },
    { date: '2026-09-16', hours: 3.2 },
    { date: '2026-09-17', hours: 2.9 },
    { date: '2026-09-18', hours: 3.6 },
    { date: '2026-09-21', hours: 3.0 },
    { date: '2026-09-22', hours: 2.4 },
    { date: '2026-09-23', hours: 3.7 },
    { date: '2026-09-24', hours: 5.3 },
    { date: '2026-09-25', hours: 3.5 },
    { date: '2026-09-28', hours: 2.8 },
    { date: '2026-09-29', hours: 3.3 },
    { date: '2026-09-30', hours: 3.8 },
    { date: '2026-10-01', hours: 4.0 },
    { date: '2026-10-02', hours: 4.9 },
  ],
};
