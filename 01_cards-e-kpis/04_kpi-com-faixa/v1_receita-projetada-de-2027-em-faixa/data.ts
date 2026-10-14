/**
 * Receita projetada de 2027, em reais, escrita como faixa e não como ponto. Dado fictício e fixo:
 * nenhum valor é de empresa real. O domínio da régua vai de zero ao teto do plano, declarado aqui,
 * para que a largura da faixa seja lida contra uma escala que não é a própria faixa.
 * `low` ou `high` nulos são projeção não calculada: o cartão escreve indisponível e nada vira zero.
 */
export type Provenance = 'MEDIDO' | 'DERIVADO' | 'PREMISSA' | 'LACUNA';

export interface RangeReference {
  /** Valor medido que ancora a leitura, em reais. */
  readonly value: number;
  /** Nome curto, lido depois de "supera o" ou "fica abaixo do": "realizado de 2026". */
  readonly label: string;
}

export interface RangeKpi {
  /** Rótulo com a palavra que declara a natureza do número: projeção, cenário, estimativa. */
  readonly label: string;
  /** Procedência do número; faixa de cenário é quase sempre PREMISSA ou DERIVADO. */
  readonly provenance: Provenance;
  /** Limite inferior da faixa, em reais, ou `null` quando a projeção não foi calculada. */
  readonly low: number | null;
  /** Limite superior da faixa, em reais, ou `null` quando a projeção não foi calculada. */
  readonly high: number | null;
  /** Ponto central do modelo; opcional, e desenhado com peso menor que a faixa. */
  readonly central: number | null;
  /** Domínio declarado da régua: de zero até `max`, com o nome do teto. */
  readonly domain: { readonly max: number; readonly label: string };
  readonly reference: RangeReference | null;
  /** A premissa que gera a faixa, em uma linha. Vazia, o cartão pede para não publicar. */
  readonly premise: string;
}

export const data: RangeKpi = {
  label: 'Receita de 2027, projeção',
  provenance: 'PREMISSA',
  low: 6_800_000,
  high: 8_300_000,
  central: 7_500_000,
  domain: { max: 12_000_000, label: 'teto do plano' },
  reference: { value: 6_200_000, label: 'realizado de 2026' },
  premise: 'pré-vendas no teto medido de 240 entradas por mês',
};
