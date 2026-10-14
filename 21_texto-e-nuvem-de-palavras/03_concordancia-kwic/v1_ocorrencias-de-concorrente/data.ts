/**
 * Anotações livres de oportunidades perdidas em 2026-T3 que citam o termo concorrente.
 * Cada linha é o texto inteiro da anotação, sem nome de pessoa, empresa ou contato; o
 * componente localiza o termo e corta o contexto. As 20 primeiras por data de perda estão
 * aqui, de um total de 31 ocorrências no recorte. Dado fictício e fixo.
 */
export interface LossNote {
  readonly id: string;
  readonly text: string;
}

export interface ConcordanceData {
  readonly term: string;
  /** Quantas anotações do recorte inteiro citam o termo, além das que vêm em `notes`. */
  readonly totalOccurrences: number;
  readonly notes: readonly LossNote[];
}

export const data: ConcordanceData = {
  term: 'concorrente',
  totalOccurrences: 31,
  notes: [
    { id: 'perda-01', text: 'Cliente optou pelo concorrente porque o prazo de entrega era menor em cinco dias.' },
    { id: 'perda-02', text: 'Concorrente ofereceu entrada reduzida e parcelamento sem juros no primeiro ano.' },
    { id: 'perda-03', text: 'Depois de três reuniões de diagnóstico e de uma proposta revisada duas vezes, o comprador avisou que fechou com o concorrente na semana seguinte.' },
    { id: 'perda-04', text: 'Diretor disse que o concorrente já atende a filial vizinha e não quer trocar de fornecedor.' },
    { id: 'perda-05', text: 'Sem verba neste trimestre, adiou a compra e comparou nossa proposta com a do concorrente mais barato.' },
    { id: 'perda-06', text: 'Visitou o showroom do concorrente e gostou do atendimento da equipe técnica.' },
    { id: 'perda-07', text: 'Pediu desconto de 8% para cobrir a oferta do concorrente, que não conseguimos igualar.' },
    { id: 'perda-08', text: 'O concorrente entregou a proposta em dois dias, e a nossa levou nove.' },
    { id: 'perda-09', text: 'Contrato anterior com o concorrente só vence em março, então o cliente prefere esperar.' },
    { id: 'perda-10', text: 'Na última ligação, o gerente confirmou a assinatura com o concorrente e agradeceu o contato.' },
    { id: 'perda-11', text: 'Equipe de compras achou nosso prazo de pagamento curto frente ao concorrente.' },
    { id: 'perda-12', text: 'Indicação de um parceiro levou o cliente ao concorrente antes da nossa visita.' },
    { id: 'perda-13', text: 'Não respondeu mais depois que o concorrente apresentou um modelo equivalente em estoque.' },
    { id: 'perda-14', text: 'Comparou a garantia estendida com a do concorrente e achou a nossa menos clara.' },
    { id: 'perda-15', text: 'Marcou nova reunião para rever condições, mas já tinha pedido orçamento ao concorrente.' },
    { id: 'perda-16', text: 'Alegou que o concorrente aceita o usado na troca por um valor melhor que o nosso.' },
    { id: 'perda-17', text: 'Perdemos o negócio por três dias de atraso; o concorrente agendou a entrega para a mesma semana.' },
    { id: 'perda-18', text: 'Sócio prefere trabalhar com o concorrente por costume antigo da família.' },
    { id: 'perda-19', text: 'Relatou que o concorrente incluiu o seguro no primeiro ano sem custo adicional.' },
    { id: 'perda-20', text: 'Fechou com o concorrente.' },
  ],
};
