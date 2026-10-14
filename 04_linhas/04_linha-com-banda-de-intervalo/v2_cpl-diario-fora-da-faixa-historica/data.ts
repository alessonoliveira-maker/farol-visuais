/**
 * Custo por lead (CPL) diário de mídia paga, em reais, de 2026-06-06 a 2026-08-31.
 * Os primeiros 56 dias (8 semanas) alimentam a faixa móvel de mínimo e máximo; o gráfico exibe
 * só agosto, quando a janela de 8 semanas anteriores já está completa. Dado fictício e fixo.
 */
export interface DailyCpl {
  readonly date: string;
  readonly cpl: number;
}

export const data: readonly DailyCpl[] = [
  { date: '2026-06-06', cpl: 52.2 }, { date: '2026-06-07', cpl: 53.8 }, { date: '2026-06-08', cpl: 46.3 },
  { date: '2026-06-09', cpl: 43.7 }, { date: '2026-06-10', cpl: 44.6 }, { date: '2026-06-11', cpl: 45.8 },
  { date: '2026-06-12', cpl: 43.5 }, { date: '2026-06-13', cpl: 57.8 }, { date: '2026-06-14', cpl: 59.2 },
  { date: '2026-06-15', cpl: 49.1 }, { date: '2026-06-16', cpl: 44.5 }, { date: '2026-06-17', cpl: 46.3 },
  { date: '2026-06-18', cpl: 45.0 }, { date: '2026-06-19', cpl: 50.1 }, { date: '2026-06-20', cpl: 61.4 },
  { date: '2026-06-21', cpl: 56.8 }, { date: '2026-06-22', cpl: 51.2 }, { date: '2026-06-23', cpl: 51.0 },
  { date: '2026-06-24', cpl: 48.5 }, { date: '2026-06-25', cpl: 48.0 }, { date: '2026-06-26', cpl: 44.4 },
  { date: '2026-06-27', cpl: 54.5 }, { date: '2026-06-28', cpl: 57.5 }, { date: '2026-06-29', cpl: 42.2 },
  { date: '2026-06-30', cpl: 42.6 }, { date: '2026-07-01', cpl: 42.3 }, { date: '2026-07-02', cpl: 40.2 },
  { date: '2026-07-03', cpl: 42.6 }, { date: '2026-07-04', cpl: 52.3 }, { date: '2026-07-05', cpl: 54.3 },
  { date: '2026-07-06', cpl: 41.0 }, { date: '2026-07-07', cpl: 41.2 }, { date: '2026-07-08', cpl: 39.6 },
  { date: '2026-07-09', cpl: 40.1 }, { date: '2026-07-10', cpl: 38.1 }, { date: '2026-07-11', cpl: 45.8 },
  { date: '2026-07-12', cpl: 50.3 }, { date: '2026-07-13', cpl: 40.5 }, { date: '2026-07-14', cpl: 39.1 },
  { date: '2026-07-15', cpl: 37.9 }, { date: '2026-07-16', cpl: 34.9 }, { date: '2026-07-17', cpl: 34.2 },
  { date: '2026-07-18', cpl: 43.5 }, { date: '2026-07-19', cpl: 42.0 }, { date: '2026-07-20', cpl: 38.0 },
  { date: '2026-07-21', cpl: 35.5 }, { date: '2026-07-22', cpl: 38.9 }, { date: '2026-07-23', cpl: 36.0 },
  { date: '2026-07-24', cpl: 40.3 }, { date: '2026-07-25', cpl: 49.4 }, { date: '2026-07-26', cpl: 44.0 },
  { date: '2026-07-27', cpl: 36.5 }, { date: '2026-07-28', cpl: 42.0 }, { date: '2026-07-29', cpl: 39.5 },
  { date: '2026-07-30', cpl: 43.7 }, { date: '2026-07-31', cpl: 40.3 },
  { date: '2026-08-01', cpl: 49.1 }, { date: '2026-08-02', cpl: 53.8 }, { date: '2026-08-03', cpl: 44.9 },
  { date: '2026-08-04', cpl: 42.0 }, { date: '2026-08-05', cpl: 41.4 }, { date: '2026-08-06', cpl: 43.7 },
  /** Pico isolado: caso difícil de valor acima da faixa móvel. */
  { date: '2026-08-07', cpl: 78.4 },
  { date: '2026-08-08', cpl: 59.2 }, { date: '2026-08-09', cpl: 55.3 }, { date: '2026-08-10', cpl: 45.1 },
  { date: '2026-08-11', cpl: 44.4 }, { date: '2026-08-12', cpl: 44.4 }, { date: '2026-08-13', cpl: 49.8 },
  { date: '2026-08-14', cpl: 45.6 }, { date: '2026-08-15', cpl: 60.4 }, { date: '2026-08-16', cpl: 59.6 },
  { date: '2026-08-17', cpl: 45.8 }, { date: '2026-08-18', cpl: 49.4 },
  /** Vale isolado: caso difícil de valor abaixo da faixa móvel. */
  { date: '2026-08-19', cpl: 21.6 },
  { date: '2026-08-20', cpl: 48.3 }, { date: '2026-08-21', cpl: 44.3 }, { date: '2026-08-22', cpl: 57.7 },
  { date: '2026-08-23', cpl: 55.6 }, { date: '2026-08-24', cpl: 44.0 }, { date: '2026-08-25', cpl: 48.4 },
  { date: '2026-08-26', cpl: 46.6 }, { date: '2026-08-27', cpl: 42.5 },
  { date: '2026-08-28', cpl: 74.9 },
  { date: '2026-08-29', cpl: 51.2 }, { date: '2026-08-30', cpl: 51.6 }, { date: '2026-08-31', cpl: 43.7 },
];
