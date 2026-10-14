/**
 * Ticket (em reais) e ciclo de fechamento (em dias) de oportunidades ganhas no trimestre,
 * agrupadas por executivo. Dado fictício e fixo: nenhum nome é pessoa real.
 *
 * O conjunto existe para exercitar o que a grade precisa saber mostrar: a **força da relação muda
 * de painel para painel**. Medido sobre estes pares (Pearson): Camila O. +0,98 e Felipe N. +0,80
 * sobem juntos; Giovana P. −0,87 anda ao contrário, ticket menor com ciclo maior; Elisa T. +0,04 e
 * Hugo M. 0,00 são nuvens sem relação nenhuma. Uma versão anterior deste arquivo alinhava os onze
 * pontos de cada painel quase numa reta perfeita, e a peça ensinava correlação perfeita em todo
 * recorte, que é o contrário do achado que ela serve para encontrar.
 *
 * O número de oportunidades varia de 10 a 12 por executivo, porque no trimestre real ele varia, e
 * o cabeçalho de cada painel escreve o próprio `n`.
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
    /** Nome mais longo do conjunto: mede o cabeçalho do painel, que não pode cortar (TIP-7). */
    id: 'ana',
    name: 'Ana Beatriz Ramos',
    points: panel([
      [310_000, 28], [345_000, 18], [365_000, 41], [392_000, 33], [410_000, 24],
      [433_000, 52], [455_000, 30], [486_000, 46], [512_000, 37], [540_000, 61], [598_000, 44],
    ]),
  },
  {
    id: 'bruno',
    name: 'Bruno C.',
    points: panel([
      [85_000, 14], [96_000, 9], [110_000, 21], [118_000, 12], [131_000, 17], [142_000, 26],
      [150_000, 11], [163_000, 19], [175_000, 31], [188_000, 15], [205_000, 24], [218_000, 20],
    ]),
  },
  {
    /** A relação mais forte da grade: ticket e ciclo sobem quase juntos. */
    id: 'camila',
    name: 'Camila O.',
    points: panel([
      [210_000, 38], [232_000, 45], [251_000, 44], [268_000, 57], [292_000, 54],
      [311_000, 66], [330_000, 63], [352_000, 74], [378_000, 79], [421_000, 85], [488_000, 96],
    ]),
  },
  {
    id: 'diego',
    name: 'Diego F. Castro',
    points: panel([
      [521_000, 128], [548_000, 96], [583_000, 141], [612_000, 88], [640_000, 119],
      [676_000, 152], [704_000, 74], [735_000, 133], [768_000, 108], [872_000, 61],
    ]),
  },
  {
    /** Nuvem sem relação: o ticket varia por um fator de três e o ciclo fica onde estava. */
    id: 'elisa',
    name: 'Elisa T.',
    points: panel([
      [152_000, 47], [178_000, 29], [204_000, 58], [228_000, 33], [246_000, 51], [271_000, 39],
      [298_000, 62], [322_000, 27], [345_000, 55], [367_000, 42], [392_000, 36], [415_000, 49],
    ]),
  },
  {
    id: 'felipe',
    name: 'Felipe N.',
    points: panel([
      [358_000, 41], [391_000, 63], [418_000, 52], [452_000, 77], [477_000, 58],
      [513_000, 84], [542_000, 69], [578_000, 95], [621_000, 72], [664_000, 104], [708_000, 88],
    ]),
  },
  {
    /** Relação invertida: os tickets menores da grade são os que mais demoram a fechar. */
    id: 'giovana',
    name: 'Giovana P.',
    points: panel([
      [62_000, 138], [78_000, 121], [92_000, 132], [108_000, 97], [121_000, 110],
      [137_000, 86], [149_000, 103], [164_000, 71], [178_000, 94], [196_000, 66], [212_000, 79],
    ]),
  },
  {
    /** Ticket alto e ciclo curto, sem relação entre os dois: a nuvem é uma faixa horizontal. */
    id: 'hugo',
    name: 'Hugo M.',
    points: panel([
      [405_000, 22], [438_000, 31], [472_000, 18], [498_000, 27], [531_000, 35],
      [562_000, 21], [594_000, 29], [628_000, 24], [671_000, 33], [728_000, 19], [818_000, 26],
    ]),
  },
];
