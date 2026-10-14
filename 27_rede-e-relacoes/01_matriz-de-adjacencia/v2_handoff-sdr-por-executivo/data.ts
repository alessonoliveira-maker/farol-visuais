/**
 * Agendas repassadas por cada SDR a cada executivo em 2026-T3. Dado fictício e fixo: SDR 1 a SDR 6
 * e executivos A a I são códigos, não pessoas. A relação é dirigida: a linha é quem repassa, a
 * coluna é quem recebe, e a matriz inteira se desenha (nada de triângulo).
 *
 * Casos difíceis de propósito. Um SDR (3) que concentra 70% do que repassa em dois executivos. Zeros
 * medidos (SDR 5 não repassou nada a três executivos). E um SDR com base pequena (SDR 6, 7 agendas),
 * cujo 71% num único executivo é o maior percentual da matriz e não pode ganhar o destaque.
 */
export interface Sdr {
  readonly id: string;
  readonly label: string;
}

export interface Executive {
  readonly id: string;
  readonly label: string;
}

export interface HandoffRow {
  readonly sdrId: string;
  /** Agendas repassadas a cada executivo de EXECUTIVES, na mesma ordem. Zero é zero medido. */
  readonly toExecutives: readonly number[];
}

export interface HandoffData {
  readonly period: string;
  readonly sdrs: readonly Sdr[];
  readonly executives: readonly Executive[];
  readonly rows: readonly HandoffRow[];
}

export const data: HandoffData = {
  period: '2026-T3',
  sdrs: [
    { id: 'sdr-1', label: 'SDR 1' },
    { id: 'sdr-2', label: 'SDR 2' },
    { id: 'sdr-3', label: 'SDR 3' },
    { id: 'sdr-4', label: 'SDR 4' },
    { id: 'sdr-5', label: 'SDR 5' },
    { id: 'sdr-6', label: 'SDR 6' },
  ],
  executives: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((letter) => ({
    id: `exec-${letter.toLowerCase()}`,
    label: letter,
  })),
  rows: [
    { sdrId: 'sdr-1', toExecutives: [8, 6, 5, 4, 9, 3, 4, 3, 2] },
    { sdrId: 'sdr-2', toExecutives: [5, 4, 6, 7, 3, 5, 4, 2, 2] },
    { sdrId: 'sdr-3', toExecutives: [4, 3, 21, 2, 2, 14, 1, 2, 1] },
    { sdrId: 'sdr-4', toExecutives: [6, 5, 5, 6, 4, 5, 3, 4, 3] },
    { sdrId: 'sdr-5', toExecutives: [0, 7, 6, 0, 5, 8, 4, 3, 0] },
    { sdrId: 'sdr-6', toExecutives: [0, 0, 5, 0, 0, 2, 0, 0, 0] },
  ],
};
