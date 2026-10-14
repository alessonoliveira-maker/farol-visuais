/**
 * Três métricas diárias fictícias da pré-vendas nos últimos 90 dias fechados antes de 2026-08-31
 * (o dia corrente, ainda em aberto, fica fora da série). Dado fictício e fixo, por fórmula
 * determinística, sem aleatório nem relógio: mesma saída em qualquer máquina. `previousTotal90` é
 * a soma fixa dos 90 dias anteriores a esses 90, guardada à parte porque a série não guarda 180 dias.
 */
export interface StripMetricSeries {
  readonly id: string;
  readonly label: string;
  readonly unitWord: string;
  readonly goodDirection: 'up' | 'down';
  /** 90 valores diários, do mais antigo (índice 0) ao mais recente (índice 89 = referenceDate). */
  readonly series: readonly number[];
  readonly previousTotal90: number;
}

export interface PreSalesStrip {
  readonly referenceDate: string;
  readonly primaryId: string;
  readonly metrics: readonly StripMetricSeries[];
}

function buildSeries(base: number, amplitude: number, trendPerDay: number, phase: number): number[] {
  return Array.from({ length: 90 }, (_, i) => Math.max(0, Math.round(base + trendPerDay * i + amplitude * Math.sin((i + phase) / 5))));
}

export const data: PreSalesStrip = {
  referenceDate: '2026-08-31',
  primaryId: 'agendas-realizadas',
  metrics: [
    {
      id: 'agendas-realizadas',
      label: 'Agendas realizadas',
      unitWord: 'agendas',
      goodDirection: 'up',
      series: buildSeries(14, 4, 0.05, 0),
      previousTotal90: 1_298,
    },
    {
      id: 'leads-recebidos',
      label: 'Leads recebidos',
      unitWord: 'leads',
      goodDirection: 'up',
      series: buildSeries(62, 12, 0.15, 2),
      previousTotal90: 5_712,
    },
    {
      id: 'handoffs-aceitos',
      label: 'Handoffs aceitos',
      unitWord: 'handoffs',
      goodDirection: 'up',
      series: buildSeries(9, 3, 0.02, 4),
      previousTotal90: 831,
    },
  ],
};
