/**
 * Marcos do planejamento em dezembro de 2026. Dado fictício e fixo: um registro por marco, com data em
 * `YYYY-MM-DD`, um rótulo curto e a natureza do compromisso.
 *
 * Aqui a célula não carrega magnitude nenhuma: ela carrega EVENTO. Por isso não há rampa sequencial
 * nesta versão, e a cor do chip diz a natureza do marco, que é categoria e vai por mapa fixo, nunca por
 * posição na lista.
 *
 * As quatro datas de controle são parâmetro, não dado medido: o dia corrente, as duas pontas da janela
 * de leitura conclusiva e as duas pontas do recesso. Elas existem em texto porque a grade precisa ser a
 * mesma em qualquer máquina e em qualquer dia, nunca vinda do relógio.
 */

/** Mês desenhado, em `YYYY-MM`. */
export const MONTH = '2026-12';

/** Dia corrente, em `YYYY-MM-DD`. Vem do seletor de período da página, nunca do relógio. */
export const TODAY = '2026-12-09';

/** Primeira ponta da janela de leitura conclusiva, em `YYYY-MM-DD`. */
export const WINDOW_START = '2026-12-14';

/** Última ponta da janela, já fora do mês desenhado: é o que faz a barra não terminar na tela. */
export const WINDOW_END = '2027-01-13';

/** Recesso fictício da casa: dias sem marco e sem expediente. */
export const RECESS_START = '2026-12-24';
export const RECESS_END = '2026-12-31';

/** Natureza do marco. O mapa de natureza para cor vive no componente. */
export type MilestoneKind = 'prazo' | 'comite' | 'externo';

export interface Milestone {
  readonly id: string;
  /** Data do marco, em `YYYY-MM-DD`. */
  readonly date: string;
  /** Rótulo curto, escrito inteiro no chip: nada de reticência (TIP-7). */
  readonly label: string;
  readonly kind: MilestoneKind;
}

export const data: readonly Milestone[] = [
  { id: 'marco-01', date: '2026-12-02', label: 'Fecha novembro', kind: 'prazo' },
  { id: 'marco-02', date: '2026-12-03', label: 'Comitê de crédito', kind: 'comite' },
  { id: 'marco-03', date: '2026-12-04', label: 'Revisão de forecast', kind: 'prazo' },
  { id: 'marco-04', date: '2026-12-07', label: 'Reunião de carteira', kind: 'externo' },
  { id: 'marco-05', date: '2026-12-09', label: 'Comitê de crédito', kind: 'comite' },
  { id: 'marco-06', date: '2026-12-09', label: 'Envia o orçamento', kind: 'prazo' },
  { id: 'marco-07', date: '2026-12-10', label: 'Revisão de metas', kind: 'prazo' },
  { id: 'marco-08', date: '2026-12-10', label: 'Visita de cedente', kind: 'externo' },
  { id: 'marco-09', date: '2026-12-10', label: 'Auditoria interna', kind: 'prazo' },
  { id: 'marco-10', date: '2026-12-11', label: 'Envio de proposta', kind: 'externo' },
  { id: 'marco-11', date: '2026-12-14', label: 'Abre a janela', kind: 'prazo' },
  { id: 'marco-12', date: '2026-12-16', label: 'Comitê de crédito', kind: 'comite' },
  { id: 'marco-13', date: '2026-12-16', label: 'Revisão de pipeline', kind: 'prazo' },
  { id: 'marco-14', date: '2026-12-16', label: 'Conselho do ano', kind: 'externo' },
  { id: 'marco-15', date: '2026-12-16', label: 'Fechamento parcial', kind: 'prazo' },
  { id: 'marco-16', date: '2026-12-17', label: 'Envio do relatório', kind: 'prazo' },
  { id: 'marco-17', date: '2026-12-18', label: 'Fecha a campanha', kind: 'prazo' },
  { id: 'marco-18', date: '2026-12-21', label: 'Balanço trimestral', kind: 'prazo' },
  { id: 'marco-19', date: '2026-12-22', label: 'Comitê de crédito', kind: 'comite' },
  { id: 'marco-20', date: '2026-12-23', label: 'Último dia útil', kind: 'prazo' },
  { id: 'marco-21', date: '2026-12-23', label: 'Prestação de contas', kind: 'externo' },
];
