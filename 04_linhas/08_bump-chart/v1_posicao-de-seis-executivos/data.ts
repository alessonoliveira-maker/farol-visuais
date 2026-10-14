/**
 * Receita reconhecida por trimestre de 6 executivos fictícios, em reais, de 2024-09 a 2026-06.
 * Dado fictício e fixo: nenhum nome é pessoa real. Cada mês representa o fechamento do
 * trimestre encerrado naquele mês.
 */
export interface ExecutiveRevenueSeries {
  readonly id: string;
  readonly name: string;
  /** Um valor por trimestre, na mesma ordem de `quarters`. */
  readonly values: readonly number[];
}

export const quarters: readonly string[] = [
  '2024-09',
  '2024-12',
  '2025-03',
  '2025-06',
  '2025-09',
  '2025-12',
  '2026-03',
  '2026-06',
];

export const data: readonly ExecutiveRevenueSeries[] = [
  { id: 'exec-01', name: 'Fernanda L.', values: [520_000, 540_000, 500_000, 460_000, 415_000, 430_000, 470_000, 510_000] },
  { id: 'exec-02', name: 'Bruno T.', values: [300_000, 330_000, 360_000, 395_000, 410_000, 440_000, 465_000, 500_000] },
  { id: 'exec-03', name: 'Marcia N.', values: [480_000, 450_000, 420_000, 390_000, 360_000, 330_000, 300_000, 270_000] },
  { id: 'exec-04', name: 'Diego P.', values: [250_000, 280_000, 320_000, 370_000, 405_000, 380_000, 340_000, 300_000] },
  { id: 'exec-05', name: 'Aline C.', values: [200_000, 215_000, 230_000, 245_000, 260_000, 275_000, 290_000, 305_000] },
  { id: 'exec-06', name: 'Rodrigo S.', values: [150_000, 180_000, 225_000, 290_000, 350_000, 400_000, 450_000, 520_000] },
];
