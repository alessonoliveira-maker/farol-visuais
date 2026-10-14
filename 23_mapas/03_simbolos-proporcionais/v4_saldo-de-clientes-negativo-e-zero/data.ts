/**
 * Clientes que entraram e que saíram da carteira por UF no 3º trimestre de 2026, em contagem de clientes.
 * Dado fictício e fixo. O saldo (entradas menos saídas) é derivado no componente, para o número escrito e a
 * dica nunca divergirem. O dado exercita o sinal e o zero: 10 UFs com saldo negativo, 3 com saldo exatamente
 * zero (Acre, Roraima e Sergipe, com entradas e saídas iguais) e 4 com saldo de 1 em módulo, que
 * desenham um círculo menor que o anel da UF zerada.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface UfFlow {
  readonly uf: UfCode;
  readonly name: string;
  readonly entries: number;
  readonly exits: number;
}

export const data: readonly UfFlow[] = [
  { uf: 'AC', name: 'Acre', entries: 12, exits: 12 },
  { uf: 'AL', name: 'Alagoas', entries: 14, exits: 18 },
  { uf: 'AP', name: 'Amapá', entries: 7, exits: 6 },
  { uf: 'AM', name: 'Amazonas', entries: 30, exits: 36 },
  { uf: 'BA', name: 'Bahia', entries: 82, exits: 91 },
  { uf: 'CE', name: 'Ceará', entries: 66, exits: 48 },
  { uf: 'DF', name: 'Distrito Federal', entries: 58, exits: 50 },
  { uf: 'ES', name: 'Espírito Santo', entries: 41, exits: 40 },
  { uf: 'GO', name: 'Goiás', entries: 77, exits: 55 },
  { uf: 'MA', name: 'Maranhão', entries: 22, exits: 31 },
  { uf: 'MT', name: 'Mato Grosso', entries: 52, exits: 30 },
  { uf: 'MS', name: 'Mato Grosso do Sul', entries: 34, exits: 30 },
  { uf: 'MG', name: 'Minas Gerais', entries: 120, exits: 150 },
  { uf: 'PA', name: 'Pará', entries: 38, exits: 47 },
  { uf: 'PB', name: 'Paraíba', entries: 19, exits: 17 },
  { uf: 'PR', name: 'Paraná', entries: 118, exits: 90 },
  { uf: 'PE', name: 'Pernambuco', entries: 60, exits: 52 },
  { uf: 'PI', name: 'Piauí', entries: 12, exits: 11 },
  { uf: 'RJ', name: 'Rio de Janeiro', entries: 140, exits: 165 },
  { uf: 'RN', name: 'Rio Grande do Norte', entries: 16, exits: 20 },
  { uf: 'RS', name: 'Rio Grande do Sul', entries: 95, exits: 110 },
  { uf: 'RO', name: 'Rondônia', entries: 11, exits: 9 },
  { uf: 'RR', name: 'Roraima', entries: 4, exits: 4 },
  { uf: 'SC', name: 'Santa Catarina', entries: 130, exits: 88 },
  { uf: 'SP', name: 'São Paulo', entries: 210, exits: 160 },
  { uf: 'SE', name: 'Sergipe', entries: 13, exits: 13 },
  { uf: 'TO', name: 'Tocantins', entries: 10, exits: 11 },
];


export interface GeoPoint {
  readonly lon: number;
  readonly lat: number;
}

/**
 * Centroides aproximados das 27 UFs, em graus (longitude e latitude), arredondados a 0,1. Não saem de
 * arquivo do IBGE: são valores de geografia pública escritos à mão, bons para posicionar um símbolo e nada além disso. O catálogo não tem o módulo de geometria (lista de imports fechada).
 */
export const UF_CENTROIDS: Readonly<Record<UfCode, GeoPoint>> = {
  AC: { lon: -70.5, lat: -9.0 }, AL: { lon: -36.6, lat: -9.6 }, AP: { lon: -51.9, lat: 1.4 },
  AM: { lon: -64.6, lat: -4.0 }, BA: { lon: -41.7, lat: -12.6 }, CE: { lon: -39.3, lat: -5.2 },
  DF: { lon: -47.8, lat: -15.8 }, ES: { lon: -40.7, lat: -19.6 }, GO: { lon: -49.6, lat: -15.9 },
  MA: { lon: -45.3, lat: -5.1 }, MT: { lon: -55.9, lat: -12.9 }, MS: { lon: -54.5, lat: -20.5 },
  MG: { lon: -44.7, lat: -18.5 }, PA: { lon: -52.9, lat: -3.8 }, PB: { lon: -36.8, lat: -7.1 },
  PR: { lon: -51.6, lat: -24.6 }, PE: { lon: -37.9, lat: -8.3 }, PI: { lon: -42.8, lat: -7.4 },
  RJ: { lon: -42.7, lat: -22.3 }, RN: { lon: -36.5, lat: -5.8 }, RS: { lon: -53.2, lat: -29.8 },
  RO: { lon: -62.8, lat: -10.9 }, RR: { lon: -61.4, lat: 2.1 }, SC: { lon: -50.5, lat: -27.3 },
  SP: { lon: -48.7, lat: -22.3 }, SE: { lon: -37.4, lat: -10.6 }, TO: { lon: -48.3, lat: -10.2 },
};

/** Caixa de desenho em graus: o contorno inteiro cabe nela, com folga para os símbolos da borda. */
export const GEO_BOUNDS = { lonMin: -74, lonMax: -34, latMax: 5.5, latMin: -34 } as const;

/**
 * Contorno grosseiro do país desenhado à mão para dar contexto ao símbolo. NÃO é a malha do
 * IBGE: as fronteiras entre UFs não existem aqui, e a costa tem o erro de quem desenha de memória.
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

