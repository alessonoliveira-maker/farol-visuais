/**
 * Uma anotação de ligação da Pré-vendas e as três categorias de objeção que o painel realça nela:
 * preço, momento e concorrente. Dado fictício e fixo: a anotação não cita pessoa, empresa, e-mail
 * ou telefone.
 *
 * O caso difícil é a busca: as chaves vão sem acento e em minúsculas, enquanto a anotação traz
 * "PRECO" em caixa alta e sem acento, e "próximo trimestre" com acento. O realce marca a forma
 * original escrita, nunca a chave. Cada categoria tem slot de cor fixo (1, 3 e 6) e não muda com a
 * ordem nem com a contagem.
 */
export interface ObjectionCategory {
  readonly id: string;
  /** Nome em minúsculas, para entrar no meio de frase. */
  readonly label: string;
  /** Slot fixo da paleta categórica, 1 a 6 (COR-3). */
  readonly slot: 1 | 3 | 6;
  /** Termos buscados, sem acento e em minúsculas. */
  readonly keys: readonly string[];
}

export interface CallNote {
  readonly id: string;
  /** Texto literal da anotação, já sem dado sensível. */
  readonly text: string;
  /** Dia da ligação, YYYY-MM-DD. */
  readonly calledOn: string;
  readonly team: string;
  readonly categories: readonly ObjectionCategory[];
}

export const data: CallNote = {
  id: 'ligacao-2026-09-23-a',
  text: 'O cliente gostou da proposta, mas achou o PRECO alto para o plano básico e pediu desconto na mensalidade. Disse que agora não é o momento: só decide no próximo trimestre, depois do balanço. Já tem outra proposta de um concorrente e vai comparar antes de responder.',
  calledOn: '2026-09-23',
  team: 'Pré-vendas',
  categories: [
    { id: 'preco', label: 'preço', slot: 1, keys: ['preco', 'desconto', 'mensalidade'] },
    { id: 'momento', label: 'momento', slot: 3, keys: ['agora nao', 'proximo trimestre', 'depois do balanco'] },
    { id: 'concorrente', label: 'concorrente', slot: 6, keys: ['concorrente', 'outra proposta'] },
  ],
};
