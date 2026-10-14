/**
 * Entradas de lead de mídia paga por dia da semana e hora, das 8h às 20h, contra a janela em que
 * a pré-vendas fica desfalcada pelo almoço.
 * Cada célula é a MÉDIA por ocorrência do dia no recorte de 12 semanas, não a soma bruta: uma
 * quinta com 4 ocorrências no período divide por 4, não pelo total de dias do recorte.
 *
 * O `value` é `number | null` de propósito, e os dois casos não são o mesmo:
 * `null` é hora em que a campanha NÃO VEICULOU, então não houve medição possível;
 * `0` é hora em que a campanha veiculou e nenhuma pessoa entrou, que é zero medido.
 * Desenhar os dois iguais seria a ausência virando zero, e o desenho separa os dois.
 *
 * Dado fictício e fixo: nenhuma pessoa, empresa ou campanha real, sem fuso a converter.
 */
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface LeadHourCell {
  readonly day: WeekDay;
  /** Hora cheia, 8 a 20. */
  readonly hour: number;
  /** Leads por ocorrência do dia nesta hora; `null` quando a campanha não veiculou. */
  readonly value: number | null;
}

/** Ordem da operação: segunda a domingo. */
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

/** Grade fechada das 8h às 20h: fora dessa janela a campanha nunca veiculou no recorte. */
export const HOURS: readonly number[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

/** Horas em que parte da pré-vendas sai para almoço, declaradas pela escala da própria equipe. */
export const SHORT_STAFF_HOURS: readonly number[] = [12, 13];

/** Tamanho da equipe de pré-vendas e quantas pessoas saem na janela de almoço. */
export const STAFF_TOTAL = 5;
export const STAFF_AWAY = 2;

/** O que a célula mede, impresso na legenda e na frase acessível. */
export const windowCaption = 'leads por ocorrência do dia, média de 12 semanas';

const WEEKDAY_ROWS: Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday', readonly (number | null)[]> = {
  monday: [1.6, 3.0, 5.2, 7.4, 8.1, 7.0, 4.4, 4.9, 4.1, 2.8, 1.9, 1.2, 0.8],
  tuesday: [1.8, 3.4, 5.6, 7.9, 8.6, 7.4, 4.7, 5.2, 4.4, 3.0, 2.1, 1.3, 0.9],
  wednesday: [1.7, 3.2, 5.4, 7.6, 8.3, 7.1, 4.5, 5.0, 4.2, 2.9, 2.0, 1.2, 0.8],
  thursday: [1.9, 3.5, 5.8, 8.2, 9.0, 7.7, 4.9, 5.4, 4.6, 3.1, 2.2, 1.4, 1.0],
  friday: [1.5, 2.9, 4.8, 6.9, 7.5, 6.4, 4.0, 4.3, 3.6, 2.4, 1.6, 0.9, 0.4],
};

/**
 * Fim de semana com a veiculação recortada pela própria campanha: no sábado ela para às 17h e no
 * domingo só começa às 13h. As horas sem veiculação vão como `null`, e o domingo ainda traz duas
 * horas de zero medido, que veicularam e não trouxeram ninguém.
 */
const WEEKEND_ROWS: Record<'saturday' | 'sunday', readonly (number | null)[]> = {
  saturday: [0.5, 1.1, 1.7, 2.2, 2.4, 2.0, 1.0, 1.2, 0.9, null, null, null, null],
  sunday: [null, null, null, null, null, 0.4, 0.6, 0.7, 0.5, 0.3, 0.0, 0.1, 0.0],
};

function buildRow(day: WeekDay, values: readonly (number | null)[]): LeadHourCell[] {
  return values.map((value, index) => ({ day, hour: HOURS[index] ?? 8, value }));
}

export const data: readonly LeadHourCell[] = [
  ...buildRow('monday', WEEKDAY_ROWS.monday),
  ...buildRow('tuesday', WEEKDAY_ROWS.tuesday),
  ...buildRow('wednesday', WEEKDAY_ROWS.wednesday),
  ...buildRow('thursday', WEEKDAY_ROWS.thursday),
  ...buildRow('friday', WEEKDAY_ROWS.friday),
  ...buildRow('saturday', WEEKEND_ROWS.saturday),
  ...buildRow('sunday', WEEKEND_ROWS.sunday),
];
