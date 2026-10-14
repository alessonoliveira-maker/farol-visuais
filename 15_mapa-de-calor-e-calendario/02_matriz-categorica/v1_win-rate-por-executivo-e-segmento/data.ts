/**
 * Win rate por executivo e segmento de cliente no trimestre corrente. Dado fictício e fixo. O par
 * executivo x segmento declara contagem, não taxa: `wins` são as oportunidades ganhas e `closed` as
 * fechadas (ganhas mais perdidas). A taxa é derivada no componente, para que o percentual escrito na
 * célula e o volume escrito embaixo dele nunca possam divergir. Nenhum nome é pessoa real.
 */
export interface SegmentDefinition {
  readonly id: string;
  readonly label: string;
}

export const SEGMENTS: readonly SegmentDefinition[] = [
  { id: 'varejo', label: 'Varejo' },
  { id: 'industria', label: 'Indústria' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'tecnologia', label: 'Tecnologia' },
  { id: 'agronegocio', label: 'Agronegócio' },
];

export interface SegmentOutcome {
  /** Oportunidades ganhas no par. */
  readonly wins: number;
  /** Oportunidades fechadas no par, ganhas mais perdidas. Zero significa par sem medição. */
  readonly closed: number;
}

export interface ExecutiveRow {
  readonly id: string;
  readonly name: string;
  /** Uma posição por segmento, na mesma ordem de SEGMENTS. */
  readonly outcomes: readonly SegmentOutcome[];
}

/**
 * Casos difíceis exercitados de propósito: o volume por par vai de 3 a 31, então a mesma taxa de
 * 33% aparece com 3 de 9 e com 4 de 12; duas células têm zero ganhas sobre menos de cinco fechadas,
 * que é o 0% que não é medição; e Camila O. tem um par sem nenhuma oportunidade fechada, que é
 * ausência de instrumento e não desempenho zero.
 */
export const data: readonly ExecutiveRow[] = [
  {
    id: 'juliana-r',
    name: 'Juliana R.',
    outcomes: [
      { wins: 18, closed: 27 },
      { wins: 15, closed: 21 },
      { wins: 20, closed: 31 },
      { wins: 11, closed: 18 },
      { wins: 5, closed: 10 },
    ],
  },
  {
    id: 'beatriz-s',
    name: 'Beatriz S.',
    outcomes: [
      { wins: 13, closed: 18 },
      { wins: 8, closed: 14 },
      { wins: 17, closed: 26 },
      { wins: 7, closed: 11 },
      { wins: 3, closed: 7 },
    ],
  },
  {
    id: 'camila-o',
    name: 'Camila O.',
    outcomes: [
      { wins: 10, closed: 19 },
      { wins: 14, closed: 23 },
      { wins: 8, closed: 17 },
      { wins: 8, closed: 14 },
      { wins: 0, closed: 0 },
    ],
  },
  {
    id: 'murilo-c',
    name: 'Murilo C.',
    outcomes: [
      { wins: 15, closed: 24 },
      { wins: 7, closed: 17 },
      { wins: 16, closed: 29 },
      { wins: 5, closed: 13 },
      { wins: 1, closed: 5 },
    ],
  },
  {
    id: 'talita-v',
    name: 'Talita V.',
    outcomes: [
      { wins: 11, closed: 22 },
      { wins: 8, closed: 16 },
      { wins: 14, closed: 24 },
      { wins: 5, closed: 12 },
      { wins: 3, closed: 9 },
    ],
  },
  {
    id: 'renan-a',
    name: 'Renan A.',
    outcomes: [
      { wins: 10, closed: 21 },
      { wins: 12, closed: 19 },
      { wins: 10, closed: 22 },
      { wins: 8, closed: 16 },
      { wins: 3, closed: 9 },
    ],
  },
  {
    id: 'rodrigo-n',
    name: 'Rodrigo N.',
    outcomes: [
      { wins: 6, closed: 14 },
      { wins: 4, closed: 10 },
      { wins: 5, closed: 13 },
      { wins: 3, closed: 8 },
      { wins: 2, closed: 6 },
    ],
  },
  {
    id: 'fernando-l',
    name: 'Fernando L.',
    outcomes: [
      { wins: 6, closed: 16 },
      { wins: 4, closed: 11 },
      { wins: 3, closed: 9 },
      { wins: 2, closed: 7 },
      { wins: 0, closed: 3 },
    ],
  },
  {
    id: 'adriano-m',
    name: 'Adriano M.',
    outcomes: [
      { wins: 4, closed: 12 },
      { wins: 3, closed: 9 },
      { wins: 6, closed: 15 },
      { wins: 1, closed: 6 },
      { wins: 1, closed: 4 },
    ],
  },
  {
    id: 'maximiliano-t',
    name: 'Maximiliano T.',
    outcomes: [
      { wins: 4, closed: 11 },
      { wins: 2, closed: 8 },
      { wins: 3, closed: 10 },
      { wins: 2, closed: 6 },
      { wins: 0, closed: 4 },
    ],
  },
];
