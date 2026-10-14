/**
 * Perdas do trimestre por motivo, em contagem de oportunidades perdidas, com dois níveis: o motivo
 * e, nos que se abrem, os submotivos.
 * Dado fictício e fixo: nenhum motivo cita empresa real.
 *
 * A regra da cauda mora NO DADO, em `tailMaxLosses`: motivo com menos perdas que isso não ganha
 * fatia própria e entra no motivo de `slot` nulo, que a peça pinta em neutro e nomeia "Outros".
 * Assim o critério de agrupamento é escrito na tela em vez de ficar só no comentário do código.
 *
 * Invariante que a peça confere em TypeScript antes de desenhar: no motivo que se abre, `losses` é
 * a soma dos `submotives`. Total de pai que não fecha com os filhos seria hierarquia mentindo, e a
 * peça troca o gráfico por um aviso em vez de desenhar.
 */
export interface LossSubmotive {
  readonly id: string;
  readonly name: string;
  readonly losses: number;
  /** Slot categórico fixo (índice em CHART_SERIES_COLORS), na ordem da COR-8. */
  readonly slot: number;
}

export interface LossMotive {
  readonly id: string;
  readonly name: string;
  /** `null` é o neutro da cauda: "Outros" nunca recebe cor categórica. */
  readonly slot: number | null;
  readonly losses: number;
  /** Submotivos do drilldown; lista vazia é motivo que não se abre. */
  readonly submotives: readonly LossSubmotive[];
}

export interface LossDrilldownData {
  readonly motives: readonly LossMotive[];
  /** Teto da cauda: abaixo deste número de perdas o motivo vai para "Outros". */
  readonly tailMaxLosses: number;
  /** Rótulo do período, já em forma de tela, com o ordinal da NUM-7. */
  readonly periodLabel: string;
}

export const data: LossDrilldownData = {
  motives: [
    {
      id: 'preco',
      name: 'Preço',
      slot: 0,
      losses: 86,
      submotives: [
        { id: 'acima-do-orcamento', name: 'Acima do orçamento', losses: 41, slot: 0 },
        { id: 'taxa-de-administracao', name: 'Taxa de administração', losses: 28, slot: 2 },
        { id: 'ticket-minimo', name: 'Ticket mínimo', losses: 17, slot: 5 },
      ],
    },
    { id: 'sem-decisor', name: 'Sem decisor no processo', slot: 2, losses: 52, submotives: [] },
    { id: 'timing', name: 'Timing da decisão', slot: 5, losses: 41, submotives: [] },
    { id: 'concorrente', name: 'Concorrente escolhido', slot: 4, losses: 26, submotives: [] },
    {
      id: 'outros',
      name: 'Outros',
      slot: null,
      losses: 21,
      submotives: [
        { id: 'sem-retorno', name: 'Sem retorno após proposta', losses: 9, slot: 0 },
        { id: 'mudanca-de-gestao', name: 'Mudança de gestão', losses: 7, slot: 2 },
        { id: 'restricao-regulatoria', name: 'Restrição regulatória', losses: 5, slot: 5 },
      ],
    },
  ],
  tailMaxLosses: 10,
  periodLabel: '3º trimestre',
};

/**
 * Nível aberto na primeira renderização. Existe porque o render do catálogo não captura clique: sem
 * ele o preview mostraria só o nível de cima e o drilldown ficaria invisível na galeria.
 */
export const initialFocusId = 'preco';
