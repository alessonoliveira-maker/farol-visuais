/**
 * Pesquisa interna de clima sobre o processo comercial, escala par de 4 pontos (sem ponto neutro),
 * respondida por até 42 pessoas em cada uma das seis afirmações, em setembro de 2026.
 * Dado fictício e fixo: nenhuma afirmação, pessoa ou equipe é real.
 */

/** Ponto da escala de 4, sem neutro: o zero cai na fronteira entre os dois polos. */
export type RatingKey = 'veryBad' | 'bad' | 'good' | 'veryGood';

export interface ScalePoint {
  readonly key: RatingKey;
  readonly label: string;
  readonly pole: 'negative' | 'positive';
  /** Slot categórico fixo (CONTRATO, COR-8). */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface StatementRatings {
  readonly id: string;
  readonly label: string;
  /** Respostas por ponto da escala; zero é zero medido. `undefined` no total vira indisponível. */
  readonly counts: Readonly<Record<RatingKey, number>> | undefined;
}

/** Do polo negativo ao positivo: é a ordem da pilha e da legenda. */
export const scale: readonly ScalePoint[] = [
  { key: 'veryBad', label: 'Discordo totalmente', pole: 'negative', slot: 5 },
  { key: 'bad', label: 'Discordo', pole: 'negative', slot: 6 },
  { key: 'good', label: 'Concordo', pole: 'positive', slot: 3 },
  { key: 'veryGood', label: 'Concordo totalmente', pole: 'positive', slot: 1 },
];

/** "Backlog claro" tem n baixo (8); "Meta comunicada" não teve nenhuma resposta no recorte. */
export const data: readonly StatementRatings[] = [
  { id: 'meta-clara', label: 'A meta do mês está clara para mim', counts: { veryBad: 2, bad: 5, good: 19, veryGood: 16 } },
  { id: 'feedback-frequente', label: 'Recebo feedback com frequência', counts: { veryBad: 4, bad: 11, good: 17, veryGood: 8 } },
  { id: 'backlog-claro', label: 'O backlog de leads chega claro', counts: { veryBad: 1, bad: 2, good: 3, veryGood: 2 } },
  { id: 'ferramentas-adequadas', label: 'As ferramentas atendem o trabalho', counts: { veryBad: 5, bad: 14, good: 15, veryGood: 5 } },
  { id: 'meta-comunicada', label: 'A meta do trimestre foi comunicada', counts: undefined },
  { id: 'reconhecimento', label: 'Sinto reconhecimento pelo resultado', counts: { veryBad: 6, bad: 9, good: 16, veryGood: 9 } },
];
