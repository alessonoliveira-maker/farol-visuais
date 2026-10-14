/**
 * Tempo entre a entrada do lead e a primeira agenda marcada, em dias corridos, separado por canal de
 * origem. Dado fictício, determinístico, sem nenhuma correspondência com base real.
 *
 * A pergunta desta versão é de **forma**, não de volume: os dois canais agendam no mesmo ritmo? E o
 * caso difícil é o tamanho, porque um canal tem 640 leads e o outro tem 38. Contagem no eixo faria o
 * canal pequeno virar uma linha rente ao zero, e a comparação seria entre volumes, não entre ritmos.
 * Por isso a escala desta versão é **percentual dentro do próprio canal**, com o n bruto de cada um
 * escrito na legenda, para a divisão não esconder de quantos leads cada forma foi calculada.
 *
 * O dado nasce como uma observação por lead, na mesma unidade para os dois canais, e quem faz a
 * faixa, conta e divide é o componente, com a mesma régua para os dois. Percentual já calculado na
 * origem esconderia o denominador, que aqui é a informação mais delicada da peça.
 */

/** Largura da faixa, em dias. Vem da régua da métrica e vale para os dois canais. */
export const BIN_WIDTH = 3;

/**
 * Quantas faixas a régua tem. A última é **aberta**: tudo de 27 dias para cima cai nela, e o rodapé
 * diz isso. Sem a faixa aberta a cauda sairia da amostra em silêncio, e com domínio que cresce com o
 * maior valor do recorte a régua deixaria de ser comparável entre filtros.
 */
export const BIN_COUNT = 10;

/**
 * Um canal da comparação. O `id` em inglês é identificador; o `label` vai para a tela.
 */
export interface ChannelGroup {
  readonly id: 'paid-media' | 'referral';
  readonly label: string;
  /** Um valor por lead, em dias corridos entre a entrada e a primeira agenda. */
  readonly values: readonly number[];
  /**
   * Leads do canal que agendaram sem data registrada, portanto sem tempo calculável. Não entram na
   * amostra e não viram faixa zero: são contados no rodapé, por canal. Somados num total só,
   * esconderiam que a falha de cadastro não é igual entre os canais, e num canal de 38 leads duas
   * ausências pesam o que quarenta pesam no de 640.
   */
  readonly withoutSchedule: number;
}

/**
 * Exatamente dois canais, e a tupla diz isso no tipo. A ordem é a ordem de desenho e o papel de cada
 * um, e ela **não muda com o filtro**: o primeiro é a barra preenchida, o segundo é a silhueta em
 * degrau, desenhada por cima. O canal pequeno fica na silhueta de propósito, porque é ela que passa
 * por cima sem ser coberta; ordem que acompanhasse o `n` do recorte faria a mesma peça trocar de
 * aparência entre dois filtros, e o leitor não teria como saber por quê.
 */
