/**
 * Ciclo de fechamento das oportunidades ganhas nos últimos 12 meses, em dias corridos entre a
 * criação e o fechamento. Dado fictício, determinístico, sem nenhuma correspondência com a base
 * real.
 *
 * O array traz **uma observação por oportunidade**, não os bins já contados. Essa é a diferença
 * que importa: quem binar é o componente, com a largura que vem da régua da métrica, e por isso a
 * mesma amostra pode ser desenhada em faixa de 7 ou de 14 dias sem reescrever o dado. Se o dado já
 * chegasse binado, trocar a largura exigiria voltar à origem.
 *
 * A ordem é a de fechamento, não a crescente: ordenar aqui esconderia que o componente não depende
 * de ordem nenhuma.
 */

/** Largura do bin, em dias. Vem da régua da métrica e não muda com o filtro. */
export const BIN_WIDTH = 7;

/**
 * Domínio fixo do eixo, em dias. É da métrica, não da amostra: com domínio livre, dois recortes
 * diferentes desenhariam réguas diferentes e o leitor compararia formas que nunca foram
 * comparáveis. O preço é a faixa vazia à direita quando ninguém chega perto do teto, e esse preço
 * é menor que o da régua elástica.
 */
export const DOMAIN_MAX = 210;

/**
 * Oportunidades ganhas sem data de criação registrada, portanto sem ciclo calculável. Não entram
 * na amostra nem viram bin zero: são contadas no rodapé, como manda a regra de ausência.
 */
export const WITHOUT_CYCLE = 9;

/** Um valor por oportunidade ganha, em dias corridos, na ordem de fechamento. */
export const data: readonly number[] = [
  49, 159, 26, 30, 15, 91, 31, 103, 92, 8, 38, 10, 35, 98, 121, 38, 68, 68,
  10, 14, 23, 93, 33, 75, 10, 102, 136, 42, 19, 15, 175, 88, 105, 31, 53, 108,
  64, 81, 101, 6, 35, 119, 6, 68, 87, 134, 138, 124, 98, 18, 61, 18, 134, 143,
  36, 51, 39, 15, 64, 68, 27, 136, 74, 10, 8, 19, 51, 88, 97, 122, 105, 45,
  20, 17, 71, 83, 50, 40, 182, 69, 31, 19, 141, 72, 131, 29, 18, 33, 32, 50,
  54, 28, 149, 89, 153, 62, 84, 77, 114, 38, 59, 41, 40, 92, 110, 13, 77, 9,
  24, 60, 112, 70, 14, 42, 41, 115, 44, 62, 87, 117, 18, 141, 73, 36, 180, 102,
  35, 37, 12, 32, 36, 18, 16, 51, 90, 12, 41, 57, 12, 112, 31, 66, 57, 17,
  87, 48, 94, 23, 130, 54, 105, 41, 117, 25, 74, 10, 109, 42, 11, 27, 23, 71,
  10, 144, 124, 63, 134, 24, 115, 113, 36, 27, 36, 30, 108, 96, 40, 29, 27, 92,
  146, 61, 50, 53, 96, 20, 30, 88, 153, 133, 37, 92, 46, 86, 38, 57, 37, 39,
  50, 75, 16, 29, 103, 32, 57, 67, 51, 181, 41, 53, 34, 109, 42, 42, 59, 34,
  21, 78, 44, 39, 74, 97, 77, 42, 192, 39, 89, 65, 45, 72, 47, 155, 83, 44,
  15, 20, 149, 41, 61, 120, 80, 28, 15, 59, 36, 25, 82, 18, 11, 63, 16, 23,
  193, 61, 143, 27, 27, 42, 28, 159, 45, 94, 11, 84, 44, 142, 9, 41, 47, 57,
  124, 24, 24, 26, 61, 75, 184, 28, 96, 157, 30, 31, 42, 6, 18, 88, 113, 50,
  53, 21, 171, 106, 79, 49, 23, 52, 52, 49, 51, 62, 24, 15, 14, 54, 65, 24,
  69, 25, 122, 111, 40, 86,
];
