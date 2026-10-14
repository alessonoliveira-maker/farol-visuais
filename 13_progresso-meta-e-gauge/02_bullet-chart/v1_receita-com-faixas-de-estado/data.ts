/**
 * Receita reconhecida do trimestre contra a meta e a régua qualitativa de estado, acordada em
 * reunião de planejamento de 2026-07-01. Valor, meta e faixas em reais. Dado fictício e fixo.
 */
export interface QualitativeBand {
  readonly name: string;
  readonly from: number;
  readonly to: number;
}

export interface QuarterlyBullet {
  readonly label: string;
  readonly value: number;
  readonly target: number;
  readonly bands: readonly QualitativeBand[];
}

export const data: QuarterlyBullet = {
  label: 'Receita reconhecida, 2026-T3',
  value: 3_820_000,
  target: 5_000_000,
  bands: [
    { name: 'Ruim', from: 0, to: 3_000_000 },
    { name: 'Aceitável', from: 3_000_000, to: 4_500_000 },
    { name: 'Boa', from: 4_500_000, to: 6_000_000 },
  ],
};
