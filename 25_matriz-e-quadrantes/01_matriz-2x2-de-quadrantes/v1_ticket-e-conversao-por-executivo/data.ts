/**
 * Resultado do trimestre de 14 executivos comerciais: ticket médio das vendas ganhas, em reais,
 * e oportunidades trabalhadas contra ganhas. `ticketReais` é nulo quando o executivo não fechou
 * nenhuma venda, e `oportunidades` zero quer dizer que ele não trabalhou nenhuma, caso em que a
 * conversão não existe. Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface ExecutiveQuarter {
  readonly id: string;
  readonly name: string;
  readonly ticketReais: number | null;
  readonly ganhas: number;
  readonly oportunidades: number;
}

export const data: readonly ExecutiveQuarter[] = [
  { id: 'exec-01', name: 'Murilo C.', ticketReais: 74_200, ganhas: 19, oportunidades: 64 },
  { id: 'exec-02', name: 'Renan A.', ticketReais: 61_800, ganhas: 14, oportunidades: 52 },
  { id: 'exec-03', name: 'Ana Carolina M.', ticketReais: 52_300, ganhas: 17, oportunidades: 58 },
  { id: 'exec-04', name: 'Bruno T.', ticketReais: 47_900, ganhas: 14, oportunidades: 72 },
  { id: 'exec-05', name: 'Larissa P.', ticketReais: 38_600, ganhas: 15, oportunidades: 49 },
  { id: 'exec-06', name: 'Davi S.', ticketReais: 33_400, ganhas: 9, oportunidades: 60 },
  { id: 'exec-07', name: 'Priscila N.', ticketReais: 66_700, ganhas: 7, oportunidades: 55 },
  { id: 'exec-08', name: 'Otávio L.', ticketReais: 85_100, ganhas: 6, oportunidades: 41 },
  { id: 'exec-09', name: 'Camila R.', ticketReais: 36_500, ganhas: 10, oportunidades: 66 },
  { id: 'exec-10', name: 'Gustavo F.', ticketReais: 29_700, ganhas: 8, oportunidades: 72 },
  { id: 'exec-11', name: 'Helena B.', ticketReais: 57_500, ganhas: 16, oportunidades: 61 },
  { id: 'exec-12', name: 'Fábio J.', ticketReais: 36_900, ganhas: 13, oportunidades: 47 },
  { id: 'exec-13', name: 'Ícaro M.', ticketReais: null, ganhas: 0, oportunidades: 18 },
  { id: 'exec-14', name: 'Vera K.', ticketReais: 44_800, ganhas: 0, oportunidades: 0 },
];