export const data: readonly [ChannelGroup, ChannelGroup] = [
  {
    id: 'paid-media',
    label: 'Mídia paga',
    withoutSchedule: 41,
    values: [
      23, 11, 10, 13, 18, 11, 7, 4, 10, 5, 7, 9, 15, 6, 6, 8, 14, 15, 14, 9,
      8, 12, 14, 19, 9, 12, 15, 10, 0, 15, 4, 15, 4, 3, 8, 6, 7, 4, 3, 24,
      13, 22, 9, 0, 11, 5, 12, 6, 34, 10, 4, 7, 6, 19, 5, 2, 19, 18, 15, 5,
      17, 17, 6, 3, 7, 7, 11, 6, 10, 23, 7, 16, 6, 12, 4, 2, 19, 18, 3, 5,
      3, 10, 18, 1, 10, 4, 16, 23, 8, 12, 0, 5, 1, 5, 6, 4, 5, 20, 18, 4,
      3, 4, 15, 4, 5, 7, 24, 5, 3, 16, 19, 8, 22, 3, 3, 6, 23, 7, 20, 21,
      13, 6, 10, 32, 9, 15, 10, 5, 4, 12, 13, 11, 7, 13, 3, 1, 2, 10, 18, 11,
      6, 24, 0, 14, 17, 18, 18, 32, 9, 13, 3, 5, 0, 4, 11, 16, 0, 7, 13, 7,
      22, 8, 10, 11, 2, 12, 11, 14, 12, 15, 24, 3, 3, 7, 23, 9, 19, 10, 17, 22,
      4, 5, 3, 8, 6, 7, 8, 5, 4, 12, 9, 12, 12, 8, 5, 19, 4, 16, 1, 11,
      10, 11, 9, 8, 4, 16, 19, 8, 7, 19, 2, 5, 27, 2, 5, 6, 2, 6, 17, 7,
      2, 2, 27, 11, 25, 3, 24, 0, 12, 4, 16, 7, 21, 3, 6, 10, 22, 19, 0, 3,
      8, 3, 4, 11, 9, 5, 6, 3, 5, 8, 11, 9, 19, 9, 11, 3, 17, 14, 5, 14,
      8, 6, 23, 15, 18, 14, 3, 13, 25, 10, 7, 7, 6, 2, 7, 14, 5, 3, 2, 6,
      21, 8, 3, 13, 3, 14, 13, 3, 25, 0, 23, 12, 19, 22, 26, 7, 13, 12, 3, 19,
      6, 10, 11, 13, 11, 9, 17, 1, 12, 7, 17, 2, 3, 5, 24, 13, 10, 1, 3, 4,
      6, 5, 16, 13, 14, 0, 14, 12, 8, 7, 3, 15, 11, 4, 6, 16, 9, 8, 12, 7,
      7, 7, 17, 9, 15, 10, 11, 25, 14, 5, 22, 8, 0, 8, 0, 10, 11, 8, 2, 19,
      4, 3, 11, 2, 12, 18, 1, 1, 7, 38, 3, 8, 7, 14, 10, 23, 12, 10, 36, 3,
      4, 3, 4, 5, 4, 3, 10, 4, 21, 37, 15, 16, 13, 13, 4, 5, 3, 12, 7, 13,
      17, 6, 16, 7, 2, 9, 22, 4, 5, 5, 10, 3, 0, 6, 11, 6, 4, 5, 15, 16,
      4, 16, 9, 15, 1, 15, 12, 10, 5, 13, 6, 4, 6, 26, 10, 24, 6, 10, 25, 16,
      3, 14, 14, 11, 10, 3, 13, 16, 11, 9, 18, 3, 8, 2, 5, 9, 19, 16, 1, 4,
      8, 21, 18, 2, 10, 5, 15, 21, 8, 17, 5, 11, 7, 1, 8, 6, 8, 21, 12, 8,
      26, 15, 10, 18, 18, 17, 10, 14, 13, 6, 13, 24, 9, 30, 8, 5, 12, 8, 11, 21,
      11, 8, 1, 7, 6, 16, 8, 8, 10, 15, 1, 5, 13, 14, 9, 9, 8, 15, 12, 11,
      7, 8, 8, 15, 7, 25, 4, 3, 2, 19, 8, 5, 25, 6, 3, 9, 8, 4, 11, 11,
      12, 3, 13, 10, 18, 22, 13, 2, 0, 17, 2, 8, 13, 25, 19, 7, 27, 8, 12, 17,
      4, 19, 20, 5, 16, 8, 4, 5, 17, 10, 4, 0, 23, 2, 11, 3, 15, 10, 2, 11,
      4, 7, 8, 13, 3, 23, 6, 9, 13, 18, 15, 1, 0, 6, 4, 8, 1, 18, 8, 0,
      4, 22, 7, 10, 5, 3, 3, 20, 9, 5, 3, 19, 5, 1, 18, 0, 12, 6, 11, 10,
      9, 14, 27, 6, 23, 5, 1, 23, 16, 15, 10, 7, 1, 19, 4, 4, 4, 3, 5, 35,
    ],
  },
  {
    id: 'referral',
    label: 'Indicação',
    withoutSchedule: 2,
    values: [
      3, 10, 4, 5, 11, 1, 4, 15, 6, 7, 5, 0, 8, 0, 5, 3, 3, 6, 4, 2,
      0, 3, 3, 2, 19, 10, 22, 2, 6, 3, 6, 5, 0, 13, 2, 13, 8, 9,
    ],
  },
];
