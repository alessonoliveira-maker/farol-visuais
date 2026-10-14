/**
 * Objeções anotadas pela pré-vendas nas ligações de um mês: cada linha é uma frase distinta e a
 * quantidade de ligações em que ela foi anotada exatamente assim (contagem de frases).
 * Dado fictício e fixo: nenhuma frase cita pessoa, empresa, marca ou produto real.
 *
 * O recorte exercita o que a árvore precisa aguentar: a mesma palavra com e sem acento e com
 * maiúscula de início de frase (não, nao, Não), a raiz no meio da frase, frase que termina antes
 * da profundidade máxima, continuações abaixo da contagem mínima (que a poda tira), empate de
 * contagem entre ramos irmãos e frases que não têm a raiz.
 */
export interface ObjectionPhrase {
  readonly id: string;
  /** A frase como foi anotada, com a grafia original. */
  readonly text: string;
  /** Em quantas ligações a frase foi anotada exatamente assim. */
  readonly count: number;
}

export const data: readonly ObjectionPhrase[] = [
  { id: 'obj-01', text: 'não tenho orçamento agora', count: 4 },
  { id: 'obj-02', text: 'Não tenho orçamento aprovado', count: 3 },
  { id: 'obj-03', text: 'nao tenho orçamento', count: 2 },
  { id: 'obj-04', text: 'não tenho tempo agora', count: 4 },
  { id: 'obj-05', text: 'agora não tenho tempo para reunião', count: 2 },
  { id: 'obj-06', text: 'não tenho tempo', count: 1 },
  { id: 'obj-07', text: 'não tenho interesse', count: 6 },
  { id: 'obj-08', text: 'não tenho disponibilidade nesta semana', count: 2 },
  { id: 'obj-09', text: 'não é o momento', count: 6 },
  { id: 'obj-10', text: 'não é prioridade agora', count: 3 },
  { id: 'obj-11', text: 'não é prioridade neste trimestre', count: 2 },
  { id: 'obj-12', text: 'não é comigo', count: 2 },
  { id: 'obj-13', text: 'não temos orçamento', count: 4 },
  { id: 'obj-14', text: 'não temos verba', count: 3 },
  { id: 'obj-15', text: 'não temos equipe', count: 3 },
  { id: 'obj-16', text: 'não posso falar agora', count: 5 },
  { id: 'obj-17', text: 'não quero mudar agora', count: 4 },
  { id: 'obj-18', text: 'eu não sou o decisor', count: 2 },
  { id: 'obj-19', text: 'não vejo necessidade', count: 2 },
  { id: 'obj-20', text: 'não conheço a empresa', count: 1 },
  { id: 'obj-21', text: 'já temos fornecedor', count: 5 },
  { id: 'obj-22', text: 'me ligue no próximo mês', count: 3 },
];

/** Palavra raiz da árvore; a comparação é pela chave sem acento e em minúsculas. */
export const rootWord = 'não';

/** Mês das ligações, em `YYYY-MM`. */
export const period = '2026-08';
