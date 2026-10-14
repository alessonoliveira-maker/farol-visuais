/**
 * Objeções anotadas pela pré-vendas em ligações de um trimestre, já com o desfecho da
 * oportunidade conhecido: cada linha é uma frase distinta, a quantidade de ligações em que ela
 * foi anotada exatamente assim e, dessas, quantas tiveram a oportunidade perdida depois
 * (contagem de ligações). Dado fictício e fixo: nenhuma frase cita pessoa, empresa, marca ou
 * produto real.
 *
 * O recorte exercita a regra de destaque: dois ramos com maioria perdida e volume (7 de 9 e
 * 7 de 10), um ramo exatamente na metade (6 de 12, que não é maioria), dois ramos com maioria
 * e volume pequeno (4 de 6 e 3 de 5, que ficam sem destaque), grafia com e sem acento e com
 * maiúscula de início de frase, e continuações abaixo da contagem mínima, que a poda tira.
 */
export interface ObjectionOutcome {
  readonly id: string;
  /** A frase como foi anotada, com a grafia original. */
  readonly text: string;
  /** Em quantas ligações a frase foi anotada exatamente assim. */
  readonly calls: number;
  /** Dessas ligações, quantas tiveram a oportunidade perdida depois. */
  readonly lost: number;
}

export const data: readonly ObjectionOutcome[] = [
  { id: 'obj-01', text: 'não tenho orçamento aprovado', calls: 9, lost: 7 },
  { id: 'obj-02', text: 'não tenho orçamento agora', calls: 5, lost: 2 },
  { id: 'obj-03', text: 'Não tenho orçamento agora', calls: 3, lost: 1 },
  { id: 'obj-04', text: 'não tenho orçamento', calls: 2, lost: 1 },
  { id: 'obj-05', text: 'não tenho interesse', calls: 12, lost: 6 },
  { id: 'obj-06', text: 'não tenho tempo agora', calls: 7, lost: 2 },
  { id: 'obj-07', text: 'nao tenho tempo', calls: 2, lost: 0 },
  { id: 'obj-08', text: 'não é prioridade', calls: 8, lost: 6 },
  { id: 'obj-09', text: 'não é prioridade agora', calls: 2, lost: 1 },
  { id: 'obj-10', text: 'não é o momento', calls: 11, lost: 5 },
  { id: 'obj-11', text: 'não é comigo', calls: 2, lost: 1 },
  { id: 'obj-12', text: 'não temos verba', calls: 6, lost: 4 },
  { id: 'obj-13', text: 'não temos equipe', calls: 5, lost: 1 },
  { id: 'obj-14', text: 'não temos orçamento', calls: 2, lost: 2 },
  { id: 'obj-15', text: 'não posso falar agora', calls: 8, lost: 2 },
  { id: 'obj-16', text: 'não quero mudar agora', calls: 5, lost: 3 },
  { id: 'obj-17', text: 'eu não sou o decisor', calls: 2, lost: 1 },
  { id: 'obj-18', text: 'já temos fornecedor', calls: 9, lost: 4 },
  { id: 'obj-19', text: 'me ligue no próximo mês', calls: 6, lost: 1 },
];

/** Palavra raiz da árvore; a comparação é pela chave sem acento e em minúsculas. */
export const rootWord = 'não';

/** Primeiro e último mês das ligações do recorte, em `YYYY-MM`. */
export const period = { start: '2026-07', end: '2026-09' } as const;
