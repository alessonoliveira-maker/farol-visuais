/**
 * Anotações de oportunidades perdidas em 2026-T3 que citam o termo concorrente, 15 das 22
 * ocorrências do recorte. O texto é o da anotação inteira, sem nome de pessoa, empresa ou
 * contato; o componente localiza o termo, ordena e agrupa. Inclui grafia sem acento (ja) para
 * provar que a ordenação usa a chave sem acento. Dado fictício e fixo.
 */
export interface LossNote {
  readonly id: string;
  readonly text: string;
}

export interface ConcordanceData {
  readonly term: string;
  /** Anotações do recorte inteiro que citam o termo, além das que vêm em `notes`. */
  readonly totalOccurrences: number;
  readonly notes: readonly LossNote[];
}

export const data: ConcordanceData = {
  term: 'concorrente',
  totalOccurrences: 22,
  notes: [
    { id: 'perda-01', text: 'Cliente contou que o concorrente mais barato fechou o orçamento em um dia.' },
    { id: 'perda-02', text: 'Diretor disse que o concorrente já atende a filial vizinha e não quer trocar.' },
    { id: 'perda-03', text: 'Pelo que entendi, o concorrente ofereceu entrada reduzida e parcelamento longo.' },
    { id: 'perda-04', text: 'Gerente achou o concorrente mais rápido na resposta e na vistoria técnica.' },
    { id: 'perda-05', text: 'Para cobrir a nossa proposta, o concorrente cobriu o desconto de 8% sem pedir contrapartida.' },
    { id: 'perda-06', text: 'Segundo o comprador, o concorrente entregou a proposta em dois dias.' },
    { id: 'perda-07', text: 'Sócio avisou que o concorrente ja atende outras duas unidades do grupo.' },
    { id: 'perda-08', text: 'Frisou que o concorrente mais barato não inclui a manutenção no primeiro ano.' },
    { id: 'perda-09', text: 'Ouvimos na visita que o concorrente tem estoque imediato do modelo pedido.' },
    { id: 'perda-10', text: 'Equipe de compras lembrou que o concorrente ofereceu o seguro sem custo adicional.' },
    { id: 'perda-11', text: 'Segundo o gerente, o concorrente já atende a região e dispensa o deslocamento.' },
    { id: 'perda-12', text: 'Soubemos depois que o concorrente tem equipe técnica local, a dez minutos da loja.' },
    { id: 'perda-13', text: 'Cliente reclamou que o concorrente mais barato demorou menos para entregar.' },
    { id: 'perda-14', text: 'Na última ligação, o concorrente entregou a documentação completa antes de nós.' },
    { id: 'perda-15', text: 'Disse que o concorrente ofereceu a troca do usado por um valor melhor.' },
  ],
};
