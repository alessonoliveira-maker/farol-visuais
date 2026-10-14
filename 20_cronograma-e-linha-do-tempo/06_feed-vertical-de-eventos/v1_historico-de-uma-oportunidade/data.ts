/**
 * Histórico da oportunidade fictícia OP-0412, com 10 eventos de quatro tipos.
 * Dado fictício e fixo: nenhuma pessoa ou empresa é real. A ordem do array é de propósito
 * embaralhada: quem ordena é o componente, do mais recente para o mais antigo.
 */
export type EventKind = 'call' | 'email' | 'meeting' | 'document';

export interface OpportunityEvent {
  readonly id: string;
  readonly kind: EventKind;
  readonly title: string;
  readonly author: string;
  readonly at: string;
  readonly detail: string;
}

export interface OpportunityHistory {
  readonly opportunity: string;
  readonly company: string;
  /** Data de referência do dado: a data relativa de todos os eventos conta a partir dela. */
  readonly referenceDate: string;
  readonly events: readonly OpportunityEvent[];
}

export const data: OpportunityHistory = {
  opportunity: 'OP-0412',
  company: 'Distribuidora Horizonte Sul',
  referenceDate: '2026-09-30',
  events: [
    { id: 'ev-03', kind: 'call', title: 'Ligação de qualificação', author: 'Talita V.', at: '2026-08-04', detail: 'Frota de 38 veículos; decisão passa pela diretoria.' },
    { id: 'ev-01', kind: 'email', title: 'Contato inicial por e-mail', author: 'Talita V.', at: '2026-07-28', detail: 'Resposta ao formulário do site pedindo cotação.' },
    { id: 'ev-09', kind: 'meeting', title: 'Reunião de proposta revisada', author: 'Murilo C.', at: '2026-09-28', detail: 'Cliente pediu ajuste na implantação; retorno na semana.' },
    { id: 'ev-05', kind: 'meeting', title: 'Diagnóstico com a operação', author: 'Murilo C.', at: '2026-08-19', detail: 'Mapeou três filiais e o fluxo atual de cotação.' },
    { id: 'ev-07', kind: 'email', title: 'Envio dos cases do setor', author: 'Murilo C.', at: '2026-09-02', detail: 'Dois casos de distribuição com resultado medido.' },
    { id: 'ev-02', kind: 'document', title: 'Briefing registrado', author: 'Talita V.', at: '2026-07-30', detail: 'Resumo do pedido, volume estimado e prazo desejado.' },
    { id: 'ev-10', kind: 'call', title: 'Ligação de confirmação', author: 'Murilo C.', at: '2026-09-29', detail: 'Confirmou a participação do financeiro na próxima reunião.' },
    { id: 'ev-06', kind: 'document', title: 'Proposta comercial enviada', author: 'Murilo C.', at: '2026-08-26', detail: 'Proposta v1 com três cenários de volume.' },
    { id: 'ev-04', kind: 'meeting', title: 'Apresentação para a diretoria', author: 'Talita V.', at: '2026-08-12', detail: 'Cinco participantes; pediram prova de conceito curta.' },
    { id: 'ev-08', kind: 'call', title: 'Ligação sobre prazos', author: 'Murilo C.', at: '2026-09-15', detail: 'Alinhou a data de início e as condições de pagamento.' },
  ],
};
