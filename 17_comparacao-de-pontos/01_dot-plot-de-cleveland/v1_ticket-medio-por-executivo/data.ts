/**
 * Ticket médio por executivo no trimestre, em reais, e o número de negócios fechados que sustenta
 * cada média. Dado fictício e fixo: nenhum nome é pessoa real. Há um empate de ticket (Heitor L. e
 * Sônia P.), um nome longo e o menor valor perto da base da escala de R$ 120 mil.
 */
export interface ExecutiveTicket {
  readonly id: string;
  readonly name: string;
  readonly ticket: number;
  readonly deals: number;
}

export const data: readonly ExecutiveTicket[] = [
  { id: 'exec-01', name: 'Talita V.', ticket: 338_400, deals: 7 },
  { id: 'exec-02', name: 'Ana Beatriz Cavalcanti', ticket: 312_900, deals: 11 },
  { id: 'exec-03', name: 'Murilo C.', ticket: 301_500, deals: 14 },
  { id: 'exec-04', name: 'Renan A.', ticket: 287_000, deals: 9 },
  { id: 'exec-05', name: 'Débora F.', ticket: 276_300, deals: 16 },
  { id: 'exec-06', name: 'Caio M.', ticket: 262_800, deals: 12 },
  { id: 'exec-07', name: 'Heitor L.', ticket: 241_000, deals: 18 },
  { id: 'exec-08', name: 'Sônia P.', ticket: 241_000, deals: 8 },
  { id: 'exec-09', name: 'Gustavo R.', ticket: 226_100, deals: 19 },
  { id: 'exec-10', name: 'Lívia T.', ticket: 214_900, deals: 13 },
  { id: 'exec-11', name: 'Otávio B.', ticket: 198_300, deals: 15 },
  { id: 'exec-12', name: 'Pietra G.', ticket: 171_600, deals: 10 },
  { id: 'exec-13', name: 'Bruno S.', ticket: 158_800, deals: 17 },
  { id: 'exec-14', name: 'Yasmin D.', ticket: 131_200, deals: 4 },
];
