/**
 * Tamanho da equipe comercial por função (pré-vendas, vendas, atendimento), em pessoas, ao longo
 * de 2026. Dado fictício e fixo: nenhuma pessoa real. Cada registro vale a partir da data
 * (stepAfter). Duas mudanças na mesma data e função se resolvem pela ordem deste array: em
 * 2026-03-02, a segunda linha de vendas é a correção da primeira e prevalece.
 */
export type FunctionKey = 'preVendas' | 'vendas' | 'atendimento';

export interface TeamChange {
  readonly date: string;
  readonly categoria: FunctionKey;
  readonly valor: number;
  readonly motivo: string;
}

export const data: readonly TeamChange[] = [
  { date: '2026-01-05', categoria: 'preVendas', valor: 2, motivo: 'Equipe inicial' },
  { date: '2026-01-05', categoria: 'vendas', valor: 4, motivo: 'Equipe inicial' },
  { date: '2026-01-05', categoria: 'atendimento', valor: 3, motivo: 'Equipe inicial' },
  { date: '2026-02-16', categoria: 'vendas', valor: 5, motivo: 'Contratação de vendas' },
  { date: '2026-03-02', categoria: 'vendas', valor: 6, motivo: 'Contratação de vendas' },
  { date: '2026-03-02', categoria: 'vendas', valor: 5, motivo: 'Correção do registro anterior' },
  { date: '2026-03-16', categoria: 'preVendas', valor: 3, motivo: 'Contratação de pré-vendas' },
  { date: '2026-05-04', categoria: 'preVendas', valor: 2, motivo: 'Saída de pré-vendas' },
  { date: '2026-06-01', categoria: 'atendimento', valor: 4, motivo: 'Contratação de atendimento' },
  { date: '2026-07-06', categoria: 'preVendas', valor: 1, motivo: 'Férias coletivas' },
  { date: '2026-07-06', categoria: 'vendas', valor: 3, motivo: 'Férias coletivas' },
  { date: '2026-07-06', categoria: 'atendimento', valor: 2, motivo: 'Férias coletivas' },
  { date: '2026-07-20', categoria: 'preVendas', valor: 2, motivo: 'Volta das férias coletivas' },
  { date: '2026-07-20', categoria: 'vendas', valor: 5, motivo: 'Volta das férias coletivas' },
  { date: '2026-07-20', categoria: 'atendimento', valor: 4, motivo: 'Volta das férias coletivas' },
  { date: '2026-08-17', categoria: 'vendas', valor: 6, motivo: 'Contratação de vendas' },
];

/** Datas do recesso de férias coletivas, para a faixa de anotação. */
export const vacationStart = '2026-07-06';
export const vacationEnd = '2026-07-20';

/** Data de corte do gráfico: o último patamar vale até aqui. */
export const cutoffDate = '2026-09-18';
