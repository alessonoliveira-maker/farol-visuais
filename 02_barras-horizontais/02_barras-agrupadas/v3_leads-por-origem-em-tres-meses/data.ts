/**
 * Leads novos por origem em cada um dos três últimos meses fechados (2026-06, 2026-07 e 2026-08),
 * em contagem de leads. Mês em que a origem ainda não era coletada vem como null: não é zero.
 * Dado fictício e fixo: origens genéricas, nenhuma empresa nem pessoa real.
 */
export type MonthTriple<T> = readonly [T, T, T];

export interface OriginLeads {
  readonly id: string;
  readonly origin: string;
  /** Leads em cada mês de `months`, na mesma ordem; null quando a origem não tinha coleta no mês. */
  readonly leads: MonthTriple<number | null>;
}

/** Os três meses, do mais antigo ao mais recente, em YYYY-MM. */
export const months: MonthTriple<string> = ['2026-06', '2026-07', '2026-08'];

export const data: readonly OriginLeads[] = [
  { id: 'origem-rede-social', origin: 'Anúncio em rede social', leads: [112, 88, 71] },
  { id: 'origem-busca', origin: 'Busca paga', leads: [84, 91, 97] },
  { id: 'origem-site', origin: 'Formulário do site', leads: [45, 39, 44] },
  { id: 'origem-contabil', origin: 'Parceria contábil', leads: [null, null, 14] },
  { id: 'origem-indicacao', origin: 'Indicação de cliente', leads: [38, 41, 52] },
  { id: 'origem-evento', origin: 'Evento presencial', leads: [6, 19, 9] },
  { id: 'origem-rede-profissional', origin: 'Rede profissional paga', leads: [22, 27, 31] },
];
