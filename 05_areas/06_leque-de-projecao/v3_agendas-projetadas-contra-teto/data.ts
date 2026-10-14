/**
 * Agendas de reunião marcadas por semana na pré-vendas, contagem inteira, de S23 a S34 de 2026.
 * `week` é o rótulo curto da semana ISO; `mondayDate` é a segunda-feira daquela semana, em
 * `YYYY-MM-DD`, usada nas anotações. `real` é a contagem medida e fica nula a partir de S28; os
 * percentis nascem em S27 (ponto de junção, colapsados no valor real) e seguem até S34. Método
 * declarado: bootstrap da variação semanal das últimas 12 semanas (2.000 reamostragens) sobre o
 * último valor real; a partir de S28 o desenho é estimativa, não medição. `ceiling` é o teto de
 * capacidade semanal da pré-vendas, constante e medido à parte (não é percentil). Dado fictício
 * e fixo.
 */
export interface WeeklyBooking {
  readonly week: string;
  readonly mondayDate: string;
  readonly real: number | null;
  readonly p05: number | null;
  readonly p25: number | null;
  readonly median: number | null;
  readonly p75: number | null;
  readonly p95: number | null;
  readonly ceiling: number;
}

export const data: readonly WeeklyBooking[] = [
  { week: 'S23', mondayDate: '2026-06-01', real: 29, p05: null, p25: null, median: null, p75: null, p95: null, ceiling: 45 },
  { week: 'S24', mondayDate: '2026-06-08', real: 31, p05: null, p25: null, median: null, p75: null, p95: null, ceiling: 45 },
  { week: 'S25', mondayDate: '2026-06-15', real: 34, p05: null, p25: null, median: null, p75: null, p95: null, ceiling: 45 },
  { week: 'S26', mondayDate: '2026-06-22', real: 33, p05: null, p25: null, median: null, p75: null, p95: null, ceiling: 45 },
  { week: 'S27', mondayDate: '2026-06-29', real: 36, p05: 36, p25: 36, median: 36, p75: 36, p95: 36, ceiling: 45 },
  { week: 'S28', mondayDate: '2026-07-06', real: null, p05: 30, p25: 34, median: 38, p75: 42, p95: 47, ceiling: 45 },
  { week: 'S29', mondayDate: '2026-07-13', real: null, p05: 28, p25: 35, median: 40, p75: 45, p95: 52, ceiling: 45 },
  { week: 'S30', mondayDate: '2026-07-20', real: null, p05: 26, p25: 36, median: 42, p75: 48, p95: 57, ceiling: 45 },
  { week: 'S31', mondayDate: '2026-07-27', real: null, p05: 24, p25: 37, median: 44, p75: 51, p95: 63, ceiling: 45 },
  { week: 'S32', mondayDate: '2026-08-03', real: null, p05: 22, p25: 38, median: 46, p75: 54, p95: 69, ceiling: 45 },
  { week: 'S33', mondayDate: '2026-08-10', real: null, p05: 20, p25: 39, median: 48, p75: 57, p95: 75, ceiling: 45 },
  { week: 'S34', mondayDate: '2026-08-17', real: null, p05: 18, p25: 40, median: 50, p75: 60, p95: 81, ceiling: 45 },
];

/** Última semana medida: o ponto de junção onde o leque abre. */
export const todayWeek = 'S27';
