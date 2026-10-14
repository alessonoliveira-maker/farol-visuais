/**
 * CPL qualificado (custo por lead qualificado, em reais) por UF em três plataformas de mídia
 * genéricas, no segundo trimestre de 2026. Dado fictício e fixo. `nationalMean` é a média nacional
 * fictícia de cada plataforma, e o desvio de cada UF é medido contra a média da própria plataforma.
 * Casos: uma UF exatamente na média em cada plataforma (desvio 0, sem sinal), UFs sem nenhum lead
 * qualificado no trimestre (`null`: o CPL não existe, e nunca vale zero) e extremos dos dois lados.
 */
export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export type Region = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

export interface PlatformCpl {
  readonly id: string;
  readonly label: string;
  readonly nationalMean: number;
  readonly cpl: Readonly<Record<UfCode, number | null>>;
}

export interface HexPosition {
  readonly row: number;
  readonly column: number;
  readonly region: Region;
}

/**
 * Grade de 8 colunas por 6 linhas, a mesma do modelo, desenhada à mão e NÃO a br_states_grid1 do
 * geofacet (arquivo público não verificado; README do catálogo). No hexágono as linhas ímpares
 * (1, 3 e 5) deslocam meia célula para a direita, o que muda quem encosta em quem: a vizinhança
 * hexagonal aqui é aproximada e pede revisão com quem lê o painel. BA e MG ficam separados pelo DF;
 * AC e AM, PA e TO, GO e MG, SP e RJ encostam só por aresta oblíqua.
 */
export const HEX_GRID: Readonly<Record<UfCode, HexPosition>> = {
  RR: { row: 1, column: 3, region: 'norte' }, AP: { row: 1, column: 4, region: 'norte' },
  AM: { row: 2, column: 3, region: 'norte' }, PA: { row: 2, column: 4, region: 'norte' },
  MA: { row: 2, column: 5, region: 'nordeste' }, PI: { row: 2, column: 6, region: 'nordeste' },
  CE: { row: 2, column: 7, region: 'nordeste' }, RN: { row: 2, column: 8, region: 'nordeste' },
  AC: { row: 3, column: 2, region: 'norte' }, RO: { row: 3, column: 3, region: 'norte' },
  MT: { row: 3, column: 4, region: 'centro-oeste' }, TO: { row: 3, column: 5, region: 'norte' },
  BA: { row: 3, column: 6, region: 'nordeste' }, PE: { row: 3, column: 7, region: 'nordeste' },
  PB: { row: 3, column: 8, region: 'nordeste' },
  MS: { row: 4, column: 4, region: 'centro-oeste' }, GO: { row: 4, column: 5, region: 'centro-oeste' },
  DF: { row: 4, column: 6, region: 'centro-oeste' }, SE: { row: 4, column: 7, region: 'nordeste' },
  AL: { row: 4, column: 8, region: 'nordeste' },
  PR: { row: 5, column: 4, region: 'sul' }, SP: { row: 5, column: 5, region: 'sudeste' },
  MG: { row: 5, column: 6, region: 'sudeste' }, ES: { row: 5, column: 7, region: 'sudeste' },
  RS: { row: 6, column: 3, region: 'sul' }, SC: { row: 6, column: 4, region: 'sul' },
  RJ: { row: 6, column: 6, region: 'sudeste' },
};

export const UF_NAMES: Readonly<Record<UfCode, string>> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina',
  SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

export const data: readonly PlatformCpl[] = [
  {
    id: 'social',
    label: 'Plataforma Social',
    nationalMean: 84,
    cpl: {
      AC: 110, AL: 78, AP: 98, AM: 81, BA: 59, CE: 88, DF: 56, ES: 64, GO: 62, MA: 59,
      MT: 104, MS: 63, MG: 67, PA: 62, PB: 84, PR: 100, PE: 87, PI: 106, RJ: 92, RN:
      120, RS: 117, RO: 55, RR: null, SC: 73, SP: 81, SE: 65, TO: 57,
    },
  },
  {
    id: 'busca',
    label: 'Plataforma de Busca',
    nationalMean: 112,
    cpl: {
      AC: 122, AL: 156, AP: null, AM: 128, BA: 130, CE: 104, DF: 115, ES: 146, GO: 108,
      MA: 116, MT: 137, MS: 112, MG: 79, PA: 81, PB: 80, PR: 79, PE: 81, PI: 86, RJ:
      113, RN: 135, RS: 99, RO: 152, RR: null, SC: 111, SP: 124, SE: 146, TO: 80,
    },
  },
  {
    id: 'profissional',
    label: 'Plataforma Profissional',
    nationalMean: 176,
    cpl: {
      AC: null, AL: 123, AP: null, AM: 184, BA: 134, CE: 129, DF: 216, ES: 162, GO: 176,
      MA: 186, MT: 220, MS: 132, MG: 109, PA: 113, PB: 211, PR: 221, PE: 164, PI: 221,
      RJ: 142, RN: 171, RS: 214, RO: 245, RR: null, SC: 232, SP: 215, SE: 171, TO: null,
    },
  },
];
