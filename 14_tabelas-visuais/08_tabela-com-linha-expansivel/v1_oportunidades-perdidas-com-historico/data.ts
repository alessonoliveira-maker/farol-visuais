/**
 * Oportunidades perdidas em 2026-08, com as etapas percorridas até a perda.
 * Dado fictício e fixo: nenhuma empresa ou pessoa é real.
 */
export interface LossStage {
  readonly name: string;
  readonly enteredAt: string;
  readonly days: number;
}

export interface LostOpportunity {
  readonly id: string;
  readonly company: string;
  readonly owner: string;
  readonly value: number;
  readonly reason: string;
  readonly lostAt: string;
  readonly stages: readonly LossStage[];
}

export const data: readonly LostOpportunity[] = [
  {
    id: 'op-01',
    company: 'Distribuidora Horizonte Sul',
    owner: 'Talita V.',
    value: 310_000,
    reason: 'Optou pelo concorrente',
    lostAt: '2026-08-22',
    stages: [
      { name: 'Qualificação', enteredAt: '2026-06-02', days: 5 },
      { name: 'Diagnóstico', enteredAt: '2026-06-07', days: 18 },
      { name: 'Proposta', enteredAt: '2026-06-25', days: 34 },
      { name: 'Negociação', enteredAt: '2026-07-29', days: 24 },
    ],
  },
  {
    id: 'op-02',
    company: 'Engenharia Contumaz',
    owner: 'Murilo C.',
    value: 96_500,
    reason: 'Sem orçamento no ciclo',
    lostAt: '2026-08-14',
    stages: [
      { name: 'Qualificação', enteredAt: '2026-07-10', days: 4 },
      { name: 'Diagnóstico', enteredAt: '2026-07-14', days: 12 },
      { name: 'Proposta', enteredAt: '2026-07-26', days: 19 },
    ],
  },
  {
    id: 'op-03',
    company: 'Grupo Alvorada de Participações Regionais',
    owner: 'Renan A.',
    value: 178_400,
    reason: 'Projeto cancelado internamente',
    lostAt: '2026-08-05',
    stages: [
      { name: 'Qualificação', enteredAt: '2026-05-19', days: 9 },
      { name: 'Diagnóstico', enteredAt: '2026-05-28', days: 41 },
      { name: 'Proposta', enteredAt: '2026-07-08', days: 28 },
    ],
  },
  {
    id: 'op-04',
    company: 'Casa Verde Alimentos',
    owner: 'Talita V.',
    value: 42_000,
    reason: 'Fora do momento de compra',
    lostAt: '2026-08-01',
    stages: [
      { name: 'Qualificação', enteredAt: '2026-07-18', days: 6 },
      { name: 'Diagnóstico', enteredAt: '2026-07-24', days: 8 },
    ],
  },
  {
    id: 'op-05',
    company: 'Portal Nordeste Serviços',
    owner: 'Bianca F.',
    value: 121_900,
    reason: 'Sem retorno após a proposta',
    lostAt: '2026-08-28',
    stages: [
      { name: 'Qualificação', enteredAt: '2026-06-15', days: 7 },
      { name: 'Diagnóstico', enteredAt: '2026-06-22', days: 22 },
      { name: 'Proposta', enteredAt: '2026-07-14', days: 45 },
    ],
  },
];

/** No preview, a primeira oportunidade já abre para mostrar o painel de etapas. */
export const expandedIds: readonly string[] = ['op-01'];
