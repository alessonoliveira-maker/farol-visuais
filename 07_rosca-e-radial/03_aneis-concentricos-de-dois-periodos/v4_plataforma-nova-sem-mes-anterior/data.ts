/**
 * Investimento em mídia paga por plataforma em dois meses fechados, em reais. Dado fictício e
 * fixo. Vídeo curto entrou na conta em ago/26; em jul/26 a plataforma não existia, e `previous`
 * vem `null` para essa linha, nunca `0` (a ausência não é um valor medido).
 */
export interface PlatformRing {
  readonly id: string;
  readonly name: string;
  /** Posição fixa na paleta categórica, atribuída na ordem 1, 3, 6, 5 (CONTRATO, COR-8). */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  /** `null` quando a plataforma não existia no mês anterior; nunca `0`. */
  readonly previous: number | null;
  readonly current: number;
}

export const data: readonly PlatformRing[] = [
  { id: 'busca-paga', name: 'Busca paga', slot: 1, previous: 150_000, current: 158_000 },
  { id: 'redes-sociais', name: 'Redes sociais', slot: 3, previous: 90_000, current: 94_000 },
  { id: 'video-curto', name: 'Vídeo curto', slot: 6, previous: null, current: 68_000 },
  { id: 'display', name: 'Display', slot: 5, previous: 60_000, current: 40_000 },
];

/** Mês do anel interno (anterior) e do anel externo (atual), em YYYY-MM. */
export const previousMonth = '2026-07';
export const currentMonth = '2026-08';
