/**
 * Leads do time de pré-vendas no semestre, já agregados na rede hexagonal do plano de fit por
 * engajamento: cada linha é um hexágono da rede, identificado por coluna e linha, com a contagem de
 * leads que caíram nele. As duas pontuações vão de 0 a 100. Hexágono que não aparece aqui está
 * vazio, sem nenhum lead, e não é a mesma coisa que hexágono de contagem baixa.
 *
 * Os leads da SDR em destaque vêm em coordenada crua, não agregados: eles são desenhados um por um
 * por cima da camada de densidade, e é justamente a posição individual deles que a versão pergunta.
 *
 * Dado fictício e fixo: pontuações inventadas, nenhum lead é pessoa real e a SDR é um nome inventado
 * com inicial de sobrenome.
 */
export interface TeamHexBin {
  /** Coluna da rede hexagonal, contada da esquerda; linha par tem 9 colunas, ímpar tem 8. */
  readonly col: number;
  /** Linha da rede hexagonal, contada de cima. */
  readonly row: number;
  readonly count: number;
}

export interface SdrLead {
  /** Pontuação de fit, de 0 a 100. */
  readonly fit: number;
  /** Pontuação de engajamento, de 0 a 100. */
  readonly engajamento: number;
}

export const data: readonly TeamHexBin[] = [
  { col: 3, row: 0, count: 4 },
  { col: 4, row: 0, count: 8 },
  { col: 5, row: 0, count: 27 },
  { col: 6, row: 0, count: 17 },
  { col: 7, row: 0, count: 3 },
  { col: 3, row: 1, count: 40 },
  { col: 4, row: 1, count: 171 },
  { col: 5, row: 1, count: 237 },
  { col: 6, row: 1, count: 123 },
  { col: 7, row: 1, count: 18 },
  { col: 3, row: 2, count: 40 },
  { col: 4, row: 2, count: 295 },
  { col: 5, row: 2, count: 662 },
  { col: 6, row: 2, count: 622 },
  { col: 7, row: 2, count: 185 },
  { col: 8, row: 2, count: 19 },
  { col: 2, row: 3, count: 10 },
  { col: 3, row: 3, count: 173 },
  { col: 4, row: 3, count: 608 },
  { col: 5, row: 3, count: 1006 },
  { col: 6, row: 3, count: 540 },
  { col: 7, row: 3, count: 108 },
  { col: 3, row: 4, count: 26 },
  { col: 4, row: 4, count: 222 },
  { col: 5, row: 4, count: 522 },
  { col: 6, row: 4, count: 505 },
  { col: 7, row: 4, count: 178 },
  { col: 8, row: 4, count: 19 },
  { col: 3, row: 5, count: 17 },
  { col: 4, row: 5, count: 113 },
  { col: 5, row: 5, count: 146 },
  { col: 6, row: 5, count: 89 },
  { col: 7, row: 5, count: 17 },
  { col: 4, row: 6, count: 3 },
  { col: 5, row: 6, count: 10 },
  { col: 6, row: 6, count: 8 },
  { col: 7, row: 6, count: 5 },
];

/** Os leads da SDR selecionada, em coordenada crua: dois deles caem onde o time não tem lead nenhum. */
export const sdrLeads: readonly SdrLead[] = [
  { fit: 78.9, engajamento: 43.6 },
  { fit: 77.7, engajamento: 59 },
  { fit: 82.5, engajamento: 57 },
  { fit: 70, engajamento: 62.2 },
  { fit: 73.9, engajamento: 64.6 },
  { fit: 69.4, engajamento: 35.9 },
  { fit: 68.4, engajamento: 65.2 },
  { fit: 69.2, engajamento: 53.3 },
  { fit: 74.7, engajamento: 58.2 },
  { fit: 71.6, engajamento: 74.1 },
  { fit: 59.9, engajamento: 38.1 },
  { fit: 56.5, engajamento: 49.6 },
  { fit: 69.6, engajamento: 44.1 },
  { fit: 77.8, engajamento: 63.7 },
  { fit: 67.5, engajamento: 56.1 },
  { fit: 81.6, engajamento: 48.2 },
  { fit: 83.6, engajamento: 46.9 },
  { fit: 71, engajamento: 47.6 },
  { fit: 74.9, engajamento: 63.5 },
  { fit: 34.2, engajamento: 24.8 },
  { fit: 90.1, engajamento: 77.3 },
];

/** O que o total conta e o período, impresso depois do número. */
export const totalCaption = 'leads do time no semestre';

/** Nome da SDR em destaque, inventado, com inicial de sobrenome. */
export const sdrName = 'Marina T.';
