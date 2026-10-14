/**
 * Ciclo de fechamento das oportunidades ganhas nos últimos 12 meses, em dias corridos entre a
 * criação e o fechamento, separado em duas carteiras: negócio novo e cliente da casa. Dado
 * fictício, determinístico, sem nenhuma correspondência com a base real.
 *
 * A pergunta desta versão não é a forma de uma distribuição, é a **distância entre duas**. Por isso
 * o dado nasce com as duas amostras na mesma unidade e sem nada agregado: cada grupo traz uma
 * observação por oportunidade, e quem bina, conta e mede a mediana é o componente, com a mesma
 * régua para os dois. Bin calculado por grupo seria a maneira mais discreta de tornar a comparação
 * impossível.
 *
 * Os dois grupos têm tamanho parecido (167 contra 143) de propósito, porque com contagem no eixo Y
 * a comparação só se sustenta assim. Grupo muito menor que o outro exige percentual dentro do
 * grupo, e é a v4 deste modelo que trata desse caso.
 */

/** Largura do bin, em dias. Vem da régua da métrica e é a mesma para os dois grupos. */
export const BIN_WIDTH = 7;

/**
 * Domínio fixo do eixo, em dias. É da métrica, não da amostra: aqui isso pesa mais do que num
 * histograma de um grupo só, porque a mensagem é o deslocamento entre as duas formas, e régua que
 * se ajusta ao maior valor de cada recorte apaga justamente o deslocamento.
 */
export const DOMAIN_MAX = 210;

/**
 * Um grupo da comparação. O `id` em inglês é identificador; o `label` é o que vai para a legenda e
 * para a frase acessível.
 */
export interface CycleGroup {
  readonly id: 'new-business' | 'house-client';
  readonly label: string;
  /** Um valor por oportunidade ganha, em dias corridos, na ordem de fechamento. */
  readonly values: readonly number[];
  /**
   * Ganhas do grupo sem data de criação registrada, portanto sem ciclo calculável. Não entram na
   * amostra nem viram bin zero: são contadas no rodapé, por grupo, como manda a regra de ausência.
   * Somadas num total só, esconderiam que a falha de cadastro não é igual nas duas carteiras.
   */
  readonly withoutCycle: number;
}

/**
 * Exatamente dois grupos, e a tupla diz isso no tipo. A sobreposição desta versão tem dois papéis
 * de desenho, barra preenchida e silhueta em degrau, e um terceiro grupo não teria papel: seria
 * mais uma silhueta cruzando as outras duas. Comparação de três ou mais na mesma régua é pequeno
 * múltiplo de histograma ou ridgeline, não esta peça.
 *
 * A ordem da tupla é a ordem de desenho e não muda com o filtro: primeiro a barra preenchida,
 * depois a silhueta. Ordem que acompanha o `n` faria a mesma peça trocar de aparência entre dois
 * recortes, e ninguém entenderia por quê.
 */
export const data: readonly [CycleGroup, CycleGroup] = [
  {
    id: 'new-business',
    label: 'Negócio novo',
    withoutCycle: 11,
    values: [
      172, 93, 32, 125, 100, 116, 144, 87, 67, 32, 50, 34, 138, 38, 92, 71, 168, 87,
      47, 37, 33, 41, 49, 87, 92, 124, 58, 144, 59, 62, 98, 57, 67, 66, 74, 64,
      105, 65, 37, 92, 128, 168, 83, 134, 81, 154, 97, 95, 79, 87, 59, 89, 109, 61,
      78, 37, 62, 30, 66, 63, 157, 29, 143, 71, 52, 31, 88, 50, 76, 76, 144, 164,
      73, 82, 49, 90, 85, 147, 35, 28, 77, 74, 53, 42, 100, 66, 61, 64, 63, 155,
      72, 78, 91, 62, 102, 27, 91, 83, 36, 84, 33, 55, 47, 60, 196, 75, 54, 50,
      56, 131, 81, 46, 57, 111, 102, 57, 61, 131, 54, 41, 58, 49, 111, 37, 104, 117,
      99, 128, 146, 68, 132, 61, 206, 45, 68, 132, 64, 147, 26, 110, 93, 67, 42, 49,
      128, 165, 93, 37, 71, 107, 48, 137, 22, 107, 143, 92, 24, 35, 32, 150, 117, 42,
      71, 40, 28, 64, 93,
    ],
  },
  {
    id: 'house-client',
    label: 'Cliente da casa',
    withoutCycle: 7,
    values: [
      21, 87, 46, 16, 23, 68, 46, 72, 23, 36, 85, 43, 23, 47, 24, 31, 40, 43,
      34, 24, 28, 44, 86, 75, 21, 46, 36, 51, 33, 63, 44, 53, 32, 23, 83, 45,
      13, 37, 42, 51, 8, 54, 23, 57, 29, 68, 31, 26, 21, 58, 106, 24, 44, 82,
      55, 34, 25, 63, 39, 21, 48, 16, 22, 34, 28, 49, 38, 37, 71, 49, 32, 60,
      73, 12, 33, 31, 22, 17, 30, 17, 59, 123, 34, 15, 50, 71, 34, 22, 55, 64,
      77, 63, 42, 66, 39, 75, 49, 65, 41, 32, 27, 39, 52, 25, 47, 56, 22, 28,
      62, 116, 21, 19, 44, 26, 60, 79, 151, 42, 110, 42, 29, 24, 26, 54, 34, 23,
      46, 20, 83, 28, 19, 42, 46, 56, 32, 30, 34, 24, 81, 76, 33, 29, 39,
    ],
  },
];
