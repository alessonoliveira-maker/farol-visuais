/**
 * Leads gerados por trimestre, por origem, em 5 trimestres fictícios. Dado fictício e fixo.
 * `null` é trimestre sem coleta (lacuna): a origem some do ranking naquele ponto e o caminho se
 * interrompe. Um valor `0` é lead medido em zero: a origem continua no ranking com a faixa mais
 * fina possível, distinta da lacuna (CONTRATO, EIX-10 e EST-3).
 */
export interface OriginSeries {
  readonly id: string;
  readonly label: string;
  /** Posição fixa na paleta (1 a 6, que vira `--chart-1` a `--chart-6`), presa à origem (COR-3). */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly values: readonly (number | null)[];
}

export const periods: readonly string[] = ['1º tri/25', '2º tri/25', '3º tri/25', '4º tri/25', '1º tri/26'];

export const data: readonly OriginSeries[] = [
  { id: 'indicacao', label: 'Indicação', slot: 1, values: [42, 45, 40, 47, 50] },
  { id: 'busca-organica', label: 'Busca orgânica', slot: 3, values: [30, 28, 32, 35, 35] },
  { id: 'evento-presencial', label: 'Evento presencial', slot: 6, values: [18, 15, 0, 12, 14] },
  { id: 'parceria-comercial', label: 'Parceria comercial', slot: 5, values: [10, null, 20, 35, 38] },
];
