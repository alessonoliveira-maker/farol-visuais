/**
 * Entradas e saídas semanais de oportunidades do funil comercial, 16 semanas de 2026, em
 * contagem. Entradas é sempre positivo; saída por ganho e saída por perda são sempre negativas.
 * Reclassificação é a mesma categoria de origem, mas o sinal alterna semana a semana (entra
 * quando o funil recebe uma oportunidade de outro pipeline, sai quando perde uma para outro);
 * por isso vem em duas colunas, a positiva e a negativa, que nunca têm valor no mesmo instante.
 * Dado fictício e fixo.
 */
export interface WeeklyOpportunityFlow {
  readonly week: string;
  readonly entradas: number;
  readonly saidaGanho: number;
  readonly saidaPerda: number;
  readonly reclassificacaoEntrada: number;
  readonly reclassificacaoSaida: number;
}

export const data: readonly WeeklyOpportunityFlow[] = [
  { week: '2026-04-06', entradas: 31, saidaGanho: -6, saidaPerda: -21, reclassificacaoEntrada: 0, reclassificacaoSaida: -7 },
  { week: '2026-04-13', entradas: 40, saidaGanho: -6, saidaPerda: -22, reclassificacaoEntrada: 0, reclassificacaoSaida: -4 },
  { week: '2026-04-20', entradas: 41, saidaGanho: -7, saidaPerda: -22, reclassificacaoEntrada: 4, reclassificacaoSaida: 0 },
  { week: '2026-04-27', entradas: 41, saidaGanho: -7, saidaPerda: -25, reclassificacaoEntrada: 0, reclassificacaoSaida: 0 },
  { week: '2026-05-04', entradas: 40, saidaGanho: -9, saidaPerda: -22, reclassificacaoEntrada: 3, reclassificacaoSaida: 0 },
  { week: '2026-05-11', entradas: 44, saidaGanho: -8, saidaPerda: -22, reclassificacaoEntrada: 0, reclassificacaoSaida: 0 },
  { week: '2026-05-18', entradas: 41, saidaGanho: -8, saidaPerda: -19, reclassificacaoEntrada: 6, reclassificacaoSaida: 0 },
  { week: '2026-05-25', entradas: 35, saidaGanho: -8, saidaPerda: -14, reclassificacaoEntrada: 0, reclassificacaoSaida: -5 },
  { week: '2026-06-01', entradas: 32, saidaGanho: -8, saidaPerda: -17, reclassificacaoEntrada: 6, reclassificacaoSaida: 0 },
  { week: '2026-06-08', entradas: 29, saidaGanho: -8, saidaPerda: -10, reclassificacaoEntrada: 3, reclassificacaoSaida: 0 },
  { week: '2026-06-15', entradas: 22, saidaGanho: -7, saidaPerda: -10, reclassificacaoEntrada: 0, reclassificacaoSaida: -6 },
  { week: '2026-06-22', entradas: 27, saidaGanho: -9, saidaPerda: -13, reclassificacaoEntrada: 4, reclassificacaoSaida: 0 },
  { week: '2026-06-29', entradas: 28, saidaGanho: -8, saidaPerda: -12, reclassificacaoEntrada: 0, reclassificacaoSaida: -6 },
  { week: '2026-07-06', entradas: 28, saidaGanho: -7, saidaPerda: -9, reclassificacaoEntrada: 0, reclassificacaoSaida: 0 },
  { week: '2026-07-13', entradas: 36, saidaGanho: -8, saidaPerda: -10, reclassificacaoEntrada: 4, reclassificacaoSaida: 0 },
  { week: '2026-07-20', entradas: 34, saidaGanho: -8, saidaPerda: -13, reclassificacaoEntrada: 6, reclassificacaoSaida: 0 },
];
