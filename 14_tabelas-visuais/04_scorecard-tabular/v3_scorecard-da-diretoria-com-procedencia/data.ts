/**
 * Quinze métricas da Diretoria em 2026-08, agrupadas por área (Marketing, Pré-vendas, Vendas),
 * cada uma com o selo de procedência do próprio número: MEDIDO vem direto da plataforma de
 * origem; DERIVADO é calculado a partir de campos medidos; PREMISSA é parâmetro assumido sem
 * medição; LACUNA não foi coletado ainda. `unit` no formato de `ValueFormat` do Farol
 * (`'int' | 'currencyCompact' | 'percent' | 'hours' | 'days'`); `null` só na linha LACUNA, que
 * também traz `reason`, o motivo curto de por que o número não existe.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plataforma real.
 */
export type DirectorUnit = 'int' | 'currencyCompact' | 'percent' | 'hours' | 'days';
export type Provenance = 'medido' | 'derivado' | 'premissa' | 'lacuna';

export interface DirectorRow {
  readonly id: string;
  readonly area: string;
  readonly metric: string;
  readonly unit: DirectorUnit | null;
  readonly value: number | null;
  readonly provenance: Provenance;
  readonly reason: string | null;
}

export const periodLabel = '2026-08';

export const data: readonly DirectorRow[] = [
  { id: 'leads', area: 'Marketing', metric: 'Leads', unit: 'int', value: 1240, provenance: 'medido', reason: null },
  { id: 'mql', area: 'Marketing', metric: 'MQL', unit: 'int', value: 268, provenance: 'medido', reason: null },
  { id: 'cpl', area: 'Marketing', metric: 'CPL', unit: 'currencyCompact', value: 84.3, provenance: 'medido', reason: null },
  {
    id: 'cpl-qualificado',
    area: 'Marketing',
    metric: 'CPL qualificado',
    unit: 'currencyCompact',
    value: 296,
    provenance: 'derivado',
    reason: null,
  },
  {
    id: 'receita-por-origem',
    area: 'Marketing',
    metric: 'Receita atribuída por origem',
    unit: null,
    value: null,
    provenance: 'lacuna',
    reason: 'sem atribuição financeira por origem no CRM',
  },
  { id: 'agendas', area: 'Pré-vendas', metric: 'Agendas', unit: 'int', value: 96, provenance: 'medido', reason: null },
  {
    id: 'taxa-agendamento',
    area: 'Pré-vendas',
    metric: 'Taxa de agendamento',
    unit: 'percent',
    value: 0.184,
    provenance: 'derivado',
    reason: null,
  },
  {
    id: 'sla-primeiro-contato',
    area: 'Pré-vendas',
    metric: 'SLA médio de 1º contato',
    unit: 'hours',
    value: 4.2,
    provenance: 'medido',
    reason: null,
  },
  {
    id: 'show-rate',
    area: 'Pré-vendas',
    metric: 'Comparecimento na agenda',
    unit: 'percent',
    value: 0.62,
    provenance: 'premissa',
    reason: null,
  },
  {
    id: 'pendencias-handoff',
    area: 'Pré-vendas',
    metric: 'Pendências de handoff abertas',
    unit: 'int',
    value: 7,
    provenance: 'medido',
    reason: null,
  },
  { id: 'opps-abertas', area: 'Vendas', metric: 'Oportunidades abertas', unit: 'int', value: 152, provenance: 'medido', reason: null },
  { id: 'win-rate', area: 'Vendas', metric: 'Win rate', unit: 'percent', value: 0.31, provenance: 'medido', reason: null },
  { id: 'ticket-medio', area: 'Vendas', metric: 'Ticket médio', unit: 'currencyCompact', value: 18_700, provenance: 'medido', reason: null },
  {
    id: 'ciclo-fechamento',
    area: 'Vendas',
    metric: 'Ciclo médio de fechamento',
    unit: 'days',
    value: 34,
    provenance: 'medido',
    reason: null,
  },
  {
    id: 'aum-projetado',
    area: 'Vendas',
    metric: 'AUM projetado do mês',
    unit: 'currencyCompact',
    value: 2_400_000,
    provenance: 'premissa',
    reason: null,
  },
];
