/**
 * Oportunidades perdidas no 3º trimestre por motivo, em contagem de oportunidades e em valor de
 * pipeline perdido, em reais.
 * Dado fictício e fixo: nenhum motivo, valor ou empresa corresponde a caso real.
 */
export interface LossReason {
  readonly id: string;
  readonly name: string;
  readonly count: number;
  readonly amount: number;
  /**
   * Slot categórico fixo (COR-8): a cor segue a categoria, nunca a posição depois de ordenar.
   * Ausente na cauda agrupada, que é pintada em neutro e não disputa slot com motivo nomeado.
   */
  readonly slot?: number;
  /**
   * Só na cauda agrupada: os motivos que ela reúne. Ficam escritos embaixo da linha dela, e não
   * numa dica, porque a ROT-10 não aceita a dica como lugar de identificar parte de um todo.
   */
  readonly parts?: readonly string[];
}

export const data: readonly LossReason[] = [
  { id: 'preco', name: 'Preço acima do previsto', count: 68, amount: 1_240_000, slot: 0 },
  { id: 'perfil', name: 'Sem aderência ao perfil buscado', count: 54, amount: 890_000, slot: 1 },
  { id: 'concorrente', name: 'Escolheu outro fornecedor', count: 39, amount: 1_470_000, slot: 2 },
  { id: 'sem-resposta', name: 'Sem resposta depois do contato', count: 32, amount: 410_000, slot: 3 },
  {
    id: 'outros',
    name: 'Outros motivos (n=3)',
    count: 19,
    amount: 305_000,
    parts: ['contato duplicado', 'fora da região atendida', 'sem orçamento aprovado'],
  },
];

/** O motivo selecionado por padrão, para o desenho parado já mostrar o estado de seleção. */
export const selectedId = 'preco';
