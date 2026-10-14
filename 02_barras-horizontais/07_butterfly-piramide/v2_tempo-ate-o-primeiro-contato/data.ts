/**
 * Entradas de lead e agendas realizadas em agosto de 2026, por faixa de tempo entre a entrada e o
 * primeiro contato da pré-vendas, em contagem. A agenda conta na faixa da entrada que a gerou.
 * A ordem do array é a ordem natural das faixas, da mais rápida para a mais lenta.
 * Dado fictício e fixo: nenhum lead, pessoa ou empresa é real.
 */
export interface ContactSpeedBand {
  readonly id: string;
  /** Faixa de tempo até o primeiro contato, como aparece na tela. */
  readonly band: string;
  readonly entries: number;
  readonly meetings: number;
}

export const data: readonly ContactSpeedBand[] = [
  { id: 'contato-ate-5min', band: 'Menos de 5 min', entries: 58, meetings: 21 },
  { id: 'contato-5-a-30min', band: '5 a 30 min', entries: 96, meetings: 24 },
  { id: 'contato-30min-a-2h', band: '30 min a 2 h', entries: 88, meetings: 14 },
  { id: 'contato-2-a-24h', band: '2 a 24 h', entries: 121, meetings: 10 },
  { id: 'contato-mais-24h', band: 'Mais de 24 h', entries: 74, meetings: 4 },
];

/** A faixa acesa por padrão: a meta de velocidade da pré-vendas. */
export const highlightId = 'contato-ate-5min';
