/**
 * Investimento em mídia paga de 2026-08, em reais, em três níveis: plataforma, campanha e
 * criativo. Dado fictício e fixo: plataformas e campanhas com nomes genéricos, nenhuma marca
 * real, nenhuma pessoa e nenhuma conta real.
 * `investment` só existe na folha e no ramo sem filhos. Em nó com filhos o valor é a SOMA dos
 * filhos, calculada no componente: assim a área do pai fecha com a dos filhos por construção, e
 * não existe o caso de um total declarado divergir do que o desenho mostra.
 * O índice de string satisfaz o TreemapDataType do Recharts (children opcional mais
 * [key: string]: unknown), exigido pelo genérico de Treemap e não pelos demais gráficos.
 */
export interface InvestmentNode {
  readonly id: string;
  readonly name: string;
  /** Investimento do nó. Só na folha e no ramo registrado sem filhos. */
  readonly investment?: number;
  /** Filhos do nó. Lista vazia é ramo registrado e sem nada dentro, diferente de folha. */
  readonly children?: readonly InvestmentNode[];
  readonly [key: string]: unknown;
}

export const data: readonly InvestmentNode[] = [
  {
    id: 'plat-01',
    name: 'Busca paga',
    children: [
      {
        id: 'camp-01',
        name: 'Marca',
        children: [
          { id: 'cria-01', name: 'Título institucional', investment: 12_400 },
          { id: 'cria-02', name: 'Título com prova', investment: 9_800 },
        ],
      },
      {
        id: 'camp-02',
        name: 'Genérica FIDC',
        children: [
          { id: 'cria-03', name: 'FIDC para indústria', investment: 18_600 },
          { id: 'cria-04', name: 'Antecipação de recebíveis', investment: 14_200 },
          { id: 'cria-05', name: 'Cedente monocedente', investment: 9_800 },
        ],
      },
      { id: 'camp-03', name: 'Concorrência', investment: 16_500, children: [] },
    ],
  },
  {
    id: 'plat-02',
    name: 'Rede social',
    children: [
      {
        id: 'camp-04',
        name: 'Público semelhante',
        children: [
          { id: 'cria-06', name: 'Carrossel patrimônio', investment: 16_400 },
          { id: 'cria-07', name: 'Vídeo depoimento', investment: 12_500 },
        ],
      },
      {
        id: 'camp-05',
        name: 'Interesse patrimônio',
        children: [
          { id: 'cria-08', name: 'Imagem única', investment: 11_300 },
          { id: 'cria-09', name: 'Coleção', investment: 8_400 },
        ],
      },
    ],
  },
  {
    id: 'plat-03',
    name: 'Rede profissional',
    children: [
      {
        id: 'camp-06',
        name: 'Cargo diretor',
        children: [
          { id: 'cria-10', name: 'Mensagem patrocinada', investment: 14_100 },
          { id: 'cria-11', name: 'Documento patrocinado', investment: 10_200 },
        ],
      },
      {
        id: 'camp-07',
        name: 'Setor indústria',
        children: [{ id: 'cria-12', name: 'Imagem única', investment: 13_800 }],
      },
    ],
  },
];

/** Mês do recorte, em `YYYY-MM`. Fixo, porque o preview não pode depender do relógio (seção 10). */
export const period = '2026-08';

/**
 * Caminho aberto na montagem, por id, do nível mais alto para o mais fundo. Declarado aqui, e não
 * no componente, para o preview mostrar o ramo vazio: é a campanha Concorrência, que existe e tem
 * investimento, mas não tem criativo registrado.
 */
export const initialPath: readonly string[] = ['plat-01', 'camp-03'];

/**
 * Assinatura do filtro global da página. Ela entra como `key` do corpo, o que remonta a árvore
 * quando o recorte muda: sem isso o caminho aberto sobreviveria a uma troca de mês e apontaria
 * para um ramo que não existe mais.
 */
export const filterSignature = '2026-08|todas-as-plataformas';
