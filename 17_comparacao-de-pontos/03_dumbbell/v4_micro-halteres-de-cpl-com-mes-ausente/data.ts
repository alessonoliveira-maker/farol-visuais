/**
 * CPL de quatro plataformas de mídia genéricas em jul/26 e em ago/26, em reais por lead.
 * Dado fictício e fixo: nenhuma plataforma corresponde a produto ou empresa real. Uma delas não
 * veiculou em agosto (`august: null`, ausência e não zero), e outra mudou só R$ 1, o que deixa as
 * duas cabeças coladas.
 */
export interface PlatformCpl {
  readonly id: string;
  readonly name: string;
  /** CPL de jul/26, em reais por lead. */
  readonly july: number;
  /** CPL de ago/26, em reais por lead; `null` quando a plataforma não veiculou no mês. */
  readonly august: number | null;
}

export const monthBefore = '2026-07';
export const monthAfter = '2026-08';

export const data: readonly PlatformCpl[] = [
  { id: 'plat-busca', name: 'Busca paga', july: 38, august: 31 },
  { id: 'plat-social', name: 'Rede social', july: 52, august: 53 },
  { id: 'plat-video', name: 'Vídeo curto', july: 74, august: 86 },
  { id: 'plat-display', name: 'Display', july: 45, august: null },
];

/** CPL que cai é bom: a cor do conector e do delta segue esta polaridade (COR-6). */
export const goodDirection = 'down' as const;
