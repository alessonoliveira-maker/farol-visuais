/**
 * Agendas marcadas e comparecidas pela pré-vendas no trimestre, por dia útil e hora cheia
 * (8h às 18h). Contagem de reuniões, não de pessoas.
 * Dado fictício e fixo: nenhuma pessoa ou empresa real.
 *
 * A ordem do array é a ordem das categorias no desenho, e ela não é alfabética. O eixo Y de
 * categoria do Recharts desenha a primeira linha do array embaixo e a última em cima, então os dias
 * entram de sexta para segunda para a leitura sair de segunda (no topo) a sexta (embaixo).
 * Dentro de cada dia, a hora entra em ordem crescente, que é a ordem do eixo X.
 */
export interface AttendanceCell {
  readonly id: string;
  readonly day: string;
  readonly hour: number;
  /** Agendas marcadas no cruzamento; é o que a área da bolha codifica. */
  readonly scheduled: number;
  /** Agendas em que o lead compareceu; é o numerador da taxa da janela. */
  readonly attended: number;
}

export const data: readonly AttendanceCell[] = [
  { id: 'sex-08', day: 'Sexta', hour: 8, scheduled: 4, attended: 2 },
  { id: 'sex-09', day: 'Sexta', hour: 9, scheduled: 9, attended: 5 },
  { id: 'sex-10', day: 'Sexta', hour: 10, scheduled: 14, attended: 9 },
  { id: 'sex-11', day: 'Sexta', hour: 11, scheduled: 16, attended: 10 },
  { id: 'sex-12', day: 'Sexta', hour: 12, scheduled: 10, attended: 6 },
  { id: 'sex-13', day: 'Sexta', hour: 13, scheduled: 6, attended: 3 },
  { id: 'sex-14', day: 'Sexta', hour: 14, scheduled: 12, attended: 7 },
  { id: 'sex-15', day: 'Sexta', hour: 15, scheduled: 15, attended: 9 },
  { id: 'sex-16', day: 'Sexta', hour: 16, scheduled: 12, attended: 7 },
  { id: 'sex-17', day: 'Sexta', hour: 17, scheduled: 9, attended: 5 },
  { id: 'sex-18', day: 'Sexta', hour: 18, scheduled: 5, attended: 2 },
  { id: 'qui-08', day: 'Quinta', hour: 8, scheduled: 5, attended: 2 },
  { id: 'qui-09', day: 'Quinta', hour: 9, scheduled: 12, attended: 7 },
  { id: 'qui-10', day: 'Quinta', hour: 10, scheduled: 19, attended: 16 },
  { id: 'qui-11', day: 'Quinta', hour: 11, scheduled: 22, attended: 18 },
  { id: 'qui-12', day: 'Quinta', hour: 12, scheduled: 14, attended: 11 },
  { id: 'qui-13', day: 'Quinta', hour: 13, scheduled: 8, attended: 4 },
  { id: 'qui-14', day: 'Quinta', hour: 14, scheduled: 16, attended: 10 },
  { id: 'qui-15', day: 'Quinta', hour: 15, scheduled: 20, attended: 12 },
  { id: 'qui-16', day: 'Quinta', hour: 16, scheduled: 17, attended: 10 },
  { id: 'qui-17', day: 'Quinta', hour: 17, scheduled: 13, attended: 8 },
  { id: 'qui-18', day: 'Quinta', hour: 18, scheduled: 6, attended: 3 },
  { id: 'qua-08', day: 'Quarta', hour: 8, scheduled: 6, attended: 3 },
  { id: 'qua-09', day: 'Quarta', hour: 9, scheduled: 12, attended: 7 },
  { id: 'qua-10', day: 'Quarta', hour: 10, scheduled: 20, attended: 16 },
  { id: 'qua-11', day: 'Quarta', hour: 11, scheduled: 23, attended: 19 },
  { id: 'qua-12', day: 'Quarta', hour: 12, scheduled: 14, attended: 11 },
  { id: 'qua-13', day: 'Quarta', hour: 13, scheduled: 9, attended: 5 },
  { id: 'qua-14', day: 'Quarta', hour: 14, scheduled: 17, attended: 10 },
  { id: 'qua-15', day: 'Quarta', hour: 15, scheduled: 21, attended: 13 },
  { id: 'qua-16', day: 'Quarta', hour: 16, scheduled: 18, attended: 11 },
  { id: 'qua-17', day: 'Quarta', hour: 17, scheduled: 13, attended: 8 },
  { id: 'qua-18', day: 'Quarta', hour: 18, scheduled: 7, attended: 3 },
  { id: 'ter-08', day: 'Terça', hour: 8, scheduled: 5, attended: 2 },
  { id: 'ter-09', day: 'Terça', hour: 9, scheduled: 11, attended: 7 },
  { id: 'ter-10', day: 'Terça', hour: 10, scheduled: 18, attended: 15 },
  { id: 'ter-11', day: 'Terça', hour: 11, scheduled: 21, attended: 17 },
  { id: 'ter-12', day: 'Terça', hour: 12, scheduled: 13, attended: 11 },
  { id: 'ter-13', day: 'Terça', hour: 13, scheduled: 8, attended: 4 },
  { id: 'ter-14', day: 'Terça', hour: 14, scheduled: 15, attended: 9 },
  { id: 'ter-15', day: 'Terça', hour: 15, scheduled: 19, attended: 12 },
  { id: 'ter-16', day: 'Terça', hour: 16, scheduled: 16, attended: 10 },
  { id: 'ter-17', day: 'Terça', hour: 17, scheduled: 12, attended: 7 },
  { id: 'ter-18', day: 'Terça', hour: 18, scheduled: 6, attended: 3 },
  { id: 'seg-08', day: 'Segunda', hour: 8, scheduled: 5, attended: 2 },
  { id: 'seg-09', day: 'Segunda', hour: 9, scheduled: 10, attended: 6 },
  { id: 'seg-10', day: 'Segunda', hour: 10, scheduled: 16, attended: 10 },
  { id: 'seg-11', day: 'Segunda', hour: 11, scheduled: 19, attended: 12 },
  { id: 'seg-12', day: 'Segunda', hour: 12, scheduled: 12, attended: 7 },
  { id: 'seg-13', day: 'Segunda', hour: 13, scheduled: 7, attended: 4 },
  { id: 'seg-14', day: 'Segunda', hour: 14, scheduled: 14, attended: 9 },
  { id: 'seg-15', day: 'Segunda', hour: 15, scheduled: 17, attended: 10 },
  { id: 'seg-16', day: 'Segunda', hour: 16, scheduled: 14, attended: 9 },
  { id: 'seg-17', day: 'Segunda', hour: 17, scheduled: 11, attended: 7 },
  { id: 'seg-18', day: 'Segunda', hour: 18, scheduled: 5, attended: 2 },
];

/**
 * A janela marcada, em dias e horas do próprio dado. Ela cobre três categorias em cada eixo, e
 * isso é premissa do desenho, não acaso: a faixa é desenhada a partir do passo entre categorias
 * vizinhas, e com uma só categoria num eixo o retângulo nasce com largura zero (REC-24).
 */
export const windowDays: readonly string[] = ['Terça', 'Quarta', 'Quinta'];
export const windowHours: readonly number[] = [10, 11, 12];
