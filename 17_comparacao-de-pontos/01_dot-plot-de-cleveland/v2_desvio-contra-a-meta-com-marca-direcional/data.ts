/**
 * Realizado e meta do trimestre por executivo, em reais. Dado fictício e fixo: nenhum nome é
 * pessoa real. O desvio é o realizado menos a meta e sai calculado no componente. Há 6 acima da
 * meta, 1 exatamente na meta (desvio zero medido) e 5 abaixo, e um nome longo.
 */
export interface QuotaRow {
  readonly id: string;
  readonly name: string;
  readonly actual: number;
  readonly target: number;
}

export const data: readonly QuotaRow[] = [
  { id: 'exec-01', name: 'Talita V.', actual: 331_000, target: 280_000 },
  { id: 'exec-02', name: 'Murilo C.', actual: 338_500, target: 300_000 },
  { id: 'exec-03', name: 'Débora F.', actual: 291_000, target: 260_000 },
  { id: 'exec-04', name: 'Renan A.', actual: 272_400, target: 250_000 },
  { id: 'exec-05', name: 'Caio M.', actual: 255_300, target: 240_000 },
  { id: 'exec-06', name: 'Ana Beatriz Cavalcanti', actual: 276_200, target: 270_000 },
  { id: 'exec-07', name: 'Heitor L.', actual: 220_000, target: 220_000 },
  { id: 'exec-08', name: 'Lívia T.', actual: 224_100, target: 230_000 },
  { id: 'exec-09', name: 'Gustavo R.', actual: 243_800, target: 260_000 },
  { id: 'exec-10', name: 'Otávio B.', actual: 186_500, target: 210_000 },
  { id: 'exec-11', name: 'Pietra G.', actual: 195_000, target: 240_000 },
  { id: 'exec-12', name: 'Bruno S.', actual: 147_600, target: 200_000 },
];
