/**
 * Iniciativas do plano de 2027 contra a linha de base: o período planejado (início e fim
 * inclusive), o percentual concluído informado pela equipe e as datas reais. Uma das seis não
 * tem plano registrado e só carrega o realizado.
 * Dado fictício e fixo: nenhuma iniciativa é de projeto real.
 */
export interface Initiative {
  readonly id: string;
  readonly name: string;
  /** Início planejado, em YYYY-MM-DD; `null` quando não há plano registrado. */
  readonly planStart: string | null;
  /** Fim planejado, em YYYY-MM-DD; `null` quando não há plano registrado. */
  readonly planEnd: string | null;
  /** Primeiro dia de trabalho de fato, em YYYY-MM-DD; `null` quando ainda não começou. */
  readonly actualStart: string | null;
  /** Dia em que terminou de fato; `null` enquanto está em andamento. */
  readonly actualEnd: string | null;
  /** Fração concluída, de 0 a 1; `null` quando ninguém informou. */
  readonly percent: number | null;
}

export const data: readonly Initiative[] = [
  { id: 'ini-01', name: 'Painel comercial', planStart: '2027-01-11', planEnd: '2027-03-31', actualStart: '2027-01-11', actualEnd: '2027-04-12', percent: 1 },
  { id: 'ini-02', name: 'Revisão de contratos', planStart: '2027-01-04', planEnd: '2027-02-26', actualStart: '2027-01-05', actualEnd: '2027-02-24', percent: 1 },
  { id: 'ini-03', name: 'Reativação por e-mail', planStart: '2027-03-01', planEnd: '2027-04-02', actualStart: '2027-03-01', actualEnd: null, percent: 0.85 },
  { id: 'ini-04', name: 'Cadência de pré-vendas', planStart: '2027-02-01', planEnd: '2027-05-14', actualStart: '2027-02-03', actualEnd: null, percent: 0.58 },
  { id: 'ini-05', name: 'Painel de campanhas', planStart: '2027-03-15', planEnd: '2027-06-30', actualStart: '2027-03-22', actualEnd: null, percent: 0.3 },
  { id: 'ini-06', name: 'Metas por equipe', planStart: null, planEnd: null, actualStart: '2027-02-08', actualEnd: null, percent: null },
];

/** Hoje, vindo do dado, nunca do relógio. */
export const today = '2027-04-15';
/** Eixo do semestre: primeiro dia e último dia, inclusive. */
export const windowStart = '2027-01-01';
export const windowEnd = '2027-06-30';
