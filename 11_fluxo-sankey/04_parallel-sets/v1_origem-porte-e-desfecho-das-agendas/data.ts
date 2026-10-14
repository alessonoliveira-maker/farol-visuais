/**
 * Origem, porte da empresa e desfecho das 248 agendas marcadas pela pré-vendas em 2026-08.
 * Dado fictício e fixo: nenhuma origem paga é marca real, nenhuma empresa é real. Cada linha de
 * `data` é uma combinação (origem, porte, desfecho) com a contagem de agendas naquela combinação;
 * o total por origem, por porte e por desfecho é sempre a SOMA das linhas, nunca um número à
 * parte, então os três eixos fecham entre si por construção.
 */
export interface ParallelCategory {
  readonly id: string;
  readonly label: string;
  /**
   * Só o eixo de origem tem slot: é a "primeira dimensão" da seção 17.2 (COR-8), a única que
   * empresta cor às faixas dos dois níveis. Porte e desfecho ficam em neutro (`--line-strong`),
   * como os nós de destino do modelo 01_sankey-simples.
   */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ParallelCombo {
  readonly origem: string;
  readonly porte: string;
  readonly desfecho: string;
  readonly count: number;
}

/** Ordem fixa na paleta categórica (COR-8: 1, 3, 6, 5, 2). */
export const origens: readonly ParallelCategory[] = [
  { id: 'midia', label: 'Mídia social', slot: 1 },
  { id: 'busca', label: 'Busca paga', slot: 3 },
  { id: 'rede', label: 'Rede profissional', slot: 6 },
  { id: 'organico', label: 'Orgânico', slot: 5 },
  { id: 'indicacao', label: 'Indicação', slot: 2 },
];

export const portes: readonly ParallelCategory[] = [
  { id: 'pequena', label: 'Pequena' },
  { id: 'media', label: 'Média' },
  { id: 'grande', label: 'Grande' },
];

export const desfechos: readonly ParallelCategory[] = [
  { id: 'realizada', label: 'Realizada' },
  { id: 'remarcada', label: 'Remarcada' },
  { id: 'cancelada', label: 'Cancelada' },
  { id: 'naocompareceu', label: 'Não compareceu' },
];

export const data: readonly ParallelCombo[] = [
  { origem: 'midia', porte: 'pequena', desfecho: 'realizada', count: 22 },
  { origem: 'midia', porte: 'pequena', desfecho: 'remarcada', count: 4 },
  { origem: 'midia', porte: 'media', desfecho: 'realizada', count: 18 },
  { origem: 'midia', porte: 'media', desfecho: 'cancelada', count: 3 },
  { origem: 'midia', porte: 'grande', desfecho: 'realizada', count: 8 },
  { origem: 'midia', porte: 'grande', desfecho: 'naocompareceu', count: 2 },
  { origem: 'busca', porte: 'pequena', desfecho: 'realizada', count: 16 },
  { origem: 'busca', porte: 'pequena', desfecho: 'cancelada', count: 5 },
  { origem: 'busca', porte: 'media', desfecho: 'realizada', count: 20 },
  { origem: 'busca', porte: 'media', desfecho: 'remarcada', count: 6 },
  { origem: 'busca', porte: 'grande', desfecho: 'realizada', count: 9 },
  { origem: 'rede', porte: 'pequena', desfecho: 'realizada', count: 10 },
  { origem: 'rede', porte: 'media', desfecho: 'realizada', count: 24 },
  { origem: 'rede', porte: 'media', desfecho: 'remarcada', count: 5 },
  { origem: 'rede', porte: 'grande', desfecho: 'realizada', count: 14 },
  { origem: 'rede', porte: 'grande', desfecho: 'remarcada', count: 3 },
  { origem: 'organico', porte: 'pequena', desfecho: 'realizada', count: 9 },
  { origem: 'organico', porte: 'pequena', desfecho: 'naocompareceu', count: 4 },
  { origem: 'organico', porte: 'media', desfecho: 'realizada', count: 11 },
  { origem: 'organico', porte: 'media', desfecho: 'cancelada', count: 2 },
  { origem: 'organico', porte: 'grande', desfecho: 'realizada', count: 6 },
  { origem: 'indicacao', porte: 'pequena', desfecho: 'realizada', count: 14 },
  { origem: 'indicacao', porte: 'pequena', desfecho: 'cancelada', count: 2 },
  { origem: 'indicacao', porte: 'media', desfecho: 'realizada', count: 17 },
  { origem: 'indicacao', porte: 'media', desfecho: 'remarcada', count: 3 },
  { origem: 'indicacao', porte: 'grande', desfecho: 'realizada', count: 8 },
  { origem: 'indicacao', porte: 'grande', desfecho: 'remarcada', count: 2 },
  { origem: 'indicacao', porte: 'grande', desfecho: 'naocompareceu', count: 1 },
];
