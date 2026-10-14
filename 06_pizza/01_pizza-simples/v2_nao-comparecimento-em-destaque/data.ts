/**
 * Desfecho das agendas marcadas na semana de 2026-09-21, em contagem de agendas.
 * Dado fictício e fixo: nenhuma agenda corresponde a pessoa ou empresa real.
 */
export interface MeetingOutcome {
  readonly id: string;
  readonly name: string;
  readonly count: number;
}

/**
 * A mesma medida na semana anterior, em contagem bruta e não em taxa já calculada.
 * Vem em contagem porque a DAD-1 exige o volume junto da taxa, e só o par permite
 * escrever "9% (7 de 78)" sem que a peça tenha de confiar num percentual de origem.
 */
export interface PreviousWeek {
  readonly noShowCount: number;
  readonly totalCount: number;
}

export const data: readonly MeetingOutcome[] = [
  { id: 'realizada', name: 'Reunião realizada', count: 48 },
  { id: 'remarcada', name: 'Remarcada pelo lead', count: 14 },
  { id: 'nao-comparecimento', name: 'Não comparecimento', count: 12 },
  { id: 'cancelada', name: 'Cancelada na véspera', count: 8 },
];

/** A categoria que carrega a mensagem do cartão: ganha a cor acesa, o deslocamento e o peso do rótulo. */
export const highlightId = 'nao-comparecimento';

export const previousWeek: PreviousWeek = { noShowCount: 7, totalCount: 78 };
