/**
 * Agendas marcadas pela pré-vendas no trimestre, por dia útil e hora cheia (8h às 19h).
 * Dado fictício e fixo: nenhuma pessoa ou empresa real. A ordem do array já segue a leitura do
 * punch card: o eixo Y de categoria do Recharts desenha a primeira linha do array embaixo e a
 * última em cima, então os dias entram de sexta para segunda para o desenho sair de segunda (no
 * topo) a sexta (embaixo). Dentro de cada dia, a hora entra em ordem crescente.
 */
export interface ScheduleCell {
  readonly id: string;
  readonly day: string;
  readonly hour: number;
  readonly count: number;
}

export const data: readonly ScheduleCell[] = [
  { id: 'sex-08', day: 'Sexta', hour: 8, count: 4 },
  { id: 'sex-09', day: 'Sexta', hour: 9, count: 10 },
  { id: 'sex-10', day: 'Sexta', hour: 10, count: 17 },
  { id: 'sex-11', day: 'Sexta', hour: 11, count: 20 },
  { id: 'sex-12', day: 'Sexta', hour: 12, count: 11 },
  { id: 'sex-13', day: 'Sexta', hour: 13, count: 7 },
  { id: 'sex-14', day: 'Sexta', hour: 14, count: 14 },
  { id: 'sex-15', day: 'Sexta', hour: 15, count: 18 },
  { id: 'sex-16', day: 'Sexta', hour: 16, count: 15 },
  { id: 'sex-17', day: 'Sexta', hour: 17, count: 11 },
  { id: 'sex-18', day: 'Sexta', hour: 18, count: 6 },
  { id: 'sex-19', day: 'Sexta', hour: 19, count: 2 },
  { id: 'qui-08', day: 'Quinta', hour: 8, count: 7 },
  { id: 'qui-09', day: 'Quinta', hour: 9, count: 15 },
  { id: 'qui-10', day: 'Quinta', hour: 10, count: 26 },
  { id: 'qui-11', day: 'Quinta', hour: 11, count: 31 },
  { id: 'qui-12', day: 'Quinta', hour: 12, count: 18 },
  { id: 'qui-13', day: 'Quinta', hour: 13, count: 11 },
  { id: 'qui-14', day: 'Quinta', hour: 14, count: 22 },
  { id: 'qui-15', day: 'Quinta', hour: 15, count: 29 },
  { id: 'qui-16', day: 'Quinta', hour: 16, count: 24 },
  { id: 'qui-17', day: 'Quinta', hour: 17, count: 17 },
  { id: 'qui-18', day: 'Quinta', hour: 18, count: 10 },
  { id: 'qui-19', day: 'Quinta', hour: 19, count: 3 },
  { id: 'qua-08', day: 'Quarta', hour: 8, count: 7 },
  { id: 'qua-09', day: 'Quarta', hour: 9, count: 16 },
  { id: 'qua-10', day: 'Quarta', hour: 10, count: 28 },
  { id: 'qua-11', day: 'Quarta', hour: 11, count: 32 },
  { id: 'qua-12', day: 'Quarta', hour: 12, count: 18 },
  { id: 'qua-13', day: 'Quarta', hour: 13, count: 12 },
  { id: 'qua-14', day: 'Quarta', hour: 14, count: 23 },
  { id: 'qua-15', day: 'Quarta', hour: 15, count: 30 },
  { id: 'qua-16', day: 'Quarta', hour: 16, count: 25 },
  { id: 'qua-17', day: 'Quarta', hour: 17, count: 17 },
  { id: 'qua-18', day: 'Quarta', hour: 18, count: 10 },
  { id: 'qua-19', day: 'Quarta', hour: 19, count: 3 },
  { id: 'ter-08', day: 'Terça', hour: 8, count: 6 },
  { id: 'ter-09', day: 'Terça', hour: 9, count: 15 },
  { id: 'ter-10', day: 'Terça', hour: 10, count: 25 },
  { id: 'ter-11', day: 'Terça', hour: 11, count: 29 },
  { id: 'ter-12', day: 'Terça', hour: 12, count: 17 },
  { id: 'ter-13', day: 'Terça', hour: 13, count: 11 },
  { id: 'ter-14', day: 'Terça', hour: 14, count: 21 },
  { id: 'ter-15', day: 'Terça', hour: 15, count: 27 },
  { id: 'ter-16', day: 'Terça', hour: 16, count: 23 },
  { id: 'ter-17', day: 'Terça', hour: 17, count: 16 },
  { id: 'ter-18', day: 'Terça', hour: 18, count: 9 },
  { id: 'ter-19', day: 'Terça', hour: 19, count: 3 },
  { id: 'seg-08', day: 'Segunda', hour: 8, count: 3 },
  { id: 'seg-09', day: 'Segunda', hour: 9, count: 8 },
  { id: 'seg-10', day: 'Segunda', hour: 10, count: 13 },
  { id: 'seg-11', day: 'Segunda', hour: 11, count: 15 },
  { id: 'seg-12', day: 'Segunda', hour: 12, count: 9 },
  { id: 'seg-13', day: 'Segunda', hour: 13, count: 6 },
  { id: 'seg-14', day: 'Segunda', hour: 14, count: 11 },
  { id: 'seg-15', day: 'Segunda', hour: 15, count: 14 },
  { id: 'seg-16', day: 'Segunda', hour: 16, count: 12 },
  { id: 'seg-17', day: 'Segunda', hour: 17, count: 8 },
  { id: 'seg-18', day: 'Segunda', hour: 18, count: 5 },
  { id: 'seg-19', day: 'Segunda', hour: 19, count: 1 },
];
