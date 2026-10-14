/**
 * Meta de receita do ano de 2026, em reais, e o que já a consome na data de corte 2026-09-13.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * A meta é a coluna cheia; realizado, contratado ainda não reconhecido e pipeline ponderado a
 * consomem em ordem de certeza. O gap não mora aqui: o componente o obtém como meta menos a soma
 * das partes. Fechamento: 6.400.000 − 4.100.000 − 900.000 − 800.000 = 600.000.
 */
export interface GoalPart {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

export interface GoalBridge {
  /** Data de corte no formato YYYY-MM-DD: a ponte muda a cada dia. */
  readonly cutoff: string;
  readonly goal: number;
  readonly parts: readonly GoalPart[];
}

export const data: GoalBridge = {
  cutoff: '2026-09-13',
  goal: 6_400_000,
  parts: [
    { id: 'realizado', label: 'Realizado', value: 4_100_000 },
    { id: 'contratado', label: 'Contratado não reconhecido', value: 900_000 },
    { id: 'pipeline', label: 'Pipeline ponderado', value: 800_000 },
  ],
};
