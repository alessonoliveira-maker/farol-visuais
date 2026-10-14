/**
 * Perdas na etapa de proposta em 2026-T3, em contagem: 110 no pai e 97 com motivo registrado nos
 * filhos. As 13 restantes não têm motivo e aparecem como passo próprio, sem redistribuir.
 * Dado fictício e fixo.
 */
export interface LossPart {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

export interface LossParent {
  readonly period: string;
  /** Nome do pai, que dá nome à última coluna. */
  readonly label: string;
  readonly value: number;
  readonly parts: readonly LossPart[];
}

export const data: LossParent = {
  period: '2026-T3',
  label: 'Perdas na proposta',
  value: 110,
  parts: [
    { id: 'preco', label: 'Preço', value: 38 },
    { id: 'concorrencia', label: 'Concorrência', value: 29 },
    { id: 'prazo', label: 'Prazo', value: 21 },
    { id: 'sem-decisao', label: 'Sem decisão', value: 9 },
  ],
};
