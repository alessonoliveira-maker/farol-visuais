/**
 * Custo por lead qualificado (CPL), em reais, nos 6 meses do semestre. Métrica de custo: descer é
 * bom, subir é ruim, polaridade invertida da métrica de saldo. Dado fictício e fixo: nenhuma
 * plataforma, pessoa ou empresa real é citada.
 */
export interface MonthlyCplQualified {
  readonly month: string;
  readonly cpl: number;
}

export const data: readonly MonthlyCplQualified[] = [
  { month: '2026-03', cpl: 248 },
  { month: '2026-04', cpl: 231 },
  { month: '2026-05', cpl: 268 },
  { month: '2026-06', cpl: 312 },
  { month: '2026-07', cpl: 298 },
  { month: '2026-08', cpl: 289 },
];
