/**
 * CPL qualificado (R$), volume de leads e margem (fração, ponto e intervalo) por origem em
 * 2026-08. `cpl: null` é indisponível (custo não importado), diferente de `cpl: 0` (zero
 * medido). `marginMin`/`marginMax` nulos com `n: 1` significam amostra de um único negócio: só
 * o ponto, sem intervalo. Dado fictício e fixo; nomes de origem são genéricos.
 */
export interface OriginMetric {
  readonly id: string;
  readonly name: string;
  readonly cpl: number | null;
  readonly volume: number;
  readonly marginCentral: number;
  readonly marginMin: number | null;
  readonly marginMax: number | null;
  readonly n: number;
}

export const data: readonly OriginMetric[] = [
  { id: 'origem-01', name: 'Indicação', cpl: 38, volume: 180, marginCentral: 0.094, marginMin: 0.061, marginMax: 0.128, n: 22 },
  { id: 'origem-02', name: 'Formulário do site', cpl: 61, volume: 612, marginCentral: 0.032, marginMin: -0.011, marginMax: 0.076, n: 48 },
  { id: 'origem-03', name: 'Busca orgânica', cpl: 0, volume: 340, marginCentral: 0.05, marginMin: 0.018, marginMax: 0.084, n: 31 },
  { id: 'origem-04', name: 'Rede social paga', cpl: 124, volume: 524, marginCentral: 0.018, marginMin: -0.021, marginMax: 0.054, n: 29 },
  { id: 'origem-05', name: 'Outbound por telefone', cpl: 96, volume: 402, marginCentral: -0.094, marginMin: -0.142, marginMax: -0.047, n: 26 },
  { id: 'origem-06', name: 'Evento presencial', cpl: null, volume: 64, marginCentral: -0.035, marginMin: -0.09, marginMax: 0.021, n: 8 },
  { id: 'origem-07', name: 'Parceiro B', cpl: 54, volume: 96, marginCentral: 0.06, marginMin: null, marginMax: null, n: 1 },
  { id: 'origem-08', name: 'Campanha de fim de ano', cpl: 48, volume: 3_784, marginCentral: 0.041, marginMin: 0.01, marginMax: 0.075, n: 54 },
];
