/**
 * Leads gerados por criativo de marketing em 2026-08, num recorte SEM hierarquia: todos os nós
 * estão no mesmo nível e nenhum tem filhos, que é a profundidade 1 que o componente precisa
 * detectar. Três criativos ficaram sem nenhum lead no mês. Dado fictício e fixo: nenhum criativo,
 * campanha ou pessoa é real.
 */
export interface CreativeNode {
  readonly id: string;
  readonly label: string;
  /** Leads no mês. Zero é medição, não ausência, e zero não tem área. */
  readonly leads: number;
  /**
   * Filhos do nó. Ausente ou vazio quando o recorte não tem grupo, e é isso que a guarda de
   * profundidade lê para decidir se o desenho pode ser um empacotamento de círculos.
   */
  readonly children?: readonly CreativeNode[];
}

export const data: readonly CreativeNode[] = [
  { id: 'depoimento-video', label: 'Depoimento em vídeo', leads: 58 },
  { id: 'comparativo-taxas', label: 'Comparativo de taxas', leads: 41 },
  { id: 'convite-webinar', label: 'Convite para webinar', leads: 27 },
  { id: 'bastidores', label: 'Bastidores da operação', leads: 16 },
  { id: 'carrossel-numeros', label: 'Carrossel de números', leads: 9 },
  { id: 'manifesto', label: 'Manifesto da marca', leads: 0 },
  { id: 'aniversario', label: 'Aniversário da casa', leads: 0 },
  { id: 'imprensa', label: 'Recorte de imprensa', leads: 0 },
];
