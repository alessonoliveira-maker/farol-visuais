/**
 * Carga semanal de cada fila de pré-vendas, em % do teto de capacidade da própria fila (100 é a fila
 * no limite): o menor e o maior valor das últimas 8 semanas fechadas e o valor da semana atual.
 * Dado fictício e fixo. Casos difíceis: semana atual dentro da faixa, acima do máximo e ainda abaixo
 * do teto, acima do teto, abaixo do mínimo, uma faixa que atravessa o teto e uma semana atual
 * (172%) que passa do fim do eixo.
 */
export interface QueueLoad {
  readonly id: string;
  readonly queue: string;
  /** Menor carga semanal entre as semanas medidas, em % do teto da fila. */
  readonly min: number;
  /** Maior carga semanal entre as semanas medidas, em % do teto da fila. */
  readonly max: number;
  /** Carga da semana atual, em % do teto da fila. */
  readonly current: number;
  /** Quantas das últimas 8 semanas tiveram medição. */
  readonly weeks: number;
}

export const data: readonly QueueLoad[] = [
  { id: 'fila-01', queue: 'Triagem inicial', min: 62, max: 96, current: 108, weeks: 8 },
  { id: 'fila-02', queue: 'Qualificação por telefone', min: 48, max: 84, current: 79, weeks: 8 },
  { id: 'fila-03', queue: 'Retorno de leads perdidos', min: 22, max: 58, current: 64, weeks: 8 },
  { id: 'fila-04', queue: 'Reativação de base', min: 30, max: 71, current: 172, weeks: 6 },
  { id: 'fila-05', queue: 'Agendamento de visitas', min: 55, max: 103, current: 98, weeks: 8 },
  { id: 'fila-06', queue: 'Pós-proposta', min: 18, max: 52, current: 40, weeks: 8 },
  { id: 'fila-07', queue: 'Contratos em revisão', min: 71, max: 92, current: 93, weeks: 8 },
  { id: 'fila-08', queue: 'Dúvidas técnicas', min: 36, max: 66, current: 20, weeks: 8 },
  { id: 'fila-09', queue: 'Cadastro e documentos', min: 25, max: 47, current: 36, weeks: 8 },
];
