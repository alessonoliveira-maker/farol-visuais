/**
 * Contatos da pré-vendas no trimestre, por dia da semana e hora cheia (6h às 19h).
 * Contagem de tentativas de contato, não de pessoas.
 * Dado fictício e fixo: nenhuma pessoa ou empresa real.
 *
 * O dado carrega DOIS campos porque a grade precisa separar três coisas que costumam virar uma:
 * `open` diz se a hora estava dentro do expediente, e `contacts` diz quantos contatos houve.
 * A combinação dos dois dá quatro estados, e cada um tem desenho próprio:
 *   `open: true` e contagem acima de zero: volume, bolha cheia com área proporcional.
 *   `open: true` e contagem zero: ZERO MEDIDO, a hora existiu e ninguém foi contatado; anel.
 *   `open: false`: SEM EXPEDIENTE, a hora não existiu; traço, e `contacts` é nulo por definição.
 *   `open: true` e `contacts` nulo: hora aberta SEM APURAÇÃO; não é desenhada e vai contada no
 *   rodapé, porque somá-la ao zero medido seria afirmar um contato que ninguém mediu (DAD-2).
 *
 * A ordem do array é a ordem das categorias no desenho, e ela não é alfabética. O eixo Y de
 * categoria do Recharts desenha a primeira linha do array embaixo e a última em cima, então os dias
 * entram de sábado para segunda, para a semana sair de segunda (no topo) a sábado (embaixo).
 * Dentro de cada dia, a hora entra em ordem crescente, que é a ordem do eixo X.
 */
export interface ContactCell {
  readonly id: string;
  readonly day: string;
  readonly hour: number;
  /** Contatos feitos na hora; nulo quando não houve expediente ou quando não houve apuração. */
  readonly contacts: number | null;
  /** A hora estava dentro do expediente da pré-vendas. */
  readonly open: boolean;
}

