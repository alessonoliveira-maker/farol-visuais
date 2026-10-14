/**
 * Receita reconhecida por UF em 2025 e em 2026, em reais, no ano fechado. Dado fictício e fixo. `inScope`
 * marca as UFs que estão dentro do perímetro da operação (22 de 27); as outras cinco aparecem com o mesmo
 * símbolo, sem o contorno. O dado cobre a escala: São Paulo tem 160 vezes a receita de Roraima, e Rondônia
 * sobe 30% enquanto Minas Gerais cai 8%, para a mesma legenda de tamanho servir aos dois painéis.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface UfRevenueYears {
  readonly uf: UfCode;
  readonly name: string;
  readonly inScope: boolean;
  readonly y2025: number;
  readonly y2026: number;
}

/** Cor por macrorregião, fixa e na ordem de COR-8 (chart 1, 3, 6, 5 e 2): a cor é da região, não da posição. */
export const REGION_COLOR: Readonly<Record<Region, string>> = {
  norte: 'var(--chart-1)',
  nordeste: 'var(--chart-3)',
  'centro-oeste': 'var(--chart-6)',
  sudeste: 'var(--chart-5)',
  sul: 'var(--chart-2)',
};

export const REGION_LABEL: Readonly<Record<Region, string>> = {
  norte: 'Norte',
  nordeste: 'Nordeste',
  'centro-oeste': 'Centro-Oeste',
  sudeste: 'Sudeste',
  sul: 'Sul',
};

export const data: readonly UfRevenueYears[] = [
  { uf: 'AC', name: 'Acre', inScope: false, y2025: 120_000, y2026: 95_000 },
  { uf: 'AL', name: 'Alagoas', inScope: true, y2025: 340_000, y2026: 310_000 },
  { uf: 'AP', name: 'Amapá', inScope: false, y2025: 90_000, y2026: 140_000 },
  { uf: 'AM', name: 'Amazonas', inScope: true, y2025: 640_000, y2026: 560_000 },
  { uf: 'BA', name: 'Bahia', inScope: true, y2025: 1_900_000, y2026: 1_750_000 },
  { uf: 'CE', name: 'Ceará', inScope: true, y2025: 1_100_000, y2026: 1_240_000 },
  { uf: 'DF', name: 'Distrito Federal', inScope: true, y2025: 1_200_000, y2026: 1_320_000 },
  { uf: 'ES', name: 'Espírito Santo', inScope: true, y2025: 900_000, y2026: 1_010_000 },
  { uf: 'GO', name: 'Goiás', inScope: true, y2025: 1_500_000, y2026: 1_650_000 },
  { uf: 'MA', name: 'Maranhão', inScope: true, y2025: 520_000, y2026: 470_000 },
  { uf: 'MT', name: 'Mato Grosso', inScope: true, y2025: 950_000, y2026: 1_130_000 },
  { uf: 'MS', name: 'Mato Grosso do Sul', inScope: true, y2025: 700_000, y2026: 760_000 },
  { uf: 'MG', name: 'Minas Gerais', inScope: true, y2025: 3_900_000, y2026: 3_600_000 },
  { uf: 'PA', name: 'Pará', inScope: true, y2025: 800_000, y2026: 720_000 },
  { uf: 'PB', name: 'Paraíba', inScope: true, y2025: 430_000, y2026: 480_000 },
  { uf: 'PR', name: 'Paraná', inScope: true, y2025: 2_500_000, y2026: 2_900_000 },
  { uf: 'PE', name: 'Pernambuco', inScope: true, y2025: 1_300_000, y2026: 1_180_000 },
  { uf: 'PI', name: 'Piauí', inScope: true, y2025: 280_000, y2026: 260_000 },
  { uf: 'RJ', name: 'Rio de Janeiro', inScope: true, y2025: 3_300_000, y2026: 3_850_000 },
  { uf: 'RN', name: 'Rio Grande do Norte', inScope: true, y2025: 380_000, y2026: 360_000 },
  { uf: 'RS', name: 'Rio Grande do Sul', inScope: true, y2025: 2_400_000, y2026: 2_200_000 },
  { uf: 'RO', name: 'Rondônia', inScope: false, y2025: 230_000, y2026: 300_000 },
  { uf: 'RR', name: 'Roraima', inScope: false, y2025: 70_000, y2026: 52_000 },
  { uf: 'SC', name: 'Santa Catarina', inScope: true, y2025: 2_000_000, y2026: 2_450_000 },
  { uf: 'SP', name: 'São Paulo', inScope: true, y2025: 7_200_000, y2026: 8_400_000 },
  { uf: 'SE', name: 'Sergipe', inScope: true, y2025: 250_000, y2026: 270_000 },
  { uf: 'TO', name: 'Tocantins', inScope: false, y2025: 200_000, y2026: 175_000 },
];

export type Region = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

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

export const UF_REGION: Readonly<Record<UfCode, Region>> = {
  AC: 'norte', AM: 'norte', AP: 'norte', PA: 'norte', RO: 'norte', RR: 'norte', TO: 'norte',
  AL: 'nordeste', BA: 'nordeste', CE: 'nordeste', MA: 'nordeste', PB: 'nordeste', PE: 'nordeste',
  PI: 'nordeste', RN: 'nordeste', SE: 'nordeste',
  DF: 'centro-oeste', GO: 'centro-oeste', MS: 'centro-oeste', MT: 'centro-oeste',
  ES: 'sudeste', MG: 'sudeste', RJ: 'sudeste', SP: 'sudeste',
  PR: 'sul', RS: 'sul', SC: 'sul',
};
