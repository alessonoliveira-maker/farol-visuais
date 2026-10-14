/**
 * Criativos de mídia de uma campanha de lançamento: o primeiro dia no ar e o último, inclusive.
 * Criativo sem data de fim segue no ar até hoje; sem data de início não tem lugar no eixo.
 * Dado fictício e fixo: os criativos são numerados e nenhum é peça de marca real.
 */
export interface Creative {
  readonly id: string;
  readonly name: string;
  /** Primeiro dia no ar, em YYYY-MM-DD; `null` quando ninguém registrou a data. */
  readonly start: string | null;
  /** Último dia no ar, em YYYY-MM-DD; `null` enquanto segue no ar. */
  readonly end: string | null;
}

export const data: readonly Creative[] = [
  { id: 'cr-01', name: 'Criativo 01', start: '2026-09-14', end: null },
  { id: 'cr-02', name: 'Criativo 02', start: '2026-09-14', end: null },
  { id: 'cr-03', name: 'Criativo 03', start: '2026-09-14', end: '2026-09-21' },
  { id: 'cr-04', name: 'Criativo 04', start: '2026-09-14', end: '2026-09-28' },
  { id: 'cr-05', name: 'Criativo 05', start: '2026-09-14', end: '2026-10-05' },
  { id: 'cr-06', name: 'Criativo 06', start: '2026-09-14', end: '2026-10-12' },
  { id: 'cr-07', name: 'Criativo 07', start: '2026-09-14', end: '2026-10-19' },
  { id: 'cr-08', name: 'Criativo 08', start: '2026-09-14', end: '2026-10-26' },
  { id: 'cr-09', name: 'Criativo 09', start: '2026-09-14', end: '2026-11-02' },
  { id: 'cr-10', name: 'Criativo 10', start: '2026-09-14', end: '2026-11-09' },
  { id: 'cr-11', name: 'Criativo 11', start: '2026-09-14', end: '2026-11-23' },
  { id: 'cr-12', name: 'Criativo 12', start: '2026-09-14', end: '2026-12-07' },
  { id: 'cr-13', name: 'Criativo 13', start: '2026-10-05', end: null },
  { id: 'cr-14', name: 'Criativo 14', start: '2026-10-05', end: '2026-10-12' },
  { id: 'cr-15', name: 'Criativo 15', start: '2026-10-05', end: '2026-10-19' },
  { id: 'cr-16', name: 'Criativo 16', start: '2026-10-05', end: '2026-10-26' },
  { id: 'cr-17', name: 'Criativo 17', start: '2026-10-05', end: '2026-11-09' },
  { id: 'cr-18', name: 'Criativo 18', start: '2026-10-05', end: '2026-11-16' },
  { id: 'cr-19', name: 'Criativo 19', start: '2026-10-05', end: '2026-12-01' },
  { id: 'cr-20', name: 'Criativo 20', start: '2026-10-05', end: '2026-12-14' },
  { id: 'cr-21', name: 'Criativo 21', start: '2026-11-02', end: null },
  { id: 'cr-22', name: 'Criativo 22', start: '2026-11-02', end: '2026-11-09' },
  { id: 'cr-23', name: 'Criativo 23', start: '2026-11-02', end: '2026-11-16' },
  { id: 'cr-24', name: 'Criativo 24', start: '2026-11-02', end: '2026-11-23' },
  { id: 'cr-25', name: 'Criativo 25', start: '2026-11-02', end: '2026-12-04' },
  { id: 'cr-26', name: 'Criativo 26', start: '2026-11-02', end: '2026-12-11' },
  { id: 'cr-27', name: 'Criativo 27', start: '2026-11-02', end: '2026-12-18' },
  { id: 'cr-28', name: 'Criativo 28', start: '2026-11-02', end: '2026-12-30' },
  { id: 'cr-29', name: 'Criativo 29', start: '2026-09-02', end: '2026-09-10' },
  { id: 'cr-30', name: 'Criativo 30', start: '2026-09-08', end: '2026-09-18' },
  { id: 'cr-31', name: 'Criativo 31', start: '2026-11-16', end: '2026-12-02' },
  { id: 'cr-32', name: 'Criativo 32', start: '2026-11-18', end: '2026-12-10' },
  { id: 'cr-33', name: 'Criativo 33', start: '2026-11-19', end: '2026-12-21' },
  { id: 'cr-34', name: 'Criativo 34', start: null, end: null },
  { id: 'cr-35', name: 'Criativo 35', start: null, end: '2026-10-30' },
];

/** Hoje, vindo do dado, nunca do relógio. */
export const today = '2026-11-20';
/** Eixo do período: primeiro e último dia, inclusive. */
export const windowStart = '2026-09-01';
export const windowEnd = '2026-12-31';
