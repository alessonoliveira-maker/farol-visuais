/**
 * Leads de 2026 por UF e por origem, em contagem de leads. Dado fictício e fixo: 9.800 leads no total, quase
 * todas as contagens em múltiplos de 5 (um ponto = 5 leads). `leads` segue a ordem de `ORIGINS`. Casos difíceis:
 * Distrito Federal com 480 leads num polígono minúsculo (aglomeração), Roraima e Amapá com 5 leads ou menos por
 * origem (um ponto ou nenhum) e células em zero medido (Amapá em indicação e em eventos, Roraima e Piauí em eventos).
 * `bounds` é a caixa da UF em graus, aproximada, e não o limite oficial.
 */
export type OriginId = 'organica' | 'paga' | 'indicacao' | 'eventos' | 'redes';

export interface Origin {
  readonly id: OriginId;
  readonly name: string;
  /** Posição na paleta categórica (COR-8: 1, 3, 6, 5, 2): a cor pertence à origem e não à posição na lista. */
  readonly slot: 1 | 2 | 3 | 5 | 6;
}

export const ORIGINS: readonly Origin[] = [
  { id: 'organica', name: 'Busca orgânica', slot: 1 },
  { id: 'paga', name: 'Mídia paga', slot: 3 },
  { id: 'indicacao', name: 'Indicação', slot: 6 },
  { id: 'eventos', name: 'Eventos', slot: 5 },
  { id: 'redes', name: 'Redes sociais', slot: 2 },
];

export interface UfBounds {
  readonly lonMin: number;
  readonly lonMax: number;
  readonly latMin: number;
  readonly latMax: number;
}

export interface UfLeads {
  readonly uf: string;
  readonly name: string;
  readonly bounds: UfBounds;
  readonly leads: readonly [number, number, number, number, number];
}

const b = (lonMin: number, lonMax: number, latMin: number, latMax: number): UfBounds => ({ lonMin, lonMax, latMin, latMax });

export const data: readonly UfLeads[] = [
  { uf: 'AC', name: 'Acre', bounds: b(-73.8, -66.6, -11.1, -7.1), leads: [5, 10, 5, 0, 5] },
  { uf: 'AL', name: 'Alagoas', bounds: b(-38.2, -35.2, -10.5, -8.8), leads: [30, 45, 15, 5, 25] },
  { uf: 'AP', name: 'Amapá', bounds: b(-54.9, -49.9, -1.2, 4.4), leads: [5, 5, 0, 0, 5] },
  { uf: 'AM', name: 'Amazonas', bounds: b(-73.8, -56.1, -9.8, 2.2), leads: [45, 65, 20, 5, 45] },
  { uf: 'BA', name: 'Bahia', bounds: b(-46.6, -37.3, -18.3, -8.5), leads: [140, 190, 80, 20, 135] },
  { uf: 'CE', name: 'Ceará', bounds: b(-41.4, -37.3, -7.9, -2.8), leads: [95, 125, 60, 20, 90] },
  { uf: 'DF', name: 'Distrito Federal', bounds: b(-48.3, -47.3, -16.05, -15.5), leads: [120, 155, 65, 45, 95] },
  { uf: 'ES', name: 'Espírito Santo', bounds: b(-41.9, -39.7, -21.3, -17.9), leads: [65, 90, 45, 10, 65] },
  { uf: 'GO', name: 'Goiás', bounds: b(-53.2, -45.9, -19.5, -12.4), leads: [105, 140, 60, 20, 90] },
  { uf: 'MA', name: 'Maranhão', bounds: b(-48.8, -41.8, -10.3, -1.0), leads: [35, 50, 20, 5, 35] },
  { uf: 'MT', name: 'Mato Grosso', bounds: b(-61.6, -50.2, -18.0, -7.3), leads: [65, 90, 35, 15, 60] },
  { uf: 'MS', name: 'Mato Grosso do Sul', bounds: b(-58.2, -50.9, -24.1, -17.2), leads: [45, 60, 30, 5, 40] },
  { uf: 'MG', name: 'Minas Gerais', bounds: b(-51.0, -39.9, -22.9, -14.2), leads: [245, 315, 170, 45, 220] },
  { uf: 'PA', name: 'Pará', bounds: b(-58.9, -46.0, -9.8, 2.6), leads: [50, 75, 30, 5, 50] },
  { uf: 'PB', name: 'Paraíba', bounds: b(-38.8, -34.8, -8.3, -6.0), leads: [35, 45, 20, 5, 30] },
  { uf: 'PR', name: 'Paraná', bounds: b(-54.6, -48.0, -26.7, -22.5), leads: [160, 215, 120, 30, 145] },
  { uf: 'PE', name: 'Pernambuco', bounds: b(-41.4, -34.8, -9.5, -7.3), leads: [90, 120, 50, 15, 80] },
  { uf: 'PI', name: 'Piauí', bounds: b(-45.9, -40.4, -10.9, -2.7), leads: [20, 35, 15, 0, 20] },
  { uf: 'RJ', name: 'Rio de Janeiro', bounds: b(-44.9, -40.9, -23.4, -20.8), leads: [200, 260, 140, 35, 190] },
  { uf: 'RN', name: 'Rio Grande do Norte', bounds: b(-38.6, -34.9, -6.98, -4.8), leads: [30, 40, 20, 5, 25] },
  { uf: 'RS', name: 'Rio Grande do Sul', bounds: b(-57.6, -49.7, -33.7, -27.1), leads: [145, 190, 110, 25, 135] },
  { uf: 'RO', name: 'Rondônia', bounds: b(-66.8, -59.8, -13.7, -8.8), leads: [15, 20, 5, 5, 15] },
  { uf: 'RR', name: 'Roraima', bounds: b(-64.8, -58.9, -1.0, 5.3), leads: [5, 5, 5, 0, 5] },
  { uf: 'SC', name: 'Santa Catarina', bounds: b(-53.8, -48.3, -29.4, -25.9), leads: [135, 170, 95, 20, 125] },
  { uf: 'SP', name: 'São Paulo', bounds: b(-53.1, -44.2, -25.3, -19.8), leads: [495, 610, 315, 90, 470] },
  { uf: 'SE', name: 'Sergipe', bounds: b(-38.2, -36.4, -11.6, -9.5), leads: [20, 25, 10, 0, 20] },
  { uf: 'TO', name: 'Tocantins', bounds: b(-50.7, -45.7, -13.5, -5.2), leads: [15, 20, 5, 5, 15] },
];

