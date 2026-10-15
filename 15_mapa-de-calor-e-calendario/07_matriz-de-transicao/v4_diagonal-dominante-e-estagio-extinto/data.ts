/**
 * Movimentos entre etapas do funil num trimestre em que o processo mudou, em contagem de
 * movimentos. Dado fictício e fixo, montado para exercitar quatro casos difíceis ao mesmo tempo.
 *
 * A permanência domina: quatro em cada cinco movimentos são de quem ficou onde estava, e por isso a
 * diagonal fica fora do domínio da cor. A etapa Contrato não recebeu nem soltou ninguém no período,
 * então a linha dela é vazia de verdade, não ausente. A etapa Negócio tem base pequena, doze
 * movimentos, e percentual sobre doze não sustenta comparação. E a etapa Triagem foi extinta no meio
 * do trimestre: ela continua no histórico como destino, e nunca mais recebe movimento novo.
 *
 * Os movimentos para estado fora do dicionário são contados à parte, e não descartados em silêncio:
 * descartar sem dizer faz o total da matriz divergir do total do funil sem explicação nenhuma.
 */
export interface StageDefinition {
  readonly id: string;
  readonly label: string;
}

/** Etapas vivas do funil, na ordem. Valem como linha e como coluna. */
export const STAGES: readonly StageDefinition[] = [
  { id: 'contato', label: 'Contato' },
  { id: 'avaliacao', label: 'Avaliação' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'negocio', label: 'Negócio' },
  { id: 'contrato', label: 'Contrato' },
];

/** Estágio extinto no meio do período: vive como coluna de histórico, nunca como linha. */
export const RETIRED_STAGE: StageDefinition = { id: 'triagem', label: 'Triagem' };

/** Data em que o estágio saiu do processo. */
export const retiredOn = '2026-08-01';

/** Abaixo desta base a linha sai da escala de cor: percentual sobre poucos casos não compara. */
export const smallBase = 20;

/** Movimentos que caíram em estado fora do dicionário de etapas, contados à parte no rodapé. */
export const outsideDictionary = 17;

export interface TransitionRow {
  readonly from: string;
  /** Movimentos para cada etapa de STAGES, na ordem, mais o estágio extinto na última posição. */
  readonly to: readonly number[];
}

export const data: readonly TransitionRow[] = [
  { from: 'contato', to: [420, 62, 4, 0, 0, 9] },
  { from: 'avaliacao', to: [7, 210, 41, 3, 0, 5] },
  { from: 'proposta', to: [2, 9, 154, 29, 0, 0] },
  { from: 'negocio', to: [0, 1, 4, 7, 0, 0] },
  { from: 'contrato', to: [0, 0, 0, 0, 0, 0] },
];

/** Último dia do trimestre medido, para o recorte aparecer desenhado e não só na frase acessível. */
export const periodEnd = '2026-09-14';
