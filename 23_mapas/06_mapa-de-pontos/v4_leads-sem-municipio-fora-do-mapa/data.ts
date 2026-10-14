/**
 * Leads de 2026 com e sem município informado, em contagem de leads. Dado fictício e fixo: 4.000 leads, dos
 * quais 3.680 chegam com município (viram ponto, um a cada 20) e 320 chegam só com a UF, ou nem isso do lado
 * da cidade (viram contagem escrita, nunca ponto). Casos difíceis: a UF com mais leads sem município é
 * também a com mais leads com município (São Paulo), e o Distrito Federal tem poucos leads sem município.
 */
export interface CityLeads {
  readonly id: string;
  readonly city: string;
  readonly lon: number;
  readonly lat: number;
  readonly leads: number;
}

export interface UfWithoutCity {
  readonly uf: string;
  readonly name: string;
  readonly leads: number;
}

export interface LeadsByPlace {
  readonly cities: readonly CityLeads[];
  readonly withoutCity: readonly UfWithoutCity[];
}

export const data: LeadsByPlace = {
  cities: [
    { id: 'sao-paulo', city: 'São Paulo', lon: -46.63, lat: -23.55, leads: 720 },
    { id: 'rio-de-janeiro', city: 'Rio de Janeiro', lon: -43.2, lat: -22.9, leads: 360 },
    { id: 'belo-horizonte', city: 'Belo Horizonte', lon: -43.94, lat: -19.92, leads: 260 },
    { id: 'brasilia', city: 'Brasília', lon: -47.93, lat: -15.78, leads: 220 },
    { id: 'curitiba', city: 'Curitiba', lon: -49.27, lat: -25.43, leads: 200 },
    { id: 'porto-alegre', city: 'Porto Alegre', lon: -51.23, lat: -30.03, leads: 200 },
    { id: 'salvador', city: 'Salvador', lon: -38.5, lat: -12.97, leads: 180 },
    { id: 'recife', city: 'Recife', lon: -34.88, lat: -8.05, leads: 160 },
    { id: 'campinas', city: 'Campinas', lon: -47.06, lat: -22.91, leads: 160 },
    { id: 'fortaleza', city: 'Fortaleza', lon: -38.52, lat: -3.73, leads: 140 },
    { id: 'goiania', city: 'Goiânia', lon: -49.25, lat: -16.68, leads: 120 },
    { id: 'florianopolis', city: 'Florianópolis', lon: -48.55, lat: -27.6, leads: 100 },
    { id: 'vitoria', city: 'Vitória', lon: -40.3, lat: -20.3, leads: 100 },
    { id: 'ribeirao-preto', city: 'Ribeirão Preto', lon: -47.81, lat: -21.18, leads: 100 },
    { id: 'belem', city: 'Belém', lon: -48.5, lat: -1.46, leads: 80 },
    { id: 'manaus', city: 'Manaus', lon: -60.02, lat: -3.12, leads: 80 },
    { id: 'campo-grande', city: 'Campo Grande', lon: -54.62, lat: -20.47, leads: 80 },
    { id: 'cuiaba', city: 'Cuiabá', lon: -56.1, lat: -15.6, leads: 60 },
    { id: 'natal', city: 'Natal', lon: -35.2, lat: -5.79, leads: 60 },
    { id: 'sao-luis', city: 'São Luís', lon: -44.3, lat: -2.53, leads: 60 },
    { id: 'londrina', city: 'Londrina', lon: -51.16, lat: -23.31, leads: 60 },
    { id: 'maceio', city: 'Maceió', lon: -35.73, lat: -9.67, leads: 40 },
    { id: 'porto-velho', city: 'Porto Velho', lon: -63.9, lat: -8.76, leads: 40 },
    { id: 'teresina', city: 'Teresina', lon: -42.8, lat: -5.09, leads: 40 },
    { id: 'joao-pessoa', city: 'João Pessoa', lon: -34.86, lat: -7.12, leads: 40 },
    { id: 'aracaju', city: 'Aracaju', lon: -37.07, lat: -10.91, leads: 20 },
  ],
  withoutCity: [
    { uf: 'SP', name: 'São Paulo', leads: 62 },
    { uf: 'MG', name: 'Minas Gerais', leads: 41 },
    { uf: 'RJ', name: 'Rio de Janeiro', leads: 38 },
    { uf: 'BA', name: 'Bahia', leads: 30 },
    { uf: 'PA', name: 'Pará', leads: 28 },
    { uf: 'AM', name: 'Amazonas', leads: 25 },
    { uf: 'PE', name: 'Pernambuco', leads: 22 },
    { uf: 'CE', name: 'Ceará', leads: 18 },
    { uf: 'GO', name: 'Goiás', leads: 16 },
    { uf: 'RS', name: 'Rio Grande do Sul', leads: 15 },
    { uf: 'PR', name: 'Paraná', leads: 14 },
    { uf: 'DF', name: 'Distrito Federal', leads: 11 },
  ],
};

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
