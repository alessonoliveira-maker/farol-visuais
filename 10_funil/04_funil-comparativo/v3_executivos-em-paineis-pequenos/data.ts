/**
 * Funil comercial do trimestre por executivo: volume absoluto por etapa, em oportunidades.
 * Dado fictício e fixo: os nomes são posições genéricas do Farol, nenhum é pessoa real.
 */
export interface ExecutiveFunnel {
  readonly id: string;
  readonly name: string;
  readonly opened: number;
  readonly diagnosed: number;
  readonly proposed: number;
  readonly negotiated: number;
  readonly won: number;
}

export const data: readonly ExecutiveFunnel[] = [
  { id: 'exec-a', name: 'Executivo A', opened: 96, diagnosed: 71, proposed: 42, negotiated: 25, won: 14 },
  { id: 'exec-b', name: 'Executivo B', opened: 80, diagnosed: 52, proposed: 24, negotiated: 12, won: 5 },
  { id: 'exec-c', name: 'Executivo C', opened: 110, diagnosed: 88, proposed: 55, negotiated: 31, won: 19 },
  { id: 'exec-d', name: 'Executivo D', opened: 64, diagnosed: 40, proposed: 18, negotiated: 9, won: 4 },
  { id: 'exec-e', name: 'Executivo E', opened: 58, diagnosed: 44, proposed: 27, negotiated: 16, won: 9 },
  { id: 'exec-f', name: 'Executivo F', opened: 132, diagnosed: 97, proposed: 51, negotiated: 28, won: 12 },
  { id: 'exec-g', name: 'Executivo G', opened: 45, diagnosed: 31, proposed: 19, negotiated: 11, won: 6 },
  { id: 'exec-h', name: 'Executivo H', opened: 7, diagnosed: 5, proposed: 3, negotiated: 1, won: 1 },
];

/** Ordem fixa das etapas em cada painel, de cima para baixo. */
export const stageNames = ['Aberta', 'Diagnóstico', 'Proposta', 'Negociação', 'Ganha'] as const;
