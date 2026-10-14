/**
 * Painel de metas da diretoria: 9 áreas por 8 métricas de unidades diferentes, medidas em 2026.
 * Cada métrica declara para onde aponta o "bom" (goodDirection), porque a cor da célula é a
 * posição da área dentro da própria coluna, não o valor absoluto. Dado fictício e fixo.
 * `null` é métrica sem medição naquela área (RH ainda não mede NPS), nunca lida como pior valor.
 */
export type MetricFormat = 'currencyCompact' | 'days' | 'decimal' | 'percent' | 'hours';

export interface MetricColumn {
  readonly id: string;
  readonly label: string;
  readonly format: MetricFormat;
  readonly goodDirection: 'up' | 'down';
}

export interface AreaRow {
  readonly areaId: string;
  readonly areaName: string;
  readonly values: Readonly<Record<string, number | null>>;
}

export const METRICS: readonly MetricColumn[] = [
  { id: 'receita', label: 'Receita nova', format: 'currencyCompact', goodDirection: 'up' },
  { id: 'ciclo', label: 'Ciclo de venda', format: 'days', goodDirection: 'down' },
  { id: 'nps', label: 'NPS', format: 'decimal', goodDirection: 'up' },
  { id: 'ocupacao', label: 'Ocupação de vagas', format: 'percent', goodDirection: 'up' },
  { id: 'sla', label: 'SLA de 1º contato', format: 'hours', goodDirection: 'down' },
  { id: 'turnover', label: 'Turnover', format: 'percent', goodDirection: 'down' },
  { id: 'satisfacao', label: 'Satisfação interna', format: 'percent', goodDirection: 'up' },
  { id: 'treinamento', label: 'Treinamento por pessoa', format: 'hours', goodDirection: 'up' },
];

export const data: readonly AreaRow[] = [
  { areaId: 'comercial', areaName: 'Comercial', values: { receita: 2_450_000, ciclo: 38, nps: 7.8, ocupacao: 0.94, sla: 1.2, turnover: 0.09, satisfacao: 0.76, treinamento: 6 } },
  { areaId: 'marketing', areaName: 'Marketing', values: { receita: 890_000, ciclo: 52, nps: 6.9, ocupacao: 0.88, sla: 2.4, turnover: 0.14, satisfacao: 0.71, treinamento: 9 } },
  { areaId: 'prevendas', areaName: 'Pré-vendas', values: { receita: 410_000, ciclo: 21, nps: 7.2, ocupacao: 0.97, sla: 0.4, turnover: 0.22, satisfacao: 0.64, treinamento: 4 } },
  { areaId: 'sucesso-cliente', areaName: 'Sucesso do cliente', values: { receita: 1_180_000, ciclo: 46, nps: 8.4, ocupacao: 0.91, sla: 1.8, turnover: 0.07, satisfacao: 0.83, treinamento: 7 } },
  { areaId: 'produto', areaName: 'Produto', values: { receita: 0, ciclo: 64, nps: 7.5, ocupacao: 0.85, sla: 3.6, turnover: 0.11, satisfacao: 0.79, treinamento: 12 } },
  { areaId: 'financeiro', areaName: 'Financeiro', values: { receita: 0, ciclo: 71, nps: 6.1, ocupacao: 0.96, sla: 4.2, turnover: 0.06, satisfacao: 0.68, treinamento: 3 } },
  { areaId: 'juridico', areaName: 'Jurídico', values: { receita: 0, ciclo: 58, nps: 6.6, ocupacao: 0.99, sla: 5.1, turnover: 0.05, satisfacao: 0.72, treinamento: 2 } },
  { areaId: 'rh', areaName: 'Recursos Humanos', values: { receita: 0, ciclo: null, nps: null, ocupacao: 0.9, sla: 2.9, turnover: 0.18, satisfacao: 0.61, treinamento: 14 } },
  { areaId: 'ti', areaName: 'Tecnologia da Informação', values: { receita: 0, ciclo: 89, nps: 5.8, ocupacao: 0.82, sla: 6.7, turnover: 0.16, satisfacao: 0.58, treinamento: 10 } },
];
