/**
 * Entradas de lead por hora ao longo das 24 horas de cada dia da semana, em anéis concêntricos.
 * Cada célula é a MÉDIA por ocorrência do dia no recorte de 12 semanas, não a soma bruta.
 *
 * O `value` é `number | null` de propósito, e os dois casos não são o mesmo:
 * `null` é hora em que a campanha NÃO VEICULOU, então não houve medição possível;
 * `0` é hora em que a campanha veiculou e nenhuma pessoa entrou, que é zero medido.
 *
 * A ordem de `DAY_ORDER` é a ordem dos anéis, de dentro para fora: segunda é o anel do centro e
 * domingo é o de fora. Isso está escrito no rodapé da peça, porque anel não tem rótulo próprio.
 *
 * Dado fictício e fixo: nenhuma pessoa, empresa ou campanha real, sem fuso a converter.
 */
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface RadialHourCell {
  readonly day: WeekDay;
  /** Hora cheia, 0 a 23. */
  readonly hour: number;
  /** Leads por ocorrência do dia nesta hora; `null` quando a campanha não veiculou. */
  readonly value: number | null;
}

/** Do anel do centro para o de fora: segunda no centro, domingo na borda. */
export const DAY_ORDER: readonly WeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

/** As 24 horas cheias, de 0h a 23h, com 0h no topo e sentido horário no desenho. */
export const HOURS: readonly number[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
];

/** Horas que ganham rótulo em volta do relógio, para a régua não lotar o perímetro. */
export const LABELLED_HOURS: readonly number[] = [0, 6, 12, 18];

/** O que a célula mede, impresso na legenda e na frase acessível. */
export const windowCaption = 'leads por ocorrência do dia, média de 12 semanas';

/** Uma linha por dia, na ordem de `HOURS`, de 0h a 23h. */
const ROWS: Record<WeekDay, readonly (number | null)[]> = {
  monday: [0.1, 0.1, 0.0, 0.0, 0.1, 0.2, 0.5, 1.1, 1.8, 3.2, 5.4, 7.6, 8.4, 7.2, 4.6, 5.1, 4.3, 3.0, 2.1, 1.5, 1.0, 0.7, 0.4, 0.2],
  tuesday: [0.1, 0.1, 0.0, 0.0, 0.1, 0.2, 0.5, 1.2, 1.9, 3.4, 5.7, 8.0, 8.8, 7.6, 4.8, 5.4, 4.5, 3.2, 2.2, 1.6, 1.1, 0.7, 0.4, 0.2],
  wednesday: [0.2, 0.1, 0.1, 0.0, 0.0, 0.1, 0.2, 0.5, 1.1, 1.8, 3.3, 5.5, 7.8, 8.6, 7.3, 4.7, 5.2, 4.4, 3.1, 2.1, 1.5, 1.0, 0.7, 0.4],
  thursday: [0.1, 0.0, 0.0, 0.1, 0.2, 0.6, 1.2, 2.0, 3.5, 5.9, 8.4, 9.2, 7.9, 5.1, 5.6, 4.7, 3.3, 2.3, 1.7, 1.1, 0.8, 0.4, 0.2, 0.1],
  friday: [0.1, 0.0, 0.0, 0.1, 0.2, 0.4, 1.0, 1.6, 2.8, 4.8, 6.7, 7.4, 6.3, 4.0, 4.5, 3.8, 2.6, 1.8, 1.3, 0.9, 0.6, 0.4, 0.2, 0.1],
  saturday: [0.2, 0.1, 0.1, null, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.4, 0.6, 1.1, 1.8, 2.6, 2.9, 2.4, 1.6, 1.7, 1.5, 1.0, 0.7, 0.5, 0.3],
  sunday: [0.2, 0.1, null, null, null, null, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.3, 0.5, 0.9, 1.2, 1.3, 1.2, 0.7, 0.8, 0.7, 0.5, 0.3, 0.2],
};

function buildRow(day: WeekDay, values: readonly (number | null)[]): RadialHourCell[] {
  return values.map((value, index) => ({ day, hour: HOURS[index] ?? 0, value }));
}

export const data: readonly RadialHourCell[] = DAY_ORDER.flatMap((day) => buildRow(day, ROWS[day]));
