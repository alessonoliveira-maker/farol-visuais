/**
 * Custo total medido em 2026-08, em reais, com a parte que ainda não tem detalhamento.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * O total é medido; as linhas são o que veio detalhado; o que falta é a diferença entre os dois,
 * obtida pelo componente, porque três linhas ainda não foram devolvidas pela controladoria.
 * Fechamento: 142.000 + 96.000 + 41.000 + 24.000 + 11.000 = 314.000; 390.000 − 314.000 = 76.000.
 */
export interface CostLine {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

export interface DetailedCost {
  /** Mês no formato YYYY-MM. */
  readonly period: string;
  /** Custo total medido, com ou sem linha detalhada. */
  readonly total: number;
  /** Quantas linhas da controladoria não foram devolvidas: explicam a parte sem detalhamento. */
  readonly missingLines: number;
  readonly lines: readonly CostLine[];
}

export const data: DetailedCost = {
  period: '2026-08',
  total: 390_000,
  missingLines: 3,
  lines: [
    { id: 'midia', label: 'Mídia', value: 142_000 },
    { id: 'equipe', label: 'Equipe', value: 96_000 },
    { id: 'ferramentas', label: 'Ferramentas', value: 41_000 },
    { id: 'comissoes', label: 'Comissões', value: 24_000 },
    { id: 'brindes', label: 'Brindes', value: 11_000 },
  ],
};
