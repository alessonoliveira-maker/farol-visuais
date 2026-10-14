/**
 * Receita de 2027 em três cenários, em reais, e qual deles virou meta. Dado fictício e fixo:
 * nenhum valor é de empresa real. A faixa vai do menor ao maior cenário; o domínio da régua vai
 * de zero ao teto do plano. `value: null` é cenário não calculado: fica fora da régua e da faixa,
 * escrito como indisponível.
 */
export type Provenance = 'MEDIDO' | 'DERIVADO' | 'PREMISSA' | 'LACUNA';

/** Forma fixa por cenário: a marca se distingue por forma e rótulo, não só por cor. */
export type ScenarioShape = 'square' | 'diamond' | 'circle';

export interface Scenario {
  readonly id: string;
  /** Nome do cenário em minúsculas, lido depois de "do": "conservador". */
  readonly label: string;
  readonly value: number | null;
  readonly shape: ScenarioShape;
}

export interface ScenarioRange {
  readonly label: string;
  readonly provenance: Provenance;
  /** Na ordem de leitura, do menor ao maior; o componente ordena de novo por valor. */
  readonly scenarios: readonly Scenario[];
  /** O cenário que virou meta: acende em destaque e ganha peso 700. */
  readonly goalId: string;
  readonly domain: { readonly max: number; readonly label: string };
  readonly premise: string;
}

export const data: ScenarioRange = {
  label: 'Receita de 2027 em três cenários',
  provenance: 'PREMISSA',
  scenarios: [
    { id: 'conservador', label: 'conservador', value: 6_800_000, shape: 'square' },
    { id: 'base', label: 'base', value: 7_412_000, shape: 'diamond' },
    { id: 'otimista', label: 'otimista', value: 8_300_000, shape: 'circle' },
  ],
  goalId: 'base',
  domain: { max: 12_000_000, label: 'teto do plano' },
  premise: 'conversão da agenda em venda de 16%, 18% e 21%',
};
