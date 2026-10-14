/**
 * Pipeline aberto do trimestre 2026-T3 por executivo e, dentro de cada executivo, por produto,
 * em reais. Dado fictício e fixo: nenhum nome é pessoa real, nenhuma empresa é real.
 *
 * O executivo NÃO declara total próprio. Quem soma é o componente, a partir dos produtos, para o
 * valor do pai ser a soma dos filhos por construção e não por coincidência do dado: é essa
 * igualdade que faz a área do grupo fechar com a área das células dentro dele.
 *
 * Produto sem pipeline aberto no trimestre fica com valor zero, sai do desenho (área zero não
 * codifica nada) e aparece escrito na linha de exclusão, com o motivo em vez do valor. O produto
 * de R$ 70 mil do Executivo F é o caso difícil de rótulo: ele vale 0,5% do total e nunca vai
 * comportar nome e valor dentro da célula.
 */
export interface PipelineProduct {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  /** Motivo da ausência do desenho, só em produto sem pipeline aberto no trimestre. */
  readonly note?: string;
}

export interface ExecutivePipeline {
  readonly id: string;
  readonly name: string;
  readonly products: readonly PipelineProduct[];
}

export const data: readonly ExecutivePipeline[] = [
  {
    id: 'exec-c',
    name: 'Executivo C',
    products: [
      { id: 'exec-c-gestao', name: 'Gestão patrimonial', value: 2_300_000 },
      { id: 'exec-c-sucessorio', name: 'Planejamento sucessório', value: 1_100_000 },
      { id: 'exec-c-credito', name: 'Crédito privado', value: 650_000 },
      { id: 'exec-c-cambio', name: 'Câmbio', value: 350_000 },
    ],
  },
  {
    id: 'exec-a',
    name: 'Executivo A',
    products: [
      { id: 'exec-a-gestao', name: 'Gestão patrimonial', value: 1_400_000 },
      { id: 'exec-a-sucessorio', name: 'Planejamento sucessório', value: 850_000 },
      { id: 'exec-a-cambio', name: 'Câmbio', value: 200_000 },
    ],
  },
  {
    id: 'exec-b',
    name: 'Executivo B',
    products: [
      { id: 'exec-b-gestao', name: 'Gestão patrimonial', value: 1_100_000 },
      { id: 'exec-b-estruturadas', name: 'Operações estruturadas', value: 650_000 },
      { id: 'exec-b-credito', name: 'Crédito privado', value: 400_000 },
    ],
  },
  {
    id: 'exec-d',
    name: 'Executivo D',
    products: [
      { id: 'exec-d-gestao', name: 'Gestão patrimonial', value: 1_050_000 },
      { id: 'exec-d-credito', name: 'Crédito privado', value: 550_000 },
      { id: 'exec-d-cambio', name: 'Câmbio', value: 290_000 },
    ],
  },
  {
    id: 'exec-e',
    name: 'Executivo E',
    products: [
      { id: 'exec-e-estruturadas', name: 'Operações estruturadas', value: 950_000 },
      { id: 'exec-e-gestao', name: 'Gestão patrimonial', value: 600_000 },
      { id: 'exec-e-imobiliaria', name: 'Gestão imobiliária', value: 210_000 },
      {
        id: 'exec-e-previdencia',
        name: 'Previdência corporativa',
        value: 0,
        note: 'sem pipeline aberto no trimestre',
      },
    ],
  },
  {
    id: 'exec-f',
    name: 'Executivo F',
    products: [
      { id: 'exec-f-gestao', name: 'Gestão patrimonial', value: 880_000 },
      { id: 'exec-f-sucessorio', name: 'Planejamento sucessório', value: 440_000 },
      { id: 'exec-f-previdencia', name: 'Previdência corporativa', value: 150_000 },
      { id: 'exec-f-cambio', name: 'Câmbio', value: 70_000 },
    ],
  },
];

/** Executivo aceso: escolhido no dado, nunca inferido do render nem da ordem de valor. */
export const highlightId = 'exec-c';
