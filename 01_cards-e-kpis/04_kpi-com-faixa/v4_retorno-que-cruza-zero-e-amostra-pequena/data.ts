/**
 * Dois casos limite do KPI em faixa, lado a lado. Dado fictício e fixo: nenhum valor é de empresa real.
 * O retorno é múltiplo do investido em mídia paga (0 é empate, negativo é perda), projetado para 2027.
 * O ciclo de venda é contado em dias corridos, da entrada à decisão, só para oportunidades já decididas;
 * as abertas ficam fora da conta e são declaradas em `openCount`.
 */
export type Provenance = 'MEDIDO' | 'DERIVADO' | 'PREMISSA' | 'LACUNA';

export interface ReturnRange {
  /** Rótulo com a palavra que declara a natureza do número: projeção. */
  readonly label: string;
  readonly provenance: Provenance;
  /** Limites da faixa em múltiplo do investido, ou `null` quando o cenário não foi calculado. */
  readonly low: number | null;
  readonly high: number | null;
  /** Ponto central do modelo, desenhado como corte fino; `null` para não desenhar. */
  readonly central: number | null;
  /** Domínio declarado da régua, que contém o zero e não é a própria faixa. */
  readonly domain: { readonly min: number; readonly max: number };
  /** A premissa que gera a faixa, em uma linha. */
  readonly premise: string;
}

export interface CycleSample {
  /** Rótulo com a estatística no nome: mediana. */
  readonly label: string;
  readonly provenance: Provenance;
  /** Dias da entrada à decisão, um por oportunidade ganha ou perdida, sem ordem garantida. */
  readonly durationsDays: readonly number[];
  /** Oportunidades ainda abertas no fim do período: sem desfecho, não entram nos quantis. */
  readonly openCount: number;
  /** Teto declarado da régua, em dias. */
  readonly ceilingDays: number;
}

export interface LimitCases {
  readonly returnRange: ReturnRange;
  readonly cycle: CycleSample;
}

export const data: LimitCases = {
  returnRange: {
    label: 'Retorno da mídia paga em 2027, projeção',
    provenance: 'PREMISSA',
    low: -0.3,
    high: 1.4,
    central: 0.5,
    domain: { min: -1, max: 2 },
    premise: 'receita por origem estimada, custo medido',
  },
  cycle: {
    label: 'Ciclo de venda da carteira nova, mediana',
    provenance: 'MEDIDO',
    durationsDays: [31, 9, 74, 22, 47, 13, 97, 42, 18, 61, 26, 52, 88, 34],
    openCount: 9,
    ceilingDays: 120,
  },
};
