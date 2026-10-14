/**
 * Anotações de motivo escritas pelo comercial em oportunidades perdidas num ano: cada linha é
 * um texto distinto e a quantidade de oportunidades em que ele foi anotado exatamente assim
 * (contagem de anotações; as 20 linhas somam 500). Dado fictício e fixo: nenhuma anotação cita
 * pessoa, empresa, marca ou produto real.
 *
 * O recorte exercita a árvore dupla: a raiz escrita de três jeitos (preço, preco e Preço, que a
 * chave sem acento e em minúsculas junta num nó só), a raiz abrindo a frase (sem prefixo) e no
 * meio dela, continuações abaixo da contagem mínima dos dois lados (que a poda tira e o contador
 * soma), a mesma palavra em lados diferentes da raiz (concorrente) e anotações sem a raiz, que
 * servem quando outra palavra vira raiz pelo clique.
 */
export interface LossNote {
  readonly id: string;
  /** A anotação como foi escrita, com a grafia original. */
  readonly text: string;
  /** Em quantas oportunidades perdidas a anotação foi escrita exatamente assim. */
  readonly count: number;
}

export const data: readonly LossNote[] = [
  { id: 'note-01', text: 'cliente achou o preço muito alto', count: 30 },
  { id: 'note-02', text: 'cliente achou o preço acima do orçamento', count: 22 },
  { id: 'note-03', text: 'diretoria achou o preço acima do orçamento', count: 16 },
  { id: 'note-04', text: 'diretoria achou o preço muito acima', count: 10 },
  { id: 'note-05', text: 'perdemos por preço para o concorrente', count: 24 },
  { id: 'note-06', text: 'perdemos por preço e prazo', count: 12 },
  { id: 'note-07', text: 'concorrente com preço menor', count: 12 },
  { id: 'note-08', text: 'concorrente com preco menor', count: 8 },
  { id: 'note-09', text: 'Preço acima do concorrente', count: 14 },
  { id: 'note-10', text: 'reclamou do preço da proposta', count: 16 },
  { id: 'note-11', text: 'reclamou do preço acima do esperado', count: 10 },
  { id: 'note-12', text: 'pediu desconto no preço final', count: 9 },
  { id: 'note-13', text: 'preco alto', count: 6 },
  { id: 'note-14', text: 'sem preço fechado', count: 5 },
  { id: 'note-15', text: 'sem verba neste ano', count: 64 },
  { id: 'note-16', text: 'projeto adiado para o próximo ano', count: 52 },
  { id: 'note-17', text: 'optou pelo concorrente atual', count: 58 },
  { id: 'note-18', text: 'decisor saiu da empresa', count: 38 },
  { id: 'note-19', text: 'cliente parou de responder', count: 54 },
  { id: 'note-20', text: 'prazo de entrega longo', count: 40 },
];

/** Palavra raiz inicial; a comparação é pela chave sem acento e em minúsculas. */
export const rootWord = 'preço';

/** Ano das oportunidades perdidas, como texto de tela. */
export const periodLabel = '2026';
