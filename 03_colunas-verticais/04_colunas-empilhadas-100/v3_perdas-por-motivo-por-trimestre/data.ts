/**
 * Perdas registradas no CRM por trimestre e motivo, 8 trimestres. Contagem de oportunidades.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * `outros` é a soma pré-calculada de 3 motivos menores; `semMotivo` é a perda sem motivo
 * registrado no CRM. Concorrência cresce de menor para maior motivo ao longo da série, caso que
 * exercita a ordem fixa por peso do trimestre mais recente sobre uma pilha que muda por dentro.
 */
export interface QuarterLosses {
  readonly quarter: string;
  readonly semFit: number;
  readonly preco: number;
  readonly concorrencia: number;
  readonly semRetorno: number;
  /** Soma dos 3 motivos menores do trimestre. */
  readonly outros: number;
  readonly semMotivo: number;
}

export const data: readonly QuarterLosses[] = [
  { quarter: 'T1/25', semFit: 30, preco: 18, concorrencia: 6, semRetorno: 10, outros: 9, semMotivo: 7 },
  { quarter: 'T2/25', semFit: 34, preco: 20, concorrencia: 9, semRetorno: 11, outros: 10, semMotivo: 6 },
  { quarter: 'T3/25', semFit: 28, preco: 22, concorrencia: 14, semRetorno: 9, outros: 8, semMotivo: 5 },
  { quarter: 'T4/25', semFit: 25, preco: 19, concorrencia: 20, semRetorno: 8, outros: 7, semMotivo: 4 },
  { quarter: 'T1/26', semFit: 22, preco: 17, concorrencia: 26, semRetorno: 7, outros: 6, semMotivo: 4 },
  { quarter: 'T2/26', semFit: 18, preco: 15, concorrencia: 33, semRetorno: 6, outros: 5, semMotivo: 3 },
  { quarter: 'T3/26', semFit: 15, preco: 13, concorrencia: 41, semRetorno: 5, outros: 4, semMotivo: 2 },
  { quarter: 'T4/26', semFit: 12, preco: 11, concorrencia: 48, semRetorno: 4, outros: 3, semMotivo: 2 },
];
