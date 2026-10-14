/**
 * Vinte e cinco marcos de 2027 em quatro públicos. Dois estão sem data (`date: null`) e saem do
 * eixo para a coluna "a definir". Sete marcos caem na semana de 29/03/2027, de propósito: três do
 * comercial e dois da pré-vendas dividem o mesmo pixel e viram um losango com contador cada.
 * `today` é o dia de referência, fixo, nunca lido do relógio.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export type Audience = 'diretoria' | 'comercial' | 'pre-vendas' | 'marketing';

export interface YearMilestone {
  readonly id: string;
  readonly name: string;
  readonly audience: Audience;
  /** Data `YYYY-MM-DD`, ou `null` quando o marco ainda não tem data definida. */
  readonly date: string | null;
}

/** Os públicos na ordem das faixas, de cima para baixo. */
export const audiences: readonly { readonly id: Audience; readonly label: string }[] = [
  { id: 'diretoria', label: 'Diretoria' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'pre-vendas', label: 'Pré-vendas' },
  { id: 'marketing', label: 'Marketing' },
];

export const data: readonly YearMilestone[] = [
  { id: 'd-plano', name: 'Plano anual aprovado', audience: 'diretoria', date: '2027-01-15' },
  { id: 'd-t1', name: 'Revisão de meta T1', audience: 'diretoria', date: '2027-04-02' },
  { id: 'd-t2', name: 'Revisão de meta T2', audience: 'diretoria', date: '2027-07-02' },
  { id: 'd-t3', name: 'Revisão de meta T3', audience: 'diretoria', date: '2027-10-01' },
  { id: 'd-fecha', name: 'Fechamento do ano', audience: 'diretoria', date: '2027-12-17' },
  { id: 'c-metas', name: 'Metas por executivo', audience: 'comercial', date: '2027-01-25' },
  { id: 'c-playbook', name: 'Playbook de negociação', audience: 'comercial', date: '2027-03-29' },
  { id: 'c-precos', name: 'Tabela de preços nova', audience: 'comercial', date: '2027-03-30' },
  { id: 'c-comissao', name: 'Comissão do T2', audience: 'comercial', date: '2027-04-01' },
  { id: 'c-piloto', name: 'Piloto de reativação', audience: 'comercial', date: '2027-05-17' },
  { id: 'c-renovacao', name: 'Mutirão de renovação', audience: 'comercial', date: '2027-08-23' },
  { id: 'c-convencao', name: 'Convenção de vendas', audience: 'comercial', date: '2027-11-08' },
  { id: 'c-parceiros', name: 'Novo canal de parceiros', audience: 'comercial', date: null },
  { id: 'p-contas', name: 'Base de contas', audience: 'pre-vendas', date: '2027-02-08' },
  { id: 'p-script', name: 'Script de abertura v2', audience: 'pre-vendas', date: '2027-03-30' },
  { id: 'p-cadencia', name: 'Cadência de seis toques', audience: 'pre-vendas', date: '2027-04-01' },
  { id: 'p-painel', name: 'Painel de agenda', audience: 'pre-vendas', date: '2027-06-28' },
  { id: 'p-objecoes', name: 'Treino de objeções', audience: 'pre-vendas', date: '2027-09-13' },
  { id: 'p-turnos', name: 'Dois turnos de contato', audience: 'pre-vendas', date: '2027-11-22' },
  { id: 'm-calendario', name: 'Calendário anual', audience: 'marketing', date: '2027-01-18' },
  { id: 'm-site', name: 'Reformulação do site', audience: 'marketing', date: '2027-03-31' },
  { id: 'm-reativacao', name: 'Campanha de reativação', audience: 'marketing', date: '2027-05-24' },
  { id: 'm-webinar', name: 'Webinar de produto', audience: 'marketing', date: '2027-08-10' },
  { id: 'm-evento', name: 'Evento do cliente', audience: 'marketing', date: '2027-10-19' },
  { id: 'm-pauta', name: 'Pauta de 2028', audience: 'marketing', date: null },
];

/** Dia de referência do plano, no mesmo formato do dado. */
export const today = '2027-06-14';
