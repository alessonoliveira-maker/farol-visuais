/**
 * Carteira de oportunidades em aberto de oito executivos em 2026-T3, em reais: início, entradas no
 * trimestre, saídas por ganho, por perda e por arquivamento (30 dias paradas), e fim. O fim não é
 * guardado: é início + entradas − ganhas − perdidas − arquivadas, calculado no componente.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 * Casos difíceis de propósito: a taxa de ganho vai de 14,3% (Renan A., 3 de 21) a 57,1% (Murilo C.,
 * 8 de 14); a maior saída de Renan A. é a perda, não a entrada; Camila R. não arquivou nada (zero
 * medido); Lívia T. é executiva nova e fechou só 3 oportunidades, amostra pequena demais para
 * desenhar a ponte.
 * `wonCount` e `lostCount` são oportunidades fechadas no trimestre, e `won`, `lost` e `archived`
 * são os valores, sempre positivos, que saíram da carteira por cada motivo.
 */
export interface ExecutiveBridge {
  readonly id: string;
  readonly name: string;
  readonly start: number;
  readonly entries: number;
  readonly won: number;
  readonly lost: number;
  readonly archived: number;
  readonly wonCount: number;
  readonly lostCount: number;
}

export const data: readonly ExecutiveBridge[] = [
  { id: 'exec-01', name: 'Talita V.', start: 940_000, entries: 520_000, won: 300_000, lost: 260_000, archived: 90_000, wonCount: 6, lostCount: 10 },
  { id: 'exec-02', name: 'Murilo C.', start: 820_000, entries: 610_000, won: 420_000, lost: 190_000, archived: 110_000, wonCount: 8, lostCount: 6 },
  { id: 'exec-03', name: 'Camila R.', start: 700_000, entries: 390_000, won: 280_000, lost: 170_000, archived: 0, wonCount: 7, lostCount: 11 },
  { id: 'exec-04', name: 'Otávio S.', start: 560_000, entries: 450_000, won: 200_000, lost: 230_000, archived: 120_000, wonCount: 5, lostCount: 10 },
  { id: 'exec-05', name: 'Renan A.', start: 650_000, entries: 300_000, won: 240_000, lost: 330_000, archived: 150_000, wonCount: 3, lostCount: 18 },
  { id: 'exec-06', name: 'Helena P.', start: 480_000, entries: 360_000, won: 310_000, lost: 90_000, archived: 40_000, wonCount: 8, lostCount: 12 },
  { id: 'exec-07', name: 'Bruno M.', start: 380_000, entries: 300_000, won: 150_000, lost: 140_000, archived: 130_000, wonCount: 4, lostCount: 9 },
  { id: 'exec-08', name: 'Lívia T.', start: 60_000, entries: 75_000, won: 20_000, lost: 10_000, archived: 15_000, wonCount: 1, lostCount: 2 },
];
