/**
 * Minutos entre a entrada do lead e o primeiro contato humano, no mês. Dado fictício,
 * determinístico, sem nenhuma correspondência com a base real.
 *
 * Uma observação por lead, na ordem de entrada. A ECDF não tem parâmetro nenhum: não escolhe bin
 * nem banda, é o dado exato virado escada. Por isso o array cru é o formato certo aqui, e qualquer
 * pré-agregação já seria uma escolha embutida.
 */

/** SLA de primeiro contato, em minutos. */
export const SLA_MINUTES = 30;

/**
 * Leads que entraram no mês e seguiam sem nenhum contato no momento da extração. Não têm tempo
 * medido e ficam fora da curva, contados no rodapé. Entrar como um valor grande inventaria uma
 * medição que não existe, e sair em silêncio empurraria a curva para cima de graça, que é o erro
 * mais confortável de todos.
 */
export const WITHOUT_CONTACT = 37;

/** Minutos até o primeiro contato humano, um valor por lead. */
export const data: readonly number[] = [
  22, 13, 23, 3, 46, 20, 42, 12, 38, 22, 44, 41, 32, 39, 8, 11, 37, 38, 20, 15, 30, 20, 26, 30,
  75, 6, 11, 5, 19, 18, 41, 25, 30, 8, 21, 32, 14, 5, 10, 19, 14, 18, 13, 8, 21, 11, 21, 14,
  13, 6, 92, 18, 19, 22, 34, 20, 11, 41, 20, 52, 13, 6, 4, 9, 49, 68, 23, 19, 106, 18, 58, 41,
  52, 48, 4, 25, 14, 15, 14, 22, 5, 177, 16, 3, 17, 63, 15, 17, 27, 6, 29, 21, 28, 25, 3, 62,
  22, 12, 136, 20, 9, 26, 53, 16, 155, 38, 5, 25, 8, 50, 23, 6, 63, 23, 20, 77, 20, 4, 5, 57,
  24, 19, 4, 19, 68, 42, 5, 15, 62, 10, 41, 4, 25, 20, 26, 9, 8, 3, 18, 37, 23, 4, 8, 29,
  5, 5, 13, 17, 5, 50, 25, 47, 21, 9, 7, 25, 79, 28, 61, 20, 11, 14, 23, 10, 11, 13, 2, 5,
  30, 31, 67, 17, 37, 9, 7, 18, 2, 16, 5, 42, 26, 14, 18, 3, 21, 91, 29, 8, 11, 15, 17, 36,
  19, 4, 40, 4, 45, 32, 11, 27, 50, 34, 46, 18, 7, 94, 15, 9, 22, 19, 38, 27, 101, 6, 31, 11,
  10, 2, 7, 65, 23, 15, 5, 12, 25, 18, 123, 84, 39, 3, 6, 24, 17, 29, 6, 12, 11, 7, 22, 16,
  21, 26, 2, 13, 31, 9, 29, 10, 10, 41, 12, 77, 27, 13, 7, 42, 12, 21, 19, 26, 32, 8, 19, 24,
  68, 8, 9, 2, 48, 32, 19, 21, 54, 10, 13, 28, 71, 162, 10, 19, 4, 12, 20, 17, 5, 4, 34, 27,
  41, 26, 15, 18, 8, 21, 13, 20, 13, 3, 24, 24, 263, 14, 51, 19, 85, 7, 17, 23, 10, 41, 28, 36,
  7, 107, 71, 10, 11, 7, 18, 6, 15, 15, 67, 35, 8, 20, 13, 7, 6, 69, 22, 18, 3, 93, 18, 4,
  48, 2, 130, 14, 87, 27, 72, 52, 7, 8, 21, 44, 11, 15, 14, 26, 35, 35, 43, 85, 32, 26, 60, 40,
  15, 49, 148, 22, 123, 143, 52, 43, 11, 12, 43, 179, 6, 28, 4, 96, 4, 46, 15, 3, 47, 6, 69, 22,
  19, 6, 23, 14, 9, 18, 41, 19, 25, 7, 38, 31, 27, 65, 6, 9, 5, 17, 14, 14, 17, 26, 26, 8,
  10, 117, 45, 48, 8, 15, 13, 3, 30, 8, 22, 31, 9, 47, 17, 29, 8, 8, 21, 6, 16, 13, 47, 25,
  9, 21, 95, 9, 11, 21, 29, 18, 13, 34, 12, 11, 14, 65, 7, 3, 13, 13, 8, 95, 22, 14, 9, 106,
  16, 23, 16, 58, 35, 112, 136, 79, 13, 6, 9, 78, 14, 317, 18, 26, 84, 36, 21, 14, 31, 19, 3, 3,];
