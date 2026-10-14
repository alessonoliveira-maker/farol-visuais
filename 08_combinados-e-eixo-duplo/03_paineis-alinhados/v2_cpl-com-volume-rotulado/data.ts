/**
 * Custo por lead qualificado (CPL) e volume de leads qualificados, mês a mês, num ano
 * fictício de 2026. O CPL está em reais por lead e o volume em contagem de leads.
 * Dado fictício e fixo: nenhuma plataforma de mídia e nenhuma empresa é real.
 *
 * O caso difícil que este dado exerce é o mês em que o CPL mais baixo do ano vem com o menor
 * volume do ano (fev/26, R$ 148 com 31 leads): lido só pela linha do CPL, fev parece o melhor
 * mês; lido com o volume ao lado, parece um mês em que quase não houve compra de mídia. É por
 * isso que o volume precisa estar escrito e não guardado num segundo eixo.
 */
export interface QualifiedLeadCost {
  readonly month: string;
  /** Contagem de leads qualificados no mês. */
  readonly leads: number;
  /** Custo por lead qualificado, em reais. */
  readonly cpl: number;
}

export const data: readonly QualifiedLeadCost[] = [
  { month: '2026-01', leads: 96, cpl: 171 },
  { month: '2026-02', leads: 31, cpl: 148 },
  { month: '2026-03', leads: 88, cpl: 183 },
  { month: '2026-04', leads: 112, cpl: 195 },
  { month: '2026-05', leads: 134, cpl: 208 },
  { month: '2026-06', leads: 151, cpl: 217 },
  { month: '2026-07', leads: 168, cpl: 229 },
  { month: '2026-08', leads: 186, cpl: 238 },
  { month: '2026-09', leads: 214, cpl: 246 },
  { month: '2026-10', leads: 197, cpl: 262 },
  { month: '2026-11', leads: 173, cpl: 278 },
  { month: '2026-12', leads: 149, cpl: 291 },
];
