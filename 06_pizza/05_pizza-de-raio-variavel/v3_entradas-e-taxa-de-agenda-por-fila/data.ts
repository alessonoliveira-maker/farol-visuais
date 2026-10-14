/**
 * Entradas e agendas marcadas por fila da pré-vendas no mês, em contagem de oportunidades. A taxa
 * de agenda é derivada no componente (agendas sobre entradas) e vive na escala de 0 a 100%, que é
 * o domínio declarado do raio. Dado fictício e fixo: os nomes descrevem a porta de entrada da
 * oportunidade, nenhuma pessoa e nenhuma marca real.
 */
export interface QueueIntakeSlice {
  readonly id: string;
  readonly name: string;
  /** Entradas do mês, em oportunidades: codifica o ângulo do setor. */
  readonly entradas: number;
  /** Agendas marcadas no mês, em oportunidades: numerador da taxa que codifica o raio. */
  readonly agendas: number;
  /** Slot categórico fixo, mapeado para a ordem 1, 3, 6, 5, 2 da COR-8. */
  readonly slot: 0 | 1 | 2 | 3 | 4;
}

export const data: readonly QueueIntakeSlice[] = [
  { id: 'formulario-site', name: 'Formulário do site', entradas: 412, agendas: 58, slot: 0 },
  { id: 'anuncio-formulario', name: 'Anúncio com formulário', entradas: 268, agendas: 21, slot: 1 },
  { id: 'base-reativada', name: 'Base reativada', entradas: 190, agendas: 47, slot: 2 },
  { id: 'lista-fria', name: 'Lista fria', entradas: 96, agendas: 3, slot: 3 },
  { id: 'indicacao-cliente', name: 'Indicação de cliente', entradas: 48, agendas: 31, slot: 4 },
];
