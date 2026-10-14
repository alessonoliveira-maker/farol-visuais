/**
 * Estoque da fila de pré-vendas por etapa, em contagem de oportunidades, ao longo de 26 semanas.
 *
 * A semana é nomeada pela segunda-feira em que começa, e o número é o estoque fotografado nessa
 * segunda-feira: é saldo em aberto, não fluxo da semana. A soma das quatro etapas é a fila
 * inteira, que se compara com o teto de capacidade da equipe.
 *
 * A semana de 2026-08-10 tem zero em Agenda marcada, e o zero é medido: naquela segunda ninguém
 * tinha agenda confirmada. Ele está no dado de propósito, para o total acima da pilha não depender
 * da última camada ter altura.
 *
 * Dado fictício e fixo: nenhuma pessoa, empresa ou operação real.
 */

/** Chaves das etapas da fila, da base da pilha para o topo. */
export type StageKey = 'entrada' | 'contato' | 'qualificacao' | 'agenda';

export interface StageDefinition {
  readonly key: StageKey;
  /** Nome de tela da etapa, em pt-BR. */
  readonly label: string;
  /** Slot categórico do token, na ordem 1, 3, 6, 5 da COR-8. */
  readonly slot: number;
}

export interface QueueWeek {
  /** Segunda-feira da semana, em YYYY-MM-DD. */
  readonly week: string;
  readonly entrada: number;
  readonly contato: number;
  readonly qualificacao: number;
  readonly agenda: number;
  /**
   * Âncora do rótulo de total: sempre zero, e empilhada junto das etapas para nascer no topo da
   * pilha. Serve de série auxiliar e por isso não é etapa nenhuma.
   */
  readonly anchor: number;
}

/** Etapas da base da pilha para o topo. */
export const stages: readonly StageDefinition[] = [
  { key: 'entrada', label: 'Entrada', slot: 1 },
  { key: 'contato', label: 'Em contato', slot: 3 },
  { key: 'qualificacao', label: 'Em qualificação', slot: 6 },
  { key: 'agenda', label: 'Agenda marcada', slot: 5 },
];

/** Teto de capacidade da equipe de pré-vendas, em oportunidades em aberto. */
export const capacity = 260;

export const data: readonly QueueWeek[] = [
  { week: '2026-04-06', entrada: 84, contato: 52, qualificacao: 31, agenda: 14, anchor: 0 },
  { week: '2026-04-13', entrada: 91, contato: 55, qualificacao: 28, agenda: 16, anchor: 0 },
  { week: '2026-04-20', entrada: 88, contato: 61, qualificacao: 33, agenda: 12, anchor: 0 },
  { week: '2026-04-27', entrada: 96, contato: 58, qualificacao: 30, agenda: 18, anchor: 0 },
  { week: '2026-05-04', entrada: 102, contato: 63, qualificacao: 35, agenda: 15, anchor: 0 },
  { week: '2026-05-11', entrada: 94, contato: 66, qualificacao: 38, agenda: 19, anchor: 0 },
  { week: '2026-05-18', entrada: 99, contato: 69, qualificacao: 34, agenda: 21, anchor: 0 },
  { week: '2026-05-25', entrada: 107, contato: 64, qualificacao: 36, agenda: 17, anchor: 0 },
  { week: '2026-06-01', entrada: 112, contato: 71, qualificacao: 39, agenda: 22, anchor: 0 },
  { week: '2026-06-08', entrada: 104, contato: 74, qualificacao: 42, agenda: 20, anchor: 0 },
  { week: '2026-06-15', entrada: 109, contato: 78, qualificacao: 37, agenda: 24, anchor: 0 },
  { week: '2026-06-22', entrada: 116, contato: 72, qualificacao: 40, agenda: 18, anchor: 0 },
  { week: '2026-06-29', entrada: 121, contato: 76, qualificacao: 44, agenda: 23, anchor: 0 },
  { week: '2026-07-06', entrada: 113, contato: 81, qualificacao: 41, agenda: 26, anchor: 0 },
  { week: '2026-07-13', entrada: 118, contato: 79, qualificacao: 38, agenda: 21, anchor: 0 },
  { week: '2026-07-20', entrada: 124, contato: 74, qualificacao: 43, agenda: 19, anchor: 0 },
  { week: '2026-07-27', entrada: 115, contato: 77, qualificacao: 39, agenda: 24, anchor: 0 },
  { week: '2026-08-03', entrada: 108, contato: 82, qualificacao: 45, agenda: 22, anchor: 0 },
  { week: '2026-08-10', entrada: 119, contato: 85, qualificacao: 42, agenda: 0, anchor: 0 },
  { week: '2026-08-17', entrada: 126, contato: 80, qualificacao: 47, agenda: 25, anchor: 0 },
  { week: '2026-08-24', entrada: 122, contato: 84, qualificacao: 44, agenda: 27, anchor: 0 },
  { week: '2026-08-31', entrada: 131, contato: 88, qualificacao: 49, agenda: 24, anchor: 0 },
  { week: '2026-09-07', entrada: 117, contato: 83, qualificacao: 46, agenda: 28, anchor: 0 },
  { week: '2026-09-14', entrada: 112, contato: 79, qualificacao: 43, agenda: 25, anchor: 0 },
  { week: '2026-09-21', entrada: 106, contato: 76, qualificacao: 41, agenda: 23, anchor: 0 },
  { week: '2026-09-28', entrada: 101, contato: 72, qualificacao: 38, agenda: 21, anchor: 0 },
];
