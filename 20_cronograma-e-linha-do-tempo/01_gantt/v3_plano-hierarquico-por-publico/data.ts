/**
 * Plano de 2027 em três níveis: público, iniciativa e entrega. Só a entrega tem datas, dono e
 * status; público e iniciativa ganham o período pela envoltória das entregas filhas.
 * A lista já vem em ordem de árvore (pai antes dos filhos).
 * Dado fictício e fixo: os donos são nomes inventados com inicial de sobrenome.
 */
export type Status = 'done' | 'active' | 'planned' | 'late';

export interface PlanNode {
  readonly id: string;
  readonly name: string;
  /** Id do nó pai; `null` no nível do público. */
  readonly parentId: string | null;
  /** Só na entrega: responsável. */
  readonly owner?: string;
  /** Só na entrega: situação em relação ao plano. */
  readonly status?: Status;
  /** Só na entrega: primeiro dia, em YYYY-MM-DD. */
  readonly start?: string;
  /** Só na entrega: último dia, em YYYY-MM-DD. */
  readonly end?: string;
}

export const data: readonly PlanNode[] = [
  { id: 'pub-comercial', name: 'Comercial', parentId: null },
  { id: 'ini-territorios', name: 'Expansão regional', parentId: 'pub-comercial' },
  { id: 'ent-mapa', name: 'Mapa de territórios', parentId: 'ini-territorios', owner: 'Marta S.', status: 'done', start: '2027-01-11', end: '2027-02-26' },
  { id: 'ent-metas', name: 'Metas por carteira', parentId: 'ini-territorios', owner: 'Caio R.', status: 'late', start: '2027-02-08', end: '2027-04-30' },
  { id: 'pub-prevendas', name: 'Pré-vendas', parentId: null },
  { id: 'ini-cadencia', name: 'Cadência de contato', parentId: 'pub-prevendas' },
  { id: 'ent-scripts', name: 'Revisão dos scripts', parentId: 'ini-cadencia', owner: 'Davi T.', status: 'done', start: '2027-01-18', end: '2027-03-05' },
  { id: 'ent-agenda', name: 'Agenda unificada', parentId: 'ini-cadencia', owner: 'Lia M.', status: 'active', start: '2027-04-05', end: '2027-08-27' },
  { id: 'pub-marketing', name: 'Marketing', parentId: null },
  { id: 'ini-conteudo', name: 'Calendário de conteúdo', parentId: 'pub-marketing' },
  { id: 'ent-pauta', name: 'Pauta do semestre', parentId: 'ini-conteudo', owner: 'Rui A.', status: 'active', start: '2027-03-15', end: '2027-06-18' },
  { id: 'ent-painel', name: 'Painel de campanhas', parentId: 'ini-conteudo', owner: 'Nina P.', status: 'planned', start: '2027-07-05', end: '2027-09-24' },
  { id: 'pub-diretoria', name: 'Diretoria', parentId: null },
  { id: 'ini-planejamento', name: 'Planejamento de 2028', parentId: 'pub-diretoria' },
  { id: 'ent-premissas', name: 'Premissas de receita', parentId: 'ini-planejamento', owner: 'Otto B.', status: 'planned', start: '2027-08-02', end: '2027-10-15' },
  { id: 'ent-orcamento', name: 'Revisão do orçamento', parentId: 'ini-planejamento', owner: 'Ana K.', status: 'planned', start: '2027-10-04', end: '2027-12-17' },
];

/** Hoje, vindo do dado, nunca do relógio. */
export const today = '2027-05-20';
/** Eixo do ano: primeiro e último dia, inclusive. */
export const windowStart = '2027-01-01';
export const windowEnd = '2027-12-31';
