/**
 * Ciclo de fechamento dos negócios ganhos nos últimos 12 meses, em dias corridos entre a criação e o
 * fechamento, separado por origem do negócio. Dado fictício, determinístico, sem nenhuma
 * correspondência com base real.
 *
 * A pergunta desta versão é de **composição por faixa**: em que faixas de ciclo caem os negócios de
 * indicação e quanto do volume de cada faixa eles representam. Por isso o dado nasce como uma
 * observação por negócio, na mesma unidade para as três origens, e quem faz a faixa, conta e calcula
 * a participação é o componente, com a mesma régua para todas. Faixa calculada por origem tornaria a
 * pilha uma soma de réguas diferentes, que é uma conta sem sentido e sem aviso na tela.
 *
 * O empilhado responde volume, nunca forma: só a camada da base tem linha comum, as de cima flutuam
 * sobre as de baixo. Para comparar a forma de cada origem o arranjo certo é o sobreposto da v1 ou o
 * percentual dentro do grupo da v4.
 */

/** Largura da faixa de ciclo, em dias. Vem da régua da métrica e vale para todas as origens. */
export const BIN_WIDTH = 14;

/**
 * Quantas faixas a régua tem. A última é **aberta**: todo ciclo de 154 dias para cima cai nela, e o
 * rodapé diz isso. Sem a faixa aberta a cauda sairia da amostra em silêncio, ou o domínio passaria a
 * crescer com o maior ciclo do recorte e a régua deixaria de ser comparável entre filtros.
 */
export const BIN_COUNT = 12;

/**
 * O papel de desenho de cada origem, e ele vem do dado, não da posição na lista: a cor pertence à
 * categoria. `focus` é a origem que a página quer ler; `support` e `supportSoft` são o contexto, em
 * tom neutro, porque três cores de papel disputando a mesma pilha deixariam de responder a pergunta
 * da peça, que é sobre uma origem só.
 */
export type OriginTone = 'focus' | 'support' | 'supportSoft';

/** Uma origem da composição. O `id` em inglês é identificador; o `label` vai para a tela. */
export interface OriginGroup {
  readonly id: 'paid-media' | 'outbound' | 'referral';
  readonly label: string;
  readonly tone: OriginTone;
  /** Um valor por negócio ganho, em dias corridos, na ordem de fechamento. */
  readonly values: readonly number[];
  /**
   * Ganhos da origem sem data de criação registrada, portanto sem ciclo calculável. Não entram na
   * amostra e não viram faixa zero: são contados no rodapé, por origem. Somados num total só,
   * esconderiam que a falha de cadastro não é igual entre os canais.
   */
  readonly withoutCycle: number;
}

/**
 * A ordem da lista é a ordem da pilha, de baixo para cima, e ela não muda com o filtro: o Recharts
 * empilha na ordem dos filhos declarados e não reordena por faixa. O maior grupo fica na base, que é
 * o único lugar em que a camada tem linha comum e forma legível; a origem em foco vai por cima, onde
 * a participação dela em cada faixa se lê contra o total.
 *
 * Ordem que acompanhasse o tamanho do recorte faria a mesma peça trocar de aparência entre dois
 * filtros, e ninguém entenderia por quê.
 */
export const data: readonly OriginGroup[] = [
  {
    id: 'paid-media',
    label: 'Mídia paga',
    tone: 'support',
    withoutCycle: 9,
    values: [
      135, 59, 72, 19, 53, 35, 44, 55, 26, 43, 28, 37,
      54, 58, 94, 59, 39, 78, 40, 107, 15, 31, 80, 42,
      112, 15, 45, 23, 43, 69, 77, 74, 52, 98, 8, 67,
      54, 70, 61, 102, 56, 24, 25, 38, 56, 32, 35, 70,
      128, 100, 37, 81, 45, 86, 55, 4, 100, 28, 43, 68,
      73, 34, 117, 96, 69, 85, 14, 80, 88, 38, 82, 35,
      69, 34, 39, 46, 39, 44, 54, 69, 21, 16, 103, 68,
      19, 27, 92, 31, 216, 54, 123, 24, 1, 23, 14, 28,
      41, 91, 57, 27, 140, 38, 42, 54, 50, 40, 21, 14,
      40, 35, 28, 8, 116, 53, 58, 33, 79, 64, 51, 88,
    ],
  },
  {
    id: 'outbound',
    label: 'Prospecção ativa',
    tone: 'supportSoft',
    withoutCycle: 5,
    values: [
      43, 56, 75, 26, 40, 43, 58, 49, 106, 95, 83, 148,
      64, 33, 54, 41, 73, 49, 76, 105, 124, 81, 23, 65,
      47, 53, 90, 81, 39, 130, 76, 90, 44, 26, 21, 15,
      34, 53, 70, 52, 14, 37, 61, 69, 38, 56, 93, 20,
      66, 92, 19, 102, 87, 88, 22, 48, 100, 74, 71, 41,
      34, 48, 40, 28, 34, 33, 91, 52, 46, 63, 112, 59,
      47, 38, 29, 55, 31, 54, 59, 124, 4, 113, 53, 80,
      82, 127, 101, 35, 58, 67, 60, 47, 107, 18, 1, 57,
    ],
  },
  {
    id: 'referral',
    label: 'Indicação',
    tone: 'focus',
    withoutCycle: 3,
    values: [
      19, 129, 8, 14, 43, 20, 14, 26, 34, 8, 92, 38,
      26, 61, 6, 17, 17, 35, 107, 28, 19, 50, 31, 31,
      73, 40, 62, 19, 43, 18, 21, 80, 63, 28, 16, 5,
      26, 38, 91, 13, 16, 23, 61, 35, 16, 16, 38, 58,
      17, 54, 1, 47, 24, 15, 40, 41, 121, 72, 31, 42,
      52, 42,
    ],
  },
];
