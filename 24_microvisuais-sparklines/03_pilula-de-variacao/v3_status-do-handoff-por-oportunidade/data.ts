/**
 * Oportunidades passadas da pré-vendas para o comercial (handoff) e o aceite de cada uma.
 * Dado fictício e fixo: as empresas são inventadas e as datas estão em YYYY-MM-DD.
 *
 * O caso difícil é a regra: fora do prazo é mais de 2 dias úteis sem aceite, contados do dia do
 * handoff. Uma oportunidade com exatos 2 dias úteis ainda está no prazo; uma aceita com 3 dias
 * úteis continua aceita, porque o aceite chegou; e uma sem data de handoff não tem prazo a contar.
 */

export interface HandoffOpportunity {
  readonly id: string;
  readonly name: string;
  /** Dia do handoff, ou `null` quando a pré-vendas não registrou a data. */
  readonly handoffDate: string | null;
  /** Dia do aceite pelo comercial, ou `null` enquanto estiver pendente. */
  readonly acceptedDate: string | null;
}

export interface HandoffQueue {
  /** Dia até o qual os pendentes são contados, em YYYY-MM-DD. */
  readonly referenceDate: string;
  /** Dias úteis sem aceite acima dos quais a oportunidade está fora do prazo. */
  readonly overdueAfterDays: number;
  readonly opportunities: readonly HandoffOpportunity[];
}

export const data: HandoffQueue = {
  referenceDate: '2026-10-02',
  overdueAfterDays: 2,
  opportunities: [
    { id: 'op-01', name: 'Transportadora Serra Azul', handoffDate: '2026-09-21', acceptedDate: '2026-09-22' },
    { id: 'op-02', name: 'Distribuidora de Autopeças Rio Claro', handoffDate: '2026-09-18', acceptedDate: null },
    { id: 'op-03', name: 'Clínica Odontológica Vale Verde', handoffDate: '2026-09-22', acceptedDate: '2026-09-22' },
    { id: 'op-04', name: 'Construtora Pedra Alta', handoffDate: '2026-09-24', acceptedDate: null },
    { id: 'op-05', name: 'Atacado Boa Vista', handoffDate: '2026-09-23', acceptedDate: '2026-09-25' },
    { id: 'op-06', name: 'Escola Horizonte', handoffDate: '2026-09-29', acceptedDate: null },
    { id: 'op-07', name: 'Agropecuária Campo Largo', handoffDate: '2026-09-24', acceptedDate: '2026-09-24' },
    { id: 'op-08', name: 'Laboratório Alvorada', handoffDate: '2026-09-30', acceptedDate: null },
    { id: 'op-09', name: 'Oficina Três Irmãos', handoffDate: '2026-09-25', acceptedDate: '2026-09-29' },
    { id: 'op-10', name: 'Metalúrgica Santa Clara', handoffDate: '2026-10-01', acceptedDate: null },
    { id: 'op-11', name: 'Mercado Central do Sul', handoffDate: '2026-09-25', acceptedDate: '2026-09-28' },
    { id: 'op-12', name: 'Farmácia do Bairro Norte', handoffDate: null, acceptedDate: null },
    { id: 'op-13', name: 'Madeireira Ipê Dourado', handoffDate: '2026-09-28', acceptedDate: '2026-10-01' },
    { id: 'op-14', name: 'Hotel Recanto das Águas', handoffDate: '2026-09-29', acceptedDate: '2026-09-30' },
    { id: 'op-15', name: 'Panificadora Trigo Fino', handoffDate: '2026-09-30', acceptedDate: '2026-10-02' },
    { id: 'op-16', name: 'Gráfica Ponto Cor', handoffDate: '2026-09-28', acceptedDate: '2026-09-29' },
  ],
};
