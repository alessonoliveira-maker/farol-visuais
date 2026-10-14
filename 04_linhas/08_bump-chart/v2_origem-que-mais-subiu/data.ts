/**
 * Volume mensal de leads por origem, em contagem de leads, de 2026-01 a 2026-06.
 * Dado fictício e fixo: nenhuma origem nomeia uma plataforma ou empresa real fora das
 * categorias genéricas de canal (busca, mídia paga, indicação, evento, parceria, outbound).
 */
export interface LeadOriginSeries {
  readonly id: string;
  readonly name: string;
  /** Um valor por mês, na mesma ordem de `months`. */
  readonly values: readonly number[];
}

export const months: readonly string[] = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

export const data: readonly LeadOriginSeries[] = [
  { id: 'origin-busca', name: 'Busca orgânica', values: [220, 215, 210, 205, 200, 195] },
  { id: 'origin-indicacao', name: 'Indicação', values: [180, 185, 190, 195, 200, 205] },
  { id: 'origin-midia-social', name: 'Mídia paga social', values: [260, 250, 230, 210, 190, 170] },
  { id: 'origin-busca-paga', name: 'Mídia paga em busca', values: [240, 235, 225, 215, 205, 190] },
  { id: 'origin-outbound', name: 'Outbound', values: [150, 155, 160, 165, 170, 175] },
  { id: 'origin-evento', name: 'Evento', values: [90, 95, 100, 105, 110, 115] },
  { id: 'origin-referencia', name: 'Referência de cliente', values: [130, 135, 140, 145, 150, 155] },
  { id: 'origin-parceria', name: 'Parceria', values: [40, 70, 110, 150, 190, 230] },
];

/** A origem em destaque: a que mais subiu no ranking no período. */
export const highlightId = 'origin-parceria';
