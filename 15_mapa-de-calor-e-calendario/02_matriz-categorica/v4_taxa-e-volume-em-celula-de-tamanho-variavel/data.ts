/**
 * Leads que entraram e agendas que saíram deles, por origem declarada e por mês, de abril a setembro
 * de 2026. Dado fictício e fixo: nenhuma origem é plataforma real e nenhum nome é pessoa real. As
 * duas unidades são contagem inteira, e a taxa de agenda é derivada no componente para que o
 * percentual desenhado e o volume desenhado nunca possam divergir.
 *
 * O par origem x mês declara `null` quando a origem NÃO era medida naquele mês, e `{ leads: 0 }`
 * quando ela era medida e não trouxe nenhum lead. Sem essa diferença o mês em que a verba estava
 * pausada leria igual ao mês em que o canal ainda não existia.
 */
export interface OriginMonthCell {
  /** Leads que entraram no par. Zero é medição, não ausência. */
  readonly leads: number;
  /** Agendas marcadas a partir desses leads. Nunca maior que `leads`. */
  readonly agendas: number;
}

/** Seis meses em `YYYY-MM`, do mais antigo ao mais recente. */
export const MONTHS: readonly string[] = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];

/**
 * Piso de amostra para a taxa concluir. Abaixo dele a célula continua desenhada no tamanho do
 * volume, porque o volume é medição, mas fica sem cor de faixa, porque a taxa de 3 em 5 não sustenta
 * comparação com a de 34 em 160.
 */
export const SAMPLE_FLOOR = 8;

export interface OriginRateRow {
  readonly id: string;
  readonly label: string;
  /** Uma posição por mês, na mesma ordem de MONTHS. `null` é origem sem medição no mês. */
  readonly monthly: readonly (OriginMonthCell | null)[];
}

/**
 * Casos difíceis exercitados de propósito: o maior volume do recorte tem 160 leads e o menor tem 5,
 * uma diferença de 32 vezes que é exatamente o que a versão existe para não deixar dominar a
 * leitura; Comparador pago tem um mês de zero lead medido, com a verba pausada; Patrocínio de
 * boletim só passou a ser medido em junho, então abril e maio são ausência; e Indicação de cliente
 * tem a maior taxa do recorte com o menor volume dele, que é a armadilha clássica da matriz de
 * conversão.
 */
export const data: readonly OriginRateRow[] = [
  {
    id: 'busca-paga',
    label: 'Busca paga',
    monthly: [
      { leads: 116, agendas: 24 },
      { leads: 132, agendas: 27 },
      { leads: 143, agendas: 30 },
      { leads: 146, agendas: 31 },
      { leads: 160, agendas: 34 },
      { leads: 71, agendas: 15 },
    ],
  },
  {
    id: 'busca-organica',
    label: 'Busca orgânica',
    monthly: [
      { leads: 85, agendas: 27 },
      { leads: 98, agendas: 31 },
      { leads: 107, agendas: 34 },
      { leads: 107, agendas: 34 },
      { leads: 117, agendas: 37 },
      { leads: 51, agendas: 16 },
    ],
  },
  {
    id: 'rede-social-paga',
    label: 'Rede social paga',
    monthly: [
      { leads: 73, agendas: 9 },
      { leads: 85, agendas: 11 },
      { leads: 94, agendas: 12 },
      { leads: 94, agendas: 12 },
      { leads: 104, agendas: 14 },
      { leads: 46, agendas: 6 },
    ],
  },
  {
    id: 'acesso-direto',
    label: 'Acesso direto',
    monthly: [
      { leads: 34, agendas: 14 },
      { leads: 41, agendas: 17 },
      { leads: 46, agendas: 19 },
      { leads: 43, agendas: 18 },
      { leads: 49, agendas: 20 },
      { leads: 20, agendas: 8 },
    ],
  },
  {
    id: 'video-patrocinado',
    label: 'Vídeo patrocinado',
    monthly: [
      { leads: 27, agendas: 2 },
      { leads: 34, agendas: 3 },
      { leads: 40, agendas: 4 },
      { leads: 37, agendas: 3 },
      { leads: 44, agendas: 4 },
      { leads: 18, agendas: 2 },
    ],
  },
  {
    id: 'comparador-pago',
    label: 'Comparador pago',
    monthly: [
      { leads: 0, agendas: 0 },
      { leads: 21, agendas: 4 },
      { leads: 26, agendas: 5 },
      { leads: 22, agendas: 4 },
      { leads: 28, agendas: 5 },
      { leads: 11, agendas: 2 },
    ],
  },
  {
    id: 'indicacao-de-cliente',
    label: 'Indicação de cliente',
    monthly: [
      { leads: 9, agendas: 5 },
      { leads: 15, agendas: 9 },
      { leads: 19, agendas: 11 },
      { leads: 14, agendas: 8 },
      { leads: 19, agendas: 11 },
      { leads: 5, agendas: 3 },
    ],
  },
  {
    id: 'patrocinio-de-boletim',
    label: 'Patrocínio de boletim',
    monthly: [
      null,
      null,
      { leads: 14, agendas: 4 },
      { leads: 10, agendas: 2 },
      { leads: 13, agendas: 3 },
      { leads: 5, agendas: 1 },
    ],
  },
];
