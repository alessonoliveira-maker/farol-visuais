/**
 * Dias entre a abertura e o fechamento de cada negócio ganho no semestre, por segmento de cliente.
 * Dado fictício e fixo, sem nenhuma correspondência com a base real: os valores saíram uma vez de um
 * gerador com semente e estão escritos abaixo, então o desenho é o mesmo em qualquer máquina.
 *
 * Uma observação por negócio, e não a curva pronta: a banda de suavização muda a forma, e com o dado
 * cru na mão ela fica declarada num lugar só, no componente e no rodapé.
 *
 * O terceiro segmento junta dois tipos de negócio de propósito, um que fecha perto de 40 dias e
 * outro perto de 100. É o caso que a caixa de quartis apaga e que este modelo existe para mostrar.
 */

export interface Segment {
  readonly id: string;
  readonly name: string;
  /** Dias de ciclo de cada negócio ganho. */
  readonly cycles: readonly number[];
}

/**
 * Negócios ganhos no semestre sem data de abertura registrada. Não têm ciclo calculável, então não
 * viram zero nem entram na forma: são contados no rodapé.
 */
export const WITHOUT_OPEN_DATE = 14;

export const data: readonly Segment[] = [
  {
    id: 'pequeno',
    name: 'Pequeno porte',
    cycles: [
      25, 22, 15, 17, 22, 13, 26, 15, 25, 15, 35, 39, 25, 24, 24, 49, 21, 42, 14, 22, 41, 14, 42, 21,
      38, 21, 23, 35, 35, 31, 19, 14, 15, 23, 22, 12, 22, 24, 24, 17, 59, 37, 20, 24, 25, 30, 9, 15,
      22, 15, 22, 23, 12, 19, 26, 22, 25, 26, 33, 22, 25, 30, 15, 23, 30, 33, 25, 20, 29, 20, 15, 37,
      16, 25, 30, 22, 28, 13, 32, 31, 18, 36, 14, 42, 30, 28, 24, 21, 20, 16, 27, 11, 37, 24, 26, 23,
      19, 21, 17, 24, 23, 18, 23, 9, 28, 19, 45, 19, 27, 18, 45, 15, 24, 24, 26, 18, 43, 36, 18, 32,
      18, 23, 27, 34, 25, 12, 12, 27, 26, 29, 25, 32, 37, 21, 23, 30, 10, 47, 27, 36, 21, 29, 26, 14,
      17, 29, 50, 23, 18, 37, 14, 24, 18, 22, 25, 25, 33, 19, 35, 31, 43, 46, 24, 16, 22, 19, 30, 19,
      29, 17, 36, 20, 23, 21, 34, 28, 14, 26, 27, 24,
    ],
  },
  {
    id: 'medio',
    name: 'Médio porte',
    cycles: [
      66, 83, 61, 64, 35, 60, 33, 36, 52, 32, 31, 48, 39, 40, 63, 39, 47, 40, 58, 47, 57, 53, 47, 32,
      54, 44, 51, 44, 30, 46, 43, 54, 73, 36, 36, 49, 58, 30, 60, 60, 26, 37, 50, 43, 29, 37, 64, 36,
      35, 33, 69, 46, 30, 39, 67, 56, 49, 34, 34, 60, 41, 47, 45, 48, 58, 48, 42, 57, 60, 29, 83, 44,
      55, 51, 39, 46, 46, 52, 43, 37, 32, 49, 51, 49, 48, 49, 34, 55, 49, 36, 37, 43, 48, 76, 52, 38,
      47, 43, 62, 40, 43, 51, 41, 54, 55, 77, 24, 67, 66, 49, 53, 41, 55, 52, 52, 46, 68, 55, 44, 58,
      44, 51, 37, 26, 30, 42, 25, 43, 30, 45, 28, 41, 91, 39, 66, 35, 58, 75, 32, 26, 49, 32, 40, 40,
      41, 22, 62, 55, 27, 42,
    ],
  },
  {
    id: 'grande',
    name: 'Grande porte e governo',
    cycles: [
      44, 108, 31, 48, 104, 89, 83, 96, 94, 102, 39, 100, 32, 97, 98, 45, 35, 25, 106, 84, 102, 51, 28, 17,
      39, 54, 92, 55, 104, 41, 44, 32, 43, 34, 101, 40, 104, 39, 91, 42, 34, 39, 40, 39, 102, 28, 29, 53,
      35, 102, 43, 40, 37, 46, 87, 55, 42, 42, 85, 44, 47, 39, 35, 84, 31, 100, 104, 102, 43, 85, 97, 45,
      106, 95, 103, 49, 43, 105, 38, 95, 28, 37, 99, 42, 29, 26, 113, 90, 43, 95, 35, 45, 42, 57, 47, 47,
      86, 79, 103, 104, 30, 109, 48, 89, 46, 29, 42, 36, 48, 40, 102, 39, 97, 25, 110, 42, 116, 99, 84, 102,
    ],
  },
];
