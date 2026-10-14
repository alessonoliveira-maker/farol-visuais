/**
 * As seis filas de trabalho da pré-vendas em 2026-08, em cinco dimensões, em índice de 0 a 100
 * pelo percentil no conjunto das filas (100 é a melhor, 0 é a pior). A primeira resposta já vem
 * invertida: 100 é a fila mais rápida, e o tempo bruto em minutos não aparece. `scores` segue a
 * ordem de `dimensions` e é null onde a dimensão não foi medida: a fila de evento não mede
 * comparecimento. A fila de reengajamento tem zero medido em agendamento, e zero é valor, não
 * ausência. `entries` é o volume de entradas da fila no mês. Dado fictício e fixo.
 */
export interface Dimension {
  readonly id: string;
  readonly label: string;
  /** O nome como entra no meio de uma frase. */
  readonly phrase: string;
}

export interface WorkQueue {
  readonly id: string;
  readonly name: string;
  readonly entries: number;
  readonly scores: readonly (number | null)[];
}

/** Primeira resposta e dentro do SLA são vizinhos de propósito: medem o mesmo hábito. */
export const dimensions: readonly Dimension[] = [
  { id: 'first-reply', label: 'Primeira resposta, invertida', phrase: 'primeira resposta' },
  { id: 'sla', label: 'Dentro do SLA', phrase: 'dentro do SLA' },
  { id: 'booking', label: 'Agendamento', phrase: 'agendamento' },
  { id: 'attendance', label: 'Comparecimento', phrase: 'comparecimento' },
  { id: 'qualification', label: 'Qualificação', phrase: 'qualificação' },
];

export const data: readonly WorkQueue[] = [
  { id: 'form', name: 'Formulário', entries: 1248, scores: [72, 80, 64, 58, 70] },
  { id: 'messaging', name: 'Mensageria', entries: 962, scores: [91, 86, 70, 66, 62] },
  { id: 'outbound', name: 'Lista outbound', entries: 640, scores: [38, 52, 44, 49, 57] },
  { id: 'reengagement', name: 'Reengajamento', entries: 318, scores: [30, 41, 0, 35, 48] },
  { id: 'event', name: 'Evento', entries: 205, scores: [60, 63, 77, null, 68] },
  { id: 'referral', name: 'Indicação', entries: 74, scores: [66, 74, 88, 92, 81] },
];
