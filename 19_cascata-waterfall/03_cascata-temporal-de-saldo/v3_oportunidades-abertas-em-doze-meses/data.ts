/**
 * Movimento mensal da carteira comercial de oportunidades abertas, de 2025-09 a 2026-08, em
 * oportunidades. A carteira abre o período com 138 e fecha com 211. Cada mês soma as entradas e
 * subtrai as ganhas, as perdidas e as paradas há mais de 30 dias arquivadas; o movimento líquido
 * do mês é a conta. Fevereiro fecha com líquido zero (9 − 3 − 4 − 2) e continua no dado.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Fechamento: 138 + 73 de movimento líquido nos doze meses = 211.
 */
export interface PipelineMonth {
  readonly month: string;
  readonly entered: number;
  readonly won: number;
  readonly lost: number;
  readonly archived: number;
}

/** Oportunidades abertas na carteira antes do primeiro mês (fim de 2025-08). */
export const openingStock = 138;
/** Rótulo do mês-base, escrito junto do valor de abertura. */
export const openingMonth = '2025-08';

export const data: readonly PipelineMonth[] = [
  { month: '2025-09', entered: 19, won: 6, lost: 4, archived: 2 },
  { month: '2025-10', entered: 17, won: 5, lost: 4, archived: 2 },
  { month: '2025-11', entered: 21, won: 6, lost: 5, archived: 2 },
  { month: '2025-12', entered: 15, won: 4, lost: 4, archived: 2 },
  { month: '2026-01', entered: 20, won: 6, lost: 5, archived: 2 },
  { month: '2026-02', entered: 9, won: 3, lost: 4, archived: 2 },
  { month: '2026-03', entered: 22, won: 7, lost: 4, archived: 2 },
  { month: '2026-04', entered: 18, won: 6, lost: 4, archived: 2 },
  { month: '2026-05', entered: 20, won: 6, lost: 5, archived: 2 },
  { month: '2026-06', entered: 19, won: 6, lost: 5, archived: 2 },
  { month: '2026-07', entered: 18, won: 5, lost: 5, archived: 2 },
  { month: '2026-08', entered: 19, won: 6, lost: 5, archived: 2 },
];
