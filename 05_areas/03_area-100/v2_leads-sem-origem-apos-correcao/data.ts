/**
 * Leads mensais por origem declarada em 2026, em contagem de leads. "Sem origem declarada" é a
 * camada de ausência, no topo da pilha. Uma correção de coleta em 2026-06-02 passou a exigir o
 * campo de origem no formulário, e a fatia sem origem caiu a partir daí. Dado fictício e fixo.
 */
export interface MonthlyLeadOrigin {
  readonly month: string;
  readonly indicacao: number;
  readonly conteudo: number;
  readonly evento: number;
  readonly semOrigem: number;
}

export const data: readonly MonthlyLeadOrigin[] = [
  { month: '2026-01', indicacao: 120, conteudo: 90, evento: 40, semOrigem: 180 },
  { month: '2026-02', indicacao: 125, conteudo: 95, evento: 42, semOrigem: 190 },
  { month: '2026-03', indicacao: 130, conteudo: 98, evento: 45, semOrigem: 200 },
  { month: '2026-04', indicacao: 135, conteudo: 102, evento: 46, semOrigem: 205 },
  { month: '2026-05', indicacao: 140, conteudo: 108, evento: 48, semOrigem: 210 },
  { month: '2026-06', indicacao: 160, conteudo: 130, evento: 60, semOrigem: 140 },
  { month: '2026-07', indicacao: 190, conteudo: 150, evento: 68, semOrigem: 90 },
  { month: '2026-08', indicacao: 205, conteudo: 162, evento: 74, semOrigem: 68 },
  { month: '2026-09', indicacao: 215, conteudo: 172, evento: 79, semOrigem: 54 },
  { month: '2026-10', indicacao: 222, conteudo: 179, evento: 83, semOrigem: 46 },
  { month: '2026-11', indicacao: 228, conteudo: 185, evento: 86, semOrigem: 41 },
  { month: '2026-12', indicacao: 233, conteudo: 190, evento: 89, semOrigem: 38 },
];

/** Mês em que a correção de coleta de 2026-06-02 passou a valer. */
export const correctionMonth = '2026-06';
