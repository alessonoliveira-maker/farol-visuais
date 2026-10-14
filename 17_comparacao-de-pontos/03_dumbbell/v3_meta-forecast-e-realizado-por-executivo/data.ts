/**
 * Meta individual, forecast e realizado do trimestre de 14 executivos, em reais de receita nova.
 * Dado fictício e fixo: nenhum nome é pessoa real. Exercita o caso difícil: um nome longo, os
 * três valores iguais (Heitor L.), forecast e realizado iguais, forecast abaixo da meta com
 * realizado acima, e o inverso.
 */
export interface QuotaTriple {
  readonly id: string;
  readonly name: string;
  /** Meta individual do trimestre. */
  readonly target: number;
  /** Projeção de fechamento feita durante o trimestre. */
  readonly forecast: number;
  /** Receita nova realizada. */
  readonly actual: number;
}

export const data: readonly QuotaTriple[] = [
  { id: 'exec-01', name: 'Talita V.', target: 280_000, forecast: 300_000, actual: 331_000 },
  { id: 'exec-02', name: 'Murilo C.', target: 300_000, forecast: 310_000, actual: 338_500 },
  { id: 'exec-03', name: 'Débora F.', target: 260_000, forecast: 255_000, actual: 291_000 },
  { id: 'exec-04', name: 'Renan A.', target: 250_000, forecast: 262_000, actual: 272_400 },
  { id: 'exec-05', name: 'Caio M.', target: 240_000, forecast: 236_000, actual: 255_300 },
  { id: 'exec-06', name: 'Ana Beatriz Cavalcanti', target: 270_000, forecast: 280_000, actual: 276_200 },
  { id: 'exec-07', name: 'Heitor L.', target: 220_000, forecast: 220_000, actual: 220_000 },
  { id: 'exec-08', name: 'Lívia T.', target: 230_000, forecast: 226_000, actual: 224_100 },
  { id: 'exec-09', name: 'Gustavo R.', target: 260_000, forecast: 250_000, actual: 243_800 },
  { id: 'exec-10', name: 'Otávio B.', target: 210_000, forecast: 200_000, actual: 186_500 },
  { id: 'exec-11', name: 'Pietra G.', target: 240_000, forecast: 215_000, actual: 195_000 },
  { id: 'exec-12', name: 'Bruno S.', target: 200_000, forecast: 170_000, actual: 147_600 },
  { id: 'exec-13', name: 'Nair P.', target: 310_000, forecast: 330_000, actual: 300_000 },
  { id: 'exec-14', name: 'Fábio D.', target: 190_000, forecast: 205_000, actual: 205_000 },
];
