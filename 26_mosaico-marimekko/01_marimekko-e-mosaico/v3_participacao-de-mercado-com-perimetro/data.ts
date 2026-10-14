/**
 * Receita de mercado de 2026 dividida entre nós, dois concorrentes e os demais, vista por
 * segmento e por região, em reais. O total é o perímetro de mercado declarado, uma premissa de
 * base pública fictícia. Dado fictício e fixo: nenhum concorrente, segmento ou número é real.
 * As duas visões fecham no mesmo perímetro e na mesma receita por competidor: trocar a coluna de
 * segmento para região muda só a largura, nunca o total.
 * Setor público pesa 0,5% do perímetro: é a coluna de poucos pixels, que ganha rótulo escalonado.
 */
export type PlayerId = 'nos' | 'concorrente-a' | 'concorrente-b' | 'demais';

export interface Player {
  readonly id: PlayerId;
  readonly label: string;
}

export interface MarketColumn {
  readonly id: string;
  readonly label: string;
  /** Receita por competidor, em reais. Todo competidor de `players` aparece, mesmo com zero. */
  readonly revenue: Readonly<Record<PlayerId, number>>;
}

export interface MarketView {
  readonly id: string;
  /** Nome da dimensão no seletor e no cabeçalho da tabela. */
  readonly label: string;
  /** Plural em minúsculas, para a frase do perímetro ("4 segmentos"). */
  readonly plural: string;
  /** Nome próprio (região) guarda a maiúscula no meio da frase; nome comum (segmento) baixa. */
  readonly properNames?: boolean;
  readonly columns: readonly MarketColumn[];
}

export interface Perimeter {
  /** De onde vem o total do mercado, escrito no subtítulo. */
  readonly source: string;
  readonly provenance: 'medido' | 'premissa';
}

/** A ordem desta lista é a ordem da pilha, da base para o topo, e a ordem da legenda. Nós na base. */
export const players: readonly Player[] = [
  { id: 'nos', label: 'Nós' },
  { id: 'concorrente-a', label: 'Concorrente A' },
  { id: 'concorrente-b', label: 'Concorrente B' },
  { id: 'demais', label: 'Demais' },
];

export const perimeter: Perimeter = { source: 'base pública fictícia, 2026', provenance: 'premissa' };

/** A primeira visão é a que abre; as outras entram no seletor. */
export const data: readonly MarketView[] = [
  {
    id: 'segmento',
    label: 'Segmento',
    plural: 'segmentos',
    columns: [
      { id: 'setor-publico', label: 'Setor público', revenue: { nos: 300_000, 'concorrente-a': 900_000, 'concorrente-b': 300_000, demais: 500_000 } },
      { id: 'industria', label: 'Indústria leve', revenue: { nos: 44_100_000, 'concorrente-a': 25_200_000, 'concorrente-b': 31_500_000, demais: 25_200_000 } },
      { id: 'varejo', label: 'Varejo alimentar', revenue: { nos: 37_000_000, 'concorrente-a': 58_800_000, 'concorrente-b': 30_200_000, demais: 42_000_000 } },
      { id: 'saude', label: 'Serviços de saúde', revenue: { nos: 12_500_000, 'concorrente-a': 41_600_000, 'concorrente-b': 20_800_000, demais: 29_100_000 } },
    ],
  },
  {
    id: 'regiao',
    label: 'Região',
    plural: 'regiões',
    properNames: true,
    columns: [
      { id: 'sudeste', label: 'Sudeste', revenue: { nos: 52_000_000, 'concorrente-a': 60_000_000, 'concorrente-b': 40_000_000, demais: 44_000_000 } },
      { id: 'sul', label: 'Sul', revenue: { nos: 24_600_000, 'concorrente-a': 22_000_000, 'concorrente-b': 21_400_000, demais: 20_000_000 } },
      { id: 'nordeste', label: 'Nordeste', revenue: { nos: 9_300_000, 'concorrente-a': 26_500_000, 'concorrente-b': 10_200_000, demais: 18_000_000 } },
      { id: 'norte-centro-oeste', label: 'Norte e Centro-Oeste', revenue: { nos: 8_000_000, 'concorrente-a': 18_000_000, 'concorrente-b': 11_200_000, demais: 14_800_000 } },
    ],
  },
];
