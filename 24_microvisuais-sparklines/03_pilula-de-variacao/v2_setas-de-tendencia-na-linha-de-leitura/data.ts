/**
 * Indicadores da pré-vendas na semana, cada um contra a semana anterior. Dado fictício e fixo.
 *
 * Os casos difíceis: o tempo de resposta sobe 24% e a seta aponta para cima em vermelho, porque
 * nessa métrica subir é pior; os handoffs aceitos caem 16% e ganham a seta para baixo em vermelho;
 * um indicador mexe menos de 5% e fica com a seta horizontal;
 * as reuniões realizadas não tinham a semana anterior medida e não ganham seta nenhuma.
 */

/** Para onde aponta o "bom" da métrica: a cor da seta sai daqui, nunca do sentido dela. */
export type GoodDirection = 'up' | 'down';

/** Como o valor se escreve: contagem inteira ou horas. */
export type Unit = 'count' | 'hours';

export interface ReadingIndicator {
  readonly id: string;
  /** Nome que entra na frase, no plural ou no singular que a frase pede. */
  readonly label: string;
  readonly unit: Unit;
  readonly goodDirection: GoodDirection;
  /** Valor da semana, ou `null` quando não houve coleta. */
  readonly current: number | null;
  /** Valor da semana anterior, ou `null` quando ela não foi medida. */
  readonly previous: number | null;
}

export interface WeeklyReading {
  readonly team: string;
  /** Segunda-feira da semana, em YYYY-MM-DD. */
  readonly weekStart: string;
  /** Variação relativa abaixo da qual a seta fica horizontal. */
  readonly stableBelow: number;
  readonly indicators: readonly ReadingIndicator[];
}

export const data: WeeklyReading = {
  team: 'Pré-vendas',
  weekStart: '2026-09-28',
  stableBelow: 0.05,
  indicators: [
    { id: 'scheduled', label: 'agendas marcadas', unit: 'count', goodDirection: 'up', current: 118, previous: 108 },
    { id: 'qualified', label: 'leads qualificados', unit: 'count', goodDirection: 'up', current: 64, previous: 63 },
    { id: 'response', label: 'tempo de resposta mediano', unit: 'hours', goodDirection: 'down', current: 3.6, previous: 2.9 },
    { id: 'handoff', label: 'handoffs aceitos', unit: 'count', goodDirection: 'up', current: 21, previous: 25 },
    { id: 'meetings', label: 'reuniões realizadas', unit: 'count', goodDirection: 'up', current: 47, previous: null },
  ],
};
