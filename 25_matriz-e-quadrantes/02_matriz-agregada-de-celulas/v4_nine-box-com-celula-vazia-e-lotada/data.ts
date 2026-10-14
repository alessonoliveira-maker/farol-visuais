/**
 * 60 contas avaliadas pelo time comercial em 2026-10 por potencial e relacionamento, em notas de 0
 * a 10 com uma casa. As duas notas são JULGAMENTO do time, não medição. `potential` e
 * `relationship` são `null` quando a conta ainda não foi avaliada. `outlook` é a posição prevista
 * para daqui a 12 meses. Dado fictício e fixo, gerado por contas inteiras, sem sorteio.
 */
export type Outlook = 'up' | 'flat' | 'down';

export interface RatedAccount {
  readonly id: string;
  readonly name: string;
  readonly potential: number | null;
  readonly relationship: number | null;
  readonly outlook: Outlook;
}

const FIRST = ['Oficina', 'Locadora', 'Mercado', 'Clínica', 'Escola', 'Padaria', 'Gráfica', 'Hotel', 'Agência', 'Estúdio', 'Fazenda', 'Armazém'] as const;
const SECOND = ['Aurora', 'Serra', 'Litoral', 'Planalto', 'Ipê', 'Cedro', 'Alvorada', 'Boa Vista', 'Delta', 'Horizonte'] as const;
const OUTLOOKS: readonly Outlook[] = ['up', 'flat', 'down', 'flat'];

/** Faixa de nota de cada eixo: baixo abaixo de 4, médio de 4 a 6,9, alto de 7 em diante. */
type Band = readonly [number, number];
const LOW: Band = [1.2, 3.9];
const MID: Band = [4, 6.9];
const HIGH: Band = [7, 9.6];

interface Group {
  readonly potential: Band | null;
  readonly relationship: Band | null;
  readonly count: number;
}

/** Célula do centro lotada (41), baixo potencial com relacionamento fraco vazia, três sem avaliação. */
const GROUPS: readonly Group[] = [
  { potential: HIGH, relationship: LOW, count: 2 },
  { potential: HIGH, relationship: MID, count: 3 },
  { potential: HIGH, relationship: HIGH, count: 4 },
  { potential: MID, relationship: LOW, count: 3 },
  { potential: MID, relationship: MID, count: 41 },
  { potential: MID, relationship: HIGH, count: 2 },
  { potential: LOW, relationship: MID, count: 1 },
  { potential: LOW, relationship: HIGH, count: 1 },
  { potential: null, relationship: null, count: 3 },
];

function pick(band: Band, seed: number): number {
  const steps = Math.round((band[1] - band[0]) * 10);
  return Math.round(band[0] * 10 + ((seed * 37) % (steps + 1))) / 10;
}

function build(): readonly RatedAccount[] {
  const accounts: RatedAccount[] = [];
  for (const group of GROUPS) {
    for (let k = 0; k < group.count; k += 1) {
      const n = accounts.length;
      accounts.push({
        id: `conta-${String(200 + n)}`,
        name: `${FIRST[n % FIRST.length] ?? ''} ${SECOND[(n * 3 + 1) % SECOND.length] ?? ''}`,
        potential: group.potential === null ? null : pick(group.potential, n + k),
        relationship: group.relationship === null ? null : pick(group.relationship, n * 3 + k),
        outlook: OUTLOOKS[n % OUTLOOKS.length] ?? 'flat',
      });
    }
  }
  return accounts;
}

export const data: readonly RatedAccount[] = build();
