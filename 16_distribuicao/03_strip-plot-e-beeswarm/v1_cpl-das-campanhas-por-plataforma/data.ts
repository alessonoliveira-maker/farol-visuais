/**
 * Custo por lead de cada campanha do trimestre, por tipo de mídia. Dado fictício, determinístico,
 * sem nenhuma correspondência com a base real, e sem nome de plataforma de verdade: o eixo é o tipo
 * de mídia, que é o recorte que sobrevive à troca de fornecedor.
 *
 * Uma linha por campanha, com nome. É o que separa o strip do histograma: aqui cada ponto é uma
 * campanha que alguém pode abrir, pausar ou copiar, e o ponto sem nome perderia justamente isso.
 */

export interface Campaign {
  readonly name: string;
  /** Custo por lead, em reais. */
  readonly cpl: number;
}

export interface MediaKind {
  readonly id: string;
  readonly name: string;
  readonly campaigns: readonly Campaign[];
}

/** Meta de CPL do trimestre, em reais. */
export const CPL_TARGET = 150;

/**
 * Campanhas que rodaram no trimestre sem gerar nenhum lead. CPL não existe com denominador zero, e
 * escrever um número infinito ou um zero seria mentir das duas formas possíveis: ficam fora da
 * faixa e contadas no rodapé.
 */
export const WITHOUT_LEADS = 7;

