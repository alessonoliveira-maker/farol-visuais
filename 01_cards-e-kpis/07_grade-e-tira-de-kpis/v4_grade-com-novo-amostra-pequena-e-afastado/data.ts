/**
 * Taxa de conversão por executivo no trimestre (oportunidades ganhas sobre oportunidades
 * trabalhadas), com três casos limite na mesma grade: um executivo novo sem histórico semanal,
 * um com amostra pequena (4 oportunidades) e um afastado que permanece na grade. Dado fictício
 * e fixo; `weeklyRate` é a fração semanal (0 a 1) das últimas 8 semanas, ou `null` sem histórico.
 */
export interface ExecutiveRate {
  readonly id: string;
  readonly name: string;
  readonly status: 'ativo' | 'novo' | 'afastado';
  readonly weeklyRate: readonly (number | null)[] | null;
  readonly won: number;
  readonly total: number;
}

export interface RateGrid {
  readonly periodLabel: string;
  readonly executives: readonly ExecutiveRate[];
}

export const data: RateGrid = {
  periodLabel: '3º trimestre de 2026',
  executives: [
    {
      id: 'exec-01',
      name: 'Arnaldo T.',
      status: 'ativo',
      weeklyRate: [0.51, 0.58, 0.5, 0.62, 0.55, 0.53, 0.6, 0.57],
      won: 23,
      total: 42,
    },
    {
      id: 'exec-02',
      name: 'Bianca S.',
      status: 'novo',
      weeklyRate: null,
      won: 0,
      total: 0,
    },
    {
      id: 'exec-03',
      name: 'Carlos Eduardo Villalba',
      status: 'ativo',
      weeklyRate: null,
      won: 3,
      total: 4,
    },
    {
      id: 'exec-04',
      name: 'Denise M.',
      status: 'ativo',
      weeklyRate: [0.48, 0.52, 0.6, 0.55, 0.5, 0.58, 0.53, 0.49],
      won: 19,
      total: 35,
    },
    {
      id: 'exec-05',
      name: 'Eduardo P.',
      status: 'afastado',
      weeklyRate: [0.42, 0.46, 0.5, 0.44, 0.48, 0.45, null, null],
      won: 11,
      total: 24,
    },
    {
      id: 'exec-06',
      name: 'Flávia R.',
      status: 'ativo',
      weeklyRate: [0.63, 0.66, 0.6, 0.71, 0.68, 0.65, 0.7, 0.67],
      won: 27,
      total: 40,
    },
  ],
};
