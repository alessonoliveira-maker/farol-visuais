/**
 * Custo por lead (CPL) mensal de 2026-01 a 2026-08, em reais, por canal de mídia paga.
 * Dado fictício e fixo: canais genéricos, nenhuma plataforma ou marca real.
 */
export interface ChannelCpl {
  readonly id: string;
  readonly name: string;
  readonly points: readonly { readonly month: string; readonly value: number }[];
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

function series(values: readonly number[]): readonly { readonly month: string; readonly value: number }[] {
  return MONTHS.map((month, index) => ({ month, value: values[index] ?? 0 }));
}

export const data: readonly ChannelCpl[] = [
  { id: 'busca', name: 'Busca paga', points: series([210, 195, 225, 240, 230, 255, 248, 260]) },
  { id: 'social', name: 'Redes sociais', points: series([165, 158, 172, 180, 175, 190, 205, 198]) },
  { id: 'display', name: 'Comparadores e marketplaces', points: series([310, 295, 330, 340, 325, 360, 355, 370]) },
  { id: 'video', name: 'Vídeo', points: series([140, 150, 145, 138, 152, 160, 158, 165]) },
];
