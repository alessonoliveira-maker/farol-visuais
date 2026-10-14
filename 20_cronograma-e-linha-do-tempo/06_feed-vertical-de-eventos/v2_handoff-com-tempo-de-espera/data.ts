/**
 * Passagens de dono da oportunidade fictícia OP-0388 entre SDR, executivo e operações.
 * Dado fictício e fixo: nenhuma pessoa ou empresa é real. A espera de cada passagem não vem
 * escrita: o componente a calcula até o primeiro evento do novo dono, ou até a data de referência
 * quando ninguém retomou ainda.
 */
export type EventKind = 'call' | 'email' | 'meeting' | 'document' | 'handoff';

export interface HandoffEvent {
  readonly id: string;
  readonly kind: EventKind;
  readonly title: string;
  readonly author: string;
  readonly at: string;
  readonly detail: string;
  /** Só nas passagens: quem recebe a oportunidade. */
  readonly receiver?: string;
}

export interface HandoffFeed {
  readonly opportunity: string;
  readonly referenceDate: string;
  /** Limite de espera sem dono, em dias. */
  readonly slaDays: number;
  readonly events: readonly HandoffEvent[];
}

export const data: HandoffFeed = {
  opportunity: 'OP-0388',
  referenceDate: '2026-10-03',
  slaDays: 2,
  events: [
    { id: 'ev-1', kind: 'email', title: 'Primeiro contato por e-mail', author: 'Bruna L.', at: '2026-09-01', detail: 'SDR respondeu ao pedido de cotação do site.' },
    { id: 'ev-2', kind: 'call', title: 'Ligação de qualificação', author: 'Bruna L.', at: '2026-09-04', detail: 'Orçamento aprovado e prazo de 60 dias para decidir.' },
    { id: 'ev-3', kind: 'handoff', title: 'Passagem do SDR para o executivo', author: 'Bruna L.', receiver: 'Caio M.', at: '2026-09-08', detail: 'Do SDR Bruna L. para o executivo Caio M.' },
    { id: 'ev-4', kind: 'meeting', title: 'Reunião de descoberta', author: 'Caio M.', at: '2026-09-11', detail: 'Levantou três filiais e o sistema atual de pedidos.' },
    { id: 'ev-5', kind: 'handoff', title: 'Passagem do executivo para operações', author: 'Caio M.', receiver: 'Dara S.', at: '2026-09-16', detail: 'Do executivo Caio M. para operações, com Dara S.' },
    { id: 'ev-6', kind: 'document', title: 'Checklist de implantação', author: 'Dara S.', at: '2026-09-17', detail: 'Listou integrações, acessos e prazos por filial.' },
    { id: 'ev-7', kind: 'handoff', title: 'Devolução de operações ao executivo', author: 'Dara S.', receiver: 'Caio M.', at: '2026-09-21', detail: 'Operações devolveu para Caio M. por falta de contrato.' },
    { id: 'ev-8', kind: 'call', title: 'Retomada com o cliente', author: 'Caio M.', at: '2026-09-28', detail: 'Cliente confirmou o contrato para a semana seguinte.' },
    { id: 'ev-9', kind: 'handoff', title: 'Nova passagem para operações', author: 'Caio M.', receiver: 'Dara S.', at: '2026-10-01', detail: 'Contrato assinado; de Caio M. para operações.' },
  ],
};
