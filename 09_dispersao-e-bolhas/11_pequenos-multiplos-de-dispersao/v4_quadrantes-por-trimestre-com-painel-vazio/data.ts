/**
 * Ticket (em reais) e ciclo de fechamento (em dias) de oportunidades ganhas, agrupadas por
 * trimestre. Dado fictício e fixo: nenhum nome é pessoa real e nenhum trimestre é um período real
 * de nenhuma casa.
 *
 * O conjunto existe para exercitar os três casos difíceis que um pequeno múltiplo quase sempre tem e
 * quase nunca desenha: um trimestre **sem nenhuma oportunidade ganha** (`4º trimestre de 2025`, lista
 * vazia), um trimestre de **amostra pequena** (`1º trimestre de 2026`, 2 pontos) e um trimestre em que
 * a **meta de ticket em vigor era outra** (`3º trimestre de 2025`, `metaTicket`). Sem esses três o
 * desenho só prova o caminho fácil, que é o caminho que nunca falha.
 *
 * A massa migra do quadrante de ticket baixo e ciclo longo para o de ticket alto e ciclo curto ao
 * longo dos seis trimestres, que é a leitura que a grade serve para encontrar.
 */
export interface ScatterPoint {
  readonly ticket: number;
  readonly ciclo: number;
}

export interface QuarterPanel {
  readonly id: string;
  /** Rótulo de tela do período, por extenso: "tri" seria abreviação inventada (ROT-8). */
  readonly label: string;
  readonly points: readonly ScatterPoint[];
  /**
   * A meta de ticket em vigor naquele trimestre, preenchida só quando ela era diferente da atual,
   * que é a que corta os quadrantes em todos os painéis. Vai como número, para o cabeçalho escrevê-la
   * pelo formatador do Farol; o cabeçalho do painel afetado é que declara a diferença, porque mover o
   * corte de um painel só destruiria a comparação entre os seis.
   */
  readonly metaTicket?: number;
}

/** Monta os pontos de um painel a partir de pares [ticket, ciclo]. */
function panel(pairs: readonly (readonly [number, number])[]): readonly ScatterPoint[] {
  return pairs.map(([ticket, ciclo]) => ({ ticket, ciclo }));
}

export const data: readonly QuarterPanel[] = [
  {
    /** Massa no quadrante de ticket baixo e ciclo longo: 1 rápida em 11. */
    id: 'q1-2025',
    label: '1º trimestre de 2025',
    points: panel([
      [182_000, 88], [214_000, 112], [247_000, 74], [268_000, 96], [312_000, 128], [336_000, 58],
      [358_000, 104], [402_000, 82], [428_000, 119], [461_000, 66], [508_000, 91],
    ]),
  },
  {
    id: 'q2-2025',
    label: '2º trimestre de 2025',
    points: panel([
      [196_000, 64], [228_000, 92], [256_000, 48], [284_000, 108], [318_000, 71], [347_000, 54],
      [376_000, 86], [412_000, 62], [441_000, 44], [468_000, 98], [497_000, 51], [529_000, 76],
      [562_000, 39],
    ]),
  },
  {
    /** O trimestre em que a meta de ticket era outra: o corte desenhado é o atual, e o cabeçalho
     * declara a diferença em vez de mover a linha só neste painel. */
    id: 'q3-2025',
    label: '3º trimestre de 2025',
    metaTicket: 520_000,
    points: panel([
      [241_000, 58], [289_000, 82], [334_000, 46], [381_000, 69], [424_000, 38], [472_000, 74],
      [518_000, 42], [566_000, 56], [614_000, 88],
    ]),
  },
  {
    /** O painel sem observação. Lista vazia, não zero: o trimestre existiu e nenhuma oportunidade
     * foi ganha nele, então não há nuvem, não há mediana e não há contagem por região a fazer. */
    id: 'q4-2025',
    label: '4º trimestre de 2025',
    points: [],
  },
  {
    /** Amostra pequena: 2 pontos. O painel mantém o tamanho dos outros e ganha a nota, porque duas
     * observações não desenham uma nuvem e a forma delas não se compara com a dos vizinhos. */
    id: 'q1-2026',
    label: '1º trimestre de 2026',
    points: panel([[386_000, 54], [612_000, 47]]),
  },
  {
    /** Massa no quadrante de ticket alto e ciclo curto: 9 rápidas em 12. */
    id: 'q2-2026',
    label: '2º trimestre de 2026',
    points: panel([
      [268_000, 41], [312_000, 62], [358_000, 34], [396_000, 52], [434_000, 29], [471_000, 58],
      [508_000, 44], [546_000, 71], [583_000, 36], [621_000, 49], [664_000, 64], [712_000, 31],
    ]),
  },
];

/** Corte de ticket em vigor hoje, e o mesmo em todos os painéis: é ele que divide os quadrantes. */
export const ticketCut = 450_000;
/** Corte de ciclo em vigor hoje, em dias, e o mesmo em todos os painéis. */
export const cicloCut = 60;
