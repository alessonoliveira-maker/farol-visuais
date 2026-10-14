/**
 * Perdas registradas no CRM no trimestre, por squad comercial e motivo. Contagem de oportunidades.
 * Dado fictício e fixo: os squads são times internos, nenhum nome é pessoa ou empresa real.
 * Squad Cedro tem só 3 casos, para provar o selo de n baixo; Squad Dourado é medido e não perdeu
 * nenhuma oportunidade (total zero, `sem casos`); Squad Éter não teve coleta no período
 * (`counts` nulo, `indisponível`), separado do zero medido de propósito.
 */
export type LossReasonId = 'sem-fit' | 'preco' | 'concorrencia' | 'sem-retorno' | 'sem-motivo';

export interface LossReason {
  readonly id: LossReasonId;
  readonly label: string;
  /** Posição fixa na paleta (COR-8: 1, 3, 6, 5). A cor é do motivo, não da posição. */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Ausência de registro: segmento vazado em neutro, sempre por último. */
  readonly neutral?: boolean;
}

export interface SquadLosses {
  readonly id: string;
  readonly label: string;
  /** Perdas por motivo. `null` quando o squad não teve coleta no período (indisponível). */
  readonly counts: Readonly<Record<LossReasonId, number>> | null;
}

/** Ordem da pilha e da legenda; o primeiro motivo é a base lida na fatia de destaque. */
export const reasons: readonly LossReason[] = [
  { id: 'sem-fit', label: 'Sem fit', slot: 1 },
  { id: 'preco', label: 'Preço', slot: 3 },
  { id: 'concorrencia', label: 'Concorrência', slot: 6 },
  { id: 'sem-retorno', label: 'Sem retorno do contato', slot: 5 },
  { id: 'sem-motivo', label: 'Sem motivo registrado', neutral: true },
];

export const data: readonly SquadLosses[] = [
  { id: 'squad-01', label: 'Squad Aurora', counts: { 'sem-fit': 41, preco: 22, concorrencia: 18, 'sem-retorno': 12, 'sem-motivo': 3 } },
  { id: 'squad-02', label: 'Squad Boreal', counts: { 'sem-fit': 19, preco: 14, concorrencia: 9, 'sem-retorno': 8, 'sem-motivo': 4 } },
  { id: 'squad-03', label: 'Squad Cedro', counts: { 'sem-fit': 1, preco: 1, concorrencia: 0, 'sem-retorno': 1, 'sem-motivo': 0 } },
  { id: 'squad-04', label: 'Squad Dourado', counts: { 'sem-fit': 0, preco: 0, concorrencia: 0, 'sem-retorno': 0, 'sem-motivo': 0 } },
  { id: 'squad-05', label: 'Squad Éter', counts: null },
];
