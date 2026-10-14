/**
 * Fechamentos por dia no ano corrente, de 2026-01-01 até a data de referência do recorte. Dado
 * fictício e fixo: uma posição por dia de calendário, na ordem, com a contagem de oportunidades
 * ganhas naquele dia. Dia sem fechamento é zero medido, não ausência: o comercial trabalhou e não
 * fechou. Dia futuro simplesmente não existe no array, e é isso que corta o calendário na diagonal.
 *
 * O dado exercita três casos difíceis de propósito: fim de semana quase todo em zero, oito dias
 * úteis com zero fechamentos espalhados pelo ano, e a concentração de fim de mês, que é o padrão
 * que o calendário existe para mostrar.
 */

/** Primeiro dia desenhado, em `YYYY-MM-DD`. A grade começa na semana que contém esta data. */
export const FIRST_DAY = '2026-01-01';

/** Último dia com medição. Depois dele não se desenha célula nenhuma. */
export const LAST_DAY = '2026-09-14';

/** Uma posição por dia entre FIRST_DAY e LAST_DAY, na ordem do calendário. */
export const data: readonly number[] = [
  0, 1, 0, 0, 1, 2, 1, 1, 2, 1, 0, 2, 2, 2, 2, 2, 0, 0, 1, 3, 2, 3, 2, 0, 0,
  2, 2, 4, 4, 3, 0, 1, 2, 2, 1, 1, 3, 0, 0, 2, 1, 3, 1, 2, 1, 0, 0, 0, 2, 2,
  2, 1, 0, 1, 2, 2, 4, 4, 1, 0, 2, 1, 1, 2, 2, 1, 0, 2, 3, 3, 1, 1, 0, 1, 1,
  2, 2, 2, 2, 0, 0, 1, 2, 3, 2, 2, 0, 0, 3, 3, 1, 1, 0, 1, 1, 2, 2, 2, 3, 2,
  0, 0, 1, 1, 2, 3, 2, 0, 0, 2, 0, 1, 2, 1, 0, 0, 4, 4, 5, 4, 0, 0, 0, 1, 2,
  2, 2, 2, 0, 0, 2, 1, 2, 2, 2, 0, 0, 2, 1, 2, 2, 2, 0, 1, 2, 2, 2, 3, 3, 1,
  0, 1, 1, 1, 0, 1, 0, 0, 2, 2, 2, 2, 1, 1, 0, 2, 2, 2, 1, 2, 0, 0, 2, 2, 2,
  2, 2, 0, 0, 4, 5, 1, 1, 1, 0, 0, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 3, 1, 0,
  2, 2, 2, 1, 1, 1, 0, 2, 4, 4, 5, 4, 0, 0, 1, 2, 1, 2, 1, 1, 0, 3, 3, 2, 2,
  1, 0, 0, 1, 2, 2, 2, 2, 0, 0, 1, 3, 2, 2, 4, 0, 0, 5, 1, 1, 1, 2, 0, 0, 0,
  2, 1, 1, 2, 0, 0, 2
];
