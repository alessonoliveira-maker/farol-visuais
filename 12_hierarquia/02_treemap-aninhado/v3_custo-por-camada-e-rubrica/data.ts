/**
 * Custo do trimestre 2026-T3 por camada e, dentro de cada camada, por rubrica, em reais.
 * Dado fictício e fixo: nenhuma rubrica cita fornecedor, plataforma ou empresa real.
 *
 * A camada NÃO declara total próprio. Quem soma é o componente, a partir das rubricas, para o
 * valor do pai ser a soma dos filhos por construção e não por coincidência do dado: é essa
 * igualdade que faz a área da camada fechar com a área das rubricas dentro dela, e é ela que
 * autoriza escrever o total e a participação da camada na faixa de cabeçalho.
 *
 * A menor camada guarda 22% do custo, e não 5%, de propósito: no squarify a largura da coluna de
 * uma camada é a participação dela vezes a largura do corpo, então camada muito pequena não tem
 * onde escrever nome e total juntos na faixa. A camada que não cabe é o caso da `v4`, não desta.
 *
 * `slot` é a posição da cor da camada na ordem de slot da COR-8 (1, 3, 6, 5, 2, 4), gravada no
 * dado e nunca inferida da posição do nó durante o render: cor que se escolhe sozinha muda de
 * dono a cada recorte.
 */
export interface CostLine {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

export interface CostLayer {
  readonly id: string;
  readonly name: string;
  readonly slot: number;
  readonly lines: readonly CostLine[];
}

export const data: readonly CostLayer[] = [
  {
    id: 'midia',
    name: 'Mídia paga',
    slot: 0,
    lines: [
      { id: 'midia-busca', name: 'Busca paga', value: 376_000 },
      { id: 'midia-social', name: 'Social paga', value: 268_000 },
      { id: 'midia-display', name: 'Rede de display', value: 92_000 },
      { id: 'midia-video', name: 'Vídeo patrocinado', value: 74_000 },
      { id: 'midia-criativo', name: 'Produção de criativo', value: 62_000 },
      { id: 'midia-evento', name: 'Evento patrocinado', value: 54_000 },
      { id: 'midia-conteudo', name: 'Patrocínio de conteúdo', value: 48_000 },
      { id: 'midia-consultoria', name: 'Consultoria de mídia', value: 35_000 },
      { id: 'midia-ferramenta', name: 'Ferramenta de anúncio', value: 21_000 },
    ],
  },
  {
    id: 'pessoas',
    name: 'Pessoas da esteira',
    slot: 1,
    lines: [
      { id: 'pessoas-prevenda', name: 'Salário da pré-venda', value: 252_000 },
      { id: 'pessoas-venda', name: 'Salário da venda', value: 198_000 },
      { id: 'pessoas-encargo', name: 'Encargo trabalhista', value: 112_000 },
      { id: 'pessoas-comissao', name: 'Comissão de venda', value: 88_000 },
      { id: 'pessoas-beneficio', name: 'Benefício de equipe', value: 45_000 },
      { id: 'pessoas-bonificacao', name: 'Bonificação de meta', value: 36_000 },
      { id: 'pessoas-viagem', name: 'Viagem comercial', value: 28_000 },
      { id: 'pessoas-treinamento', name: 'Treinamento comercial', value: 22_000 },
      { id: 'pessoas-processo', name: 'Consultoria de processo', value: 19_000 },
    ],
  },
  {
    id: 'estrutura',
    name: 'Estrutura',
    slot: 2,
    lines: [
      { id: 'estrutura-licenca', name: 'Licença de plataforma', value: 148_000 },
      { id: 'estrutura-escritorio', name: 'Escritório', value: 112_000 },
      { id: 'estrutura-servidor', name: 'Servidor e nuvem', value: 86_000 },
      { id: 'estrutura-contabilidade', name: 'Contabilidade', value: 54_000 },
      { id: 'estrutura-juridico', name: 'Jurídico', value: 42_000 },
      { id: 'estrutura-telefonia', name: 'Telefonia e dados', value: 32_000 },
      { id: 'estrutura-seguro', name: 'Seguro', value: 30_000 },
      { id: 'estrutura-manutencao', name: 'Energia e manutenção', value: 26_000 },
    ],
  },
];
