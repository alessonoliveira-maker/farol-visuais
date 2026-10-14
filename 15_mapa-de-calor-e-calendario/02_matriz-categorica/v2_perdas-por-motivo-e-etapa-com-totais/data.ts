/**
 * Perdas de oportunidade no trimestre, contadas por motivo declarado e pela etapa do funil em que a
 * oportunidade morreu. Dado fictício e fixo: nenhum nome é pessoa real e nenhuma etapa é de sistema
 * real. A unidade é oportunidade perdida, contagem inteira, nunca valor em reais.
 *
 * O par motivo x etapa declara `null` quando aquele motivo NÃO foi registrado naquela etapa, e `0`
 * quando ele foi registrado e não houve nenhuma perda ali. As duas coisas são diferentes, e o
 * componente as desenha em canais diferentes: ausência de instrumento contra zero medido.
 */
export interface FunnelStage {
  readonly id: string;
  readonly label: string;
}

/** Na ordem do funil, que é a ordem em que as colunas aparecem. Nunca em ordem de volume. */
export const STAGES: readonly FunnelStage[] = [
  { id: 'triagem', label: 'Triagem' },
  { id: 'qualificacao', label: 'Qualificação' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'negociacao', label: 'Negociação' },
];

export interface LossReasonRow {
  readonly id: string;
  readonly label: string;
  /** Uma posição por etapa, na mesma ordem de STAGES. `null` é motivo não registrado na etapa. */
  readonly byStage: readonly (number | null)[];
}

/**
 * Casos difíceis exercitados de propósito: Preço e Decisor trocou não existem na Triagem, porque lá
 * a oportunidade morre antes de haver proposta ou comitê, e isso é ausência de registro; Fora do
 * perfil tem zero medido na Negociação e Concorrência tem zero medido na Triagem, que são perdas
 * medidas em zero e não ausência; o maior par do recorte tem 98 perdas e o menor medido tem 3, o que
 * faz a mesma cor cobrir uma faixa larga e obriga o número escrito em toda célula.
 */
export const data: readonly LossReasonRow[] = [
  { id: 'preco', label: 'Preço', byStage: [null, 12, 34, 98, 41] },
  { id: 'sem-orcamento', label: 'Sem orçamento', byStage: [18, 46, 29, 22, 7] },
  { id: 'concorrencia', label: 'Concorrência', byStage: [0, 6, 18, 37, 33] },
  { id: 'sem-resposta', label: 'Sem resposta', byStage: [74, 61, 25, 14, 3] },
  { id: 'fora-do-perfil', label: 'Fora do perfil', byStage: [96, 38, 9, 4, 0] },
  { id: 'timing-do-cliente', label: 'Timing do cliente', byStage: [11, 23, 31, 26, 12] },
  { id: 'decisor-trocou', label: 'Decisor trocou', byStage: [null, 5, 14, 11, 9] },
];
