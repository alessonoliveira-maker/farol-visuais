/**
 * Custo do trimestre 2026-T3 por camada e, dentro de cada camada, por rubrica, em reais.
 * Dado fictício e fixo: nenhuma rubrica cita fornecedor, plataforma ou empresa real.
 *
 * A camada NÃO declara total próprio. Quem soma é o componente, a partir das rubricas, para o
 * valor do pai ser a soma dos filhos por construção e não por coincidência do dado.
 *
 * O caso difícil que esta versão existe para exercitar é a camada `contingencia`, com uma única
 * rubrica de R$ 3 mil num custo de R$ 1,9 mi, isto é 0,2% do total: ela precisa ser desenhada na
 * escala que o valor pede, sem selo nenhum, e continuar nomeada fora do desenho. Escala é o que
 * não se negocia; o rótulo é.
 *
 * `slot` é a posição da cor da camada na ordem de slot da COR-8 (1, 3, 6, 5, 2, 4), gravada no
 * dado e nunca inferida da posição do nó durante o render.
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
      { id: 'midia-busca', name: 'Busca paga', value: 340_000 },
      { id: 'midia-social', name: 'Social paga', value: 240_000 },
      { id: 'midia-display', name: 'Rede de display', value: 88_000 },
      { id: 'midia-criativo', name: 'Produção de criativo', value: 56_000 },
    ],
  },
  {
    id: 'pessoas',
    name: 'Pessoas da esteira',
    slot: 1,
    lines: [
      { id: 'pessoas-prevenda', name: 'Salário da pré-venda', value: 232_000 },
      { id: 'pessoas-venda', name: 'Salário da venda', value: 186_000 },
      { id: 'pessoas-encargo', name: 'Encargo trabalhista', value: 98_000 },
      { id: 'pessoas-comissao', name: 'Comissão de venda', value: 64_000 },
    ],
  },
  {
    id: 'eventos',
    name: 'Eventos e conteúdo',
    slot: 4,
    lines: [
      { id: 'eventos-evento', name: 'Evento patrocinado', value: 132_000 },
      { id: 'eventos-conteudo', name: 'Produção de conteúdo', value: 86_000 },
      { id: 'eventos-brinde', name: 'Brinde institucional', value: 19_000 },
    ],
  },
  {
    id: 'estrutura',
    name: 'Estrutura',
    slot: 2,
    lines: [
      { id: 'estrutura-licenca', name: 'Licença de plataforma', value: 86_000 },
      { id: 'estrutura-escritorio', name: 'Escritório', value: 68_000 },
      { id: 'estrutura-servidor', name: 'Servidor e nuvem', value: 44_000 },
    ],
  },
  {
    id: 'servicos',
    name: 'Serviços profissionais',
    slot: 3,
    lines: [
      { id: 'servicos-contabilidade', name: 'Contabilidade', value: 54_000 },
      { id: 'servicos-juridico', name: 'Jurídico', value: 38_000 },
      { id: 'servicos-auditoria', name: 'Auditoria', value: 26_000 },
    ],
  },
  {
    id: 'contingencia',
    name: 'Contingência',
    slot: 5,
    lines: [{ id: 'contingencia-reserva', name: 'Reserva de contingência', value: 3_000 }],
  },
];
