/**
 * Perfil da fila de inbound da pré-venda em seis eixos, em índice de 0 a 100, nos trimestres de
 * 2026-T1 a 2026-T3. Os perfis são quase idênticos de propósito: em quatro dos seis eixos duas ou
 * três linhas coincidem e a diferença máxima é de 4 pontos. A ordem dos eixos é a do registry.
 * Dado fictício e fixo.
 */
export interface QueueAxis {
  readonly id: string;
  readonly label: string;
  /** O nome como entra no meio de uma frase. */
  readonly phrase: string;
  /** O índice de cada trimestre, na ordem de `quarters`. */
  readonly values: readonly [number, number, number];
}

export interface Quarter {
  readonly name: string;
  /** Slot fixo da cor de série: a cor vem da categoria, não da posição no array. */
  readonly slot: 1 | 3 | 6;
}

export const quarters: readonly [Quarter, Quarter, Quarter] = [
  { name: '2026-T1', slot: 6 },
  { name: '2026-T2', slot: 3 },
  { name: '2026-T3', slot: 1 },
];

export const data: readonly QueueAxis[] = [
  { id: 'first-touch', label: 'Primeiro toque', phrase: 'primeiro toque', values: [72, 72, 72] },
  { id: 'qualification', label: 'Qualificação', phrase: 'qualificação', values: [65, 65, 67] },
  { id: 'schedule', label: 'Agendamento', phrase: 'agendamento', values: [48, 50, 52] },
  { id: 'queue', label: 'Fila tratada', phrase: 'fila tratada', values: [81, 81, 81] },
  { id: 'complete', label: 'Dado completo', phrase: 'dado completo', values: [58, 60, 60] },
  { id: 'on-time', label: 'Retorno no prazo', phrase: 'retorno no prazo', values: [69, 70, 71] },
];
