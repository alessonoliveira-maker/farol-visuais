/**
 * Oportunidades comerciais do trimestre: cada movimento é o dia em que a oportunidade passou a estar
 * numa etapa, e o índice da etapa é a posição dela em `stages` (0 é a primeira). Movimento para um
 * índice menor é retorno de etapa. A oportunidade que chegou à última etapa está ganha; as outras
 * seguem abertas até hoje. Dado fictício e fixo: as oportunidades são numeradas e nenhuma representa
 * cliente real.
 */
export interface Move {
  /** Dia da mudança, em YYYY-MM-DD. */
  readonly date: string;
  /** Índice da etapa em `stages`. */
  readonly stage: number;
}

export interface Pursuit {
  readonly id: string;
  readonly name: string;
  readonly moves: readonly Move[];
}

/** Etapas na ordem do funil; a última é o fechamento ganho. */
export const stages: readonly string[] = ['Qualificação', 'Diagnóstico', 'Proposta', 'Negociação', 'Ganha'];

export const data: readonly Pursuit[] = [
  {
    id: 'op-01',
    name: 'Oportunidade 01',
    moves: [
      { date: '2026-07-02', stage: 0 },
      { date: '2026-07-09', stage: 1 },
      { date: '2026-07-16', stage: 2 },
      { date: '2026-07-23', stage: 3 },
      { date: '2026-07-30', stage: 4 },
    ],
  },
  {
    id: 'op-02',
    name: 'Oportunidade 02',
    moves: [
      { date: '2026-07-03', stage: 0 },
      { date: '2026-07-14', stage: 1 },
      { date: '2026-07-30', stage: 2 },
      { date: '2026-08-18', stage: 3 },
      { date: '2026-09-08', stage: 4 },
    ],
  },
  {
    id: 'op-03',
    name: 'Oportunidade 03',
    moves: [
      { date: '2026-07-06', stage: 0 },
      { date: '2026-07-20', stage: 1 },
      { date: '2026-08-10', stage: 2 },
      { date: '2026-08-24', stage: 1 },
      { date: '2026-09-07', stage: 2 },
      { date: '2026-09-28', stage: 3 },
      { date: '2026-10-06', stage: 4 },
    ],
  },
  {
    id: 'op-04',
    name: 'Oportunidade 04',
    moves: [
      { date: '2026-07-10', stage: 0 },
      { date: '2026-07-24', stage: 1 },
      { date: '2026-08-06', stage: 2 },
      { date: '2026-08-20', stage: 3 },
      { date: '2026-09-03', stage: 4 },
    ],
  },
  {
    id: 'op-05',
    name: 'Oportunidade 05',
    moves: [
      { date: '2026-07-15', stage: 0 },
      { date: '2026-08-03', stage: 1 },
      { date: '2026-08-20', stage: 2 },
      { date: '2026-09-17', stage: 3 },
      { date: '2026-10-05', stage: 4 },
    ],
  },
  {
    id: 'op-06',
    name: 'Oportunidade 06',
    moves: [
      { date: '2026-07-22', stage: 0 },
      { date: '2026-08-01', stage: 1 },
      { date: '2026-08-12', stage: 2 },
      { date: '2026-09-02', stage: 1 },
      { date: '2026-09-15', stage: 2 },
      { date: '2026-09-29', stage: 3 },
    ],
  },
  {
    id: 'op-07',
    name: 'Oportunidade 07',
    moves: [
      { date: '2026-08-03', stage: 0 },
      { date: '2026-08-17', stage: 1 },
      { date: '2026-09-02', stage: 2 },
      { date: '2026-09-22', stage: 3 },
      { date: '2026-10-02', stage: 4 },
    ],
  },
  {
    id: 'op-08',
    name: 'Oportunidade 08',
    moves: [
      { date: '2026-08-12', stage: 0 },
      { date: '2026-08-26', stage: 1 },
      { date: '2026-09-14', stage: 2 },
    ],
  },
  {
    id: 'op-09',
    name: 'Oportunidade 09',
    moves: [
      { date: '2026-08-24', stage: 0 },
      { date: '2026-09-07', stage: 1 },
    ],
  },
  { id: 'op-10', name: 'Oportunidade 10', moves: [{ date: '2026-09-10', stage: 0 }] },
];

/** Hoje, vindo do dado, nunca do relógio. */
export const today = '2026-10-08';
/** Eixo do período: primeiro dia e hoje. */
export const windowStart = '2026-07-01';
