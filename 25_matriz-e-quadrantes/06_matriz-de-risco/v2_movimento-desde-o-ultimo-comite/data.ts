/**
 * Registro fictício de 23 riscos do plano comercial de 2027, com a posição de cada um no último comitê. `probability` é a chance estimada
 * de ocorrer no ano (de 0 a 1) e `impact` é a perda de receita estimada, em R$ mil; `null` é
 * risco sem impacto avaliado, que fica fora da grade e nunca vale zero. As faixas têm critério
 * numérico (limite inferior incluso, superior excluso) e o nível de cada célula sai de uma
 * tabela de consulta acordada, nunca do produto dos índices. Dado fictício e fixo.
 */
export type Level = 'baixo' | 'medio' | 'alto';

export interface Band {
  readonly key: string;
  readonly label: string;
  readonly from: number;
  /** Limite superior excluso; `null` na última faixa, que não tem teto. */
  readonly to: number | null;
}

export interface Risk {
  readonly id: string;
  readonly name: string;
  readonly probability: number;
  readonly impact: number | null;
  /** Posição no último comitê; ausente quando o risco não mudou de posição desde então. */
  readonly previous?: { readonly probability: number; readonly impact: number | null };
}

/** Da menos para a mais provável: o índice 0 é a base da matriz. */
export const PROBABILITY_BANDS: readonly Band[] = [
  { key: 'rara', label: 'Rara', from: 0, to: 0.2 },
  { key: 'improvavel', label: 'Improvável', from: 0.2, to: 0.4 },
  { key: 'possivel', label: 'Possível', from: 0.4, to: 0.6 },
  { key: 'provavel', label: 'Provável', from: 0.6, to: 0.8 },
  { key: 'quase-certa', label: 'Quase certa', from: 0.8, to: null },
];

/** Perda de receita em R$ mil, do menor para o maior impacto. */
export const IMPACT_BANDS: readonly Band[] = [
  { key: 'minimo', label: 'Mínimo', from: 0, to: 50 },
  { key: 'menor', label: 'Menor', from: 50, to: 150 },
  { key: 'moderado', label: 'Moderado', from: 150, to: 400 },
  { key: 'maior', label: 'Maior', from: 400, to: 1000 },
  { key: 'critico', label: 'Crítico', from: 1000, to: null },
];

/** Tabela de consulta acordada: linha é a faixa de probabilidade, coluna é a de impacto. */
export const LEVEL_TABLE: readonly (readonly Level[])[] = [
  ['baixo', 'baixo', 'baixo', 'medio', 'medio'],
  ['baixo', 'baixo', 'medio', 'medio', 'alto'],
  ['baixo', 'medio', 'medio', 'alto', 'alto'],
  ['medio', 'medio', 'alto', 'alto', 'alto'],
  ['medio', 'alto', 'alto', 'alto', 'alto'],
];

export const data: readonly Risk[] = [
  { id: 'r01', name: 'Teto de capacidade de pré-vendas', probability: 0.86, impact: 520 },
  { id: 'r02', name: 'Atraso na contratação de executivos', probability: 0.82, impact: 610 },
  { id: 'r03', name: 'Dependência de mídia paga', probability: 0.84, impact: 780 },
  { id: 'r04', name: 'Perda do principal canal de origem', probability: 0.88, impact: 1350 },
  { id: 'r05', name: 'Concentração de receita em três contas', probability: 0.81, impact: 1800 },
  { id: 'r06', name: 'Queda de conversão no meio do funil', probability: 0.72, impact: 430 },
  { id: 'r07', name: 'Aumento do custo de aquisição', probability: 0.66, impact: 560 },
  { id: 'r08', name: 'Rotatividade na equipe de campo', probability: 0.74, impact: 490 },
  { id: 'r09', name: 'Atraso em integração de dados', probability: 0.63, impact: 820 },
  { id: 'r10', name: 'Reajuste de preço sem aceitação', probability: 0.68, impact: 1150 },
  { id: 'r11', name: 'Mudança de regra de comissionamento', probability: 0.76, impact: 1020 },
  { id: 'r12', name: 'Sazonalidade mais forte que a prevista', probability: 0.7, impact: 260, previous: { probability: 0.5, impact: 100 } },
  { id: 'r13', name: 'Inadimplência acima do orçamento', probability: 0.83, impact: 310, previous: { probability: 0.5, impact: 230 } },
  { id: 'r14', name: 'Fornecedor de leads com entrega irregular', probability: 0.55, impact: 240 },
  { id: 'r15', name: 'Retrabalho na qualificação de oportunidades', probability: 0.48, impact: 190 },
  { id: 'r16', name: 'Falha pontual na agenda de visitas', probability: 0.45, impact: 90 },
  { id: 'r17', name: 'Entrada de concorrente regional', probability: 0.52, impact: 640, previous: { probability: 0.3, impact: 120 } },
  { id: 'r18', name: 'Atraso de licença de operação', probability: 0.32, impact: 350 },
  { id: 'r19', name: 'Revisão de metas pela matriz', probability: 0.27, impact: 170 },
  { id: 'r20', name: 'Falha prolongada no sistema de pedidos', probability: 0.24, impact: 700, previous: { probability: 0.15, impact: 300 } },
  { id: 'r21', name: 'Erro de cadastro em lote', probability: 0.12, impact: 110 },
  { id: 'r22', name: 'Mudança regulatória de privacidade', probability: 0.38, impact: null },
  { id: 'r23', name: 'Nova exigência de garantia do canal', probability: 0.58, impact: null },
];
