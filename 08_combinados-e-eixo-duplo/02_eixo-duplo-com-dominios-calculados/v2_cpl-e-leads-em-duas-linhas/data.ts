/**
 * Investimento de mídia e leads recebidos por mês em 2026, com o custo por lead saindo da divisão
 * de um pelo outro. Investimento em reais; leads em contagem de pessoas que preencheram formulário.
 *
 * O recorte foi escolhido para exercitar a regra de escala: o volume oscila pouco em torno da base
 * (índice de 94,8 a 121,7) enquanto o custo por lead sobe sem parar (índice de 100 a 174), então a
 * série de menor amplitude fica achatada quando as duas dividem o mesmo eixo. Fevereiro cai abaixo
 * da base de propósito, para a linha do índice 100 ficar DENTRO do domínio e não na borda dele.
 *
 * Dado fictício e fixo: nenhuma campanha, plataforma ou empresa real.
 */
export interface MonthlyLeadCost {
  /** Mês de competência, em YYYY-MM. */
  readonly month: string;
  /** Leads recebidos no mês. */
  readonly leads: number;
  /** Investimento de mídia do mês, em reais. */
  readonly investment: number;
}

export const data: readonly MonthlyLeadCost[] = [
  { month: '2026-01', leads: 420, investment: 63_000 },
  { month: '2026-02', leads: 398, investment: 61_690 },
  { month: '2026-03', leads: 441, investment: 71_883 },
  { month: '2026-04', leads: 432, investment: 75_168 },
  { month: '2026-05', leads: 465, investment: 86_490 },
  { month: '2026-06', leads: 489, investment: 94_866 },
  { month: '2026-07', leads: 462, investment: 96_096 },
  { month: '2026-08', leads: 502, investment: 108_934 },
  { month: '2026-09', leads: 478, investment: 109_940 },
  { month: '2026-10', leads: 511, investment: 123_151 },
  { month: '2026-11', leads: 486, investment: 121_986 },
  { month: '2026-12', leads: 503, investment: 131_283 },
];
