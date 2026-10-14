/**
 * Ticket das oportunidades fechadas nos últimos 12 meses, em reais, separado em dois desfechos:
 * ganhas e perdidas. Dado fictício, determinístico, sem nenhuma correspondência com base real.
 *
 * A pergunta desta versão é o **confronto faixa a faixa**: a partir de que ticket o time ganha mais
 * do que perde. Por isso o dado nasce como uma observação por oportunidade, na mesma unidade para os
 * dois desfechos, e quem faz a faixa, conta e acha a virada é o componente, com a mesma régua para
 * os dois lados. Faixa calculada por desfecho seria a maneira mais discreta de tornar o confronto
 * impossível, porque cada lado poderia ter vindo de um corte diferente sem ninguém perceber.
 *
 * Os dois grupos têm tamanho parecido, 84 contra 93, e isso é condição do arranjo espelhado: os dois
 * lados dividem a mesma régua de contagem, então tamanhos muito diferentes fariam um lado nascer
 * sempre menor por volume e não por desfecho. O caso desigual é a v4 deste modelo.
 */

/** Largura da faixa de ticket, em reais. Vem da régua da métrica e vale para os dois desfechos. */
export const BAND_WIDTH = 25_000;

/**
 * Quantas faixas a régua tem. A última é **aberta**: tudo de R$ 175 mil para cima cai nela, e o
 * rodapé diz isso. Faixa aberta no fim é o que impede a cauda de sair da amostra sem aviso; sem ela
 * a alternativa seria um domínio que cresce com o maior ticket do recorte, e aí a régua deixaria de
 * ser comparável entre filtros.
 */
export const BAND_COUNT = 8;

/**
 * Um desfecho da comparação. O `id` em inglês é identificador; o `label` é o que vai para o desenho
 * e para a frase acessível.
 */
export interface OutcomeGroup {
  readonly id: 'won' | 'lost';
  readonly label: string;
  /** Um valor por oportunidade fechada, em reais, na ordem de fechamento. */
  readonly values: readonly number[];
  /**
   * Fechadas do grupo sem valor registrado, portanto sem faixa calculável. Não entram na amostra e
   * não viram faixa zero: são contadas no rodapé, por grupo. Somadas num total só, esconderiam que a
   * falha de cadastro não é igual nos dois desfechos.
   */
  readonly withoutTicket: number;
}

/**
 * Exatamente dois grupos, e a tupla diz isso no tipo. A pirâmide tem dois lados e só dois: um
 * terceiro desfecho não teria lado, teria que dividir um dos dois e o confronto binário se
 * desfaria. Comparação de três ou mais na mesma régua é o arranjo sobreposto da v1 ou o empilhado da
 * v3.
 *
 * A ordem da tupla é o lado de cada grupo e não muda com o filtro: o primeiro vai para a esquerda,
 * com o sinal invertido pelo componente, e o segundo para a direita. Ordem que acompanhasse o
 * tamanho do grupo faria a mesma peça trocar de lado entre dois recortes.
 */
export const data: readonly [OutcomeGroup, OutcomeGroup] = [
  {
    id: 'lost',
    label: 'Perdidas',
    withoutTicket: 9,
    values: [
      144900, 12500, 82200, 93300, 66800, 43200, 31400, 250600,
      38700, 89600, 31400, 40200, 121300, 64800, 123500, 41300,
      14300, 14000, 20400, 60800, 23900, 60600, 21700, 31100,
      194600, 63400, 65500, 67100, 2600, 96000, 18500, 46200,
      160700, 42900, 116200, 22500, 129600, 109400, 121800, 900,
      37200, 16100, 153400, 47100, 3800, 40800, 191400, 10500,
      96300, 85200, 81200, 31300, 13700, 53400, 135200, 39700,
      32000, 80500, 60200, 90800, 145100, 15300, 48900, 77700,
      7100, 123400, 259100, 14800, 69400, 113900, 26900, 127300,
      15900, 131200, 9400, 45200, 3700, 157400, 152600, 55900,
      30700, 98800, 101900, 89200, 60300, 61800, 22900, 21000,
      167400, 63500, 58900, 138900, 103700,
    ],
  },
  {
    id: 'won',
    label: 'Ganhas',
    withoutTicket: 6,
    values: [
      78900, 105800, 195000, 121800, 152700, 111300, 42900, 120000,
      71800, 141500, 225200, 158300, 112300, 248400, 79000, 214800,
      54200, 52700, 30400, 256700, 92900, 172400, 61200, 247400,
      183800, 123400, 94700, 112600, 67100, 162400, 170900, 68400,
      108700, 119700, 86300, 62300, 147600, 88200, 62100, 168900,
      17600, 38700, 83000, 144300, 140100, 93900, 2400, 48400,
      16900, 151600, 145600, 122300, 33600, 8500, 51600, 133500,
      167100, 140100, 35200, 112700, 66300, 66900, 29800, 141200,
      251400, 106200, 154200, 15800, 210700, 155700, 36500, 88700,
      135200, 107200, 94300, 11600, 139400, 132200, 102100, 142800,
      126000, 96700, 171200, 42100,
    ],
  },
];
