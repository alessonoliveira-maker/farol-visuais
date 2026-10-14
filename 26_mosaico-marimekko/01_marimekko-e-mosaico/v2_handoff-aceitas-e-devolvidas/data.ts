/**
 * Oportunidades que cada fila de pré-vendas passou para vendas no handoff de 2026-T3, separadas
 * em aceitas e devolvidas, e as devolvidas pelo motivo registrado. Contagem de oportunidades.
 * Dado fictício e fixo: nenhuma fila, pessoa ou empresa é real.
 * A lista vem fora de ordem de propósito: quem ordena as colunas por largura é o componente.
 * Reativação de base passou só 3 oportunidades: é a coluna fina, que ganha rótulo escalonado e
 * selo de n. Em Indicação de parceiro o motivo em destaque é baixo demais para o rótulo interno.
 */
export type ReasonId = 'fora-de-perfil' | 'sem-orcamento' | 'sem-retorno';

export interface ReturnReason {
  readonly id: ReasonId;
  readonly label: string;
}

export interface HandoffQueue {
  readonly id: string;
  readonly label: string;
  /** Oportunidades que vendas aceitou. */
  readonly accepted: number;
  /** Oportunidades devolvidas, por motivo. Todo motivo de `reasons` aparece, mesmo com zero. */
  readonly returned: Readonly<Record<ReasonId, number>>;
}

export const reasons: readonly ReturnReason[] = [
  { id: 'fora-de-perfil', label: 'Fora de perfil' },
  { id: 'sem-orcamento', label: 'Sem orçamento' },
  { id: 'sem-retorno', label: 'Sem retorno do contato' },
];

/** O motivo que acende em `--chart-1`; os demais somam numa parte neutra só. */
export const highlightReasonId: ReasonId = 'fora-de-perfil';

export const data: readonly HandoffQueue[] = [
  { id: 'eventos', label: 'Eventos', accepted: 30, returned: { 'fora-de-perfil': 14, 'sem-orcamento': 6, 'sem-retorno': 3 } },
  { id: 'reativacao', label: 'Reativação de base', accepted: 1, returned: { 'fora-de-perfil': 2, 'sem-orcamento': 0, 'sem-retorno': 0 } },
  { id: 'site', label: 'Site e formulário', accepted: 97, returned: { 'fora-de-perfil': 31, 'sem-orcamento': 15, 'sem-retorno': 9 } },
  { id: 'parceiro', label: 'Indicação de parceiro', accepted: 58, returned: { 'fora-de-perfil': 5, 'sem-orcamento': 7, 'sem-retorno': 4 } },
  { id: 'prospeccao', label: 'Prospecção ativa', accepted: 68, returned: { 'fora-de-perfil': 29, 'sem-orcamento': 12, 'sem-retorno': 9 } },
];
