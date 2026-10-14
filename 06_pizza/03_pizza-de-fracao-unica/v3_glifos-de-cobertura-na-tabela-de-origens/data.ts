/**
 * Cobertura de qualificação por origem de lead: quantos leads do mês têm qualificação registrada,
 * contra quantos entraram. Contagens absolutas, nunca fração pré-calculada. Dado fictício e fixo:
 * nenhuma origem, contagem ou parceiro corresponde a dado real.
 */
export interface OriginCoverage {
  readonly id: string;
  /** Nome da origem em pt-BR, escrito por extenso: sem sigla inventada (ROT-8). */
  readonly name: string;
  /** Leads que entraram pela origem no mês. */
  readonly leads: number;
  /** Quantos deles já têm qualificação registrada. */
  readonly qualified: number;
}

/** Mês da medição, em formato de dado; a tela imprime por formatMonthLong. */
export const month = '2026-08';

export const data: readonly OriginCoverage[] = [
  { id: 'indicacao-carteira', name: 'Indicação de cliente da carteira', leads: 18, qualified: 18 },
  { id: 'evento-presencial', name: 'Evento presencial', leads: 52, qualified: 41 },
  { id: 'busca-organica', name: 'Busca orgânica', leads: 138, qualified: 96 },
  { id: 'formulario-site', name: 'Formulário do site', leads: 95, qualified: 62 },
  { id: 'parceiro-contabil', name: 'Parceiro contábil', leads: 8, qualified: 5 },
  { id: 'base-propria', name: 'Base própria', leads: 121, qualified: 74 },
  { id: 'midia-paga', name: 'Mídia paga', leads: 147, qualified: 33 },
];
