/**
 * Clientes por cidade e escritórios, em contagem de clientes e coordenadas em graus. Dado fictício e fixo:
 * as cidades são lugares públicos, mas os clientes e os escritórios são inventados. O componente espalha os
 * clientes de cada cidade em volta da coordenada com um gerador de semente fixa, e a distância ao escritório
 * mais próximo decide quem está dentro do raio. Casos difíceis: Campinas, Ouro Preto e Formosa perto da
 * borda de 100 km, Anápolis logo depois dela, e Juiz de Fora e Rio de Janeiro bem fora.
 */
export interface ClientCity {
  readonly id: string;
  readonly city: string;
  readonly lon: number;
  readonly lat: number;
  readonly clients: number;
}

export interface Office {
  readonly id: string;
  readonly city: string;
  readonly lon: number;
  readonly lat: number;
}

export const data: readonly ClientCity[] = [
  { id: 'sao-paulo', city: 'São Paulo', lon: -46.63, lat: -23.55, clients: 4 },
  { id: 'campinas', city: 'Campinas', lon: -47.06, lat: -22.91, clients: 3 },
  { id: 'santos', city: 'Santos', lon: -46.33, lat: -23.96, clients: 3 },
  { id: 'sorocaba', city: 'Sorocaba', lon: -47.45, lat: -23.5, clients: 2 },
  { id: 'jundiai', city: 'Jundiaí', lon: -46.88, lat: -23.19, clients: 2 },
  { id: 'sao-jose-dos-campos', city: 'São José dos Campos', lon: -45.89, lat: -23.22, clients: 2 },
  { id: 'ribeirao-preto', city: 'Ribeirão Preto', lon: -47.81, lat: -21.18, clients: 5 },
  { id: 'rio-de-janeiro', city: 'Rio de Janeiro', lon: -43.2, lat: -22.9, clients: 6 },
  { id: 'londrina', city: 'Londrina', lon: -51.16, lat: -23.31, clients: 4 },
  { id: 'bauru', city: 'Bauru', lon: -49.06, lat: -22.31, clients: 4 },
  { id: 'belo-horizonte', city: 'Belo Horizonte', lon: -43.94, lat: -19.92, clients: 4 },
  { id: 'sete-lagoas', city: 'Sete Lagoas', lon: -44.25, lat: -19.47, clients: 2 },
  { id: 'ouro-preto', city: 'Ouro Preto', lon: -43.5, lat: -20.39, clients: 2 },
  { id: 'juiz-de-fora', city: 'Juiz de Fora', lon: -43.35, lat: -21.76, clients: 3 },
  { id: 'uberlandia', city: 'Uberlândia', lon: -48.28, lat: -18.92, clients: 3 },
  { id: 'montes-claros', city: 'Montes Claros', lon: -43.86, lat: -16.73, clients: 3 },
  { id: 'vitoria', city: 'Vitória', lon: -40.3, lat: -20.3, clients: 4 },
  { id: 'brasilia', city: 'Brasília', lon: -47.93, lat: -15.78, clients: 4 },
  { id: 'luziania', city: 'Luziânia', lon: -47.95, lat: -16.25, clients: 3 },
  { id: 'formosa', city: 'Formosa', lon: -47.33, lat: -15.54, clients: 2 },
  { id: 'anapolis', city: 'Anápolis', lon: -48.95, lat: -16.33, clients: 3 },
  { id: 'goiania', city: 'Goiânia', lon: -49.25, lat: -16.68, clients: 4 },
  { id: 'unai', city: 'Unaí', lon: -46.9, lat: -16.36, clients: 2 },
];

export const offices: readonly Office[] = [
  { id: 'escritorio-sp', city: 'São Paulo', lon: -46.63, lat: -23.55 },
  { id: 'escritorio-bh', city: 'Belo Horizonte', lon: -43.94, lat: -19.92 },
  { id: 'escritorio-df', city: 'Brasília', lon: -47.93, lat: -15.78 },
];

/** Raio de atuação, em quilômetros. */
export const RADIUS_KM = 100;

/** Janela de desenho em graus: recorta o Sudeste e o Centro-Oeste, onde ficam os três escritórios. */
export const GEO_WINDOW = { lonMin: -52, lonMax: -39.5, latMax: -14.5, latMin: -25 } as const;

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
