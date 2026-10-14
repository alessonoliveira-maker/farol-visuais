/**
 * Leads recebidos no semestre por plataforma de mídia e estado de qualificação, em contagem de
 * leads. Dado fictício e fixo: as plataformas são genéricas, nenhuma delas nomeia um produto real.
 *
 * A ordem das fatias é a ordem natural do estado, sempre a mesma: qualificado, em análise,
 * desqualificado. As três frações de cada plataforma fecham em 100,0% com uma casa decimal.
 */
export interface QualificationSlice {
  readonly id: 'qualificado' | 'analise' | 'desqualificado';
  readonly name: string;
  readonly value: number;
}

export interface LeadPlatform {
  readonly platformId: string;
  readonly platformName: string;
  /** Ordem fixa dos estados: a mesma sequência e a mesma cor em toda plataforma (COR-3). */
  readonly slices: readonly QualificationSlice[];
}

export const data: readonly LeadPlatform[] = [
  {
    platformId: 'rede-social',
    platformName: 'Rede social',
    slices: [
      { id: 'qualificado', name: 'Qualificado', value: 846 },
      { id: 'analise', name: 'Em análise', value: 620 },
      { id: 'desqualificado', name: 'Desqualificado', value: 1_014 },
    ],
  },
  {
    platformId: 'busca-paga',
    platformName: 'Busca paga',
    slices: [
      { id: 'qualificado', name: 'Qualificado', value: 570 },
      { id: 'analise', name: 'Em análise', value: 310 },
      { id: 'desqualificado', name: 'Desqualificado', value: 360 },
    ],
  },
  {
    platformId: 'portal-de-noticias',
    platformName: 'Portal de notícias',
    slices: [
      { id: 'qualificado', name: 'Qualificado', value: 130 },
      { id: 'analise', name: 'Em análise', value: 150 },
      { id: 'desqualificado', name: 'Desqualificado', value: 340 },
    ],
  },
];
