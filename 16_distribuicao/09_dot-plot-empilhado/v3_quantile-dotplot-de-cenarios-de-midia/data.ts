/**
 * Entradas qualificadas por mês em quatro cenários de orçamento de mídia, simuladas: cada cenário
 * traz 40 amostras do simulador. Dado fictício e fixo, sem marca nem plataforma real. O componente
 * reduz cada lista a 20 quantis, de 2,5% a 97,5%, e é isso que vira ponto. O caso difícil é o
 * cenário de mais 30% de mídia, de cauda larga, que cruza o teto de capacidade com folga, e o de
 * menos 20%, que não cruza com nenhum desfecho.
 */
export interface MediaScenario {
  readonly id: string;
  readonly name: string;
  /** Entradas qualificadas por mês em cada rodada do simulador. */
  readonly samples: readonly number[];
}

/** Número de desfechos mostrados por cenário. Fixo no produto inteiro: a contagem vale em qualquer tela. */
export const QUANTILES = 20;

/** Teto de capacidade da pré-vendas, em entradas qualificadas por mês. */
export const CAPACITY = 120;

/** Régua comum aos quatro cenários, em entradas qualificadas por mês. */
export const AXIS_MIN = 40;
export const AXIS_MAX = 200;

export const data: readonly MediaScenario[] = [
  {
    id: 'cut-20',
    name: 'Menos 20% de mídia',
    samples: [
      81, 72, 85, 78, 89, 69, 53, 103, 86, 74,
      69, 98, 90, 69, 80, 105, 103, 73, 93, 80,
      80, 86, 72, 90, 69, 87, 82, 73, 82, 90,
      91, 70, 97, 92, 83, 94, 99, 104, 68, 88,
    ],
  },
  {
    id: 'base',
    name: 'Orçamento atual',
    samples: [
      103, 119, 105, 90, 102, 105, 96, 101, 97, 92,
      90, 112, 117, 104, 114, 119, 132, 89, 114, 98,
      92, 96, 116, 70, 70, 116, 109, 109, 117, 124,
      123, 93, 93, 97, 123, 142, 110, 126, 92, 108,
    ],
  },
  {
    id: 'plus-15',
    name: 'Mais 15% de mídia',
    samples: [
      96, 115, 102, 108, 122, 138, 128, 107, 89, 112,
      149, 129, 100, 115, 151, 123, 110, 110, 125, 104,
      107, 136, 131, 74, 129, 151, 82, 122, 121, 102,
      140, 113, 93, 162, 119, 102, 101, 160, 126, 115,
    ],
  },
  {
    id: 'plus-30',
    name: 'Mais 30% de mídia',
    samples: [
      201, 155, 157, 123, 123, 133, 156, 121, 107, 113,
      122, 120, 111, 106, 130, 145, 102, 101, 123, 128,
      124, 140, 171, 154, 131, 118, 148, 115, 129, 120,
      114, 143, 163, 127, 99, 122, 159, 146, 188, 172,
    ],
  },
];
