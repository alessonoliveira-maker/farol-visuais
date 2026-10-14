/**
 * Participação de mercado própria por segmento, em fração de 0 a 1, contra os concorrentes do
 * perímetro do segmento. Dado fictício e fixo: nenhum nome é empresa real e os concorrentes de
 * cada linha não têm nome. Casos difíceis de propósito: um segmento em que a própria participação
 * é a maior, outro em que é a menor, nomes longos e número de concorrentes diferente por linha.
 */
export interface SegmentShare {
  readonly id: string;
  readonly name: string;
  /** Participação própria no segmento, de 0 a 1. */
  readonly own: number;
  /** Participação de cada concorrente do perímetro naquele segmento, de 0 a 1. */
  readonly peers: readonly number[];
}

export interface ShareData {
  /** Perímetro declarado no cabeçalho: de onde saem os concorrentes. */
  readonly perimeter: string;
  readonly segments: readonly SegmentShare[];
}

export const data: ShareData = {
  perimeter: 'concorrentes fictícios da praça metropolitana, 2026 T3',
  segments: [
    { id: 'seg-01', name: 'Utilitários leves', own: 0.184, peers: [0.231, 0.172, 0.149, 0.118, 0.096, 0.082, 0.071, 0.055, 0.041, 0.028] },
    { id: 'seg-02', name: 'Picapes médias', own: 0.312, peers: [0.268, 0.19, 0.144, 0.101, 0.077, 0.052, 0.034, 0.022] },
    { id: 'seg-03', name: 'Sedãs compactos', own: 0.067, peers: [0.274, 0.221, 0.176, 0.152, 0.128, 0.093, 0.081, 0.064, 0.049, 0.036, 0.027, 0.019, 0.014] },
    { id: 'seg-04', name: 'SUVs médios', own: 0.142, peers: [0.198, 0.171, 0.157, 0.133, 0.104, 0.089, 0.062, 0.044, 0.031, 0.02, 0.012] },
    { id: 'seg-05', name: 'Elétricos e híbridos', own: 0.021, peers: [0.119, 0.087, 0.066, 0.051, 0.039, 0.024] },
    { id: 'seg-06', name: 'Motos de trabalho', own: 0.251, peers: [0.242, 0.183, 0.139, 0.097, 0.074, 0.051, 0.03] },
    { id: 'seg-07', name: 'Seminovos premium', own: 0.109, peers: [0.204, 0.162, 0.131, 0.109, 0.083, 0.058, 0.036, 0.017] },
    { id: 'seg-08', name: 'Peças e acessórios', own: 0.087, peers: [0.215, 0.178, 0.126, 0.087, 0.064, 0.045, 0.029, 0.016, 0.01] },
  ],
};
