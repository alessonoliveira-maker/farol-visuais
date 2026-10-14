/**
 * Quatro contagens do mesmo painel, cada uma num estado que costuma mentir: zero medido, coleta
 * que falhou, métrica sem mês anterior e mês corrente parcial. Contagens inteiras por mês.
 * Dado fictício e fixo: nenhum número vem de empresa real.
 *
 * Os quatro cartões respondem ao mesmo dia de referência, 2026-08-14 (14 de 31 dias corridos de
 * ago/26): é por isso que zero medido e sem mês anterior também carregam `coverage`, não só o
 * cartão que só demonstra o mês parcial. Ausência de dado é a exceção: coleta falhou desde
 * 2026-08-02, dentro do mesmo mês em curso, não depois dele.
 *
 * O caso difícil é que os quatro precisam caber na mesma tira com a mesma altura e a mesma linha
 * de base do número, sem que o zero pareça ausência nem a ausência pareça zero.
 */

/** Para onde aponta o "bom" da métrica; a cor da variação sai daqui, nunca do sinal. */
export type Polarity = 'higher-is-better' | 'lower-is-better' | 'neutral';

export interface CountNoun {
  readonly one: string;
  readonly many: string;
  /** Gênero gramatical do substantivo, para o artigo do zero medido concordar; padrão masculino. */
  readonly gender?: 'f' | 'm';
}

export interface Comparison {
  /** Mês de comparação, no formato YYYY-MM. */
  readonly month: string;
  /** Valor na mesma janela do período atual, ou `null` quando o mês não foi medido. */
  readonly value: number | null;
}

export interface Unavailability {
  readonly reason: string;
  /** Data da falha, no formato YYYY-MM-DD. */
  readonly since: string;
  readonly lastValid: { readonly month: string; readonly value: number } | null;
}

export interface StateKpi {
  readonly id: string;
  readonly label: string;
  readonly noun: CountNoun;
  readonly polarity: Polarity;
  /** Mês do número, no formato YYYY-MM. */
  readonly month: string;
  /** Presente quando o mês ainda está em curso. */
  readonly coverage?: { readonly elapsedDays: number; readonly totalDays: number };
  /** Contagem medida; `null` quando não houve medição. */
  readonly value: number | null;
  readonly previous?: Comparison;
  /** O que o zero significa, escrito quando o valor medido é 0. */
  readonly zeroMeaning?: string;
  readonly unavailable?: Unavailability;
  /** Primeira medição da métrica, no formato YYYY-MM-DD, para explicar a falta de base. */
  readonly firstMeasuredOn?: string;
}

export const data: readonly StateKpi[] = [
  {
    id: 'paid-media-sales',
    label: 'Vendas de mídia paga',
    noun: { one: 'venda', many: 'vendas', gender: 'f' },
    polarity: 'higher-is-better',
    month: '2026-08',
    coverage: { elapsedDays: 14, totalDays: 31 },
    value: 0,
    previous: { month: '2026-07', value: 2 },
    zeroMeaning: 'nenhuma venda de mídia paga',
  },
  {
    id: 'qualified-leads',
    label: 'Leads qualificados',
    noun: { one: 'lead', many: 'leads', gender: 'm' },
    polarity: 'higher-is-better',
    month: '2026-08',
    value: null,
    unavailable: {
      reason: 'coleta da fonte de mídia falhou',
      since: '2026-08-02',
      lastValid: { month: '2026-07', value: 386 },
    },
  },
  {
    id: 'partner-meetings',
    label: 'Reuniões de parcerias',
    noun: { one: 'reunião', many: 'reuniões', gender: 'f' },
    polarity: 'higher-is-better',
    month: '2026-08',
    coverage: { elapsedDays: 14, totalDays: 31 },
    value: 17,
    previous: { month: '2026-07', value: null },
    firstMeasuredOn: '2026-08-04',
  },
  {
    id: 'held-meetings',
    label: 'Agendas realizadas',
    noun: { one: 'agenda', many: 'agendas', gender: 'f' },
    polarity: 'higher-is-better',
    month: '2026-08',
    coverage: { elapsedDays: 14, totalDays: 31 },
    value: 58,
    previous: { month: '2026-07', value: 51 },
  },
];
