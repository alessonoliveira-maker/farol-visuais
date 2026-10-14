/**
 * Ticket das vendas ganhas por segmento de cliente no semestre, em reais: o menor e o maior ticket
 * observados em cada segmento e quantas vendas ganhas a faixa resume. Dado fictício e fixo. Casos
 * difíceis: faixa estreita (Saúde e clínicas, só 60 mil de amplitude), nome de segmento comprido e
 * amostras de tamanhos muito diferentes, de 9 a 38 vendas.
 */
export interface TicketRange {
  readonly id: string;
  readonly segment: string;
  readonly min: number;
  readonly max: number;
  readonly deals: number;
}

export const data: readonly TicketRange[] = [
  { id: 'seg-01', segment: 'Cooperativas agrícolas', min: 200_000, max: 760_000, deals: 14 },
  { id: 'seg-02', segment: 'Indústria metalmecânica', min: 180_000, max: 640_000, deals: 22 },
  { id: 'seg-03', segment: 'Transporte e logística', min: 170_000, max: 520_000, deals: 31 },
  { id: 'seg-04', segment: 'Distribuição atacadista', min: 190_000, max: 410_000, deals: 38 },
  { id: 'seg-05', segment: 'Saúde e clínicas', min: 230_000, max: 290_000, deals: 9 },
];
