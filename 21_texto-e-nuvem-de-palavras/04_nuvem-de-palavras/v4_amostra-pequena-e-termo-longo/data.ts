/**
 * Termos das respostas abertas de pré-vendas à pergunta "o que motivou o contato", em 2026-09.
 * `responses` conta quantas das 22 respostas citam o termo; uma resposta que repete o termo pesa
 * uma. Os termos já chegam em minúsculas, sem palavras vazias, e com os bigramas mais frequentes
 * unidos, e é por isso que o termo que lidera tem duas palavras.
 * O recorte é pequeno de propósito: 22 respostas e 9 termos ficam abaixo do mínimo da nuvem, e a
 * peça responde com a lista ordenada. Há dois empates, um termo com uma resposta só e nenhum zero.
 * Dado fictício e fixo: nenhuma resposta, pessoa ou empresa é real.
 */
export interface IntakeTerm {
  readonly id: string;
  /** Forma exibida: a grafia original mais frequente, com acento. */
  readonly label: string;
  /** Respostas que citam o termo ao menos uma vez. */
  readonly responses: number;
}

/** Respostas com texto no recorte: o denominador, e a contagem que decide entre nuvem e lista. */
export const totalResponses = 22;

/** Mês do recorte. */
export const period = '2026-09';

export const data: readonly IntakeTerm[] = [
  { id: 'planejamento-sucessorio', label: 'planejamento sucessório', responses: 9 },
  { id: 'holding-familiar', label: 'holding familiar', responses: 6 },
  { id: 'imposto', label: 'imposto', responses: 5 },
  { id: 'inventario', label: 'inventário', responses: 5 },
  { id: 'herdeiros', label: 'herdeiros', responses: 4 },
  { id: 'doacao', label: 'doação', responses: 3 },
  { id: 'testamento', label: 'testamento', responses: 3 },
  { id: 'previdencia', label: 'previdência', responses: 2 },
  { id: 'usufruto', label: 'usufruto', responses: 1 },
];
