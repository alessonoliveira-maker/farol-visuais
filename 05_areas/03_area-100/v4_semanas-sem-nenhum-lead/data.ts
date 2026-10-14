/**
 * Leads semanais por origem em 16 semanas de 2026, em contagem de leads. Duas semanas têm zero
 * lead em todas as origens, um total zero medido, não uma falta de coleta. Dado fictício e fixo.
 */
export interface WeeklyOriginSmall {
  readonly week: string;
  readonly indicacao: number;
  readonly conteudo: number;
  readonly evento: number;
}

export const data: readonly WeeklyOriginSmall[] = [
  { week: '2026-01-05', indicacao: 8, conteudo: 5, evento: 3 },
  { week: '2026-01-12', indicacao: 9, conteudo: 6, evento: 2 },
  { week: '2026-01-19', indicacao: 7, conteudo: 7, evento: 3 },
  { week: '2026-01-26', indicacao: 10, conteudo: 5, evento: 4 },
  { week: '2026-02-02', indicacao: 6, conteudo: 4, evento: 2 },
  { week: '2026-02-09', indicacao: 5, conteudo: 3, evento: 1 },
  { week: '2026-02-16', indicacao: 0, conteudo: 0, evento: 0 },
  { week: '2026-02-23', indicacao: 9, conteudo: 6, evento: 3 },
  { week: '2026-03-02', indicacao: 11, conteudo: 7, evento: 4 },
  { week: '2026-03-09', indicacao: 10, conteudo: 8, evento: 3 },
  { week: '2026-03-16', indicacao: 8, conteudo: 5, evento: 2 },
  { week: '2026-03-23', indicacao: 0, conteudo: 0, evento: 0 },
  { week: '2026-03-30', indicacao: 12, conteudo: 9, evento: 5 },
  { week: '2026-04-06', indicacao: 13, conteudo: 8, evento: 6 },
  { week: '2026-04-13', indicacao: 14, conteudo: 10, evento: 6 },
  { week: '2026-04-20', indicacao: 15, conteudo: 11, evento: 7 },
];
