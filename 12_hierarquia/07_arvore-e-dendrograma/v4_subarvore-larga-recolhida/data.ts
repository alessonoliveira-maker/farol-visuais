/**
 * Estrutura fictícia e desbalanceada de uma área comercial: uma coordenação com 14 funções, outra
 * com 2 e outra com 3, mais duas funções um nível abaixo do limite de profundidade do desenho.
 * A unidade é a função, não a pessoa: nenhuma pessoa é citada e não há contagem de gente aqui.
 *
 * `expanded` declara o estado inicial de cada ramo no próprio dado, para o desenho sair igual em
 * qualquer máquina e em qualquer dia (seção 10). O botão do visual troca o estado a partir daí.
 *
 * Dado fictício e fixo: só nome de função, nenhuma empresa e nenhuma pessoa real.
 */
export interface OrgUnit {
  readonly id: string;
  readonly label: string;
  /**
   * Slot categórico fixo, declarado só nas coordenações, na ordem da COR-8 (1, 3, 6): a cor
   * pertence à categoria e desce por herança, nunca vem da posição no array (COR-3).
   */
  readonly slot?: number;
  /** Estado inicial do ramo. Ausente vale como recolhido. */
  readonly expanded?: boolean;
  readonly children?: readonly OrgUnit[];
}

export const data: OrgUnit = {
  id: 'area-comercial',
  label: 'Área comercial',
  expanded: true,
  children: [
    {
      id: 'pre-vendas',
      label: 'Pré-vendas',
      slot: 1,
      expanded: false,
      children: [
        { id: 'pv-entrada', label: 'Prospecção de entrada' },
        { id: 'pv-saida', label: 'Prospecção de saída' },
        { id: 'pv-carteira', label: 'Prospecção de carteira' },
        { id: 'pv-lista', label: 'Pesquisa de lista' },
        { id: 'pv-higiene', label: 'Higiene de base' },
        { id: 'pv-roteamento', label: 'Roteamento de entrada' },
        { id: 'pv-agenda', label: 'Agendamento' },
        { id: 'pv-qualificacao', label: 'Qualificação técnica' },
        { id: 'pv-enriquecimento', label: 'Enriquecimento' },
        { id: 'pv-email', label: 'Cadência de e-mail' },
        { id: 'pv-telefone', label: 'Cadência de telefone' },
        { id: 'pv-treino', label: 'Treinamento' },
        { id: 'pv-qualidade', label: 'Qualidade de conversa' },
        { id: 'pv-coordenacao', label: 'Coordenação de fila' },
      ],
    },
    {
      id: 'comercial',
      label: 'Comercial',
      slot: 3,
      expanded: true,
      children: [
        { id: 'co-contas', label: 'Executivo de contas' },
        { id: 'co-senior', label: 'Executivo sênior' },
      ],
    },
    {
      id: 'marketing',
      label: 'Marketing',
      slot: 6,
      expanded: true,
      children: [
        { id: 'mk-performance', label: 'Analista de performance' },
        {
          id: 'mk-conteudo',
          label: 'Analista de conteúdo',
          children: [
            { id: 'mk-redacao', label: 'Redação' },
            { id: 'mk-revisao', label: 'Revisão' },
          ],
        },
        { id: 'mk-coordenacao', label: 'Coordenação de campanha' },
      ],
    },
  ],
};
