/**
 * Perdas registradas no CRM por trimestre e motivo, 6 trimestres. Contagem de oportunidades.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * T3/25 tem só 4 perdas (abaixo do piso de leitura confiável) e T4/25 não teve nenhuma perda
 * registrada no trimestre, caso que testa os dois estados que o 100% não pode desenhar como se
 * fossem um mix normal.
 */
export interface QuarterLosses {
  readonly quarter: string;
  readonly semFit: number;
  readonly preco: number;
  readonly concorrencia: number;
  readonly semMotivo: number;
}

export const data: readonly QuarterLosses[] = [
  { quarter: 'T1/25', semFit: 30, preco: 18, concorrencia: 22, semMotivo: 6 },
  { quarter: 'T2/25', semFit: 34, preco: 20, concorrencia: 19, semMotivo: 5 },
  { quarter: 'T3/25', semFit: 2, preco: 1, concorrencia: 1, semMotivo: 0 },
  { quarter: 'T4/25', semFit: 0, preco: 0, concorrencia: 0, semMotivo: 0 },
  { quarter: 'T1/26', semFit: 28, preco: 24, concorrencia: 17, semMotivo: 4 },
  { quarter: 'T2/26', semFit: 31, preco: 22, concorrencia: 20, semMotivo: 3 },
];
