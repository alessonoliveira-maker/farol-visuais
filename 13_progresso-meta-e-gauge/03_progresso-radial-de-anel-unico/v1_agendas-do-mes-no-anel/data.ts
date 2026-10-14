/**
 * Agendas marcadas pela pré-vendas até a data de corte, contra a meta do mês.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface AgendasDoMes {
  readonly month: string;
  readonly marcadas: number;
  readonly meta: number;
}

export const data: AgendasDoMes = {
  month: '2026-09',
  marcadas: 41,
  meta: 90,
};
