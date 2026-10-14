/**
 * Fila de primeiro contato aguardando resposta, em contagem inteira, por semana, de
 * 2026-08-03 a 2026-10-26. Dado fictício e fixo: nenhuma empresa ou pessoa real. `real` traz o
 * medido até a semana de corte; `projected` traz a projeção dali em diante. A semana de corte
 * aparece nas duas chaves com o mesmo valor, para a linha não abrir buraco na virada.
 */
export interface WeeklyQueueForecast {
  readonly week: string;
  readonly real: number | null;
  readonly projected: number | null;
}

export const data: readonly WeeklyQueueForecast[] = [
  { week: '2026-08-03', real: 28, projected: null },
  { week: '2026-08-10', real: 31, projected: null },
  { week: '2026-08-17', real: 29, projected: null },
  { week: '2026-08-24', real: 34, projected: null },
  { week: '2026-08-31', real: 33, projected: null },
  { week: '2026-09-07', real: 37, projected: null },
  { week: '2026-09-14', real: 40, projected: 40 },
  { week: '2026-09-21', real: null, projected: 43 },
  { week: '2026-09-28', real: null, projected: 46 },
  { week: '2026-10-05', real: null, projected: 49 },
  { week: '2026-10-12', real: null, projected: 52 },
  { week: '2026-10-19', real: null, projected: 55 },
  { week: '2026-10-26', real: null, projected: 58 },
];

/** Semana de corte entre o medido e a projeção. */
export const cutoffWeek = '2026-09-14';

/** Teto de capacidade da fila de primeiro contato. */
export const capacityCeiling = 50;

/** Método da projeção, declarado por extenso porque a zona tracejada não nasce sem ele. */
export const queueMethod = 'Projeção linear pela taxa média de crescimento das 4 semanas medidas antes do corte.';
