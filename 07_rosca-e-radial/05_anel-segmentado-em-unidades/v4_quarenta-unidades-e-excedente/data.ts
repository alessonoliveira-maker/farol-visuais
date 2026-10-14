/**
 * Reuniões do trimestre de um executivo contra a meta de 40, no teto de legibilidade do
 * formato: acima de 40 segmentos os gomos viram fios. Dado fictício e fixo.
 */
export interface QuarterlyMeetingSlot {
  readonly id: string;
}

export const metaTrimestral = 40;
export const totalRealizado = 43;
export const executiveName = 'Renan A.';

/** O anel desenha o teto de 40 segmentos, todos cumpridos; o excedente vai só no selo. */
export const data: readonly QuarterlyMeetingSlot[] = Array.from({ length: metaTrimestral }, (_, index) => ({
  id: `reuniao-${String(index + 1).padStart(2, '0')}`,
}));
