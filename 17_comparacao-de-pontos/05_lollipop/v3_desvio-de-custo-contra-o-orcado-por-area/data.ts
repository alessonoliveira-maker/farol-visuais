/**
 * Custo por unidade entregue de 18 áreas no trimestre, em reais: o orçado e o realizado. Dado
 * fictício e fixo. Sete áreas estouraram o orçado, uma fechou exatamente nele (desvio zero medido)
 * e dez ficaram abaixo; há nomes longos e desvios de centavos ao lado de um desvio de R$ 9,40.
 */
export interface AreaCost {
  readonly id: string;
  readonly name: string;
  /** Custo orçado por unidade entregue, em reais. */
  readonly budget: number;
  /** Custo realizado por unidade entregue, em reais. */
  readonly actual: number;
}

/** Custo que sobe é ruim: acima do orçado é `--negative`, abaixo é `--positive` (COR-6). */
export const goodDirection = 'down' as const;

export const data: readonly AreaCost[] = [
  { id: 'area-01', name: 'Logística de entrega', budget: 24.0, actual: 33.4 },
  { id: 'area-02', name: 'Armazenagem', budget: 12.5, actual: 19.1 },
  { id: 'area-03', name: 'Montagem final', budget: 38.0, actual: 43.2 },
  { id: 'area-04', name: 'Embalagem', budget: 6.8, actual: 10.0 },
  { id: 'area-05', name: 'Controle de qualidade', budget: 9.4, actual: 11.9 },
  { id: 'area-06', name: 'Manutenção de máquinas', budget: 15.0, actual: 16.4 },
  { id: 'area-07', name: 'Atendimento ao cliente', budget: 18.0, actual: 18.6 },
  { id: 'area-08', name: 'Compras', budget: 7.2, actual: 7.2 },
  { id: 'area-09', name: 'Recursos humanos', budget: 5.6, actual: 5.3 },
  { id: 'area-10', name: 'Financeiro', budget: 4.8, actual: 4.1 },
  { id: 'area-11', name: 'Jurídico', budget: 3.9, actual: 2.9 },
  { id: 'area-12', name: 'Tecnologia da informação', budget: 21.0, actual: 19.6 },
  { id: 'area-13', name: 'Engenharia de produto', budget: 28.0, actual: 26.1 },
  { id: 'area-14', name: 'Segurança patrimonial', budget: 6.2, actual: 4.0 },
  { id: 'area-15', name: 'Limpeza e conservação', budget: 5.0, actual: 2.4 },
  { id: 'area-16', name: 'Planejamento', budget: 11.0, actual: 8.2 },
  { id: 'area-17', name: 'Treinamento', budget: 8.4, actual: 5.1 },
  { id: 'area-18', name: 'Expedição noturna', budget: 30.0, actual: 23.2 },
];
