/**
 * Correlação de Pearson entre catorze métricas semanais de marketing e de pré-vendas, calculada
 * sobre a VARIAÇÃO semana a semana, não sobre o nível. Dado fictício e fixo.
 *
 * A escolha da variação é o que separa esta matriz de uma tabela de tendência comum: em nível, duas
 * séries que crescem no ano saem correlacionadas porque as duas crescem, e não porque uma puxa a
 * outra. A diferença semana a semana tira o crescimento comum e deixa só o movimento.
 *
 * A ordem das medidas é a do agrupamento, nunca a alfabética: três blocos, topo de funil,
 * qualificação e custo, e é o degrau entre blocos que a matriz existe para mostrar. Dentro de cada
 * bloco as medidas andam juntas; entre topo de funil e qualificação a relação quase desaparece; e o
 * bloco de custo se relaciona com a qualificação por sinal contrário, que é o esperado de um custo
 * por unidade.
 */
export interface MeasureDefinition {
  readonly id: string;
  readonly label: string;
  readonly blockId: string;
}

export interface BlockDefinition {
  readonly id: string;
  readonly label: string;
}

/** Os três blocos, na ordem em que aparecem nos dois eixos. */
export const BLOCKS: readonly BlockDefinition[] = [
  { id: 'topo', label: 'topo de funil' },
  { id: 'qualificacao', label: 'qualificação' },
  { id: 'custo', label: 'custo' },
];

/** Ordem por agrupamento. Trocar a ordem desmancha os blocos, que são a leitura da peça. */
export const MEASURES: readonly MeasureDefinition[] = [
  { id: 'investimento', label: 'Investimento', blockId: 'topo' },
  { id: 'impressoes', label: 'Impressões', blockId: 'topo' },
  { id: 'cliques', label: 'Cliques', blockId: 'topo' },
  { id: 'sessoes', label: 'Sessões', blockId: 'topo' },
  { id: 'alcance', label: 'Alcance', blockId: 'topo' },
  { id: 'leads', label: 'Leads', blockId: 'topo' },
  { id: 'qualificados', label: 'Qualificados', blockId: 'qualificacao' },
  { id: 'reunioes-marcadas', label: 'Reuniões marcadas', blockId: 'qualificacao' },
  { id: 'reunioes-realizadas', label: 'Reuniões realizadas', blockId: 'qualificacao' },
  { id: 'propostas', label: 'Propostas', blockId: 'qualificacao' },
  { id: 'contratos', label: 'Contratos', blockId: 'qualificacao' },
  { id: 'custo-por-lead', label: 'Custo por lead', blockId: 'custo' },
  { id: 'custo-por-reuniao', label: 'Custo por reunião', blockId: 'custo' },
  { id: 'custo-por-contrato', label: 'Custo por contrato', blockId: 'custo' },
];

/** Semanas fechadas na janela. A variação semana a semana consome uma, então os pares têm 51. */
export const OBSERVATIONS = 52;

/**
 * Triângulo inferior, linha a linha. A entrada `i` é a linha da medida `i + 2` e traz os
 * coeficientes das colunas `0` até `i`, então a primeira medida não abre linha e a última não abre
 * coluna.
 */
export const data: readonly (readonly number[])[] = [
  [0.94],
  [0.86, 0.9],
  [0.81, 0.84, 0.93],
  [0.88, 0.91, 0.79, 0.76],
  [0.74, 0.72, 0.82, 0.85, 0.7],
  [0.22, 0.18, 0.27, 0.29, 0.15, 0.34],
  [0.19, 0.14, 0.24, 0.26, 0.12, 0.31, 0.81],
  [0.17, 0.13, 0.21, 0.23, 0.1, 0.28, 0.74, 0.86],
  [0.13, 0.09, 0.17, 0.19, 0.08, 0.24, 0.62, 0.68, 0.72],
  [0.11, 0.08, 0.14, 0.16, 0.12, 0.21, 0.55, 0.59, 0.64, 0.71],
  [0.46, 0.42, 0.31, 0.29, 0.38, -0.34, -0.78, -0.58, -0.52, -0.44, -0.39],
  [0.41, 0.38, 0.28, 0.26, 0.34, -0.29, -0.61, -0.72, -0.68, -0.41, -0.36, 0.67],
  [0.37, 0.34, 0.25, 0.23, 0.31, -0.26, -0.48, -0.54, -0.57, -0.66, -0.74, 0.59, 0.64],
];
