/**
 * Origem, porte da empresa e desfecho das 248 agendas marcadas pela pré-vendas na competência
 * 2026-08, em 28 combinações. Dado fictício e fixo: nenhuma origem é plataforma real, nenhuma
 * empresa é real, nenhuma pessoa é citada.
 *
 * Cada linha de `data` é uma combinação inteira (origem, porte, desfecho) com a contagem de
 * agendas. O total de cada categoria, nos três eixos, é sempre a SOMA das linhas, nunca um número
 * declarado à parte: assim os três eixos fecham entre si por construção e a combinação em foco não
 * pode valer mais do que a categoria que a contém.
 */
export interface ParallelCategory {
  readonly id: string;
  readonly label: string;
}

/** Os eixos desta versão. Serve de chave em `ParallelCombo` e na prop `axisOrder`. */
export type AxisId = 'origem' | 'porte' | 'desfecho';

export interface ParallelAxis {
  readonly id: AxisId;
  readonly label: string;
  /** Ordem fixa de leitura dentro do eixo, de cima para baixo. */
  readonly categories: readonly ParallelCategory[];
}

export interface ParallelCombo {
  readonly origem: string;
  readonly porte: string;
  readonly desfecho: string;
  readonly count: number;
}

/** Uma categoria por eixo: é a combinação que acende. */
export interface ComboHighlight {
  readonly origem: string;
  readonly porte: string;
  readonly desfecho: string;
}

export const axes: readonly ParallelAxis[] = [
  {
    id: 'origem',
    label: 'Origem',
    categories: [
      { id: 'midia', label: 'Mídia social' },
      { id: 'busca', label: 'Busca paga' },
      { id: 'rede', label: 'Rede social' },
      { id: 'organico', label: 'Orgânico' },
      { id: 'indicacao', label: 'Indicação' },
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
  { origem: 'organico', porte: 'media', desfecho: 'cancelada', count: 4 },
  { origem: 'organico', porte: 'grande', desfecho: 'realizada', count: 6 },
  { origem: 'organico', porte: 'grande', desfecho: 'ausente', count: 4 },
  { origem: 'indicacao', porte: 'pequena', desfecho: 'realizada', count: 10 },
  { origem: 'indicacao', porte: 'media', desfecho: 'realizada', count: 18 },
  { origem: 'indicacao', porte: 'media', desfecho: 'remarcada', count: 4 },
  { origem: 'indicacao', porte: 'grande', desfecho: 'realizada', count: 21 },
  { origem: 'indicacao', porte: 'grande', desfecho: 'remarcada', count: 7 },
];

/** A combinação que acende: indicação, empresa grande, agenda realizada. 21 das 248 agendas. */
export const highlight: ComboHighlight = { origem: 'indicacao', porte: 'grande', desfecho: 'realizada' };

/**
 * Ordem inicial dos eixos, fixa no dado. Reordenar por clique é trabalho do Farol, não do catálogo:
 * aqui a ordem entra pela prop `axisOrder` e o desenho se refaz sozinho.
 */
export const axisOrder: readonly AxisId[] = ['origem', 'porte', 'desfecho'];

/** Competência do recorte, em texto. Nada de `new Date()`. */
export const period = '2026-08';

/** O substantivo que acompanha toda contagem de tela (NUM-6). */
export const unitPlural = 'agendas';
