/**
 * Vitórias comerciais do semestre, contadas uma a uma, por origem do lead.
 * Dado fictício e fixo: nenhum número é de operação real.
 *
 * O caso difícil está nos extremos: um nome longo ("Indicação de clientes"), uma origem com poucas
 * vitórias (3) e a categoria de ausência ("Sem origem declarada"), que fica por último e em tom neutro.
 */
export interface OriginWins {
  readonly id: string;
  /** Nome da origem como aparece na fileira. */
  readonly name: string;
  /** Vitórias do semestre; um ícone por vitória. */
  readonly wins: number;
  /** Categoria de ausência: vai por último e em tom neutro. */
  readonly isUndeclared?: boolean;
}

export const data: readonly OriginWins[] = [
  { id: 'origem-parceiro', name: 'Parceiro de canal', wins: 3 },
  { id: 'origem-indicacao', name: 'Indicação de clientes', wins: 17 },
  { id: 'origem-evento', name: 'Evento presencial', wins: 6 },
  { id: 'origem-sem-origem', name: 'Sem origem declarada', wins: 2, isUndeclared: true },
  { id: 'origem-midia', name: 'Mídia paga', wins: 13 },
  { id: 'origem-prospeccao', name: 'Prospecção ativa', wins: 11 },
];
