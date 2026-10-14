/**
 * Ticket (em reais) e ciclo de fechamento (em dias) de oportunidades ganhas no semestre,
 * agrupadas por região comercial. Dado fictício e fixo: nenhuma região existe no mapa e nenhum
 * nome é de empresa real.
 *
 * A lista está em **ordem alfabética de propósito**: quem ordena os painéis é o componente, pela
 * mediana do ciclo, e deixar o dado já ordenado esconderia justamente a transformação que a versão
 * existe para demonstrar. Conferir a ordem da tela contra esta lista é a prova de que a ordem é por
 * medida, não pelo arquivo.
 *
 * Cada região tem 11 pontos, número ímpar para a mediana cair num valor observado e ser conferível
 * à mão. As medianas de ciclo vão de 26 a 112 dias e nenhuma empata, então os 12 painéis têm ordem
 * única. A força da relação entre ticket e ciclo muda de região para região e em nenhuma delas os
 * pontos sobem em linha reta: medido por Pearson sobre os próprios pares, o conjunto vai de −0,26
 * em Várzea Sul a +0,32 em Serra Azul, passando por +0,03 em Morro Verde, que é nuvem sem relação
 * nenhuma. Uma grade que ensina correlação perfeita em todo recorte não ensina nada.
 */
export interface ScatterPoint {
  readonly ticket: number;
  readonly ciclo: number;
}

export interface RegionPanel {
  readonly id: string;
  readonly name: string;
  readonly points: readonly ScatterPoint[];
}

/** Monta os pontos de um painel a partir de pares [ticket, ciclo]. */
function panel(pairs: readonly (readonly [number, number])[]): readonly ScatterPoint[] {
  return pairs.map(([ticket, ciclo]) => ({ ticket, ciclo }));
}

export const data: readonly RegionPanel[] = [
  {
    /** Mediana de ciclo 38 dias. */
    id: 'baia-norte',
    name: 'Baía Norte',
    points: panel([
      [212_000, 47], [248_000, 21], [281_000, 34], [316_000, 58], [349_000, 27], [382_000, 41],
      [414_000, 16], [447_000, 52], [479_000, 31], [512_000, 38], [546_000, 62],
    ]),
  },
  {
    /** Mediana de ciclo 96 dias. */
    id: 'campo-novo',
    name: 'Campo Novo',
    points: panel([
      [136_000, 118], [168_000, 72], [201_000, 96], [233_000, 134], [266_000, 81], [298_000, 108],
      [331_000, 58], [363_000, 126], [396_000, 91], [428_000, 102], [461_000, 66],
    ]),
  },
  {
    /** Mediana de ciclo 58 dias, e o nome mais longo da grade: mede o cabeçalho do painel. */
    id: 'chapada-oeste',
    name: 'Chapada Oeste',
    points: panel([
      [188_000, 74], [219_000, 39], [251_000, 58], [283_000, 91], [314_000, 47], [346_000, 66],
      [378_000, 28], [409_000, 82], [441_000, 52], [472_000, 63], [504_000, 35],
    ]),
  },
  {
    /** Mediana de ciclo 112 dias: a região mais lenta da grade, o último painel da ordem. */
    id: 'enseada-norte',
    name: 'Enseada Norte',
    points: panel([
      [172_000, 88], [208_000, 141], [245_000, 112], [281_000, 74], [318_000, 129], [354_000, 104],
      [391_000, 152], [427_000, 96], [464_000, 147], [500_000, 118], [537_000, 108],
    ]),
  },
  {
    /** Mediana de ciclo 48 dias. */
    id: 'lagoa-seca',
    name: 'Lagoa Seca',
    points: panel([
      [164_000, 62], [192_000, 28], [221_000, 44], [249_000, 71], [278_000, 36], [306_000, 51],
      [334_000, 22], [363_000, 58], [391_000, 40], [418_000, 48], [446_000, 79],
    ]),
  },
  {
    /** Mediana de ciclo 78 dias. */
    id: 'mata-alta',
    name: 'Mata Alta',
    points: panel([
      [241_000, 54], [276_000, 102], [312_000, 78], [347_000, 44], [383_000, 91], [418_000, 69],
      [454_000, 118], [489_000, 61], [524_000, 110], [560_000, 84], [596_000, 73],
    ]),
  },
  {
    /** Mediana de ciclo 26 dias: a região mais rápida da grade, o primeiro painel da ordem. */
    id: 'morro-verde',
    name: 'Morro Verde',
    points: panel([
      [148_000, 24], [176_000, 41], [203_000, 12], [229_000, 33], [256_000, 26], [284_000, 19],
      [311_000, 47], [338_000, 15], [366_000, 38], [392_000, 22], [421_000, 29],
    ]),
  },
  {
    /** Mediana de ciclo 66 dias. */
    id: 'pontal-leste',
    name: 'Pontal Leste',
    points: panel([
      [296_000, 42], [329_000, 88], [362_000, 66], [396_000, 34], [429_000, 79], [462_000, 57],
      [496_000, 103], [529_000, 48], [562_000, 94], [596_000, 71], [629_000, 61],
    ]),
  },
  {
    /** Mediana de ciclo 102 dias. */
    id: 'rio-fundo',
    name: 'Rio Fundo',
    points: panel([
      [224_000, 78], [261_000, 132], [298_000, 102], [334_000, 68], [371_000, 121], [408_000, 94],
      [444_000, 146], [481_000, 86], [518_000, 138], [554_000, 112], [591_000, 97],
    ]),
  },
  {
    /** Mediana de ciclo 50 dias. */
    id: 'serra-azul',
    name: 'Serra Azul',
    points: panel([
      [268_000, 31], [302_000, 68], [337_000, 44], [371_000, 25], [406_000, 57], [441_000, 50],
      [476_000, 82], [511_000, 38], [546_000, 74], [581_000, 61], [618_000, 47],
    ]),
  },
  {
    /** Mediana de ciclo 88 dias, e o maior ticket da grade: mede o topo do domínio comum. */
    id: 'vale-claro',
    name: 'Vale Claro',
    points: panel([
      [318_000, 64], [356_000, 112], [394_000, 88], [431_000, 52], [469_000, 104], [507_000, 79],
      [544_000, 128], [582_000, 71], [619_000, 118], [657_000, 94], [694_000, 83],
    ]),
  },
  {
    /** Mediana de ciclo 72 dias, e a relação mais negativa da grade, ainda assim fraca: Pearson de
     * cerca de −0,26 sobre estes pares, ticket maior com ciclo um pouco menor. */
    id: 'varzea-sul',
    name: 'Várzea Sul',
    points: panel([
      [152_000, 96], [184_000, 48], [217_000, 72], [249_000, 108], [282_000, 59], [314_000, 84],
      [347_000, 36], [379_000, 101], [412_000, 66], [444_000, 78], [477_000, 41],
    ]),
  },
];
