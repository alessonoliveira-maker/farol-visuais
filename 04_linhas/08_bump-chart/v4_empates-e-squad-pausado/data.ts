/**
 * SLA semanal de atendimento por squad, em percentual, de 2026-05-04 a 2026-06-22.
 * Dado fictício e fixo: nenhum squad nomeia uma equipe real. `null` marca uma semana em que o
 * squad não operou (férias coletivas, por exemplo), distinto de um SLA de 0%.
 */
export interface SquadSlaSeries {
  readonly id: string;
  readonly name: string;
  /** Um SLA por semana, na mesma ordem de `weeks`; `null` é semana sem operação. */
  readonly values: readonly (number | null)[];
}

export const weeks: readonly string[] = [
  '2026-05-04', '2026-05-11', '2026-05-18', '2026-05-25',
  '2026-06-01', '2026-06-08', '2026-06-15', '2026-06-22',
];

export const data: readonly SquadSlaSeries[] = [
  { id: 'squad-norte', name: 'Squad Norte', values: [92, 90, 88, 88, 85, 85, 90, 92] },
  { id: 'squad-sul', name: 'Squad Sul', values: [88, 90, 90, 85, 85, 88, 85, 85] },
  { id: 'squad-leste', name: 'Squad Leste', values: [80, 82, 88, 85, 80, 82, 85, 88] },
  { id: 'squad-oeste', name: 'Squad Oeste', values: [75, 78, 80, 78, 75, 80, 80, 82] },
  { id: 'squad-centro', name: 'Squad Centro', values: [90, 85, 80, null, null, null, 82, 85] },
];
