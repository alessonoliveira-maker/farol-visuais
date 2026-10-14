/**
 * Ciclo de fechamento das oportunidades ganhas no ano, em dias corridos entre a criação e o
 * fechamento. Dado fictício, determinístico, sem nenhuma correspondência com a base real: nasceu
 * de um gerador de semente fixa e o array final está escrito aqui, para o preview desenhar a mesma
 * coisa em qualquer máquina e em qualquer data.
 *
 * Como na v1, o array traz **uma observação por oportunidade**, e não os bins já contados nem as
 * estatísticas já calculadas. É isso que permite a esta versão desenhar mediana, média e faixa
 * interquartil a partir do mesmo dado do histograma: se a origem entregasse as estatísticas
 * prontas, nada garantiria que elas foram calculadas sobre a amostra desenhada, que é justamente a
 * afirmação desta peça.
 *
 * A amostra é de cauda longa de propósito. Com mediana de 51 dias e média de 74, a média fica
 * acima de dois terços dos negócios, e é essa distância que a versão existe para mostrar.
 *
 * A ordem é a de fechamento, não a crescente: ordenar aqui esconderia que o componente não depende
 * de ordem nenhuma.
 */

/** Largura do bin, em dias. Vem da régua da métrica e não muda com o filtro. */
export const BIN_WIDTH = 7;

/**
 * Domínio fixo do eixo, em dias, o mesmo da v1 deste modelo. É da métrica, não da amostra: com
 * domínio livre, dois recortes diferentes desenhariam réguas diferentes e o leitor compararia
 * formas que nunca foram comparáveis. Manter a mesma régua da v1 é o que permite colar as duas no
 * mesmo painel e ler uma contra a outra.
 */
export const DOMAIN_MAX = 210;

/**
 * Oportunidades ganhas sem data de criação registrada, portanto sem ciclo calculável. Não entram
 * na amostra nem viram bin zero: são contadas no rodapé, como manda a regra de ausência.
 */
export const WITHOUT_CYCLE = 12;

/** Um valor por oportunidade ganha, em dias corridos, na ordem de fechamento. */
export const data: readonly number[] = [
   59,  15,  44, 148,  39,  72,  31,  63,  28,  88,  36,  72,  53, 166,  44,  46,  26,  46,
   47, 143,  28,  63,  38,  79,  39, 198,  61,  94,  62, 200,  48, 151,  20,  24, 157,  61,
   24, 169, 185,  64,  67,  22,  41, 194,  44,  26,  76,  38,  28,  42,  69,  59, 137,  48,
  126, 135,  36,  61,  39, 152,  62,  65,  35, 202,  42, 165,  59,  35,  85, 177, 126,  43,
  184, 123, 120,  28,  24,  40,  81,  57,  25, 134,  69,  50,  31,  22, 135, 206,  38,  29,
  127, 121,  29, 185,  36, 157,  51,  64,  25,  73, 179,  28,  51,  33, 165,  36, 188, 161,
   31,  93,  57,  50, 147,  73,  35,  42, 125,  62,  30, 179,  31,  26,  51, 133,  70,  37,
   47, 169, 103,  53,  21, 138, 175,  57,  22,  19,  99,  32,  85,  18,  95, 207,  46,  36,
   50,  82,  26, 183,  26, 206,  59,  40,  87,  27,  77,  71,  32,  34, 154,  54, 144,  43,
  168, 127,  27,  18,  43, 180,  67,  55,  40,  79,  43,  40,  65, 151,  35,  38,  40,  34,
   26,  33,  19, 133,  46, 122,  21,  40, 196, 158, 111, 202,  44, 192,  37,  75, 124,  42,
   47,  35,  45,  24,  34,  39, 120,  42,  34,  38,  37, 163, 129,  28,  55,  29,  57, 160,
  135, 127, 123,  37,  21,  54,  50, 141,  53,  98,  61,  54,  31, 129,  49,  36,  34,  26,
   27,  51, 121,  29,  87,  46, 203,  37, 121, 105,  38, 121,  25,  33, 187,  56,  33,  39,
   30, 120,  50,  45,  57,  49, 189,  33,  39,  31,  18, 100,  57,  21,  22, 154,  28,  20,
   24,  74, 102,  70,  44, 176,  49,  42,  35,  34,  81,  47,  78,  40,  20,  21,  48, 120,
   33, 121,  40,  62,  25,  44,  44,  56,
];
