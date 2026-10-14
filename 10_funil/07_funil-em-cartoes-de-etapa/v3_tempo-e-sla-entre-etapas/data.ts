/**
 * Quatro etapas da pré-vendas na semana, com o tempo de passagem entre algumas delas.
 * `passed` é quem já completou a passagem; `stillHere` é quem ainda está na etapa de origem,
 * sem ter avançado, e por isso fica de fora da mediana (censura). Tempo em `medianUnit` e
 * `p90Unit`; SLA em horas, `null` quando não há meta definida. Dado fictício e fixo.
 */
export interface FunnelCardStageCount {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

export type DurationUnit = 'min' | 'h' | 'dias';

export interface PassageTiming {
  readonly fromId: string;
  readonly toId: string;
  readonly passed: number;
  readonly stillHere: number;
  readonly medianValue: number | null;
  readonly medianUnit: DurationUnit;
  readonly p90Value: number | null;
  readonly p90Unit: DurationUnit | null;
  readonly slaHours: number | null;
  readonly slaLabel: string;
}

export interface PreSalesTimingFunnel {
  readonly week: string;
  readonly stages: readonly FunnelCardStageCount[];
  readonly passages: readonly PassageTiming[];
}

export const data: PreSalesTimingFunnel = {
  week: '2026-W37',
  stages: [
    { id: 'entrada', label: 'Entrada', value: 1_180 },
    { id: 'tentativa', label: 'Primeira tentativa', value: 1_020 },
    { id: 'conexao', label: 'Conexão', value: 612 },
    { id: 'agenda-marcada', label: 'Agenda marcada', value: 248 },
  ],
  passages: [
    {
      fromId: 'entrada',
      toId: 'tentativa',
      passed: 1_020,
      stillHere: 160,
      medianValue: 38,
      medianUnit: 'min',
      p90Value: 5,
      p90Unit: 'h',
      slaHours: 1,
      slaLabel: '1 h útil',
    },
    {
      fromId: 'tentativa',
      toId: 'conexao',
      passed: 612,
      stillHere: 408,
      medianValue: null,
      medianUnit: 'h',
      p90Value: null,
      p90Unit: null,
      slaHours: null,
      slaLabel: 'sem SLA definido',
    },
    {
      fromId: 'conexao',
      toId: 'agenda-marcada',
      passed: 248,
      stillHere: 364,
      medianValue: 2.1,
      medianUnit: 'dias',
      p90Value: 2.9,
      p90Unit: 'dias',
      slaHours: 72,
      slaLabel: '3 dias corridos',
    },
  ],
};
