/**
 * Maturidade da área comercial em doze critérios, avaliada para o plano de 2027, numa escala de
 * 0 a 100 pontos. Dado fictício e fixo: nenhuma empresa ou pessoa real.
 * A ordem é a do registry de critérios e corre no sentido horário a partir do topo, com os
 * correlatos vizinhos: três de dado, três de processo, três de pessoas e três de cliente.
 * Os nomes têm duas ou três palavras e quebram em duas linhas onde o perímetro não dá largura, e
 * os três índices mais baixos estão em blocos diferentes, para a lista ao lado não repetir um
 * canto só da estrela.
 */
export interface MaturityCriterion {
  readonly id: string;
  readonly name: string;
  /** Índice de 0 a 100. */
  readonly value: number;
}

export const data: readonly MaturityCriterion[] = [
  { id: 'cadastro', name: 'Qualidade do cadastro', value: 71 },
  { id: 'funil', name: 'Higiene do funil', value: 61 },
  { id: 'previsao', name: 'Previsão de receita', value: 34 },
  { id: 'rituais', name: 'Rituais de gestão', value: 86 },
  { id: 'processo', name: 'Processo de vendas', value: 78 },
  { id: 'roteiro', name: 'Roteiro de abordagem', value: 64 },
  { id: 'treinamento', name: 'Treinamento contínuo', value: 58 },
  { id: 'carreira', name: 'Plano de carreira', value: 41 },
  { id: 'remuneracao', name: 'Remuneração variável', value: 69 },
  { id: 'segmentacao', name: 'Segmentação de carteira', value: 74 },
  { id: 'pos-venda', name: 'Pós-venda estruturado', value: 46 },
  { id: 'inteligencia', name: 'Inteligência de mercado', value: 63 },
];

/** O que é avaliado, para a frase acessível. */
export const subject = 'área comercial';
