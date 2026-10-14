/**
 * Uso de agosto de 2026 das quatro filas da pré-vendas e da carteira de vendas contra o teto
 * mensal de cada uma, em contagem: entradas na fila no mês ou contas ativas na carteira.
 * Dado fictício e fixo: nenhuma pessoa nem empresa real.
 *
 * A ordem é a do processo (da primeira fila à carteira), não a do uso: o componente não reordena.
 * `ceilingSource` diz de onde vem o teto: `medido` é a média de seis meses de vazão real; `premissa`
 * é valor de planilha de capacidade, sem medição. `usage: null` é fila sem coleta; `ceiling: null`,
 * fila sem teto declarado (a régua fica neutra e nada é julgado).
 */
export type CeilingSource = 'medido' | 'premissa';

export interface QueueCapacity {
  readonly id: string;
  readonly name: string;
  /** Substantivo da contagem, no plural: "entradas", "contas". */
  readonly unit: string;
  readonly usage: number | null;
  readonly ceiling: number | null;
  readonly ceilingSource: CeilingSource;
}

export const data: readonly QueueCapacity[] = [
  { id: 'fila-primeiro-contato', name: 'Primeiro contato', unit: 'entradas', usage: 186, ceiling: 160, ceilingSource: 'premissa' },
  { id: 'fila-qualificacao', name: 'Qualificação por telefone', unit: 'entradas', usage: 131, ceiling: 150, ceilingSource: 'medido' },
  { id: 'fila-agendamento', name: 'Agendamento de reunião', unit: 'entradas', usage: 58, ceiling: 90, ceilingSource: 'premissa' },
  { id: 'fila-reengajamento', name: 'Reengajamento de base antiga', unit: 'entradas', usage: 44, ceiling: 40, ceilingSource: 'premissa' },
  { id: 'carteira-vendas', name: 'Carteira de vendas', unit: 'contas', usage: 142, ceiling: 150, ceilingSource: 'medido' },
];

/** Mês da fotografia, YYYY-MM. */
export const month = '2026-08';

/** Corte de atenção declarado pelo negócio: a partir de 85% do próprio teto. */
export const attentionFrom = 0.85;
