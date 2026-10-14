/**
 * Oportunidades abertas e há quantos dias estão sem movimento, uma linha por oportunidade. Dado
 * fictício e fixo: os dias vêm de uma conta de resto determinística, sem sorteio e sem relógio.
 *
 * Os casos difíceis: a etapa de nome longo ("Proposta enviada ao cliente") concentra as paradas
 * (19 de 34 há mais de 30 dias), e a etapa com menos paradas ainda tem a faixa do meio quase vazia.
 */
export interface FunnelStage {
  readonly id: string;
  readonly label: string;
}

export interface OpenOpportunity {
  readonly id: string;
  /** `id` da etapa onde a oportunidade está hoje. */
  readonly stageId: string;
  /** Valor esperado, em reais. */
  readonly value: number;
  /** Dias desde a última movimentação registrada. */
  readonly idleDays: number;
}

export interface OpenOpportunities {
  /** Etapas na ordem do funil, da entrada ao fechamento. */
  readonly stages: readonly FunnelStage[];
  readonly items: readonly OpenOpportunity[];
}

const stages: readonly FunnelStage[] = [
  { id: 'qualificacao', label: 'Qualificação' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'proposta', label: 'Proposta enviada ao cliente' },
  { id: 'negociacao', label: 'Negociação' },
];

/** Por etapa: quantas até 15 dias, de 16 a 30 dias e acima de 30 dias sem movimento. */
const BANDS: readonly (readonly [number, number, number])[] = [
  [26, 8, 6],
  [27, 6, 11],
  [8, 7, 19],
  [12, 2, 8],
];

function buildItems(): readonly OpenOpportunity[] {
  const items: OpenOpportunity[] = [];
  let serial = 0;
  stages.forEach((stage, stageIndex) => {
    const [recent, middle, stale] = BANDS[stageIndex] ?? [0, 0, 0];
    const spans: readonly (readonly [number, number, number])[] = [
      [recent, 1, 15],
      [middle, 16, 30],
      [stale, 31, 96],
    ];
    for (const [count, from, to] of spans) {
      for (let k = 0; k < count; k += 1) {
        serial += 1;
        items.push({
          id: `OP-${String(2000 + serial)}`,
          stageId: stage.id,
          value: 22_000 + ((serial * 41) % 31) * 6_900,
          idleDays: from + ((serial * 17) % (to - from + 1)),
        });
      }
    }
  });
  return items;
}

export const data: OpenOpportunities = { stages, items: buildItems() };
