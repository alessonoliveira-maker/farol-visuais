/**
 * Taxonomia fictícia de criativos de mídia paga: três plataformas, nove campanhas e 96 criativos
 * ao todo, contados por campanha. A unidade é o criativo publicado no mês de referência.
 *
 * Cada campanha traz o nome curto que aparece no perímetro (`code`) e o nome inteiro que aparece
 * no tooltip (`name`); os dois são nome da própria campanha, nunca sigla inventada (ROT-8).
 *
 * `highlight` declara o criativo cujo caminho até a raiz fica aceso, pelo id da campanha e pela
 * posição dele dentro dela, para o desenho sair igual em qualquer máquina (seção 10).
 *
 * Dado fictício e fixo: nenhuma plataforma, campanha ou marca real é citada.
 */
export interface RadialCampaign {
  readonly id: string;
  /** Nome curto, escrito no perímetro. */
  readonly code: string;
  /** Nome inteiro, no tooltip do nó. */
  readonly name: string;
  readonly creatives: number;
}

export interface RadialPlatform {
  readonly id: string;
  readonly label: string;
  /** Slot categórico fixo, na ordem da COR-8 (1, 3, 6): cor da categoria, nunca da posição. */
  readonly slot: number;
  readonly campaigns: readonly RadialCampaign[];
}

export interface RadialHighlight {
  readonly campaignId: string;
  /** Posição do criativo dentro da campanha, começando em zero. */
  readonly creativeIndex: number;
  readonly label: string;
}

export interface RadialTaxonomy {
  readonly label: string;
  readonly platforms: readonly RadialPlatform[];
  readonly highlight: RadialHighlight;
}

export const data: RadialTaxonomy = {
  label: 'Criativos do mês',
  platforms: [
    {
      id: 'video-curto',
      label: 'Vídeo curto',
      slot: 1,
      campaigns: [
        {
          id: 'retomada',
          code: 'Retomada',
          name: 'Retomada de contas sem contato no ano',
          creatives: 14,
        },
        {
          id: 'lancamento',
          code: 'Lançamento',
          name: 'Lançamento da linha de crédito estruturado',
          creatives: 12,
        },
        { id: 'sul', code: 'Sul', name: 'Praça Sul, cidades médias', creatives: 9 },
      ],
    },
    {
      id: 'display',
      label: 'Display',
      slot: 3,
      campaigns: [
        { id: 'portfolio', code: 'Portfólio', name: 'Portfólio completo, público frio', creatives: 11 },
        { id: 'reforco', code: 'Reforço', name: 'Reforço de quem visitou e não pediu contato', creatives: 10 },
        { id: 'eventos', code: 'Eventos', name: 'Presença nos eventos de negócios do ano', creatives: 8 },
      ],
    },
    {
      id: 'busca-paga',
      label: 'Busca paga',
      slot: 6,
      campaigns: [
        { id: 'genericas', code: 'Genéricas', name: 'Buscas genéricas de investimento', creatives: 13 },
        {
          id: 'concorrencia',
          code: 'Concorrência',
          name: 'Buscas por casas concorrentes, sem citar nome',
          creatives: 11,
        },
        { id: 'regional', code: 'Regional', name: 'Buscas com nome de cidade e de região', creatives: 8 },
      ],
    },
  ],
  highlight: { campaignId: 'sul', creativeIndex: 5, label: 'Sul 06' },
};
