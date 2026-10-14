/**
 * Leads captados em julho e agosto por plataforma de mídia, em contagem. Dado fictício e fixo: as
 * plataformas são genéricas, sem marca real. `null` é plataforma sem veiculação no mês, nunca zero;
 * `0` é plataforma que rodou, foi medida e não trouxe nenhum lead. Os dois casos existem em agosto.
 */
export interface PlatformLeads {
  readonly id: string;
  readonly name: string;
  /** Leads de julho; `null` quando a plataforma não foi veiculada no mês. */
  readonly july: number | null;
  /** Leads de agosto; `null` quando a plataforma não foi veiculada no mês. */
  readonly august: number | null;
}

/** Meses comparados, em YYYY-MM: o primeiro é a base, o segundo é o mês de leitura. */
export const months = { base: '2026-07', current: '2026-08' } as const;

export const data: readonly PlatformLeads[] = [
  { id: 'plat-01', name: 'Busca paga', july: 412, august: 438 },
  { id: 'plat-02', name: 'Mídia social', july: 268, august: 231 },
  { id: 'plat-03', name: 'Vídeo curto', july: 96, august: null },
  { id: 'plat-04', name: 'E-mail', july: 54, august: 0 },
];
