/**
 * Oportunidades abertas do funil comercial, uma linha por oportunidade. Dado fictício e fixo: os
 * valores e os dias são gerados por uma conta de resto determinística, sem sorteio e sem relógio.
 *
 * Os casos difíceis: uma etapa de nome longo ("Proposta enviada ao cliente") e uma etapa com só 3
 * oportunidades, que precisa continuar visível ao lado de uma com 48.
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
  /** Dias desde a entrada da oportunidade no funil. */
  readonly daysInFunnel: number;
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
  { id: 'assinatura', label: 'Assinatura de contrato' },
];

const COUNTS: readonly number[] = [44, 48, 36, 24, 3];

function buildItems(): readonly OpenOpportunity[] {
  const items: OpenOpportunity[] = [];
  let serial = 0;
  stages.forEach((stage, stageIndex) => {
    const count = COUNTS[stageIndex] ?? 0;
    for (let k = 0; k < count; k += 1) {
      serial += 1;
      items.push({
        id: `OP-${String(1000 + serial)}`,
        stageId: stage.id,
        value: 18_000 + ((serial * 37) % 29) * 7_300,
        daysInFunnel: 3 + ((serial * 53) % 97),
      });
    }
  });
  return items;
}

export const data: OpenOpportunities = { stages, items: buildItems() };
