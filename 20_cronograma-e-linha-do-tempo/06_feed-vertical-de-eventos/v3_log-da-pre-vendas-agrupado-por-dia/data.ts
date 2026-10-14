/**
 * Log fictício de 64 atividades da pré-vendas entre 2026-11-09 e 2026-11-13.
 * Dado fixo e sem sorteio: a mistura de tipos vem de uma conta sobre o índice, então o render é
 * sempre o mesmo. Nenhuma pessoa, fila ou empresa é real.
 */
export type ActivityKind = 'call' | 'email' | 'meeting' | 'note';

export interface Activity {
  readonly id: string;
  readonly day: string;
  readonly kind: ActivityKind;
  readonly title: string;
  readonly author: string;
  readonly queue: string;
}

export interface ActivityLog {
  readonly from: string;
  readonly to: string;
  readonly activities: readonly Activity[];
}

const KINDS: readonly ActivityKind[] = ['call', 'email', 'meeting', 'note'];

const TITLES: Record<ActivityKind, readonly string[]> = {
  call: ['Ligação de primeiro contato', 'Ligação de retorno', 'Ligação de qualificação', 'Ligação de confirmação'],
  email: ['E-mail de apresentação', 'E-mail com proposta', 'E-mail de acompanhamento', 'E-mail de agendamento'],
  meeting: ['Reunião de diagnóstico', 'Reunião de demonstração', 'Reunião de alinhamento'],
  note: ['Nota de qualificação', 'Nota de objeção', 'Nota de próximo passo'],
};

const AUTHORS: readonly string[] = ['Bruna L.', 'Caio M.', 'Dara S.', 'Elias P.', 'Flávia R.', 'Gil T.'];
const QUEUES: readonly string[] = ['Fila Norte', 'Fila Sul', 'Fila Centro'];

/** Atividades de cada dia útil da semana; a soma fecha em 64. */
const DAY_TOTALS: readonly { readonly day: string; readonly total: number }[] = [
  { day: '2026-11-09', total: 14 },
  { day: '2026-11-10', total: 13 },
  { day: '2026-11-11', total: 15 },
  { day: '2026-11-12', total: 12 },
  { day: '2026-11-13', total: 10 },
];

function buildActivities(): readonly Activity[] {
  let sequence = 0;
  return DAY_TOTALS.flatMap(({ day, total }) =>
    Array.from({ length: total }, (): Activity => {
      const n = sequence;
      sequence += 1;
      const kind = KINDS[(n * 5 + Math.floor(n / 4)) % KINDS.length] ?? 'call';
      const titles = TITLES[kind];
      return {
        id: `at-${String(n + 1).padStart(2, '0')}`,
        day,
        kind,
        title: titles[n % titles.length] ?? 'Atividade',
        author: AUTHORS[(n * 3) % AUTHORS.length] ?? 'Sem autor',
        queue: QUEUES[n % QUEUES.length] ?? 'Sem fila',
      };
    }),
  );
}

export const data: ActivityLog = {
  from: '2026-11-09',
  to: '2026-11-13',
  activities: buildActivities(),
};
