/**
 * Carteira de contas por executivo comercial, uma linha por conta, com o teto de contas por pessoa.
 * Dado fictício e fixo: nenhum nome é pessoa real, e o segmento de cada conta sai de um padrão de
 * resto determinístico, sem sorteio e sem relógio.
 *
 * Os casos difíceis: dois executivos passam do teto de 120 (um por 8 contas, outro por 1), um está
 * muito abaixo (49), e o agrupamento por segmento tem grupos maiores que qualquer carteira.
 */
export interface Executive {
  readonly id: string;
  readonly name: string;
  /** Contas na carteira. */
  readonly accounts: number;
}

export interface Segment {
  readonly id: string;
  readonly label: string;
  /** Posição fixa na paleta (1 a 6, que viram `--chart-1` a `--chart-6`): a cor é da categoria. */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface Account {
  /** Identificador da conta, estável entre agrupamentos e filtros. */
  readonly id: string;
  readonly executiveId: string;
  readonly segmentId: string;
}

export interface Portfolio {
  /** Teto de contas por executivo. */
  readonly ceiling: number;
  readonly executives: readonly Executive[];
  readonly segments: readonly Segment[];
  readonly accounts: readonly Account[];
}

const executives: readonly Executive[] = [
  { id: 'talita-v', name: 'Talita V.', accounts: 128 },
  { id: 'murilo-c', name: 'Murilo C.', accounts: 121 },
  { id: 'renan-a', name: 'Renan A.', accounts: 100 },
  { id: 'bianca-s', name: 'Bianca S.', accounts: 90 },
  { id: 'otavio-m', name: 'Otávio M.', accounts: 78 },
  { id: 'helena-p', name: 'Helena P.', accounts: 49 },
];

const segments: readonly Segment[] = [
  { id: 'industria', label: 'Indústria', slot: 1 },
  { id: 'varejo', label: 'Varejo', slot: 3 },
  { id: 'servicos', label: 'Serviços', slot: 6 },
];

/** Reparte as contas em três segmentos de tamanho quase igual: o resto de serial * 5 por 12 percorre os 12 valores, 4 para cada segmento. */

function buildAccounts(): readonly Account[] {
  const accounts: Account[] = [];
  let serial = 0;
  for (const executive of executives) {
    for (let k = 0; k < executive.accounts; k += 1) {
      serial += 1;
      const segment = segments[Math.floor(((serial * 5) % 12) / 4)];
      accounts.push({ id: `C-${String(1000 + serial)}`, executiveId: executive.id, segmentId: segment?.id ?? 'industria' });
    }
  }
  return accounts;
}

export const data: Portfolio = { ceiling: 120, executives, segments, accounts: buildAccounts() };
