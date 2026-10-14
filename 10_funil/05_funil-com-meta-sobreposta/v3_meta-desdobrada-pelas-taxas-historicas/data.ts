/**
 * Meta de 36 ganhos do quarto trimestre de 2026 desdobrada para trás pelas taxas de passo dos
 * últimos quatro trimestres, contra o que já está no funil em 2026-09-14. Aqui a meta é do
 * resultado final (Ganha), não de cada etapa: o necessário de cada etapa é derivado do final, o
 * oposto do que as versões v1 e v2 deste modelo mostram.
 * Dado fictício e fixo: nenhuma pessoa ou organização real.
 */
export interface EtapaDesdobrada {
  readonly id: string;
  readonly etapa: string;
  /** O que já está no funil nesta etapa, na data de corte. */
  readonly noFunil: number;
  /** O necessário nesta etapa para a meta final de ganhos, desdobrado pela taxa histórica. */
  readonly necessario: number;
}

export const data: readonly EtapaDesdobrada[] = [
  { id: 'aberta', etapa: 'Aberta', noFunil: 340, necessario: 497 },
  { id: 'diagnostico', etapa: 'Diagnóstico', noFunil: 210, necessario: 308 },
  { id: 'proposta', etapa: 'Proposta', noFunil: 96, necessario: 160 },
  { id: 'negociacao', etapa: 'Negociação', noFunil: 41, necessario: 70 },
];

/** Meta final de ganhos do trimestre, a origem de todo o desdobramento. */
export const metaGanhos = 36;

/** Taxas de passo dos últimos quatro trimestres, na ordem Aberta a Ganha, que originam a meta. */
export const taxasHistoricas: readonly number[] = [0.62, 0.52, 0.44, 0.52];

/** Data de corte do que já está no funil. */
export const dataCorte = '2026-09-14';
