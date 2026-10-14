/**
 * Funil comercial do terceiro trimestre de 2026, com a etapa Comitê de investimento criada no
 * meio do trimestre e sem taxa histórica: a meta dela é premissa digitada por quem desenhou o
 * novo passo, não uma medição, e por isso o atingimento não tem base para ser calculado.
 * Dado fictício e fixo: nenhuma pessoa ou organização real.
 */
export interface EtapaMetaOrigem {
  readonly id: string;
  readonly etapa: string;
  readonly realizado: number;
  readonly meta: number;
  /** 'medida': meta vem da taxa histórica da etapa. 'premissa': meta digitada, sem medição por trás. */
  readonly origemMeta: 'medida' | 'premissa';
}

export const data: readonly EtapaMetaOrigem[] = [
  { id: 'aberta', etapa: 'Aberta', realizado: 420, meta: 460, origemMeta: 'medida' },
  { id: 'diagnostico', etapa: 'Diagnóstico', realizado: 268, meta: 290, origemMeta: 'medida' },
  { id: 'proposta', etapa: 'Proposta', realizado: 131, meta: 150, origemMeta: 'medida' },
  { id: 'comite-investimento', etapa: 'Comitê de investimento', realizado: 8, meta: 15, origemMeta: 'premissa' },
];
