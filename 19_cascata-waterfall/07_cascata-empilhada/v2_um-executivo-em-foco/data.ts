/**
 * Carteira de oportunidades abertas em 2026-08, em oportunidades: abre em 180, recebe 64 entradas,
 * perde 10 por ganho e 41 por perda, e fecha em 193. Cada passo se divide por executivo, e um deles
 * (`highlightId`) fica aceso. Denise R. fecha 3 de 9 decididas (33,3%); a mediana dos quatro é 18,4%.
 * Dado fictício e fixo: nenhum nome é pessoa real. Os passos são separados por sinal (entradas
 * somam, ganhos e perdas subtraem), então nenhum passo mistura positivo com negativo.
 * Os valores de `parts` são sempre magnitudes do passo; o sinal vem do `sign` e a cor, do `polarity`.
 * Fechamento: 180 + 64 − 10 − 41 = 193.
 */
export interface Part {
  readonly id: string;
  readonly label: string;
}

export interface PartValue {
  readonly partId: string;
  readonly value: number;
}

export type BridgeStep =
  | { readonly id: string; readonly label: string; readonly kind: 'total'; readonly value: number }
  | {
      readonly id: string;
      readonly label: string;
      readonly kind: 'segmented';
      readonly sign: 1 | -1;
      /** Papel do passo para o negócio (COR-6), independente do sinal: ganhar e entrar são bons, perder é ruim. */
      readonly polarity: 'good' | 'bad';
      readonly parts: readonly PartValue[];
    };

/** Ordem de referência; o componente leva o executivo em foco para a base da pilha. */
export const parts: readonly Part[] = [
  { id: 'bruna', label: 'Bruna T.' },
  { id: 'caio', label: 'Caio M.' },
  { id: 'denise', label: 'Denise R.' },
  { id: 'otavio', label: 'Otávio L.' },
];

export const period = '2026-08';

/** Executivo aceso por padrão. */
export const highlightId = 'denise';

export const data: readonly BridgeStep[] = [
  { id: 'inicio', label: 'Início do mês', kind: 'total', value: 180 },
  {
    id: 'entradas',
    label: 'Entradas',
    kind: 'segmented',
    sign: 1,
    polarity: 'good',
    parts: [
      { partId: 'bruna', value: 18 },
      { partId: 'caio', value: 14 },
      { partId: 'denise', value: 17 },
      { partId: 'otavio', value: 15 },
    ],
  },
  {
    id: 'ganhos',
    label: 'Ganhos',
    kind: 'segmented',
    sign: -1,
    polarity: 'good',
    parts: [
      { partId: 'bruna', value: 1 },
      { partId: 'caio', value: 2 },
      { partId: 'denise', value: 3 },
      { partId: 'otavio', value: 4 },
    ],
  },
  {
    id: 'perdas',
    label: 'Perdas',
    kind: 'segmented',
    sign: -1,
    polarity: 'bad',
    parts: [
      { partId: 'bruna', value: 9 },
      { partId: 'caio', value: 13 },
      { partId: 'denise', value: 6 },
      { partId: 'otavio', value: 13 },
    ],
  },
  { id: 'fim', label: 'Fim do mês', kind: 'total', value: 193 },
];
