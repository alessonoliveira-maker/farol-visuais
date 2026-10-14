/**
 * Seis indicadores da meta 2027 da diretoria, cada um na própria unidade, lidos como percentual
 * da própria meta numa escala única de 0% a 140%.
 * Dado fictício e fixo: números e nomes inventados, nenhum indicador ou meta é real.
 */
export interface DirectorMetric {
  readonly id: string;
  readonly name: string;
  /** Valor realizado no ano, na unidade própria do indicador. */
  readonly actual: number;
  /** Meta do indicador para 2027, na mesma unidade. */
  readonly target: number;
  /** Formato de exibição do valor original: literais aceitos por ValueFormat em valueFormat.ts. */
  readonly format: 'currencyCompact' | 'int' | 'percent';
  /** Sentido bom da métrica: 'up' quando mais é melhor, 'down' quando menos é melhor. */
  readonly goodDirection: 'up' | 'down';
  /** Recorte que a meta cobre, escrito ao lado do nome. */
  readonly perimeter: string;
}

export const data: readonly DirectorMetric[] = [
  {
    id: 'receita-nova',
    name: 'Receita nova',
    actual: 7_450_000,
    target: 10_000_000,
    format: 'currencyCompact',
    goodDirection: 'up',
    perimeter: '2027',
  },
  {
    id: 'novos-clientes',
    name: 'Novos clientes',
    actual: 62,
    target: 80,
    format: 'int',
    goodDirection: 'up',
    perimeter: 'carteira MFO',
  },
  {
    id: 'ticket-medio',
    name: 'Ticket médio',
    actual: 21_800,
    target: 25_000,
    format: 'currencyCompact',
    goodDirection: 'up',
    perimeter: 'cliente novo',
  },
  {
    id: 'agendas-mes',
    name: 'Agendas por mês',
    actual: 235,
    target: 274,
    format: 'int',
    goodDirection: 'up',
    perimeter: '5 SDRs',
  },
  {
    id: 'conversao-sdr',
    name: 'Conversão de agenda',
    actual: 0.081,
    target: 0.1,
    format: 'percent',
    goodDirection: 'up',
    perimeter: 'SDR a vendas',
  },
  {
    id: 'custo-reuniao',
    name: 'Custo por reunião',
    actual: 612,
    target: 480,
    format: 'currencyCompact',
    goodDirection: 'down',
    perimeter: 'mídia paga',
  },
];
