/**
 * Ticket (em reais) e ciclo de fechamento (em dias) de oportunidades ganhas no trimestre,
 * agrupadas por executivo. Dado fictício e fixo: nenhum nome é pessoa real.
 *
 * O conjunto existe para exercitar o que esta versão precisa mostrar: **cada executivo ocupa uma
 * região diferente da nuvem do time**, e é isso que a nuvem de fundo serve para revelar. Alice M.
 * fica no alto e à direita (ticket alto, ciclo longo), Bento R. no canto de baixo à esquerda,
 * Fábio N. na região boa (ticket alto com ciclo curto), Gabriela S. na ruim (ticket baixo com ciclo
 * longo), Heitor P. num aglomerado apertado no centro e Clara V. espalhada pelo plano inteiro. Sem
 * essa diferença de posição a nuvem de fundo seria enfeite: ela só informa quando o recorte do
 * painel cai em algum lugar reconhecível dentro dela.
 *
 * O número de oportunidades varia de 9 a 12 por executivo, porque no trimestre real ele varia, e o
 * cabeçalho de cada painel escreve o próprio `n`.
 */
export interface ScatterPoint {
  readonly ticket: number;
  readonly ciclo: number;
}

export interface ExecutivePanel {
  readonly id: string;
  readonly name: string;
  readonly points: readonly ScatterPoint[];
}

/** Monta os pontos de um painel a partir de pares [ticket, ciclo]. */
function panel(pairs: readonly (readonly [number, number])[]): readonly ScatterPoint[] {
  return pairs.map(([ticket, ciclo]) => ({ ticket, ciclo }));
}

export const data: readonly ExecutivePanel[] = [
  {
    /** Alto e lento: o ticket mediano mais alto da grade, e o segundo ciclo mais longo. */
    id: 'alice',
    name: 'Alice M.',
    points: panel([
      [612_000, 96], [648_000, 112], [671_000, 88], [703_000, 127], [728_000, 105],
      [755_000, 141], [782_000, 119], [809_000, 134], [841_000, 108], [876_000, 152],
    ]),
  },
  {
    /** Baixo e rápido: o ciclo mediano mais curto da grade. */
    id: 'bento',
    name: 'Bento R.',
    points: panel([
      [62_000, 14], [74_000, 9], [88_000, 22], [97_000, 16], [109_000, 28], [121_000, 12],
      [134_000, 25], [148_000, 19], [161_000, 33], [176_000, 24], [191_000, 38],
    ]),
  },
  {
    /** Espalhada pelo plano inteiro: o painel em que a nuvem de fundo quase desaparece por baixo. */
    id: 'clara',
    name: 'Clara V.',
    points: panel([
      [96_000, 118], [158_000, 41], [214_000, 73], [287_000, 22], [341_000, 136], [398_000, 58],
      [452_000, 95], [518_000, 31], [586_000, 148], [644_000, 67], [721_000, 108], [798_000, 45],
    ]),
  },
  {
    /** Faixa horizontal no alto: ticket do meio da escala com o ciclo mais longo da grade. */
    id: 'davi',
    name: 'Davi L.',
    points: panel([
      [298_000, 104], [321_000, 128], [347_000, 112], [368_000, 145], [392_000, 121],
      [414_000, 138], [431_000, 109], [446_000, 132], [468_000, 150],
    ]),
  },
  {
    id: 'elisa',
    name: 'Elisa T.',
    points: panel([
      [246_000, 18], [268_000, 31], [289_000, 24], [312_000, 42], [334_000, 27], [356_000, 36],
      [378_000, 21], [396_000, 45], [412_000, 29], [428_000, 38], [447_000, 33],
    ]),
  },
  {
    /** A região boa do plano: ticket alto com ciclo curto. */
    id: 'fabio',
    name: 'Fábio N.',
    points: panel([
      [548_000, 18], [576_000, 26], [604_000, 21], [631_000, 33], [658_000, 15],
      [684_000, 28], [712_000, 23], [741_000, 35], [768_000, 20], [796_000, 30],
    ]),
  },
  {
    /** A região ruim do plano: ticket baixo com ciclo longo. */
    id: 'gabriela',
    name: 'Gabriela S.',
    points: panel([
      [84_000, 98], [96_000, 124], [108_000, 106], [119_000, 141], [131_000, 112], [144_000, 133],
      [157_000, 119], [168_000, 147], [182_000, 128], [196_000, 115], [214_000, 138],
    ]),
  },
  {
    /** Aglomerado apertado no centro: mede se a marca de destaque se separa quando os pontos se
     * encostam uns nos outros e também na nuvem de fundo. */
    id: 'heitor',
    name: 'Heitor P.',
    points: panel([
      [362_000, 62], [381_000, 71], [396_000, 58], [408_000, 76], [419_000, 65],
      [431_000, 81], [444_000, 68], [458_000, 74], [472_000, 61], [489_000, 79],
    ]),
  },
];
