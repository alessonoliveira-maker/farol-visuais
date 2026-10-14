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
  { id: 'indicacao', name: 'Indicação', slot: 1, previous: 142, current: 168 },
  { id: 'midia-paga', name: 'Mídia paga', slot: 3, previous: 118, current: 152 },
  { id: 'busca-organica', name: 'Busca orgânica', slot: 6, previous: 94, current: 88 },
  { id: 'redes-sociais', name: 'Redes sociais', slot: 5, previous: 48, current: 50 },
];

/** Mês do anel interno (anterior) e do anel externo (atual), em YYYY-MM. */
export const previousMonth = '2026-07';
export const currentMonth = '2026-08';
