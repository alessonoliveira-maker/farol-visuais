/**
 * CPL do mês atual por origem de lead, em reais, contra os meses anteriores da mesma origem.
 * Dado fictício e fixo. Casos difíceis de propósito, um por linha: valor acima do máximo, valor
 * dentro da faixa, valor abaixo do mínimo, origem com menos de 6 meses de história e origem sem o
 * CPL do mês (`null`, nunca zero).
 */
export interface OriginCpl {
  readonly id: string;
  readonly name: string;
  /** CPL do mês atual; `null` quando a origem não foi medida no mês. */
  readonly current: number | null;
  /** CPL dos meses anteriores medidos (até 12), sem o mês atual. */
  readonly history: readonly number[];
}

export interface OriginCplData {
  /** Mês atual, em `YYYY-MM`. */
  readonly month: string;
  readonly origins: readonly OriginCpl[];
}

export const data: OriginCplData = {
  month: '2026-09',
  origins: [
    { id: 'orig-01', name: 'Busca paga', current: 98, history: [44, 52, 61, 58, 49, 63, 70, 80, 72, 66, 59, 54] },
    { id: 'orig-02', name: 'Indicação de clientes', current: 27, history: [18, 22, 31, 25, 29, 34, 20, 24, 28, 33, 21, 26] },
    { id: 'orig-03', name: 'Redes sociais', current: 19, history: [36, 41, 38, 47, 52, 44, 39, 43, 50, 46, 40, 37] },
    { id: 'orig-04', name: 'Feira regional', current: 73, history: [68, 82, 77] },
    { id: 'orig-05', name: 'Parceria com portais', current: null, history: [55, 49, 62, 58, 51, 60, 57, 64] },
  ],
};
