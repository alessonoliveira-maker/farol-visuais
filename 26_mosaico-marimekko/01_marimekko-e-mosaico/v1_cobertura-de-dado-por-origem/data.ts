/**
 * Leads que entraram em agosto de 2026, contados por origem e pela cobertura do cadastro: dado
 * completo (todo campo obrigatório preenchido), parcial (falta ao menos um) ou ausente (só o
 * contato chegou). Contagem de leads. Dado fictício e fixo: nenhuma origem é marca ou plataforma
 * real e nenhum número vem de base real.
 * A lista vem fora de ordem de propósito: quem ordena as colunas por largura é o componente.
 * Indicação de cliente tem o nome longo, e nela e em Evento o dado ausente fica baixo demais para
 * o rótulo interno, que é o caso da lista de identificação.
 */
export type CoverageId = 'complete' | 'partial' | 'missing';

export interface CoveragePart {
  readonly id: CoverageId;
  readonly label: string;
  /** Posição fixa na paleta, atribuída na ordem 1, 3 (CONTRATO, COR-8). A cor é da parte. */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Ausência de dado: ladrilho hachurado em neutro, sempre por último, no topo da coluna. */
  readonly neutral?: boolean;
}

export interface OriginCoverage {
  readonly id: string;
  readonly label: string;
  /** Leads por cobertura. Toda parte de `parts` aparece, mesmo com zero. */
  readonly counts: Readonly<Record<CoverageId, number>>;
}

/** A ordem desta lista é a ordem da pilha, da base para o topo, e a ordem da legenda. */
export const parts: readonly CoveragePart[] = [
  { id: 'complete', label: 'Dado completo', slot: 1 },
  { id: 'partial', label: 'Dado parcial', slot: 3 },
  { id: 'missing', label: 'Dado ausente', neutral: true },
];

export const data: readonly OriginCoverage[] = [
  { id: 'evento', label: 'Evento', counts: { complete: 92, partial: 33, missing: 7 } },
  { id: 'busca-paga', label: 'Busca paga', counts: { complete: 193, partial: 84, missing: 35 } },
  { id: 'organico', label: 'Orgânico', counts: { complete: 76, partial: 46, missing: 30 } },
  { id: 'redes-sociais', label: 'Redes sociais', counts: { complete: 166, partial: 154, missing: 84 } },
  { id: 'indicacao', label: 'Indicação de cliente', counts: { complete: 178, partial: 27, missing: 7 } },
];
