/**
 * Clientes novos do ano por origem de chegada, em contagem de clientes.
 * Dado fictício e fixo: nenhum número é de operação real.
 *
 * O caso difícil está no arredondamento: 412 clientes não dividem em 100 figuras sem resto, e a
 * indicação (127, ou 30,8%) cai em "cerca de 3 em cada 10". A categoria de ausência fica por último.
 */
export interface NewClientOrigin {
  readonly id: string;
  readonly name: string;
  /** Clientes novos que chegaram por esta origem no ano. */
  readonly clients: number;
  /** Posição fixa da cor da categoria na paleta (1 a 8); a cor não depende da ordem na lista. */
  readonly slot?: number;
  /** Categoria de ausência: tom neutro e por último. */
  readonly isUndeclared?: boolean;
}

export const data: readonly NewClientOrigin[] = [
  { id: 'origem-indicacao', name: 'Indicação', clients: 127, slot: 1 },
  { id: 'origem-midia', name: 'Mídia paga', clients: 118, slot: 3 },
  { id: 'origem-prospeccao', name: 'Prospecção ativa', clients: 84, slot: 6 },
  { id: 'origem-organico', name: 'Busca orgânica', clients: 61, slot: 5 },
  { id: 'origem-sem-origem', name: 'Sem origem declarada', clients: 22, isUndeclared: true },
];

/** Categoria cujo bloco abre a frase em destaque. */
export const highlightId = 'origem-indicacao';
