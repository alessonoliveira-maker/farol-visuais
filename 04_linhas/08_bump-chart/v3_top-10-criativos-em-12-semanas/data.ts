/**
 * CPL qualificado semanal de 12 criativos de mídia paga, em reais, de 2026-06-01 a 2026-08-17.
 * Dado fictício e fixo: nenhum criativo nomeia uma peça ou marca real. O universo do top 10 é
 * calculado a cada semana a partir destes 12 valores; quem fica abaixo do 10º lugar vira lacuna
 * no gráfico, não zero.
 */
export interface CreativeCplSeries {
  readonly id: string;
  readonly name: string;
  /** Um CPL por semana, na mesma ordem de `weeks`. Todos os 12 sempre têm valor: o corte do
   * top 10 é decidido no componente, não aqui. */
  readonly values: readonly number[];
}

export const weeks: readonly string[] = [
  '2026-06-01', '2026-06-08', '2026-06-15', '2026-06-22', '2026-06-29', '2026-07-06',
  '2026-07-13', '2026-07-20', '2026-07-27', '2026-08-03', '2026-08-10', '2026-08-17',
];

export const data: readonly CreativeCplSeries[] = [
  { id: 'crt-01', name: 'Depoimento em vídeo', values: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30] },
  { id: 'crt-02', name: 'Carrossel de benefícios', values: [35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35] },
  { id: 'crt-03', name: 'Estático com oferta', values: [45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45] },
  { id: 'crt-04', name: 'Vídeo explicativo', values: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },
  { id: 'crt-05', name: 'UGC de cliente', values: [55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55] },
  { id: 'crt-06', name: 'Prova social', values: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 55] },
  { id: 'crt-07', name: 'Anúncio institucional', values: [65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65] },
  { id: 'crt-08', name: 'Case de sucesso', values: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70] },
  { id: 'crt-09', name: 'Banner sazonal', values: [75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75] },
  { id: 'crt-10', name: 'Reels de bastidores', values: [32, 36, 40, 44, 48, 52, 56, 59, 64, 67, 69, 74] },
  { id: 'crt-11', name: 'Comparativo de resultado', values: [95, 95, 95, 72, 72, 72, 95, 95, 95, 95, 95, 95] },
  { id: 'crt-12', name: 'Tutorial curto', values: [98, 98, 98, 98, 98, 98, 98, 98, 71, 71, 98, 98] },
];
