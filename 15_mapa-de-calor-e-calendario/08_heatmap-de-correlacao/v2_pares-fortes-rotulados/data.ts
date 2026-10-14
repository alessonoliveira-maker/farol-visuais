/**
 * Correlação de Pearson, em nível, entre dez métricas semanais do funil, sobre 52 semanas fechadas
 * de 2026. Dado fictício e fixo; nenhuma métrica é de plataforma real.
 *
 * O caso que o dado exercita é o de leitura executiva: o topo do funil anda colado consigo mesmo,
 * o investimento ainda alcança o lead, e para de alcançar no lead qualificado. A relação que a
 * diretoria espera encontrar e não encontra é justamente investimento com qualificados, que fica em
 * 0,19; e a única relação forte e negativa da matriz é custo por lead com qualificados.
 *
 * A matriz é simétrica, então só o triângulo inferior é desenhado: repetir a metade de cima dobraria
 * a tinta sem acrescentar informação.
 */
export interface MeasureDefinition {
  readonly id: string;
  readonly label: string;
}

/**
 * Ordem importa, e é a do funil, não a alfabética: a leitura do triângulo é posicional, e o degrau
 * entre o bloco de volume e o bloco de qualificação só aparece se as métricas vizinhas forem
 * vizinhas no funil.
 */
export const MEASURES: readonly MeasureDefinition[] = [
  { id: 'investimento', label: 'Investimento' },
  { id: 'impressoes', label: 'Impressões' },
  { id: 'cliques', label: 'Cliques' },
  { id: 'sessoes', label: 'Sessões' },
  { id: 'leads', label: 'Leads' },
  { id: 'qualificados', label: 'Qualificados' },
  { id: 'reunioes', label: 'Reuniões' },
  { id: 'propostas', label: 'Propostas' },
  { id: 'contratos', label: 'Contratos' },
  { id: 'custo-por-lead', label: 'Custo por lead' },
];

/** Observações por par. Abaixo de umas 12, o coeficiente não sustenta leitura. */
export const OBSERVATIONS = 52;

/**
 * Triângulo inferior, linha a linha, de cima para baixo. A linha `i` traz os coeficientes das
 * colunas `0` até `i`, então a primeira medida não abre linha e a última não abre coluna.
 */
export const data: readonly (readonly number[])[] = [
  [0.93],
  [0.88, 0.91],
  [0.84, 0.86, 0.95],
  [0.74, 0.71, 0.79, 0.82],
  [0.19, 0.16, 0.24, 0.27, 0.41],
  [0.15, 0.12, 0.18, 0.21, 0.33, 0.76],
  [0.11, 0.09, 0.14, 0.16, 0.27, 0.62, 0.71],
  [0.08, 0.06, 0.1, 0.12, 0.22, 0.54, 0.63, 0.78],
  [0.46, 0.44, 0.31, 0.28, -0.29, -0.92, -0.68, -0.57, -0.49],
];

/** O par que a diretoria já conta como certo: investimento com lead. Linha e coluna do triângulo. */
export const WORKING_PAIR = { rowIndex: 3, columnIndex: 0 } as const;

/**
 * O par que a diretoria espera forte e que não aparece: investimento com lead qualificado. É a
 * célula que ganha o anel tracejado, porque ausência de relação não chama atenção sozinha.
 */
export const EXPECTED_PAIR = { rowIndex: 4, columnIndex: 0 } as const;
