/**
 * Dias corridos entre a criação da oportunidade e a primeira reunião realizada, no mês, para as 46
 * oportunidades que chegaram à reunião. Dado fictício e fixo: nenhuma pessoa ou empresa real.
 * O caso difícil está nas faixas de 2 dias: uma pilha alta (2 a 3 dias), faixas vazias no meio
 * (16 a 17 e 22 a 25 dias) e uma cauda isolada de 26 a 27 dias.
 */
export interface FirstMeeting {
  readonly id: string;
  readonly days: number;
}

/** Largura de cada faixa, em dias. Fixa no produto: a régua não muda quando o filtro muda. */
export const BIN_DAYS = 2;

/** Fim da régua em dias, múltiplo de `BIN_DAYS`. Oportunidade além dele fica fora, contada no rodapé. */
export const DOMAIN_DAYS = 28;

export const data: readonly FirstMeeting[] = [
  { id: 'opp-01', days: 0 },
  { id: 'opp-02', days: 0 },
  { id: 'opp-03', days: 1 },
  { id: 'opp-04', days: 1 },
  { id: 'opp-05', days: 2 },
  { id: 'opp-06', days: 2 },
  { id: 'opp-07', days: 2 },
  { id: 'opp-08', days: 2 },
  { id: 'opp-09', days: 2 },
  { id: 'opp-10', days: 3 },
  { id: 'opp-11', days: 3 },
  { id: 'opp-12', days: 3 },
  { id: 'opp-13', days: 3 },
  { id: 'opp-14', days: 4 },
  { id: 'opp-15', days: 4 },
  { id: 'opp-16', days: 4 },
  { id: 'opp-17', days: 4 },
  { id: 'opp-18', days: 4 },
  { id: 'opp-19', days: 5 },
  { id: 'opp-20', days: 5 },
  { id: 'opp-21', days: 5 },
  { id: 'opp-22', days: 6 },
  { id: 'opp-23', days: 6 },
  { id: 'opp-24', days: 6 },
  { id: 'opp-25', days: 6 },
  { id: 'opp-26', days: 7 },
  { id: 'opp-27', days: 7 },
  { id: 'opp-28', days: 7 },
  { id: 'opp-29', days: 8 },
  { id: 'opp-30', days: 8 },
  { id: 'opp-31', days: 8 },
  { id: 'opp-32', days: 9 },
  { id: 'opp-33', days: 9 },
  { id: 'opp-34', days: 10 },
  { id: 'opp-35', days: 10 },
  { id: 'opp-36', days: 11 },
  { id: 'opp-37', days: 11 },
  { id: 'opp-38', days: 12 },
  { id: 'opp-39', days: 13 },
  { id: 'opp-40', days: 13 },
  { id: 'opp-41', days: 14 },
  { id: 'opp-42', days: 15 },
  { id: 'opp-43', days: 18 },
  { id: 'opp-44', days: 18 },
  { id: 'opp-45', days: 20 },
  { id: 'opp-46', days: 27 },
];
