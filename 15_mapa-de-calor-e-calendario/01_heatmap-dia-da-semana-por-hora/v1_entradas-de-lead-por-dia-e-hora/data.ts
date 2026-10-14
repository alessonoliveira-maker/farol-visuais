/**
 * Entradas de lead de mídia paga por dia da semana e hora, das 8h às 20h.
 * Cada célula é a MÉDIA por ocorrência do dia no recorte de 12 semanas (não a soma bruta):
 * uma quinta com 4 ocorrências no período divide por 4, não pelo total de dias do recorte.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real, sem fuso a converter.
 */
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface LeadHourCell {
  readonly day: WeekDay;
  /** Hora cheia, 8 a 20. */
  readonly hour: number;
  /** Leads por ocorrência do dia nesta hora, média das últimas 12 semanas. */
  readonly value: number;
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

/** Grade fechada das 8h às 20h: fora do expediente fica fora do escopo desta versão. */
export const HOURS: readonly number[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const WEEKDAY_ROWS: Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday', readonly number[]> = {
  monday: [1.8, 3.2, 5.4, 5.8, 2.6, 2.2, 4.6, 5.1, 4.3, 3.0, 2.1, 1.4, 0.9],
  tuesday: [2.0, 3.6, 5.7, 6.1, 2.8, 2.4, 4.9, 5.4, 4.6, 3.2, 2.3, 1.5, 1.0],
  wednesday: [1.9, 3.4, 5.5, 5.9, 2.7, 2.3, 4.7, 5.2, 4.4, 3.1, 2.2, 1.4, 0.9],
  thursday: [2.1, 3.7, 5.8, 6.3, 2.9, 2.5, 5.0, 5.6, 4.7, 3.3, 2.4, 1.6, 1.1],
  friday: [1.7, 3.1, 5.0, 5.3, 2.4, 2.0, 4.2, 4.6, 3.8, 2.6, 1.7, 1.0, 0.5],
};

/** Fim de semana medido à parte: volume bem mais baixo, com horas sem nenhuma entrada no domingo. */
const WEEKEND_ROWS: Record<'saturday' | 'sunday', readonly number[]> = {
  saturday: [0.6, 1.2, 1.8, 1.6, 0.9, 0.7, 1.1, 1.3, 1.0, 0.6, 0.4, 0.2, 0.1],
  sunday: [0.0, 0.2, 0.5, 0.6, 0.3, 0.2, 0.4, 0.5, 0.4, 0.2, 0.1, 0.0, 0.0],
};

function buildRow(day: WeekDay, values: readonly number[]): LeadHourCell[] {
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

/** O que a média conta e a janela, impresso depois do número. */
export const windowCaption = 'leads por ocorrência do dia, média de 12 semanas';