export const data: readonly ContactCell[] = [
  { id: 'sab-06', day: 'Sábado', hour: 6, contacts: null, open: false },
  { id: 'sab-07', day: 'Sábado', hour: 7, contacts: null, open: false },
  { id: 'sab-08', day: 'Sábado', hour: 8, contacts: null, open: false },
  { id: 'sab-09', day: 'Sábado', hour: 9, contacts: null, open: false },
  { id: 'sab-10', day: 'Sábado', hour: 10, contacts: null, open: false },
  { id: 'sab-11', day: 'Sábado', hour: 11, contacts: null, open: false },
  { id: 'sab-12', day: 'Sábado', hour: 12, contacts: null, open: false },
  { id: 'sab-13', day: 'Sábado', hour: 13, contacts: null, open: false },
  { id: 'sab-14', day: 'Sábado', hour: 14, contacts: null, open: false },
  { id: 'sab-15', day: 'Sábado', hour: 15, contacts: null, open: false },
  { id: 'sab-16', day: 'Sábado', hour: 16, contacts: null, open: false },
  { id: 'sab-17', day: 'Sábado', hour: 17, contacts: null, open: false },
  { id: 'sab-18', day: 'Sábado', hour: 18, contacts: null, open: false },
  { id: 'sab-19', day: 'Sábado', hour: 19, contacts: null, open: false },
  { id: 'sex-06', day: 'Sexta', hour: 6, contacts: null, open: false },
  { id: 'sex-07', day: 'Sexta', hour: 7, contacts: null, open: false },
  { id: 'sex-08', day: 'Sexta', hour: 8, contacts: 4, open: true },
  { id: 'sex-09', day: 'Sexta', hour: 9, contacts: 10, open: true },
  { id: 'sex-10', day: 'Sexta', hour: 10, contacts: 15, open: true },
  { id: 'sex-11', day: 'Sexta', hour: 11, contacts: 18, open: true },
  { id: 'sex-12', day: 'Sexta', hour: 12, contacts: 6, open: true },
  { id: 'sex-13', day: 'Sexta', hour: 13, contacts: 2, open: true },
  { id: 'sex-14', day: 'Sexta', hour: 14, contacts: 13, open: true },
  { id: 'sex-15', day: 'Sexta', hour: 15, contacts: 17, open: true },
  { id: 'sex-16', day: 'Sexta', hour: 16, contacts: 14, open: true },
  { id: 'sex-17', day: 'Sexta', hour: 17, contacts: 9, open: true },
  { id: 'sex-18', day: 'Sexta', hour: 18, contacts: 0, open: true },
  { id: 'sex-19', day: 'Sexta', hour: 19, contacts: 0, open: true },
  { id: 'qui-06', day: 'Quinta', hour: 6, contacts: null, open: false },
  { id: 'qui-07', day: 'Quinta', hour: 7, contacts: null, open: false },
  { id: 'qui-08', day: 'Quinta', hour: 8, contacts: 6, open: true },
  { id: 'qui-09', day: 'Quinta', hour: 9, contacts: 14, open: true },
  { id: 'qui-10', day: 'Quinta', hour: 10, contacts: 22, open: true },
  { id: 'qui-11', day: 'Quinta', hour: 11, contacts: 26, open: true },
  { id: 'qui-12', day: 'Quinta', hour: 12, contacts: 9, open: true },
  { id: 'qui-13', day: 'Quinta', hour: 13, contacts: null, open: true },
  { id: 'qui-14', day: 'Quinta', hour: 14, contacts: 18, open: true },
  { id: 'qui-15', day: 'Quinta', hour: 15, contacts: 24, open: true },
  { id: 'qui-16', day: 'Quinta', hour: 16, contacts: 20, open: true },
  { id: 'qui-17', day: 'Quinta', hour: 17, contacts: 13, open: true },
  { id: 'qui-18', day: 'Quinta', hour: 18, contacts: 4, open: true },
  { id: 'qui-19', day: 'Quinta', hour: 19, contacts: 0, open: true },
  { id: 'qua-06', day: 'Quarta', hour: 6, contacts: null, open: false },
  { id: 'qua-07', day: 'Quarta', hour: 7, contacts: null, open: false },
  { id: 'qua-08', day: 'Quarta', hour: 8, contacts: 7, open: true },
  { id: 'qua-09', day: 'Quarta', hour: 9, contacts: 15, open: true },
  { id: 'qua-10', day: 'Quarta', hour: 10, contacts: 24, open: true },
  { id: 'qua-11', day: 'Quarta', hour: 11, contacts: 29, open: true },
  { id: 'qua-12', day: 'Quarta', hour: 12, contacts: 10, open: true },
  { id: 'qua-13', day: 'Quarta', hour: 13, contacts: 6, open: true },
  { id: 'qua-14', day: 'Quarta', hour: 14, contacts: 20, open: true },
  { id: 'qua-15', day: 'Quarta', hour: 15, contacts: 26, open: true },
  { id: 'qua-16', day: 'Quarta', hour: 16, contacts: 22, open: true },
  { id: 'qua-17', day: 'Quarta', hour: 17, contacts: 14, open: true },
  { id: 'qua-18', day: 'Quarta', hour: 18, contacts: 4, open: true },
  { id: 'qua-19', day: 'Quarta', hour: 19, contacts: 0, open: true },
  { id: 'ter-06', day: 'Terça', hour: 6, contacts: null, open: false },
  { id: 'ter-07', day: 'Terça', hour: 7, contacts: null, open: false },
  { id: 'ter-08', day: 'Terça', hour: 8, contacts: 6, open: true },
  { id: 'ter-09', day: 'Terça', hour: 9, contacts: 15, open: true },
  { id: 'ter-10', day: 'Terça', hour: 10, contacts: 23, open: true },
  { id: 'ter-11', day: 'Terça', hour: 11, contacts: 27, open: true },
  { id: 'ter-12', day: 'Terça', hour: 12, contacts: 9, open: true },
  { id: 'ter-13', day: 'Terça', hour: 13, contacts: null, open: true },
  { id: 'ter-14', day: 'Terça', hour: 14, contacts: 19, open: true },
  { id: 'ter-15', day: 'Terça', hour: 15, contacts: 25, open: true },
  { id: 'ter-16', day: 'Terça', hour: 16, contacts: 21, open: true },
  { id: 'ter-17', day: 'Terça', hour: 17, contacts: 14, open: true },
  { id: 'ter-18', day: 'Terça', hour: 18, contacts: 4, open: true },
  { id: 'ter-19', day: 'Terça', hour: 19, contacts: 0, open: true },
  { id: 'seg-06', day: 'Segunda', hour: 6, contacts: null, open: false },
  { id: 'seg-07', day: 'Segunda', hour: 7, contacts: null, open: false },
  { id: 'seg-08', day: 'Segunda', hour: 8, contacts: 5, open: true },
  { id: 'seg-09', day: 'Segunda', hour: 9, contacts: 13, open: true },
  { id: 'seg-10', day: 'Segunda', hour: 10, contacts: 20, open: true },
  { id: 'seg-11', day: 'Segunda', hour: 11, contacts: 23, open: true },
  { id: 'seg-12', day: 'Segunda', hour: 12, contacts: 8, open: true },
  { id: 'seg-13', day: 'Segunda', hour: 13, contacts: 5, open: true },
  { id: 'seg-14', day: 'Segunda', hour: 14, contacts: 16, open: true },
  { id: 'seg-15', day: 'Segunda', hour: 15, contacts: 22, open: true },
  { id: 'seg-16', day: 'Segunda', hour: 16, contacts: 18, open: true },
  { id: 'seg-17', day: 'Segunda', hour: 17, contacts: 12, open: true },
  { id: 'seg-18', day: 'Segunda', hour: 18, contacts: 4, open: true },
  { id: 'seg-19', day: 'Segunda', hour: 19, contacts: 0, open: true },
];
