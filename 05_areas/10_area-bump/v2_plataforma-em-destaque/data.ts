/**
 * Investimento trimestral por plataforma de mídia paga, em reais, de 8 trimestres fictícios.
 * Dado fictício e fixo: nenhuma plataforma é marca real, os nomes são canais genéricos.
 * `null` é trimestre sem coleta (lacuna), distinto de um valor medido em zero.
 */
export interface PlatformSeries {
  readonly id: string;
  readonly label: string;
  /**
   * Posição fixa da série na paleta (1 a 6, que vira `--chart-1` a `--chart-6`) quando a série não
   * é o destaque: o destaque usa sempre `--chart-1`, os demais usam `--line-strong` (CONTRATO, COR-3).
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly values: readonly (number | null)[];
}

export const periods: readonly string[] = [
  '1º tri/24',
  '2º tri/24',
  '3º tri/24',
  '4º tri/24',
  '1º tri/25',
  '2º tri/25',
  '3º tri/25',
  '4º tri/25',
];

export const data: readonly PlatformSeries[] = [
  { id: 'busca-paga', label: 'Busca paga', slot: 1, values: [180_000, 190_000, 205_000, 215_000, 230_000, 245_000, 260_000, 275_000] },
  { id: 'midia-social', label: 'Mídia paga social', slot: 3, values: [260_000, 255_000, 240_000, 225_000, 210_000, 195_000, 180_000, 165_000] },
  { id: 'marketplace-video', label: 'Marketplace de vídeo', slot: 6, values: [90_000, 100_000, 120_000, 140_000, 150_000, 165_000, 175_000, 190_000] },
  { id: 'rede-display', label: 'Rede de display', slot: 5, values: [140_000, 135_000, 130_000, 125_000, 120_000, 115_000, 110_000, 105_000] },
  { id: 'parcerias', label: 'Parcerias', slot: 2, values: [60_000, 70_000, 85_000, 95_000, 100_000, 110_000, 120_000, 130_000] },
  { id: 'retargeting', label: 'Retargeting', slot: 4, values: [50_000, 55_000, 60_000, 65_000, 70_000, 75_000, 80_000, 85_000] },
];

/** Plataforma acompanhada nesta versão: começa em 2º e termina líder. */
export const highlightId = 'busca-paga';
