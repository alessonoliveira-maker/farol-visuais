/**
 * Agendas marcadas por SDR, por dia da semana e hora, somadas no trimestre.
 * Uma grade por pessoa, 5 dias por 12 horas, das 8h às 19h, com domínio comum às oito.
 *
 * O `value` é `number | null` de propósito, e os dois casos não são o mesmo:
 * `null` é hora em que a pessoa não estava na escala, então não houve medição possível;
 * `0` é hora em que ela estava na escala e não marcou nada, que é zero medido.
 * Abaixo de `SAMPLE_FLOOR` a célula existe e é medida, mas a amostra não sustenta leitura de
 * intensidade, e por isso ela sai hachurada em vez de pintada no degrau mais baixo da rampa.
 *
 * Sábado e domingo ficam fora da grade: a pré-vendas não atende no fim de semana, e desenhar as
 * duas colunas vazias diria que não houve agenda, quando o certo é que não houve expediente.
 *
 * Dado fictício e fixo: nenhuma pessoa real; os nomes são inventados com inicial de sobrenome.
 */
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface Sdr {
  readonly id: string;
  readonly name: string;
}

export interface AgendaCell {
  readonly sdrId: string;
  readonly day: WeekDay;
  /** Hora cheia, 8 a 19. */
  readonly hour: number;
  /** Agendas marcadas nesta janela no trimestre; `null` quando a pessoa não estava na escala. */
  readonly value: number | null;
}

/** Ordem da operação: segunda a sexta. O fim de semana não entra na grade. */
export const DAY_ORDER: readonly WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export const DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
};

export const HOURS: readonly number[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

/** Piso de amostra: abaixo disso a célula é hachurada, porque o número não sustenta intensidade. */
export const SAMPLE_FLOOR = 5;

/** O que a célula mede, impresso na legenda e na frase acessível. */
export const windowCaption = 'agendas marcadas no trimestre, mesma escala nas oito grades';

export const sdrs: readonly Sdr[] = [
  { id: 'sdr-01', name: 'Talita V.' },
  { id: 'sdr-02', name: 'Murilo C.' },
  { id: 'sdr-03', name: 'Helena P.' },
  { id: 'sdr-04', name: 'Bianca L.' },
  { id: 'sdr-05', name: 'Otávio M.' },
  { id: 'sdr-06', name: 'Nayara F.' },
  { id: 'sdr-07', name: 'Caio S.' },
  { id: 'sdr-08', name: 'Iara D.' },
];

/** Uma linha por dia, na ordem de `DAY_ORDER`, e uma coluna por hora, na ordem de `HOURS`. */
const ROWS: Record<string, readonly (readonly (number | null)[])[]> = {
  'sdr-01': [
    [2, 9, 14, 13, 8, 3, 6, 9, 8, 4, 4, 0],
    [3, 10, 17, 15, 8, 3, 6, 9, 9, 5, 4, 2],
    [5, 10, 16, 14, 6, 4, 8, 10, 8, 6, 3, 1],
    [5, 12, 17, 15, 7, 4, 7, 10, 8, 6, 4, 2],
    [4, 7, 13, 10, 6, 2, 4, 6, 8, 4, 1, 0],
  ],
  'sdr-02': [
    [2, 2, 6, 7, 4, 6, 11, 14, 12, 10, 4, 2],
    [1, 4, 8, 6, 3, 5, 11, 16, 14, 9, 5, 2],
    [2, 4, 6, 6, 5, 4, 12, 14, 14, 10, 6, 4],
    [3, 4, 7, 7, 5, 5, 12, 15, 15, 12, 6, 4],
    [2, 4, 5, 5, 2, 5, 9, 12, 9, 9, 3, 1],
  ],
  'sdr-03': [
    [null, null, null, 8, 3, 4, 4, 2, 2, 3, 0, 0],
    [15, 18, 15, 8, 3, 1, 4, 3, 4, 4, 1, 1],
    [14, 16, 14, 8, 2, 3, 4, 5, 4, 2, 0, 2],
    [16, 19, 16, 10, 4, 2, 4, 4, 4, 4, 1, 3],
    [9, 13, 12, 6, 2, 2, 1, 2, 1, 2, 2, 0],
  ],
  'sdr-04': [
    [2, 5, 12, 12, 5, 4, 10, 11, 10, 8, 6, 3],
    [5, 5, 12, 11, 6, 5, 8, 10, 10, 6, 5, 1],
    [2, 8, 11, 12, 7, 4, 10, 10, 8, 4, 6, 1],
    [5, 5, 12, 11, 7, 6, 9, 12, 9, 6, 3, 1],
    [1, 4, 9, 8, 4, 5, 6, 10, 6, 4, 2, 2],
  ],
  'sdr-05': [
    [2, 4, 8, 10, 4, 3, 8, 10, 8, 4, 2, 0],
    [3, 6, 9, 8, 5, 5, 8, 9, 9, 4, 3, 0],
    [2, 5, 8, 8, 4, 6, 6, 10, 8, 4, 2, 0],
    [2, 6, 10, 9, 5, 3, 8, 8, 9, 5, 2, 2],
    [3, 4, 6, 8, 5, 2, 7, 6, 4, 2, 2, 2],
  ],
  'sdr-06': [
    [2, 2, 4, 8, 5, 2, 5, 10, 4, 4, 1, 0],
    [2, 5, 6, 8, 3, 3, 5, 7, 7, 5, 2, 1],
    [4, 2, 6, 6, 4, 4, 5, 6, 8, 2, 4, 2],
    [3, 2, 5, 5, 4, 2, 8, 8, 6, 4, 4, 2],
    [3, 3, 4, 4, 3, 3, 4, 4, null, null, null, null],
  ],
  'sdr-07': [
    [5, 10, 10, 10, 5, 4, 4, 4, 4, 0, 0, 0],
    [7, 10, 13, 12, 4, 3, 5, 5, 5, 1, 0, 1],
    [6, 9, 12, 11, 6, 3, 6, 5, 2, 0, 0, 0],
    [5, 10, 12, 10, 4, 4, 4, 5, 3, 0, 0, 0],
    [5, 6, 8, 8, 5, 2, 4, 2, 2, 2, 2, 0],
  ],
  'sdr-08': [
    [2, 2, 6, 6, 3, 4, 4, 4, 6, 4, 1, 1],
    [3, 3, 3, 4, 4, 2, 4, 5, 4, 3, 1, 0],
    [null, null, 3, 6, 4, 3, 5, 7, 4, 2, 1, 0],
    [0, 4, 4, 6, 4, 2, 4, 6, 6, 5, 0, 0],
    [2, 3, 4, 3, 3, 1, 4, 4, 4, 2, 1, 0],
  ],
};

function buildSdr(sdrId: string, rows: readonly (readonly (number | null)[])[]): AgendaCell[] {
  return DAY_ORDER.flatMap((day, dayIndex) =>
    (rows[dayIndex] ?? []).map((value, hourIndex) => ({
      sdrId,
      day,
      hour: HOURS[hourIndex] ?? 8,
      value,
    })),
  );
}

export const data: readonly AgendaCell[] = sdrs.flatMap((sdr) => buildSdr(sdr.id, ROWS[sdr.id] ?? []));