/** Caixa de desenho em graus: o contorno inteiro cabe nela. */
export const GEO_BOUNDS = { lonMin: -74, lonMax: -34, latMax: 5.5, latMin: -34 } as const;

/**
 * Contorno grosseiro do país desenhado à mão para dar contexto aos pontos. NÃO é a malha do IBGE: as
 * fronteiras entre UFs não existem aqui, e a costa tem o erro de quem desenha de memória.
 */
export const BRASIL_OUTLINE: readonly (readonly [number, number])[] = [
  [-51.6, 4.4], [-50.0, 1.8], [-48.5, -1.0], [-44.5, -2.3], [-41.5, -2.9], [-38.5, -3.7], [-35.2, -5.2],
  [-34.8, -7.2], [-35.0, -9.0], [-37.0, -11.0], [-38.5, -13.0], [-39.2, -17.5], [-39.7, -19.8],
  [-40.9, -21.8], [-42.0, -23.0], [-44.5, -23.3], [-46.5, -24.2], [-48.5, -26.0], [-48.7, -28.5],
  [-50.2, -30.5], [-52.5, -33.0], [-53.4, -33.7], [-55.5, -30.9], [-57.6, -30.2], [-56.0, -28.2],
  [-54.5, -27.3], [-53.8, -25.9], [-54.6, -25.6], [-54.6, -24.0], [-55.3, -22.0], [-57.9, -22.1],
  [-58.2, -20.2], [-57.8, -17.6], [-60.2, -16.2], [-60.5, -13.8], [-63.5, -12.5], [-65.3, -10.0],
  [-68.0, -11.0], [-70.6, -11.0], [-73.2, -9.4], [-72.9, -7.6], [-70.9, -4.4], [-69.5, -4.2],
  [-69.9, -1.0], [-69.4, 1.0], [-67.0, 1.8], [-64.0, 4.2], [-60.8, 5.2], [-60.0, 3.5], [-57.0, 2.0],
  [-54.0, 2.3],
];
