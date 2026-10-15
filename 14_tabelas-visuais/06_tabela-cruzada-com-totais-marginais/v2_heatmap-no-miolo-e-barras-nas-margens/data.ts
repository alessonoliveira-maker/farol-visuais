/**
 * Oportunidades abertas em 2026-09, por executivo (linha) e etapa do funil (coluna), a
 * mesma leitura do modelo 1 mas para responder outra pergunta: qual etapa concentra mais
 * volume e quais executivos carregam essa concentração. `null` é etapa que o papel do
 * executivo não cobre (não se aplica), fora da escala de cor e fora das somas.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface ExecutiveStageLoad {
  readonly id: string;
  readonly name: string;
  readonly role: 'SDR' | 'AE';
  /** Uma entrada por STAGE, na mesma ordem. */
  readonly counts: readonly (number | null)[];
}

export const STAGES: readonly string[] = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento'];

export const data: readonly ExecutiveStageLoad[] = [
  { id: 'exec-01', name: 'Otávio L.', role: 'AE', counts: [null, null, 14, 6, 2] },
  { id: 'exec-02', name: 'Carla Mendes Sobral', role: 'AE', counts: [null, null, 11, 9, 3] },
  { id: 'exec-03', name: 'Iury B.', role: 'AE', counts: [null, null, 5, 3, 1] },
  { id: 'exec-04', name: 'Renata V.', role: 'SDR', counts: [22, 15, null, null, null] },
  { id: 'exec-05', name: 'Diego A.', role: 'SDR', counts: [18, 10, null, null, null] },
  { id: 'exec-06', name: 'Suellen K.', role: 'SDR', counts: [9, 4, null, null, null] },
];
