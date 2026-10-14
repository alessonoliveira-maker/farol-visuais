/**
 * Oportunidades de 2026 cruzadas por origem do lead e por desfecho (ganho, perdido ou em aberto):
 * uma tabela de contingência de duas variáveis. Contagem de oportunidades. Dado fictício e fixo:
 * nenhuma origem é marca ou plataforma real e nenhum número vem de base real.
 * Casos de borda de propósito: Evento tem 22 oportunidades e o esperado de "em aberto" fica em
 * 3,1, abaixo de 5 (amostra insuficiente); Orgânico não tem nenhuma em aberto, com 8,8 esperadas
 * (zero observado); Indicação de cliente com ganho passa de +4 e Redes sociais com ganho passa
 * de −4, então os cinco degraus da legenda aparecem.
 * A ordem das linhas é a ordem da pilha quando as variáveis são invertidas.
 */
export type OutcomeId = 'won' | 'lost' | 'open';

export interface Outcome {
  readonly id: OutcomeId;
  readonly label: string;
}

export interface OriginOutcomes {
  readonly id: string;
  readonly label: string;
  /** Oportunidades por desfecho. Todo desfecho de `outcomes` aparece, mesmo com zero. */
  readonly counts: Readonly<Record<OutcomeId, number>>;
}

export interface MosaicVariables {
  /** Nome, em minúsculas, da variável das linhas de `data` (a que divide primeiro ao abrir). */
  readonly rows: string;
  /** Nome, em minúsculas, da variável de `outcomes`. */
  readonly outcomes: string;
}

/** A ordem desta lista é a ordem da pilha, da base para o topo: o ganho fica na base. */
export const outcomes: readonly Outcome[] = [
  { id: 'won', label: 'Ganho' },
  { id: 'lost', label: 'Perdido' },
  { id: 'open', label: 'Em aberto' },
];

export const variables: MosaicVariables = { rows: 'origem', outcomes: 'desfecho' };

export const data: readonly OriginOutcomes[] = [
  { id: 'redes-sociais', label: 'Redes sociais', counts: { won: 22, lost: 134, open: 34 } },
  { id: 'busca-paga', label: 'Busca paga', counts: { won: 40, lost: 82, open: 28 } },
  { id: 'indicacao', label: 'Indicação de cliente', counts: { won: 58, lost: 30, open: 8 } },
  { id: 'organico', label: 'Orgânico', counts: { won: 20, lost: 42, open: 0 } },
  { id: 'evento', label: 'Evento', counts: { won: 6, lost: 12, open: 4 } },
];
