/**
 * Fechamentos por dia em 2026, agrupados por mês, para ler o efeito de dia do mês. Dado fictício e
 * fixo: contagem de oportunidades ganhas em cada dia, uma posição por dia medido, do dia 1 em diante.
 * Zero é medido e quer dizer que o dia teve trabalho e nenhum fechamento; dia que não existe no
 * calendário e dia ainda não medido simplesmente não têm posição no array.
 *
 * O comprimento de cada lista é a máscara de validade da data, e é ele que impede o desenho de
 * inventar 30 de fevereiro: fevereiro tem 28 posições, abril tem 30, setembro tem 14 porque a medição
 * para em 14 de setembro, e outubro, novembro e dezembro vêm vazios porque ainda não aconteceram.
 *
 * O dado exercita o padrão que a versão existe para provar: os últimos cinco dias úteis de cada mês
 * concentram parte grande dos fechamentos, e o fim de semana fica em zero.
 */

export interface MonthDeals {
  /** Mês em `YYYY-MM`. */
  readonly month: string;
  /** Uma posição por dia medido, a partir do dia 1. Mês sem nenhuma medição vem vazio. */
  readonly days: readonly number[];
}

export const data: readonly MonthDeals[] = [
  { month: '2026-01', days: [0, 1, 0, 0, 2, 1, 1, 1, 1, 0, 0, 1, 2, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 4, 3, 3, 3, 2, 0] },
  { month: '2026-02', days: [0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2, 0, 0, 0, 0, 1, 1, 1, 0, 0, 3, 4, 2, 3, 2, 0] },
  { month: '2026-03', days: [0, 2, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2, 0, 0, 2, 1, 1, 1, 2, 0, 0, 2, 1, 2, 2, 2, 0, 0, 3, 2] },
  { month: '2026-04', days: [2, 1, 0, 0, 0, 1, 2, 2, 1, 2, 0, 0, 1, 1, 2, 1, 2, 0, 0, 2, 0, 2, 1, 3, 0, 0, 4, 3, 3, 3] },
  { month: '2026-05', days: [0, 0, 0, 1, 2, 1, 1, 1, 0, 0, 1, 2, 1, 2, 2, 0, 0, 1, 1, 1, 1, 1, 0, 0, 4, 3, 3, 2, 2, 0, 0] },
  { month: '2026-06', days: [1, 1, 1, 0, 1, 0, 0, 1, 2, 1, 1, 1, 0, 0, 2, 2, 2, 1, 2, 0, 0, 1, 2, 2, 2, 3, 0, 0, 3, 2] },
  { month: '2026-07', days: [1, 1, 1, 0, 0, 1, 1, 1, 2, 1, 0, 0, 2, 1, 1, 1, 1, 0, 0, 2, 1, 2, 2, 1, 0, 0, 3, 4, 4, 3, 3] },
  { month: '2026-08', days: [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 2, 1, 1, 1, 1, 0, 0, 1, 3, 3, 2, 4, 0, 0, 3] },
  { month: '2026-09', days: [1, 1, 2, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1] },
  { month: '2026-10', days: [] },
  { month: '2026-11', days: [] },
  { month: '2026-12', days: [] },
];
