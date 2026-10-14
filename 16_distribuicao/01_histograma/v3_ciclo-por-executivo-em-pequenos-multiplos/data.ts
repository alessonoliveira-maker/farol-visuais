/**
 * Ciclo de fechamento por executivo, em dias corridos entre a criação e o fechamento da
 * oportunidade ganha. Dado fictício, determinístico, sem nenhuma correspondência com a base real:
 * nasceu de um gerador de semente fixa e o array final está escrito aqui, para o preview desenhar
 * a mesma coisa em qualquer máquina e em qualquer data.
 *
 * Os executivos são nomeados por letra, e não por nome de pessoa: a peça do catálogo não carrega
 * identidade de ninguém, e quem colar no Farol troca o `label` pelo nome que a página já usa.
 *
 * A ordem aqui é a do cadastro, e não a da leitura. Quem ordena é o componente, por mediana
 * crescente, e é de propósito que o dado chegue fora de ordem: painel ordenado na origem esconderia
 * que a régua de leitura é uma decisão do desenho e não uma propriedade do dado.
 *
 * Um dos executivos tem três negócios fechados no período. Ele fica no dado porque existir com
 * amostra pequena é um estado normal da operação, e é o componente que decide que abaixo do piso de
 * amostra o painel deixa de desenhar forma.
 */

/** Largura do bin, em dias. Vem da régua da métrica, é a mesma nos oito painéis e não muda com o filtro. */
export const BIN_WIDTH = 7;

/**
 * Domínio fixo do eixo, em dias, o mesmo das outras versões deste modelo. Aqui ele deixa de ser
 * conveniência e vira obrigação: oito painéis com domínio calculado painel a painel desenhariam
 * oito réguas diferentes, e a comparação que o modelo existe para fazer viraria ilusão.
 */
export const DOMAIN_MAX = 210;

/**
 * Abaixo deste número de observações o painel não desenha histograma. Vem da regra da família:
 * amostra pequena não ganha forma, ganha caso individual, porque uma barra solitária num painel
 * pequeno é lida como pico.
 */
export const MIN_SAMPLE = 30;

export interface ExecutiveCycle {
  /** Nome curto do executivo, como ele aparece no título do painel. */
  readonly label: string;
  /** Um valor por oportunidade ganha, em dias corridos, na ordem de fechamento. */
  readonly values: readonly number[];
  /** Ganhas sem data de criação, portanto sem ciclo: fora da amostra e contadas no rodapé. */
  readonly withoutCycle: number;
}

export const data: readonly ExecutiveCycle[] = [
  {
    label: 'Executivo A',
    withoutCycle: 2,
    values: [
       19,  26,  15,  23,  14,  17,  37,  59,  27,  21,  52,  20,  24,  22,  30,  32,
       54,  18,  49,  29,  34,  18,  36,  37,  40,  54,  30,  38,  51,  45,  24,  16,
       38,  97,  30,  20,  43,  22,  41,  30,  21,  46,  18,  28,  29,  35,  19,  53,
       30,  18,  29,  13,  41,  34,  33,  21,  45,  26,
    ],
  },
  {
    label: 'Executivo B',
    withoutCycle: 1,
    values: [
       33,  58,  55,  67,  25,  25,  30,  28,  48,  56, 156, 109,  30,  42,  76,  29,
       77,  81,  27,  31,  27,  56,  61,  62,  41,  52,  34,  18,  62, 123,  26,  21,
       36,  25,  34,  22,  41,  76,  73,  44,  32,  23,  25,  38,  45,  43,  23,  20,
       28,  47,  70,  44,
    ],
  },
  {
    label: 'Executivo C',
    withoutCycle: 3,
    values: [
       42,  78,  32,  53,  68,  37,  28,  53,  34, 109,  49,  62,  77,  32,  42,  21,
       37,  70,  55,  49,  69, 130,  51,  49,  29,  55,  61,  35,  54,  50,  59,  37,
      113,  50,  35,  24,  34,  18,  34,  46,  27, 101,  84,  71,  48, 118, 128,
    ],
  },
  {
    label: 'Executivo D',
    withoutCycle: 0,
    values: [
       34,  56,  33,  33,  55,  69, 117,  45,  55,  64,  88, 201,  55,  45,  46,  49,
       57,  57,  67,  12,  43, 171,  66,  30,  37, 118,  52,  61, 102,  61,  21,  42,
       65,  48,  44,  89, 150,  55,  80,  41,  35,  38,  54,  74,
    ],
  },
  {
    label: 'Executivo E',
    withoutCycle: 2,
    values: [
       55,  81, 171,  72,  39,  39, 191,  59, 119,  47, 135,  51,  39,  32, 145,  94,
      137,  61,  52,  49,  47,  53, 121,  25,  54, 122,  26,  51,  43,  33,  30,  27,
       42,  27, 120,  25,  47,  62,  42,
    ],
  },
  {
    label: 'Executivo F',
    withoutCycle: 1,
    values: [
      125,  45,  44,  59, 136,  29,  78, 173, 121,  34, 194,  47,  66,  32,  81,  31,
      139,  68, 195,  34,  45,  46,  40,  51,  29,  61,  90,  51,  30,  52, 204, 121,
      122,  94,
    ],
  },
  {
    label: 'Executivo G',
    withoutCycle: 2,
    values: [
      187, 181,  87, 130,  86,  68, 128, 179,  48,  36, 120, 136, 198, 109,  54,  76,
       45, 143,  68, 158, 119,  75, 151, 121, 189,  81,  74, 156, 117, 139,  48,
    ],
  },
  {
    label: 'Executivo H',
    withoutCycle: 1,
    values: [
      122,  70,  56,
    ],
  },
];
