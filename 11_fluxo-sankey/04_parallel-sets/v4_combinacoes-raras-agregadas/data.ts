/**
 * Origem, porte da empresa e desfecho das 248 agendas marcadas pela pré-vendas na competência
 * 2026-08, em 28 combinações observadas. Dado fictício e fixo: nenhuma origem é plataforma real,
 * nenhuma empresa é real, nenhuma pessoa é citada.
 *
 * O DADO CHEGA INTEIRO E CRU. A agregação das combinações raras é decisão do componente, que tem o
 * limiar numa constante do topo do arquivo, não do dado: assim o mesmo `data.ts` serve para mostrar
 * as 28 combinações ou para agregar as pequenas, e a soma continua sendo 248 nas duas leituras. Se
 * a agregação viesse pronta aqui, o limiar ficaria escondido e ninguém saberia o que sumiu.
 *
 * Seis combinações têm menos de cinco agendas e somam 20: são elas que o componente junta.
 */
export interface ParallelCategory {
  readonly id: string;
  readonly label: string;
  /**
   * Slot da paleta categórica, fixo por categoria e vindo do dado (COR-3). Só o eixo de origem
   * tem slot, porque é a primeira dimensão e a única identificável ao longo do caminho inteiro.
   * A ordem 1, 3, 6, 5, 2 é a da COR-8.
   */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
}

export type AxisId = 'origem' | 'porte' | 'desfecho';

export interface ParallelAxis {
  readonly id: AxisId;
  readonly label: string;
  readonly categories: readonly ParallelCategory[];
}

export interface ParallelCombo {
  readonly origem: string;
  readonly porte: string;
  readonly desfecho: string;
  readonly count: number;
}

export const axes: readonly ParallelAxis[] = [
  {
    id: 'origem',
    label: 'Origem',
    categories: [
      { id: 'midia', label: 'Mídia social', slot: 1 },
      { id: 'busca', label: 'Busca paga', slot: 3 },
      { id: 'rede', label: 'Rede social', slot: 6 },
      { id: 'organico', label: 'Orgânico', slot: 5 },
      { id: 'indicacao', label: 'Indicação', slot: 2 },
    ],
  },
  {
    id: 'porte',
    label: 'Porte',
    categories: [
      { id: 'pequena', label: 'Pequena' },
      { id: 'media', label: 'Média' },
      { id: 'grande', label: 'Grande' },
    ],
  },
  {
    id: 'desfecho',
    label: 'Desfecho',
    categories: [
      { id: 'realizada', label: 'Realizada' },
      { id: 'remarcada', label: 'Remarcada' },
      { id: 'cancelada', label: 'Cancelada' },
      { id: 'ausente', label: 'Não compareceu' },
    ],
  },
];

export const data: readonly ParallelCombo[] = [
  { origem: 'midia', porte: 'pequena', desfecho: 'realizada', count: 14 },
  { origem: 'midia', porte: 'pequena', desfecho: 'cancelada', count: 5 },
  { origem: 'midia', porte: 'media', desfecho: 'realizada', count: 16 },
  { origem: 'midia', porte: 'media', desfecho: 'remarcada', count: 6 },
  { origem: 'midia', porte: 'media', desfecho: 'cancelada', count: 2 },
  { origem: 'midia', porte: 'grande', desfecho: 'realizada', count: 7 },
  { origem: 'midia', porte: 'grande', desfecho: 'ausente', count: 4 },
  { origem: 'busca', porte: 'pequena', desfecho: 'realizada', count: 12 },
  { origem: 'busca', porte: 'pequena', desfecho: 'cancelada', count: 6 },
  { origem: 'busca', porte: 'media', desfecho: 'realizada', count: 15 },
  { origem: 'busca', porte: 'media', desfecho: 'remarcada', count: 5 },
  { origem: 'busca', porte: 'grande', desfecho: 'realizada', count: 8 },
  { origem: 'busca', porte: 'grande', desfecho: 'cancelada', count: 4 },
  { origem: 'rede', porte: 'pequena', desfecho: 'realizada', count: 9 },
  { origem: 'rede', porte: 'media', desfecho: 'realizada', count: 17 },
  { origem: 'rede', porte: 'media', desfecho: 'remarcada', count: 5 },
  { origem: 'rede', porte: 'grande', desfecho: 'realizada', count: 13 },
  { origem: 'rede', porte: 'grande', desfecho: 'remarcada', count: 4 },
  { origem: 'organico', porte: 'pequena', desfecho: 'realizada', count: 8 },
  { origem: 'organico', porte: 'pequena', desfecho: 'ausente', count: 5 },
  { origem: 'organico', porte: 'media', desfecho: 'realizada', count: 11 },
  { origem: 'organico', porte: 'media', desfecho: 'cancelada', count: 3 },
  { origem: 'organico', porte: 'grande', desfecho: 'realizada', count: 6 },
  { origem: 'indicacao', porte: 'pequena', desfecho: 'realizada', count: 10 },
  { origem: 'indicacao', porte: 'media', desfecho: 'realizada', count: 18 },
  { origem: 'indicacao', porte: 'media', desfecho: 'remarcada', count: 3 },
  { origem: 'indicacao', porte: 'grande', desfecho: 'realizada', count: 25 },
  { origem: 'indicacao', porte: 'grande', desfecho: 'remarcada', count: 7 },
];

/** Ordem inicial de leitura dos eixos, fixa no dado. */
export const axisOrder: readonly AxisId[] = ['origem', 'porte', 'desfecho'];

/** Competência do recorte, em texto. Nada de `new Date()`. */
export const period = '2026-08';

/** O substantivo que acompanha toda contagem de tela (NUM-6). */
export const unitPlural = 'agendas';
