/**
 * Investimento semanal em mídia paga, somando todas as campanhas ativas, e leads
 * qualificados gerados na mesma semana, das últimas 20 semanas. Investimento em reais,
 * leads em contagem inteira.
 * Dado fictício e fixo: nenhuma campanha ou plataforma corresponde a uma real.
 */
export interface WeeklyInvestmentLeads {
  readonly id: string;
  readonly week: string;
  readonly investimentoReais: number;
  readonly leadsQualificados: number;
}

export const data: readonly WeeklyInvestmentLeads[] = [
  { id: 'sem-01', week: '2025-12-29', investimentoReais: 0, leadsQualificados: 9 },
  { id: 'sem-02', week: '2026-01-05', investimentoReais: 8_800, leadsQualificados: 5 },
  { id: 'sem-03', week: '2026-01-12', investimentoReais: 11_200, leadsQualificados: 31 },
  { id: 'sem-04', week: '2026-01-19', investimentoReais: 15_200, leadsQualificados: 18 },
  { id: 'sem-05', week: '2026-01-26', investimentoReais: 19_700, leadsQualificados: 34 },
  { id: 'sem-06', week: '2026-02-02', investimentoReais: 16_200, leadsQualificados: 35 },
  { id: 'sem-07', week: '2026-02-09', investimentoReais: 20_200, leadsQualificados: 10 },
  { id: 'sem-08', week: '2026-02-16', investimentoReais: 29_300, leadsQualificados: 12 },
  { id: 'sem-09', week: '2026-02-23', investimentoReais: 27_400, leadsQualificados: 10 },
  { id: 'sem-10', week: '2026-03-02', investimentoReais: 27_800, leadsQualificados: 32 },
  { id: 'sem-11', week: '2026-03-09', investimentoReais: 37_500, leadsQualificados: 44 },
  { id: 'sem-12', week: '2026-03-16', investimentoReais: 38_900, leadsQualificados: 19 },
  { id: 'sem-13', week: '2026-03-23', investimentoReais: 40_800, leadsQualificados: 35 },
  { id: 'sem-14', week: '2026-03-30', investimentoReais: 40_400, leadsQualificados: 48 },
  { id: 'sem-15', week: '2026-04-06', investimentoReais: 42_300, leadsQualificados: 47 },
  { id: 'sem-16', week: '2026-04-13', investimentoReais: 45_800, leadsQualificados: 23 },
  { id: 'sem-17', week: '2026-04-20', investimentoReais: 53_200, leadsQualificados: 52 },
  { id: 'sem-18', week: '2026-04-27', investimentoReais: 57_300, leadsQualificados: 58 },
  { id: 'sem-19', week: '2026-05-04', investimentoReais: 60_000, leadsQualificados: 57 },
  { id: 'sem-20', week: '2026-05-11', investimentoReais: 56_500, leadsQualificados: 41 },
];
