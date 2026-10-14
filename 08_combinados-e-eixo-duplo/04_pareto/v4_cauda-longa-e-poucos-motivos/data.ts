/**
 * Oportunidades perdidas no trimestre por motivo, no funil comercial (pré-vendas e vendas).
 * Dado fictício e fixo: quantidade de negócios perdidos por motivo, 3º trimestre de 2026. O
 * recorte tem 40 motivos distintos; aqui vêm os 10 de maior volume, e os 30 restantes entram
 * somados em `tailLosses`, com a contagem em `tailCount`. A última categoria nomeada tem 2
 * perdas de propósito, para exercitar o `minPointSize` da coluna minúscula, e a cauda somada é
 * maior que 6 das 10 nomeadas, para provar que ela pesa na escala sem furar a ordenação.
 */
export interface LossReason {
  readonly id: string;
  readonly reason: string;
  readonly count: number;
}

export const data: readonly LossReason[] = [
  { id: 'preco', reason: 'Preço', count: 44 },
  { id: 'duplicado', reason: 'Duplicado', count: 2 },
  { id: 'sem-fit', reason: 'Sem fit', count: 58 },
  { id: 'escopo', reason: 'Escopo', count: 18 },
  { id: 'sem-retorno', reason: 'Sem retorno', count: 39 },
  { id: 'momento', reason: 'Momento', count: 14 },
  { id: 'concorrencia', reason: 'Concorrência', count: 31 },
  { id: 'sem-decisor', reason: 'Sem decisor', count: 9 },
  { id: 'prazo', reason: 'Prazo', count: 26 },
  { id: 'sem-verba', reason: 'Sem verba', count: 22 },
];

/** Quantos motivos ficaram fora do top 10 e entram somados na coluna final. */
export const tailCount = 30;

/** Perdas somadas dos motivos da cauda, no mesmo trimestre. */
export const tailLosses = 45;
