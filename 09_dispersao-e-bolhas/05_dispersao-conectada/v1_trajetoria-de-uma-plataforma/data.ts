/**
 * CPL (custo por lead, em reais) e taxa de qualificação (fração) da plataforma A, mês a mês nos
 * últimos 12 meses, na ordem do tempo.
 * Dado fictício e fixo: "plataforma A" é rótulo genérico, nenhuma marca real.
 */
export interface PlatformMonth {
  readonly id: string;
  readonly month: string;
  readonly cpl: number;
  readonly taxaQualificacao: number;
}

export const data: readonly PlatformMonth[] = [
  { id: '2025-10', month: '2025-10', cpl: 190, taxaQualificacao: 0.22 },
  { id: '2025-11', month: '2025-11', cpl: 178, taxaQualificacao: 0.24 },
  { id: '2025-12', month: '2025-12', cpl: 167, taxaQualificacao: 0.26 },
  { id: '2026-01', month: '2026-01', cpl: 158, taxaQualificacao: 0.275 },
  { id: '2026-02', month: '2026-02', cpl: 150, taxaQualificacao: 0.29 },
  { id: '2026-03', month: '2026-03', cpl: 144, taxaQualificacao: 0.305 },
  { id: '2026-04', month: '2026-04', cpl: 140, taxaQualificacao: 0.32 },
  { id: '2026-05', month: '2026-05', cpl: 152, taxaQualificacao: 0.28 },
  { id: '2026-06', month: '2026-06', cpl: 168, taxaQualificacao: 0.24 },
  { id: '2026-07', month: '2026-07', cpl: 188, taxaQualificacao: 0.205 },
  { id: '2026-08', month: '2026-08', cpl: 210, taxaQualificacao: 0.175 },
  { id: '2026-09', month: '2026-09', cpl: 232, taxaQualificacao: 0.14 },
];
