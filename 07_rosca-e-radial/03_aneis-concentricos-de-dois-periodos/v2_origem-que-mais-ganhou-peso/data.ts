/**
 * Leads por canal de origem em dois meses fechados, em unidades. Dado fictício e fixo.
 * O componente ordena pelo mês atual e aplica a mesma ordem aos dois anéis.
 */
export interface OriginRing {
  readonly id: string;
  readonly name: string;
  /** Posição fixa na paleta categórica, atribuída na ordem 1, 3, 6, 5 (CONTRATO, COR-8). */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly previous: number;
  readonly current: number;
}

export const data: readonly OriginRing[] = [
  { id: 'midia-paga', name: 'Mídia paga', slot: 1, previous: 96, current: 143 },
  { id: 'indicacao', name: 'Indicação', slot: 3, previous: 120, current: 121 },
  { id: 'parceria', name: 'Parceria', slot: 6, previous: 79, current: 88 },
  { id: 'eventos', name: 'Eventos', slot: 5, previous: 55, current: 58 },
];

/** Mês do anel interno (anterior) e do anel externo (atual), em YYYY-MM. */
export const previousMonth = '2026-07';
export const currentMonth = '2026-08';
