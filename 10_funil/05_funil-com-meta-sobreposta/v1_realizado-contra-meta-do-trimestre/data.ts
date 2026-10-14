/**
 * Funil comercial do terceiro trimestre de 2026: realizado contra a meta de cada etapa,
 * com o realizado medido até 2026-09-14, quando 83% do trimestre já havia decorrido.
 * A meta é da própria etapa (desdobrada da taxa histórica dela), não a meta do resultado
 * final: uma etapa pode bater a própria meta mesmo que Ganha, no fim da cadeia, não bata a dela.
 * Dado fictício e fixo: nenhuma pessoa ou organização real.
 */
export interface EtapaMeta {
  readonly id: string;
  readonly etapa: string;
  readonly realizado: number;
  readonly meta: number;
}

export const data: readonly EtapaMeta[] = [
  { id: 'aberta', etapa: 'Aberta', realizado: 420, meta: 460 },
  { id: 'diagnostico', etapa: 'Diagnóstico', realizado: 268, meta: 290 },
  { id: 'proposta', etapa: 'Proposta', realizado: 131, meta: 150 },
  { id: 'negociacao', etapa: 'Negociação', realizado: 64, meta: 75 },
  { id: 'ganha', etapa: 'Ganha', realizado: 29, meta: 36 },
];

/** Fração do trimestre já decorrida na data de corte do realizado, 2026-09-14. */
export const fracaoDecorrida = 0.83;

/** Data de corte do realizado, em ISO. */
export const dataCorte = '2026-09-14';
