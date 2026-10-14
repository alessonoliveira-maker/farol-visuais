/**
 * Fila de uma SDR em 2026-10-06: 64 leads, cada um com o prazo restante do SLA de primeiro contato
 * (em horas, negativo quando já venceu) e o valor potencial em reais (`null` quando ninguém estimou).
 * Dado fictício e fixo, gerado por contas inteiras, sem sorteio. A caixa de cada lead NÃO mora aqui:
 * o componente a deriva pela regra de SLA e valor.
 */
export interface QueueLead {
  readonly id: string;
  readonly name: string;
  readonly slaHours: number;
  readonly value: number | null;
}

const FIRST = ['Oficina', 'Locadora', 'Mercado', 'Clínica', 'Escola', 'Padaria', 'Gráfica', 'Hotel', 'Agência', 'Estúdio', 'Fazenda', 'Armazém', 'Cantina'] as const;
const SECOND = ['Aurora', 'Serra', 'Litoral', 'Planalto', 'Ipê', 'Cedro', 'Vale Verde', 'Boa Vista', 'Delta', 'Horizonte'] as const;

interface Group {
  /** Quantos leads o grupo cria. */
  readonly count: number;
  /** Quantos deles já vencidos. Só vale para grupo urgente. */
  readonly overdue: number;
  readonly urgent: boolean;
  /** `high` é valor de R$ 50 mil para cima, `low` abaixo, `none` é sem estimativa. */
  readonly value: 'high' | 'low' | 'none';
}

const GROUPS: readonly Group[] = [
  { count: 18, overdue: 5, urgent: true, value: 'high' },
  { count: 21, overdue: 0, urgent: false, value: 'high' },
  { count: 12, overdue: 3, urgent: true, value: 'low' },
  { count: 7, overdue: 0, urgent: false, value: 'low' },
  { count: 6, overdue: 1, urgent: true, value: 'none' },
];

function build(): readonly QueueLead[] {
  const leads: QueueLead[] = [];
  GROUPS.forEach((group) => {
    for (let k = 0; k < group.count; k += 1) {
      const n = leads.length;
      const slaHours = group.urgent
        ? k < group.overdue
          ? -(2 + ((k * 7 + 3) % 26))
          : 1 + ((k * 5 + 2) % 23)
        : 26 + ((k * 13 + 5) % 130);
      const value =
        group.value === 'none' ? null : group.value === 'high' ? 52_000 + ((k * 37) % 34) * 5_000 : 4_000 + ((k * 29) % 9) * 5_000;
      leads.push({
        id: `fila-${String(1000 + n)}`,
        name: `${FIRST[n % FIRST.length] ?? ''} ${SECOND[(n * 3 + 1) % SECOND.length] ?? ''}`,
        slaHours,
        value,
      });
    }
  });
  return leads;
}

export const data: readonly QueueLead[] = build();
