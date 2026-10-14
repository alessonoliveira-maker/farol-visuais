/**
 * Três etapas do funil comercial por semana, em contagem: entradas registradas, agendas
 * marcadas e negócios fechados. A semana é nomeada pela segunda-feira dela, em `YYYY-MM-DD`,
 * e são 26 semanas seguidas de um ano fictício de 2026.
 * Dado fictício e fixo: nenhuma pessoa e nenhuma empresa é real.
 *
 * O caso difícil que este dado exerce é a etapa que trava enquanto as de cima seguem: entradas
 * e agendas crescem semana a semana até o fim, e os fechamentos sobem até o meio do período e
 * depois caem de 8 para 2. As três grandezas estão na mesma unidade mas em ordens de grandeza
 * diferentes (centenas, dezenas, unidades), então cada painel precisa da sua própria escala e o
 * cartão precisa dizer isso: lidas em altura uma contra a outra, as três mentem.
 */
export interface FunnelWeek {
  readonly week: string;
  readonly entradas: number;
  readonly agendas: number;
  readonly fechamentos: number;
}

export const data: readonly FunnelWeek[] = [
  { week: '2026-04-06', entradas: 118, agendas: 21, fechamentos: 4 },
  { week: '2026-04-13', entradas: 126, agendas: 23, fechamentos: 5 },
  { week: '2026-04-20', entradas: 131, agendas: 22, fechamentos: 4 },
  { week: '2026-04-27', entradas: 124, agendas: 25, fechamentos: 6 },
  { week: '2026-05-04', entradas: 139, agendas: 27, fechamentos: 5 },
  { week: '2026-05-11', entradas: 147, agendas: 26, fechamentos: 6 },
  { week: '2026-05-18', entradas: 152, agendas: 29, fechamentos: 7 },
  { week: '2026-05-25', entradas: 144, agendas: 28, fechamentos: 6 },
  { week: '2026-06-01', entradas: 161, agendas: 31, fechamentos: 7 },
  { week: '2026-06-08', entradas: 168, agendas: 33, fechamentos: 8 },
  { week: '2026-06-15', entradas: 174, agendas: 32, fechamentos: 7 },
  { week: '2026-06-22', entradas: 181, agendas: 35, fechamentos: 8 },
  { week: '2026-06-29', entradas: 177, agendas: 34, fechamentos: 7 },
  { week: '2026-07-06', entradas: 193, agendas: 37, fechamentos: 6 },
  { week: '2026-07-13', entradas: 201, agendas: 39, fechamentos: 5 },
  { week: '2026-07-20', entradas: 208, agendas: 38, fechamentos: 4 },
  { week: '2026-07-27', entradas: 214, agendas: 41, fechamentos: 4 },
  { week: '2026-08-03', entradas: 223, agendas: 43, fechamentos: 3 },
  { week: '2026-08-10', entradas: 231, agendas: 42, fechamentos: 4 },
  { week: '2026-08-17', entradas: 238, agendas: 45, fechamentos: 3 },
  { week: '2026-08-24', entradas: 244, agendas: 44, fechamentos: 3 },
  { week: '2026-08-31', entradas: 251, agendas: 47, fechamentos: 2 },
  { week: '2026-09-07', entradas: 259, agendas: 46, fechamentos: 3 },
  { week: '2026-09-14', entradas: 266, agendas: 49, fechamentos: 2 },
  { week: '2026-09-21', entradas: 272, agendas: 48, fechamentos: 2 },
  { week: '2026-09-28', entradas: 281, agendas: 51, fechamentos: 2 },
];
