/**
 * Anotações de ligações de pré-vendas em 2026-T3, sem nome de pessoa, empresa ou contato, e os dois
 * termos consultados: preço, que aparece em cinco anotações (uma abre a frase, uma a fecha sem
 * pontuação, uma tem vírgula colada e uma tem aspas, com a grafia preco sem acento), e desconto,
 * que não ocorre em nenhuma. Dado fictício e fixo.
 */
export interface CallNote {
  readonly id: string;
  readonly text: string;
}

export interface BorderCaseData {
  /** Termos consultados, na ordem em que as seções aparecem. */
  readonly terms: readonly string[];
  readonly notes: readonly CallNote[];
}

export const data: BorderCaseData = {
  terms: ['preço', 'desconto'],
  notes: [
    { id: 'lig-01', text: 'Preço é o ponto que mais pesa para ele.' },
    { id: 'lig-02', text: 'Achou o preco alto demais para este trimestre.' },
    { id: 'lig-03', text: 'Pediu retorno na segunda, depois do almoço.' },
    { id: 'lig-04', text: 'Disse que, no preço, não há margem para subir.' },
    { id: 'lig-05', text: 'Citou o “preço” duas vezes durante a ligação.' },
    { id: 'lig-06', text: 'Perguntou se a visita técnica tem custo.' },
    { id: 'lig-07', text: 'Quer saber só o preço' },
  ],
};
