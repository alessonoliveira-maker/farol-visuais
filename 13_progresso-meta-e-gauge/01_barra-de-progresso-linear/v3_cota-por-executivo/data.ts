/**
 * Atingimento da cota de vendas por executivo no trimestre comercial, em reais.
 * Dado fictício e fixo, referente a 2026 T3 (julho a setembro).
 *
 * `target: null` é o executivo sem cota definida no período (por exemplo, contratado no meio do
 * trimestre): fica de fora do cálculo da mediana e some do ordenamento por atingimento.
 */
export interface ExecutiveQuota {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly target: number | null;
}

export const data: readonly ExecutiveQuota[] = [
  { id: 'exec-01', name: 'Renata A.', value: 612_000, target: 500_000 },
  { id: 'exec-02', name: 'Murilo C.', value: 498_000, target: 480_000 },
  { id: 'exec-03', name: 'Talita V.', value: 402_000, target: 450_000 },
  { id: 'exec-04', name: 'Diego P.', value: 356_000, target: 420_000 },
  { id: 'exec-05', name: 'Camila S.', value: 214_000, target: 400_000 },
  { id: 'exec-06', name: 'Vinícius B.', value: 188_000, target: 380_000 },
  { id: 'exec-07', name: 'Fernanda O. de Andrade Lima', value: 9_000, target: 350_000 },
  { id: 'exec-08', name: 'Bruno T.', value: 61_000, target: null },
];
