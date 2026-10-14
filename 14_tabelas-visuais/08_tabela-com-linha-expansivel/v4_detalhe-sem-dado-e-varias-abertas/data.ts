/**
 * Oportunidades perdidas com três formas de detalhe: histórico completo, sem histórico no
 * recorte e histórico indisponível. Dado fictício e fixo: nenhuma empresa é real.
 */
export interface LossStage {
  readonly name: string;
  readonly enteredAt: string;
  readonly days: number;
}

export type LossDetail =
  | { readonly kind: 'historico'; readonly stages: readonly LossStage[] }
  | { readonly kind: 'vazio'; readonly reason: string }
  | { readonly kind: 'falha' };

export interface LostOpportunity {
  readonly id: string;
  readonly company: string;
  readonly owner: string;
  readonly value: number;
  readonly reason: string;
  readonly lostAt: string;
  readonly detail: LossDetail;
}

export const data: readonly LostOpportunity[] = [
  {
    id: 'op-01',
    company: 'Distribuidora Horizonte Sul',
    owner: 'Talita V.',
    value: 310_000,
    reason: 'Optou pelo concorrente',
    lostAt: '2026-08-22',
    detail: {
      kind: 'historico',
      stages: [
        { name: 'Qualificação', enteredAt: '2026-06-02', days: 5 },
        { name: 'Diagnóstico', enteredAt: '2026-06-07', days: 18 },
        { name: 'Proposta', enteredAt: '2026-06-25', days: 34 },
      ],
    },
  },
  {
    id: 'op-02',
    company: 'Metalúrgica Serra Azul',
    owner: 'Murilo C.',
    value: 96_500,
    reason: 'Sem orçamento no ciclo',
    lostAt: '2026-08-14',
    detail: { kind: 'vazio', reason: 'migração recente de CRM' },
  },
  {
    id: 'op-03',
    company: 'Grupo Alvorada de Participações',
    owner: 'Renan A.',
    value: 178_400,
    reason: 'Projeto cancelado internamente',
    lostAt: '2026-08-05',
    detail: { kind: 'falha' },
  },
  {
    id: 'op-04',
    company: 'Casa Verde Alimentos',
    owner: 'Talita V.',
    value: 42_000,
    reason: 'Fora do momento de compra',
    lostAt: '2026-08-01',
    detail: {
      kind: 'historico',
      stages: [
        { name: 'Qualificação', enteredAt: '2026-07-18', days: 6 },
        { name: 'Diagnóstico', enteredAt: '2026-07-24', days: 8 },
      ],
    },
  },
  {
    id: 'op-05',
    company: 'Portal Nordeste Serviços',
    owner: 'Bianca F.',
    value: 121_900,
    reason: 'Sem retorno após a proposta',
    lostAt: '2026-08-28',
    detail: {
      kind: 'historico',
      stages: [
        { name: 'Qualificação', enteredAt: '2026-06-15', days: 7 },
        { name: 'Diagnóstico', enteredAt: '2026-06-22', days: 22 },
        { name: 'Proposta', enteredAt: '2026-07-14', days: 45 },
      ],
    },
  },
];

/** No preview, três linhas já abrem: histórico, vazio e indisponível lado a lado. */
export const expandedIds: readonly string[] = ['op-01', 'op-02', 'op-03'];
