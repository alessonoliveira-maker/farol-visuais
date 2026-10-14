/**
 * Auditoria de um classificador de texto que sugere o motivo de perda: a linha é o motivo que a
 * revisão humana confirmou e a coluna é o motivo que o classificador sugeriu, em contagem de perdas.
 * Dado fictício e fixo, sobre 1.200 perdas.
 *
 * Duas dificuldades estão no dado de propósito. A classe Fora de hora não tem nenhum caso revisado,
 * então a revocação dela divide por zero e o cálculo precisa devolver ausência, nunca zero; a
 * precisão dela, ao contrário, tem denominador e vale zero de verdade, porque o classificador sugeriu
 * o motivo 18 vezes e acertou nenhuma. E a coluna Sem fit recolhe erro das outras três classes, que
 * é justamente a pergunta que o cartão persegue.
 */
export interface LossReason {
  readonly id: string;
  readonly label: string;
}

/** Motivos de perda, na ordem do dicionário. A mesma lista vale como linha e como coluna. */
export const REASONS: readonly LossReason[] = [
  { id: 'sem-fit', label: 'Sem fit' },
  { id: 'preco', label: 'Preço' },
  { id: 'concorrencia', label: 'Concorrência' },
  { id: 'sem-resposta', label: 'Sem resposta' },
  { id: 'fora-de-hora', label: 'Fora de hora' },
];

export interface ConfusionRow {
  /** Motivo confirmado pela revisão humana. */
  readonly actual: string;
  /** Contagem por motivo sugerido, na ordem de REASONS. */
  readonly predicted: readonly number[];
}

export const data: readonly ConfusionRow[] = [
  { actual: 'sem-fit', predicted: [410, 28, 34, 40, 8] },
  { actual: 'preco', predicted: [46, 168, 31, 12, 3] },
  { actual: 'concorrencia', predicted: [38, 22, 118, 9, 3] },
  { actual: 'sem-resposta', predicted: [57, 6, 5, 158, 4] },
  { actual: 'fora-de-hora', predicted: [0, 0, 0, 0, 0] },
];

/** Último dia da amostra revisada, para o recorte aparecer desenhado e não só na frase acessível. */
export const periodEnd = '2026-09-14';
