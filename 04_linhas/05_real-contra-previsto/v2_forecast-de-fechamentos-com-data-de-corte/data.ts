/**
 * Fechamentos por semana, em contagem inteira, de 2026-08-03 a 2026-12-28. Dado fictício e
 * fixo: nenhuma empresa ou pessoa real. `real` traz o medido até a data de corte; `projected`
 * traz o forecast dali até o fim do ano. A semana de corte aparece nas duas chaves com o mesmo
 * valor, para a linha não abrir buraco na virada.
 */
export interface WeeklyClosingsForecast {
  readonly week: string;
  readonly real: number | null;
  readonly projected: number | null;
}

export const data: readonly WeeklyClosingsForecast[] = [
  { week: '2026-08-03', real: 9, projected: null },
  { week: '2026-08-10', real: 11, projected: null },
  { week: '2026-08-17', real: 8, projected: null },
  { week: '2026-08-24', real: 13, projected: null },
  { week: '2026-08-31', real: 10, projected: null },
  { week: '2026-09-07', real: 12, projected: null },
  { week: '2026-09-14', real: 14, projected: 14 },
  { week: '2026-09-21', real: null, projected: 13 },
  { week: '2026-09-28', real: null, projected: 14 },
  { week: '2026-10-05', real: null, projected: 15 },
  { week: '2026-10-12', real: null, projected: 14 },
  { week: '2026-10-19', real: null, projected: 13 },
  { week: '2026-10-26', real: null, projected: 14 },
  { week: '2026-11-02', real: null, projected: 15 },
  { week: '2026-11-09', real: null, projected: 14 },
  { week: '2026-11-16', real: null, projected: 13 },
  { week: '2026-11-23', real: null, projected: 14 },
  { week: '2026-11-30', real: null, projected: 15 },
  { week: '2026-12-07', real: null, projected: 14 },
  { week: '2026-12-14', real: null, projected: 13 },
  { week: '2026-12-21', real: null, projected: 14 },
  { week: '2026-12-28', real: null, projected: 15 },
];

/** Data de corte entre o medido e o forecast. */
export const cutoffWeek = '2026-09-14';

/** Método do forecast, declarado por extenso porque a zona projetada não nasce sem ele. */
export const forecastMethod = 'Forecast pela média móvel das 4 semanas medidas antes do corte.';
