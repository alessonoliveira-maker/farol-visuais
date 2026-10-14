/**
 * Perfil de oito SDRs da pré-vendas em 2026-T3, em seis dimensões, todas em índice de 0 a 100
 * pelo percentil no time (100 é o melhor do time, 0 é o pior). `scores` segue a ordem de
 * `dimensions`, que é a do registry e a mesma em todas as miniaturas. Davi O. tem zero medido
 * em comparecimento: zero é valor, não ausência. Dado fictício e fixo.
 */
export interface Dimension {
  readonly id: string;
  readonly label: string;
}

export interface SdrProfile {
  readonly id: string;
  readonly name: string;
  readonly scores: readonly number[];
}

export const dimensions: readonly Dimension[] = [
  { id: 'first-reply', label: 'Primeira resposta' },
  { id: 'attempts', label: 'Tentativas por lead' },
  { id: 'booking', label: 'Agenda marcada' },
  { id: 'qualification', label: 'Qualificação' },
  { id: 'attendance', label: 'Comparecimento' },
  { id: 'crm', label: 'Registro no CRM' },
];

export const data: readonly SdrProfile[] = [
  { id: 'sdr-01', name: 'Helena M.', scores: [82, 74, 68, 79, 71, 88] },
  { id: 'sdr-02', name: 'Bruno T.', scores: [45, 52, 38, 41, 12, 60] },
  { id: 'sdr-03', name: 'Larissa P.', scores: [78, 70, 72, 75, 69, 81] },
  { id: 'sdr-04', name: 'Caio F.', scores: [60, 88, 55, 48, 52, 44] },
  { id: 'sdr-05', name: 'Renata S.', scores: [91, 85, 80, 86, 78, 92] },
  { id: 'sdr-06', name: 'Davi O.', scores: [35, 40, 46, 38, 0, 55] },
  { id: 'sdr-07', name: 'Maria Eduarda S.', scores: [66, 58, 81, 64, 73, 70] },
  { id: 'sdr-08', name: 'Tiago A.', scores: [70, 63, 59, 92, 48, 66] },
];
