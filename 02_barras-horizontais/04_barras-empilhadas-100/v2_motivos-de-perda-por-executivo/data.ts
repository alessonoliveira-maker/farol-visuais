/**
 * Oportunidades perdidas no semestre por executivo e motivo de perda registrado no CRM.
 * Contagem de oportunidades. Dado fictício e fixo: os nomes são inventados, nenhum é pessoa real.
 * Os volumes variam de 19 a 214 perdas para o n escrito à direita ter o que dizer, e há um
 * motivo de ausência ("Sem motivo registrado") que fica visível e por último.
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

export interface ExecutiveLosses {
  readonly id: string;
  readonly name: string;
  /** Perdas por motivo. Todo motivo de `reasons` aparece, mesmo com zero. */
  readonly counts: Readonly<Record<LossReasonId, number>>;
}

/** Ordem da pilha e da legenda. O primeiro motivo fica na base e define a ordenação das barras. */
export const reasons: readonly LossReason[] = [
  { id: 'sem-fit', label: 'Sem fit', slot: 1 },
  { id: 'preco', label: 'Preço', slot: 3 },
  { id: 'concorrencia', label: 'Concorrência', slot: 6 },
  { id: 'sem-retorno', label: 'Sem retorno do contato', slot: 5 },
  { id: 'sem-motivo', label: 'Sem motivo registrado', neutral: true },
];

export const data: readonly ExecutiveLosses[] = [
  { id: 'exec-01', name: 'Talita V.', counts: { 'sem-fit': 41, preco: 38, concorrencia: 22, 'sem-retorno': 29, 'sem-motivo': 6 } },
  { id: 'exec-02', name: 'Murilo C.', counts: { 'sem-fit': 58, preco: 71, concorrencia: 34, 'sem-retorno': 39, 'sem-motivo': 12 } },
  { id: 'exec-03', name: 'Ingrid S.', counts: { 'sem-fit': 49, preco: 12, concorrencia: 9, 'sem-retorno': 14, 'sem-motivo': 4 } },
  { id: 'exec-04', name: 'Renan A.', counts: { 'sem-fit': 22, preco: 31, concorrencia: 27, 'sem-retorno': 18, 'sem-motivo': 3 } },
  { id: 'exec-05', name: 'Lorena B.', counts: { 'sem-fit': 17, preco: 21, concorrencia: 8, 'sem-retorno': 11, 'sem-motivo': 9 } },
  { id: 'exec-06', name: 'Heitor M.', counts: { 'sem-fit': 36, preco: 19, concorrencia: 14, 'sem-retorno': 23, 'sem-motivo': 2 } },
  { id: 'exec-07', name: 'Priscila T.', counts: { 'sem-fit': 9, preco: 24, concorrencia: 19, 'sem-retorno': 12, 'sem-motivo': 5 } },
  { id: 'exec-08', name: 'Otavio R.', counts: { 'sem-fit': 13, preco: 3, concorrencia: 1, 'sem-retorno': 2, 'sem-motivo': 0 } },
  { id: 'exec-09', name: 'Maria Eduarda L.', counts: { 'sem-fit': 28, preco: 26, concorrencia: 16, 'sem-retorno': 31, 'sem-motivo': 7 } },
  { id: 'exec-10', name: 'Caio F.', counts: { 'sem-fit': 31, preco: 14, concorrencia: 6, 'sem-retorno': 17, 'sem-motivo': 1 } },
  { id: 'exec-11', name: 'Valentina Q.', counts: { 'sem-fit': 12, preco: 29, concorrencia: 11, 'sem-retorno': 9, 'sem-motivo': 4 } },
  { id: 'exec-12', name: 'Joaquim D.', counts: { 'sem-fit': 26, preco: 17, concorrencia: 13, 'sem-retorno': 12, 'sem-motivo': 8 } },
];
