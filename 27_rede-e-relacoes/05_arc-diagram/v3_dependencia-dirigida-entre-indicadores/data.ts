/**
 * Dependência de cálculo entre indicadores: cada linha de `links` diz que o indicador `from` usa
 * o indicador `to` na própria fórmula. A relação é de presença, sem peso, e a unidade das
 * contagens é dependências. Dado fictício e fixo: nenhum indicador é de empresa ou produto real.
 * Os nós vêm na ordem do eixo, que é a da etapa do funil, do topo ao resultado, e o componente
 * não reordena. A previsão e a meta de receita usam uma à outra: é a dependência circular que a
 * versão precisa marcar. `label` é o nome curto do eixo e `name` é o nome completo, que vai para
 * a lista acessível de ligações e para a dica.
 */
export interface IndicatorNode {
  readonly id: string;
  /** Nome curto, de uma palavra, para caber no passo do eixo. */
  readonly label: string;
  /** Nome completo do indicador. */
  readonly name: string;
  /** O indicador no meio de uma oração, com artigo e sem a maiúscula de rótulo. */
  readonly inSentence: string;
}

export interface DependencyLink {
  /** Id do indicador que usa. */
  readonly from: string;
  /** Id do indicador usado no cálculo. */
  readonly to: string;
}

export interface DependencyGraph {
  /** Critério da ordem do eixo, já no texto de tela. */
  readonly orderLabel: string;
  readonly nodes: readonly IndicatorNode[];
  readonly links: readonly DependencyLink[];
}

export const data: DependencyGraph = {
  orderLabel: 'etapa do funil',
  nodes: [
    { id: 'leads', label: 'Leads', name: 'Leads gerados no mês', inSentence: 'os leads gerados' },
    { id: 'eficiencia', label: 'Eficiência', name: 'Eficiência do funil, de lead a contrato', inSentence: 'a eficiência do funil' },
    { id: 'propostas', label: 'Propostas', name: 'Propostas enviadas no mês', inSentence: 'as propostas enviadas' },
    { id: 'conversao', label: 'Conversão', name: 'Taxa de conversão de propostas em contratos', inSentence: 'a taxa de conversão' },
    { id: 'contratos', label: 'Contratos', name: 'Contratos fechados no mês', inSentence: 'os contratos fechados' },
    { id: 'ticket', label: 'Ticket', name: 'Ticket médio por contrato', inSentence: 'o ticket médio' },
    { id: 'receita', label: 'Receita', name: 'Receita nova contratada no mês', inSentence: 'a receita nova' },
    { id: 'previsao', label: 'Previsão', name: 'Previsão de receita do mês', inSentence: 'a previsão de receita' },
    { id: 'meta', label: 'Meta', name: 'Meta de receita do mês', inSentence: 'a meta de receita' },
  ],
  links: [
    { from: 'eficiencia', to: 'leads' },
    { from: 'eficiencia', to: 'contratos' },
    { from: 'conversao', to: 'propostas' },
    { from: 'conversao', to: 'contratos' },
    { from: 'ticket', to: 'contratos' },
    { from: 'ticket', to: 'receita' },
    { from: 'previsao', to: 'conversao' },
    { from: 'previsao', to: 'ticket' },
    { from: 'previsao', to: 'meta' },
    { from: 'meta', to: 'previsao' },
    { from: 'meta', to: 'receita' },
  ],
};
