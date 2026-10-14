/**
 * Oportunidades comerciais abertas em 2026-09, por executivo (linha) e etapa do funil
 * (coluna). Cada célula é a contagem de oportunidades daquele executivo naquela etapa.
 * `null` marca uma combinação que não se aplica: SDR não trabalha etapa de fechamento
 * (Proposta, Negociação, Fechamento) e AE não trabalha etapa de prospecção (Prospecção,
 * Qualificação), por desenho do papel. É diferente de zero, que é contagem real e medida.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface ExecutiveStageRow {
  readonly id: string;
  readonly name: string;
  readonly role: 'SDR' | 'AE';
  /** Uma entrada por STAGE, na mesma ordem. */
  readonly counts: readonly (number | null)[];
}

/** As cinco etapas do funil, na ordem de leitura. */
export const STAGES: readonly string[] = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento'];

export const data: readonly ExecutiveStageRow[] = [
  { id: 'exec-01', name: 'Marina T.', role: 'AE', counts: [null, null, 5, 3, 1] },
  { id: 'exec-02', name: 'Rogério A.', role: 'AE', counts: [null, null, 4, 2, 0] },
  { id: 'exec-03', name: 'Bianca F.', role: 'SDR', counts: [9, 6, null, null, null] },
  { id: 'exec-04', name: 'Wellington de Souza Prado', role: 'SDR', counts: [7, 4, null, null, null] },
  { id: 'exec-05', name: 'Tainá C.', role: 'AE', counts: [null, null, 2, 0, 2] },
  { id: 'exec-06', name: 'Edilson M.', role: 'SDR', counts: [5, 0, null, null, null] },
];
