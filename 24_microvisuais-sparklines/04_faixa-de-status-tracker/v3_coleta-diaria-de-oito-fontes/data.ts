/**
 * Estado da coleta diária de 8 fontes de dado ao longo de 90 dias, de 2026-07-07 a 2026-10-04.
 * Cada fonte vem em trechos seguidos (estado, quantidade de dias) que somam 90, um dia por
 * posição. `off` é dia sem agenda de coleta: a fonte não devia rodar e não entra no percentual.
 * Dado fictício e fixo; os nomes das fontes são genéricos.
 */
export type DayState = 'complete' | 'partial' | 'failed' | 'off';

export interface SourceRun {
  readonly state: DayState;
  readonly days: number;
}

export interface SourceCollection {
  readonly id: string;
  readonly label: string;
  readonly runs: readonly SourceRun[];
}

/** Primeiro dia dos 90; o último é 2026-10-04. */
export const FIRST_DAY = '2026-07-07';

/** Quantos dos últimos dias cada fileira mostra em largura estreita. */
export const NARROW_DAYS = 30;

const c = (days: number): SourceRun => ({ state: 'complete', days });
const p = (days: number): SourceRun => ({ state: 'partial', days });
const f = (days: number): SourceRun => ({ state: 'failed', days });
const o = (days: number): SourceRun => ({ state: 'off', days });

export const data: readonly SourceCollection[] = [
  { id: 'crm', label: 'CRM', runs: [c(41), p(1), c(30), f(1), c(17)] },
  { id: 'midia-a', label: 'Mídia paga A', runs: [c(28), f(2), c(33), p(3), c(24)] },
  { id: 'midia-b', label: 'Mídia paga B', runs: [c(50), f(1), c(39)] },
  { id: 'analytics', label: 'Analytics', runs: [o(17), c(46), p(4), c(20), f(3)] },
  { id: 'telefonia', label: 'Telefonia', runs: [c(12), p(5), c(20), f(6), c(9), p(2), c(36)] },
  { id: 'formularios', label: 'Formulários do site', runs: [c(35), o(14), c(41)] },
  { id: 'contratos', label: 'Cadastro de contratos', runs: [c(20), p(8), f(9), p(3), c(22), f(3), p(2), c(23)] },
  { id: 'agenda', label: 'Agenda comercial', runs: [c(60), f(1), c(29)] },
];