export const data: readonly MediaKind[] = [
  {
    id: 'busca',
    name: 'Busca paga',
    campaigns: [
    { name: 'Alvorada prospecção', cpl: 104 }, { name: 'Bastião prospecção', cpl: 32 },
    { name: 'Cerrado prospecção', cpl: 67 }, { name: 'Dunas prospecção', cpl: 95 },
    { name: 'Estuário prospecção', cpl: 88 }, { name: 'Alecrim prospecção', cpl: 70 },
    { name: 'Guaíba prospecção', cpl: 133 }, { name: 'Horizonte prospecção', cpl: 185 },
    { name: 'Ipê prospecção', cpl: 98 }, { name: 'Jacarandá prospecção', cpl: 101 },
    { name: 'Kuriri prospecção', cpl: 77 }, { name: 'Litoral prospecção', cpl: 99 },
    { name: 'Manancial prospecção', cpl: 92 }, { name: 'Nascente prospecção', cpl: 134 },
    { name: 'Oiti prospecção', cpl: 85 }, { name: 'Palmares prospecção', cpl: 97 },
    { name: 'Quaresmeira prospecção', cpl: 71 }, { name: 'Recanto prospecção', cpl: 52 },
    { name: 'Serrano prospecção', cpl: 100 }, { name: 'Tapera prospecção', cpl: 53 },
    { name: 'Urutau prospecção', cpl: 81 }, { name: 'Varanda prospecção', cpl: 61 },
    { name: 'Xaxim prospecção', cpl: 58 }, { name: 'Zênite prospecção', cpl: 106 },
    { name: 'Aroeira prospecção', cpl: 87 }, { name: 'Braúna prospecção', cpl: 115 },
    { name: 'Canela prospecção', cpl: 198 }, { name: 'Dourado prospecção', cpl: 80 },
    { name: 'Embiara prospecção', cpl: 73 }, { name: 'Figueira prospecção', cpl: 88 },
    { name: 'Gaivota prospecção', cpl: 62 }, { name: 'Hibisco prospecção', cpl: 74 },
    { name: 'Imbuia prospecção', cpl: 76 }, { name: 'Jatobá prospecção', cpl: 75 },
    ],
  },
  {
    id: 'social',
    name: 'Social',
    campaigns: [
    { name: 'Lapinha prospecção', cpl: 125 }, { name: 'Murici prospecção', cpl: 391 },
    { name: 'Nambu prospecção', cpl: 182 }, { name: 'Ouricuri prospecção', cpl: 79 },
    { name: 'Pitanga prospecção', cpl: 94 }, { name: 'Quixaba prospecção', cpl: 136 },
    { name: 'Rubi prospecção', cpl: 69 }, { name: 'Sabiá prospecção', cpl: 69 },
    { name: 'Tucano prospecção', cpl: 149 }, { name: 'Umbu prospecção', cpl: 56 },
    { name: 'Vinhático prospecção', cpl: 153 }, { name: 'Alvorada remarketing', cpl: 230 },
    { name: 'Bastião remarketing', cpl: 180 }, { name: 'Cerrado remarketing', cpl: 138 },
    { name: 'Dunas remarketing', cpl: 151 }, { name: 'Estuário remarketing', cpl: 152 },
    { name: 'Alecrim remarketing', cpl: 196 }, { name: 'Guaíba remarketing', cpl: 174 },
    { name: 'Horizonte remarketing', cpl: 103 }, { name: 'Ipê remarketing', cpl: 75 },
    { name: 'Jacarandá remarketing', cpl: 132 }, { name: 'Kuriri remarketing', cpl: 68 },
    { name: 'Litoral remarketing', cpl: 194 }, { name: 'Manancial remarketing', cpl: 74 },
    { name: 'Nascente remarketing', cpl: 38 }, { name: 'Oiti remarketing', cpl: 55 },
    { name: 'Palmares remarketing', cpl: 75 }, { name: 'Quaresmeira remarketing', cpl: 110 },
    { name: 'Recanto remarketing', cpl: 67 }, { name: 'Serrano remarketing', cpl: 128 },
    { name: 'Tapera remarketing', cpl: 146 }, { name: 'Urutau remarketing', cpl: 75 },
    { name: 'Varanda remarketing', cpl: 58 }, { name: 'Xaxim remarketing', cpl: 60 },
    { name: 'Zênite remarketing', cpl: 86 }, { name: 'Aroeira remarketing', cpl: 138 },
    { name: 'Braúna remarketing', cpl: 52 }, { name: 'Canela remarketing', cpl: 102 },
    { name: 'Dourado remarketing', cpl: 87 }, { name: 'Embiara remarketing', cpl: 165 },
    { name: 'Figueira remarketing', cpl: 138 },
    ],
  },
  {
    id: 'video',
    name: 'Vídeo',
    campaigns: [
    { name: 'Gaivota remarketing', cpl: 162 }, { name: 'Hibisco remarketing', cpl: 283 },
    { name: 'Imbuia remarketing', cpl: 291 }, { name: 'Jatobá remarketing', cpl: 136 },
    { name: 'Lapinha remarketing', cpl: 127 }, { name: 'Murici remarketing', cpl: 249 },
    { name: 'Nambu remarketing', cpl: 251 }, { name: 'Ouricuri remarketing', cpl: 350 },
    { name: 'Pitanga remarketing', cpl: 149 }, { name: 'Quixaba remarketing', cpl: 140 },
    { name: 'Rubi remarketing', cpl: 198 }, { name: 'Sabiá remarketing', cpl: 179 },
    { name: 'Tucano remarketing', cpl: 94 }, { name: 'Umbu remarketing', cpl: 169 },
    { name: 'Vinhático remarketing', cpl: 99 }, { name: 'Alvorada institucional', cpl: 114 },
    { name: 'Bastião institucional', cpl: 255 }, { name: 'Cerrado institucional', cpl: 91 },
    { name: 'Dunas institucional', cpl: 232 }, { name: 'Estuário institucional', cpl: 188 },
    { name: 'Alecrim institucional', cpl: 201 }, { name: 'Guaíba institucional', cpl: 162 },
    ],
  },
  {
    id: 'display',
    name: 'Display',
    campaigns: [
    { name: 'Horizonte institucional', cpl: 172 }, { name: 'Ipê institucional', cpl: 371 },
    { name: 'Jacarandá institucional', cpl: 188 }, { name: 'Kuriri institucional', cpl: 286 },
    { name: 'Litoral institucional', cpl: 149 }, { name: 'Manancial institucional', cpl: 328 },
    { name: 'Nascente institucional', cpl: 53 }, { name: 'Oiti institucional', cpl: 81 },
    { name: 'Palmares institucional', cpl: 204 }, { name: 'Quaresmeira institucional', cpl: 79 },
    { name: 'Recanto institucional', cpl: 72 }, { name: 'Serrano institucional', cpl: 121 },
    { name: 'Tapera institucional', cpl: 102 }, { name: 'Urutau institucional', cpl: 63 },
    { name: 'Varanda institucional', cpl: 75 }, { name: 'Xaxim institucional', cpl: 395 },
    { name: 'Zênite institucional', cpl: 151 },
    ],
  },
];
