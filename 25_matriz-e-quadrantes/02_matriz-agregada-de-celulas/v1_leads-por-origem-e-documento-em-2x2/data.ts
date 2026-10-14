/**
 * Leads de um mês (2026-09) cruzados por duas perguntas de sim ou não: a origem foi identificada e o
 * documento é válido. Contagem de leads por caixa, em unidades. Dado fictício e fixo. `leads` é
 * `null` quando a caixa não foi medida, e esse caso é diferente de zero.
 */
export interface LeadBox {
  readonly id: string;
  readonly label: string;
  readonly hasOrigin: boolean;
  readonly hasDocument: boolean;
  readonly leads: number | null;
}

export const month = '2026-09';

export const data: readonly LeadBox[] = [
  { id: 'both', label: 'Origem e documento', hasOrigin: true, hasDocument: true, leads: 412 },
  { id: 'origin-only', label: 'Só origem identificada', hasOrigin: true, hasDocument: false, leads: 163 },
  { id: 'document-only', label: 'Só documento válido', hasOrigin: false, hasDocument: true, leads: 88 },
  { id: 'neither', label: 'Sem origem nem documento', hasOrigin: false, hasDocument: false, leads: 47 },
];
