/**
 * Leads por origem no trimestre, com quantos têm qualificação registrada e o CPL qualificado em
 * reais. `cpl` é null quando a origem não tem nenhum registro qualificado (ausência, nunca zero).
 * A origem sem declaração vem marcada por `undeclared`. Dado fictício e fixo, 2026 T3.
 */
export interface OriginCoverage {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly qualified: number;
  readonly cpl: number | null;
  readonly undeclared?: boolean;
}

/** Corte declarado: abaixo dele o CPL da origem é rebaixado. Fração de 0 a 1. */
export const threshold = 0.5;

export const data: readonly OriginCoverage[] = [
  { id: 'org-01', name: 'Busca paga', leads: 1_420, qualified: 1_180, cpl: 42.6 },
  { id: 'org-02', name: 'Busca orgânica', leads: 980, qualified: 760, cpl: 18.9 },
  { id: 'org-03', name: 'Anúncio em rede social', leads: 1_760, qualified: 790, cpl: 61.4 },
  { id: 'org-04', name: 'Indicação de cliente', leads: 310, qualified: 262, cpl: 12.2 },
  { id: 'org-05', name: 'Formulário do site, página de preços', leads: 640, qualified: 520, cpl: 35.8 },
  { id: 'org-06', name: 'E-mail marketing', leads: 870, qualified: 505, cpl: 22.1 },
  { id: 'org-07', name: 'Evento presencial', leads: 240, qualified: 96, cpl: 118.5 },
  { id: 'org-08', name: 'Parceiro de revenda', leads: 520, qualified: 188, cpl: 54.7 },
  { id: 'org-09', name: 'Lista comprada', leads: 1_150, qualified: 207, cpl: 97.3 },
  { id: 'org-10', name: 'Webinar', leads: 410, qualified: 303, cpl: 28.4 },
  { id: 'org-11', name: 'Portal de classificados', leads: 690, qualified: 331, cpl: 46.9 },
  { id: 'org-12', name: 'Mensagem direta', leads: 360, qualified: 0, cpl: null },
  { id: 'org-13', name: 'Telefone ativo', leads: 290, qualified: 145, cpl: 39.0 },
  { id: 'org-99', name: 'Sem origem declarada', leads: 510, qualified: 102, cpl: 83.2, undeclared: true },
];
