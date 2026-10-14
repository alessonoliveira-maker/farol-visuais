/**
 * Correlação de Pearson, em nível, entre seis medidas semanais, com os três estados de célula que
 * uma matriz honesta precisa separar. Dado fictício e fixo.
 *
 * O primeiro estado é o coeficiente medido, e ele vem com o próprio número de pares, porque a
 * exclusão é POR PAR: cada célula usa só as semanas em que as duas medidas existem, então vizinhas
 * na mesma linha podem ter amostras diferentes, e a matriz inteira não tem um n só.
 *
 * O segundo é o par com histórico curto. `Propostas` entrou em operação há oito semanas, então todo
 * par dela tem oito observações, abaixo do piso de doze: o coeficiente existe na conta e não sustenta
 * leitura, então ele não vai desenhado.
 *
 * O terceiro é o coeficiente não calculável. `Verba mensal` foi a mesma em todas as semanas, isto é
 * variância zero, e a correlação de Pearson divide pelo desvio padrão: o resultado é indefinido, nunca
 * zero. Uma célula zerada ali diria que as duas medidas não têm relação, o que é afirmação, e não há
 * afirmação nenhuma a fazer.
 */
export interface MeasureDefinition {
  readonly id: string;
  readonly label: string;
  /** Rótulo da coluna, quebrado por palavra inteira: SVG puro não mede texto, então a quebra vem do dado. */
  readonly columnLines: readonly string[];
  /** Variância zero no período: a medida não variou, e nenhum par dela tem coeficiente. */
  readonly constant: boolean;
}

export interface CellDatum {
  /** `null` quando alguma das duas medidas tem variância zero: indefinido nunca é zero. */
  readonly coefficient: number | null;
  /** Semanas em que as duas medidas existem. É o n desta célula, e só dela. */
  readonly pairs: number;
}

/** Ordem do funil, não a alfabética, e as duas medidas de exceção ficam no meio e no fim. */
export const MEASURES: readonly MeasureDefinition[] = [
  { id: 'midia-paga', label: 'Mídia paga', columnLines: ['Mídia', 'paga'], constant: false },
  { id: 'cliques', label: 'Cliques', columnLines: ['Cliques'], constant: false },
  { id: 'leads', label: 'Leads', columnLines: ['Leads'], constant: false },
  { id: 'verba-mensal', label: 'Verba mensal', columnLines: ['Verba', 'mensal'], constant: true },
  { id: 'reunioes', label: 'Reuniões', columnLines: ['Reuniões'], constant: false },
  { id: 'propostas', label: 'Propostas', columnLines: ['Propostas'], constant: false },
];

/** Semanas fechadas na janela. Nenhuma célula usa todas elas, e é esse o ponto da versão. */
export const OBSERVATIONS = 52;

/** Piso de pares. Abaixo dele o coeficiente oscila mais que o fenômeno e não vai desenhado. */
export const MIN_PAIRS = 12;

/**
 * Triângulo inferior, linha a linha. A entrada `i` é a linha da medida `i + 2` e traz as colunas `0`
 * até `i`, então a primeira medida não abre linha e a última não abre coluna.
 */
export const data: readonly (readonly CellDatum[])[] = [
  [{ coefficient: 0.91, pairs: 52 }],
  [
    { coefficient: 0.78, pairs: 51 },
    { coefficient: 0.83, pairs: 52 },
  ],
  [
    { coefficient: null, pairs: 52 },
    { coefficient: null, pairs: 52 },
    { coefficient: null, pairs: 51 },
  ],
  [
    { coefficient: -0.74, pairs: 49 },
    { coefficient: -0.68, pairs: 48 },
    { coefficient: 0.22, pairs: 44 },
    { coefficient: null, pairs: 49 },
  ],
  [
    { coefficient: 0.31, pairs: 8 },
    { coefficient: 0.27, pairs: 8 },
    { coefficient: 0.44, pairs: 8 },
    { coefficient: null, pairs: 8 },
    { coefficient: 0.61, pairs: 8 },
  ],
];

/**
 * O mesmo par da anotação, recalculado sobre a variação semana a semana. O coeficiente forte e
 * negativo do nível era tendência comum: a mídia caiu ao longo do ano e a reunião subiu, e nenhuma
 * semana puxou a outra.
 */
export const LEVEL_TRAP = { rowIndex: 3, columnIndex: 0, onVariation: 0.06 } as const;
