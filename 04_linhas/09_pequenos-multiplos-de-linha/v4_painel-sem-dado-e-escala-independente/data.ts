/**
 * Leads mensais de 2026-01 a 2026-08, por origem de captação, em volumes muito diferentes entre
 * si. Uma origem não tem nenhum valor coletado no período (integração ainda não plugada).
 * Dado fictício e fixo: origens genéricas, nenhuma pessoa ou empresa real.
 */
export interface OriginMonthly {
  readonly id: string;
  readonly name: string;
  readonly points: readonly { readonly month: string; readonly value: number | null }[];
}

const MONTHS = [
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
] as const;

function series(values: readonly (number | null)[]): readonly { readonly month: string; readonly value: number | null }[] {
  return MONTHS.map((month, index) => ({ month, value: values[index] ?? null }));
}

export const data: readonly OriginMonthly[] = [
  { id: 'organico', name: 'Busca orgânica', points: series([520, 540, 560, 590, 610, 630, 650, 670]) },
  { id: 'social', name: 'Redes sociais', points: series([300, 310, 295, 330, 340, 320, 350, 365]) },
  { id: 'formulario', name: 'Formulário do site', points: series([180, 190, 175, 200, 210, 205, 220, 230]) },
  { id: 'parceria', name: 'Parceria comercial', points: series([40, 45, 42, 50, 48, 55, 52, 60]) },
  { id: 'indicacao', name: 'Indicação de cliente', points: series([18, 20, 22, 19, 25, 23, 27, 30]) },
  { id: 'evento', name: 'Evento e palestra', points: series([5, 25, 8, 4, 3, 28, 6, 5]) },
  { id: 'podcast', name: 'Anúncio em podcast', points: series([8, 9, 7, 10, 12, 11, 13, 14]) },
  { id: 'referral', name: 'Programa de indicação paga', points: series([null, null, null, null, null, null, null, null]) },
];
