/**
 * Leads por semana em 2026, de 2026-01-05 a 2026-03-16 (11 semanas), por origem.
 * Dado fictício e fixo: origens genéricas de captação, nenhuma pessoa ou empresa real.
 */
export interface OriginWeekly {
  readonly id: string;
  readonly name: string;
  readonly points: readonly { readonly week: string; readonly value: number }[];
}

const WEEKS = [
  '2026-01-05',
  '2026-01-12',
  '2026-01-19',
  '2026-01-26',
  '2026-02-02',
  '2026-02-09',
  '2026-02-16',
  '2026-02-23',
  '2026-03-02',
  '2026-03-09',
  '2026-03-16',
] as const;

function series(values: readonly number[]): readonly { readonly week: string; readonly value: number }[] {
  return WEEKS.map((week, index) => ({ week, value: values[index] ?? 0 }));
}

export const data: readonly OriginWeekly[] = [
  { id: 'organico', name: 'Busca orgânica', points: series([48, 52, 55, 51, 58, 60, 63, 66, 64, 70, 72]) },
  { id: 'indicacao', name: 'Indicação de cliente', points: series([22, 19, 25, 21, 24, 20, 26, 23, 27, 25, 29]) },
  { id: 'formulario', name: 'Formulário do site', points: series([40, 38, 44, 41, 46, 43, 49, 45, 50, 47, 53]) },
  { id: 'evento', name: 'Evento e palestra', points: series([12, 30, 14, 11, 9, 33, 10, 8, 12, 9, 31]) },
  { id: 'parceria', name: 'Parceria comercial', points: series([31, 29, 34, 30, 33, 28, 35, 32, 36, 30, 38]) },
  { id: 'direto', name: 'Contato direto por telefone', points: series([15, 13, 17, 14, 16, 12, 18, 15, 19, 14, 20]) },
];
