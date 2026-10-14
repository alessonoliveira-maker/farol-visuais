/**
 * Quatro recortes da mesma fração, escolhidos porque cada um quebra o glifo de um jeito diferente:
 * zero medido, fração sem medição, fração pequena demais e fração grande demais. Contagens
 * absolutas de oportunidades ganhas e de quantas vieram de indicação. Dado fictício e fixo:
 * nenhum recorte, contagem ou pessoa corresponde a dado real.
 */
export interface FractionStateCase {
  readonly id: string;
  /** Nome do recorte, curto o bastante para caber numa coluna de 131 px. */
  readonly label: string;
  /** Oportunidades ganhas no recorte. */
  readonly total: number;
  /** Quantas vieram de indicação. Nulo quando não houve medição: ausência nunca é zero. */
  readonly part: number | null;
  /** Por que o desenho muda neste recorte, numa frase curta de apoio. */
  readonly note: string;
}

/** Recorte de período, em prosa: a tela usa texto, o dado usaria YYYY-MM-DD. */
export const period = '3º trimestre de 2026';

export const data: readonly FractionStateCase[] = [
  { id: 'eventos', label: 'Eventos', total: 34, part: 0, note: 'zero medido, e não falta de coleta' },
  { id: 'midia-paga', label: 'Mídia paga', total: 27, part: null, note: 'a coleta da origem parou no meio do trimestre' },
  { id: 'base-propria', label: 'Base própria', total: 61, part: 2, note: 'a fatia viraria lasca' },
  { id: 'carteira', label: 'Carteira', total: 59, part: 58, note: 'o disco pareceria cheio' },
];
