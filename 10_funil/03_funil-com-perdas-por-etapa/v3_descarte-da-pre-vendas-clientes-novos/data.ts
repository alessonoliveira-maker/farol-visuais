/**
 * Descarte da Pré-vendas por etapa em 2026-08: Entradas, Conexão e Agenda marcada, com o motivo
 * de cada descarte. Dois recortes fixos e fictícios, em número de leads: "todos" e "apenas
 * clientes novos" (canal_canonico fora de cliente_ativo e indicação).
 *
 * Fechamento auditado a mão nos dois recortes: advanced + soma dos motivos + inProgress =
 * entered, e o entered de uma etapa é o advanced da etapa anterior.
 */
export type DiscardMotiveKey = 'outOfProfile' | 'noReturn' | 'invalidContact' | 'noInterest' | 'duplicate';

export interface DiscardMotiveDefinition {
  readonly key: DiscardMotiveKey;
  readonly label: string;
  /** Slot categórico fixo (CONTRATO, COR-8): 1, 3, 6, 5, 2 nesta ordem. */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface PrevendasStageRow {
  readonly id: string;
  readonly stage: string;
  readonly entered: number;
  readonly advanced: number;
  readonly inProgress: number;
  readonly outOfProfile: number;
  readonly noReturn: number;
  readonly invalidContact: number;
  readonly noInterest: number;
  readonly duplicate: number;
}

export const motives: readonly DiscardMotiveDefinition[] = [
  { key: 'outOfProfile', label: 'Fora do perfil', slot: 1 },
  { key: 'noReturn', label: 'Sem retorno', slot: 3 },
  { key: 'invalidContact', label: 'Contato inválido', slot: 6 },
  { key: 'noInterest', label: 'Sem interesse', slot: 5 },
  { key: 'duplicate', label: 'Duplicado', slot: 2 },
];

/** Recorte completo: todas as entradas da Pré-vendas em 2026-08. É também o recorte padrão do componente e a base do domínio fixo. */
export const data: readonly PrevendasStageRow[] = [
  { id: 'entradas', stage: 'Entradas', entered: 640, advanced: 412, inProgress: 70, outOfProfile: 52, noReturn: 46, invalidContact: 28, noInterest: 20, duplicate: 12 },
  { id: 'conexao', stage: 'Conexão', entered: 412, advanced: 248, inProgress: 34, outOfProfile: 18, noReturn: 51, invalidContact: 24, noInterest: 22, duplicate: 15 },
  { id: 'agenda', stage: 'Agenda marcada', entered: 248, advanced: 187, inProgress: 18, outOfProfile: 4, noReturn: 15, invalidContact: 9, noInterest: 10, duplicate: 5 },
];

/** Recorte apenas clientes novos: canal_canonico fora de cliente_ativo e indicação. */
export const dataClientesNovos: readonly PrevendasStageRow[] = [
  { id: 'entradas', stage: 'Entradas', entered: 512, advanced: 322, inProgress: 54, outOfProfile: 48, noReturn: 38, invalidContact: 24, noInterest: 16, duplicate: 10 },
  { id: 'conexao', stage: 'Conexão', entered: 322, advanced: 188, inProgress: 26, outOfProfile: 16, noReturn: 42, invalidContact: 20, noInterest: 18, duplicate: 12 },
  { id: 'agenda', stage: 'Agenda marcada', entered: 188, advanced: 138, inProgress: 14, outOfProfile: 3, noReturn: 13, invalidContact: 7, noInterest: 8, duplicate: 5 },
];
