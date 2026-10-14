/**
 * Investimento em mídia paga de um mês, em reais, do total à plataforma, da plataforma à campanha e
 * da campanha ao criativo. Dado fictício e fixo: nenhuma plataforma, campanha ou criativo é real, e
 * os nomes são genéricos de propósito.
 *
 * Duas coisas do dado importam para o desenho. A primeira: cada plataforma soma exatamente as
 * campanhas dela. A segunda, que é o caso a exercitar: a campanha `busca-planejamento` vale 51.000 e
 * os criativos dela somam 34.100, então sobram 16.900 sem criativo declarado. Essa diferença não
 * está escrita aqui; o componente a calcula e desenha como um filho "direto na campanha", para o
 * espaço da faixa não sobrar vazio nem a soma do nível mentir.
 */
export interface SpendNode {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly children?: readonly SpendNode[];
}

/**
 * Plataforma: além do nó comum, carrega o slot fixo de cor (COR-3, COR-8). O slot pertence à
 * plataforma, não à posição no ranking de gasto, então reordenar nunca troca a cor.
 */
export interface PlatformSpend extends SpendNode {
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export const data: readonly PlatformSpend[] = [
  {
    id: 'rede-social',
    label: 'Rede social',
    value: 130_000,
    slot: 1,
    children: [
      {
        id: 'social-captacao',
        label: 'Captação patrimonial',
        value: 74_000,
        children: [
          { id: 'social-captacao-video', label: 'Vídeo depoimento', value: 29_000 },
          { id: 'social-captacao-carrossel', label: 'Carrossel de gráficos', value: 24_500 },
          { id: 'social-captacao-imagem', label: 'Imagem única', value: 20_500 },
        ],
      },
      {
        id: 'social-remarketing',
        label: 'Remarketing de base',
        value: 56_000,
        children: [
          { id: 'social-remarketing-vertical', label: 'Vídeo curto vertical', value: 31_000 },
          { id: 'social-remarketing-colecao', label: 'Coleção de imóveis', value: 25_000 },
        ],
      },
    ],
  },
  {
    id: 'busca-paga',
    label: 'Busca paga',
    value: 112_000,
    slot: 3,
    children: [
      {
        id: 'busca-marca',
        label: 'Marca própria',
        value: 30_000,
        children: [
          { id: 'busca-marca-chamada', label: 'Chamada direta', value: 17_400 },
          { id: 'busca-marca-local', label: 'Extensão de local', value: 12_600 },
        ],
      },
      {
        id: 'busca-planejamento',
        label: 'Planejamento',
        value: 51_000,
        children: [
          { id: 'busca-planejamento-texto', label: 'Anúncio de planejamento', value: 22_000 },
          { id: 'busca-planejamento-sucessao', label: 'Anúncio de sucessão', value: 12_100 },
        ],
      },
      {
        id: 'busca-concorrentes',
        label: 'Concorrentes',
        value: 31_000,
        children: [
          { id: 'busca-concorrentes-taxas', label: 'Comparativo de taxas', value: 17_500 },
          { id: 'busca-concorrentes-migracao', label: 'Migração de carteira', value: 13_500 },
        ],
      },
    ],
  },
  {
    id: 'rede-profissional',
    label: 'Rede profissional',
    value: 70_000,
    slot: 6,
    children: [
      {
        id: 'profissional-conteudo',
        label: 'Conteúdo técnico',
        value: 38_000,
        children: [
          { id: 'profissional-conteudo-artigo', label: 'Artigo patrocinado', value: 22_400 },
          { id: 'profissional-conteudo-documento', label: 'Documento para download', value: 15_600 },
        ],
      },
      {
        id: 'profissional-ficha',
        label: 'Ficha nativa',
        value: 32_000,
        children: [
          { id: 'profissional-ficha-diagnostico', label: 'Ficha de diagnóstico', value: 18_400 },
          { id: 'profissional-ficha-evento', label: 'Ficha de evento', value: 13_600 },
        ],
      },
    ],
  },
];

/** Nome dos quatro níveis, de fora para dentro. A contagem manda no número de faixas. */
export const levelNames = ['Total', 'Plataforma', 'Campanha', 'Criativo'] as const;

/** Nome da faixa de cima, escrito com o total ao lado. */
export const totalLabel = 'Investimento do mês';

/** Recorte de período, escrito no desenho e na frase acessível, nunca só na frase (DAD-9). */
export const periodLabel = '2026-08';

/**
 * Rótulo do filho calculado quando a campanha tem valor próprio sem criativo que o explique. Mora
 * aqui, e não no componente, porque é texto de tela.
 */
export const directChildLabel = 'Direto na campanha, sem criativo';
