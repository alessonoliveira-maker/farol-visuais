/**
 * Os cinco maiores motivos de perda da Comercial no 3º trimestre de 2026 e os verbatins de cada
 * um, com a contagem de respostas parecidas por verbatim. Dado fictício e fixo: as frases são
 * inventadas, sem pessoa, empresa, e-mail ou telefone.
 *
 * Os casos difíceis: os verbatins do motivo escolhido vêm FORA da ordem da parcela, para o
 * componente ordenar; os motivos têm 5, 3, 3, 2 e 0 verbatins, e o último cai no estado vazio em
 * vez de inventar uma citação.
 */
export interface LossVerbatim {
  readonly id: string;
  readonly text: string;
  /** Respostas do motivo parecidas com esta, ela inclusa. */
  readonly similarCount: number;
  /** Desfecho da oportunidade, em minúsculas, para entrar no meio de frase. */
  readonly outcome: string;
  /** Mês da resposta, YYYY-MM. */
  readonly month: string;
}

export interface LossReason {
  readonly id: string;
  /** Nome para o seletor, com a inicial maiúscula. */
  readonly chip: string;
  /** Nome em minúsculas, para entrar no meio de frase. */
  readonly label: string;
  /** Respostas de perda que citam o motivo. */
  readonly responseCount: number;
  readonly verbatims: readonly LossVerbatim[];
}

export interface LossReasons {
  /** Primeiro mês do período, YYYY-MM. */
  readonly periodStart: string;
  /** Último mês do período, YYYY-MM. */
  readonly periodEnd: string;
  /** Todas as respostas de perda do período, de qualquer motivo. */
  readonly totalResponses: number;
  /** Motivo aberto de início. */
  readonly selectedId: string;
  readonly reasons: readonly LossReason[];
}

export const data: LossReasons = {
  periodStart: '2026-07',
  periodEnd: '2026-09',
  totalResponses: 312,
  selectedId: 'preco',
  reasons: [
    {
      id: 'preco',
      chip: 'Preço',
      label: 'preço',
      responseCount: 96,
      verbatims: [
        { id: 'p3', text: 'Sem desconto para pagamento à vista, o comitê não aprovou.', similarCount: 14, outcome: 'perdida por preço', month: '2026-09' },
        { id: 'p1', text: 'A mensalidade ficou acima do que a gente orçou para o ano, e não havia como diluir.', similarCount: 22, outcome: 'fechou com concorrente', month: '2026-09' },
        { id: 'p5', text: 'Ficou caro para o tamanho da carteira que temos hoje.', similarCount: 6, outcome: 'perdida por preço', month: '2026-08' },
        { id: 'p2', text: 'Gostamos do plano, mas outra proposta veio com taxa menor para o mesmo patrimônio.', similarCount: 17, outcome: 'fechou com concorrente', month: '2026-08' },
        { id: 'p4', text: 'O valor total só apareceu no fim, e aí já estava fora da faixa que a gente tinha.', similarCount: 9, outcome: 'sem decisão', month: '2026-07' },
      ],
    },
    {
      id: 'implantacao',
      chip: 'Implantação',
      label: 'prazo de implantação',
      responseCount: 61,
      verbatims: [
        { id: 'i1', text: 'Precisávamos começar em outubro, e o cronograma só abria vaga em janeiro.', similarCount: 19, outcome: 'adiada pelo cliente', month: '2026-09' },
        { id: 'i2', text: 'Não dava para ficar três meses esperando a migração da carteira.', similarCount: 11, outcome: 'fechou com concorrente', month: '2026-08' },
        { id: 'i3', text: 'O prazo de implantação passou do que o conselho tinha autorizado.', similarCount: 7, outcome: 'sem decisão', month: '2026-07' },
      ],
    },
    {
      id: 'retorno',
      chip: 'Sem retorno',
      label: 'falta de retorno do cliente',
      responseCount: 52,
      verbatims: [
        { id: 'r1', text: 'Mandei a proposta revisada duas vezes e a resposta nunca veio.', similarCount: 24, outcome: 'sem decisão', month: '2026-09' },
        { id: 'r2', text: 'O contato mudou de área no meio da negociação e ninguém assumiu.', similarCount: 8, outcome: 'sem decisão', month: '2026-08' },
        { id: 'r3', text: 'Depois da apresentação, o cliente parou de atender as ligações.', similarCount: 5, outcome: 'sem decisão', month: '2026-07' },
      ],
    },
    {
      id: 'concorrente',
      chip: 'Concorrente',
      label: 'oferta do concorrente',
      responseCount: 47,
      verbatims: [
        { id: 'c1', text: 'Já tinham relacionamento antigo com o outro gestor e preferiram manter.', similarCount: 13, outcome: 'fechou com concorrente', month: '2026-09' },
        { id: 'c2', text: 'A outra casa ofereceu atendimento no mesmo prédio, e isso decidiu.', similarCount: 10, outcome: 'fechou com concorrente', month: '2026-08' },
      ],
    },
    {
      id: 'pagamento',
      chip: 'Pagamento',
      label: 'condição de pagamento',
      responseCount: 31,
      verbatims: [],
    },
  ],
};
