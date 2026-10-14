/**
 * Eventos presenciais de 2026 por cidade, em contagem de eventos. Dado fictício e fixo: as cidades são
 * lugares públicos, mas os eventos são inventados. `events` zero é medido (a cidade foi acompanhada e não
 * recebeu evento): Manaus, Belém e Porto Velho. O Norte inteiro fica em zero, que é o padrão que o mapa
 * precisa mostrar. Casos difíceis: São Paulo com 5 eventos no mesmo ponto, cidades a 9 px uma da outra
 * (Curitiba e Florianópolis) e cidades com 1 evento só.
 */
export type RegionId = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

export interface EventCity {
  readonly id: string;
  readonly city: string;
  readonly region: RegionId;
  readonly lon: number;
  readonly lat: number;
  readonly events: number;
}

export const data: readonly EventCity[] = [
  { id: 'sao-paulo', city: 'São Paulo', region: 'sudeste', lon: -46.6, lat: -23.5, events: 5 },
  { id: 'rio-de-janeiro', city: 'Rio de Janeiro', region: 'sudeste', lon: -43.2, lat: -22.9, events: 4 },
  { id: 'belo-horizonte', city: 'Belo Horizonte', region: 'sudeste', lon: -43.9, lat: -19.9, events: 3 },
  { id: 'ribeirao-preto', city: 'Ribeirão Preto', region: 'sudeste', lon: -47.8, lat: -21.2, events: 2 },
  { id: 'uberlandia', city: 'Uberlândia', region: 'sudeste', lon: -48.3, lat: -18.9, events: 2 },
  { id: 'vitoria', city: 'Vitória', region: 'sudeste', lon: -40.3, lat: -20.3, events: 1 },
  { id: 'curitiba', city: 'Curitiba', region: 'sul', lon: -49.3, lat: -25.4, events: 3 },
  { id: 'porto-alegre', city: 'Porto Alegre', region: 'sul', lon: -51.2, lat: -30.0, events: 3 },
  { id: 'londrina', city: 'Londrina', region: 'sul', lon: -51.2, lat: -23.3, events: 1 },
  { id: 'florianopolis', city: 'Florianópolis', region: 'sul', lon: -48.5, lat: -27.6, events: 1 },
  { id: 'brasilia', city: 'Brasília', region: 'centro-oeste', lon: -47.9, lat: -15.8, events: 3 },
  { id: 'campo-grande', city: 'Campo Grande', region: 'centro-oeste', lon: -54.6, lat: -20.5, events: 2 },
  { id: 'cuiaba', city: 'Cuiabá', region: 'centro-oeste', lon: -56.1, lat: -15.6, events: 2 },
  { id: 'salvador', city: 'Salvador', region: 'nordeste', lon: -38.5, lat: -13.0, events: 3 },
  { id: 'recife', city: 'Recife', region: 'nordeste', lon: -34.9, lat: -8.1, events: 3 },
  { id: 'fortaleza', city: 'Fortaleza', region: 'nordeste', lon: -38.5, lat: -3.7, events: 2 },
  { id: 'natal', city: 'Natal', region: 'nordeste', lon: -35.2, lat: -5.8, events: 1 },
  { id: 'sao-luis', city: 'São Luís', region: 'nordeste', lon: -44.3, lat: -2.5, events: 1 },
  { id: 'manaus', city: 'Manaus', region: 'norte', lon: -60.0, lat: -3.1, events: 0 },
  { id: 'belem', city: 'Belém', region: 'norte', lon: -48.5, lat: -1.5, events: 0 },
  { id: 'porto-velho', city: 'Porto Velho', region: 'norte', lon: -63.9, lat: -8.8, events: 0 },
];

/** Macrorregiões na ordem de leitura de norte a sul e de oeste a leste. */
export const REGIONS: readonly { readonly id: RegionId; readonly name: string }[] = [
  { id: 'norte', name: 'Norte' },
  { id: 'nordeste', name: 'Nordeste' },
  { id: 'centro-oeste', name: 'Centro-Oeste' },
  { id: 'sudeste', name: 'Sudeste' },
  { id: 'sul', name: 'Sul' },
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
