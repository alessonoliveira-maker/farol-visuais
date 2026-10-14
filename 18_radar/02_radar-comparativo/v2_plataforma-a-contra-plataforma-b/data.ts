/**
 * Plataforma A contra Plataforma B em seis indicadores de mídia em 2026-08, em índice de 0 a 100
 * (maior é melhor). Em CPL e CPL qualificado o índice é invertido: 100 menos o custo em reais
 * dividido pelo teto da escala (R$ 200 no CPL, R$ 400 no CPL qualificado). Nas taxas o índice é a
 * própria taxa sobre os leads da plataforma. A ordem dos eixos é a do registry e a cobertura de dado
 * fica ao lado do CPL qualificado, que ela sustenta. Dado fictício e fixo.
 */
export interface PlatformAxis {
  readonly id: string;
  readonly label: string;
  /** O nome como entra no meio de uma frase. */
  readonly phrase: string;
  /** `cost` guarda o custo em reais; `rate` guarda a contagem que cumpre o critério. */
  readonly kind: 'cost' | 'rate';
  readonly a: number;
  readonly b: number;
  readonly aRaw: number;
  readonly bRaw: number;
}

export interface Platform {
  readonly name: string;
  /** Slot fixo da cor de série: a cor vem da categoria, não da posição no array. */
  readonly slot: 1 | 3;
  /** Leads do mês, base das taxas. */
  readonly leads: number;
}

export const platformA: Platform = { name: 'Plataforma A', slot: 1, leads: 1250 };
export const platformB: Platform = { name: 'Plataforma B', slot: 3, leads: 1000 };

export const data: readonly PlatformAxis[] = [
  { id: 'cpl', label: 'CPL', phrase: 'CPL', kind: 'cost', a: 48, b: 64, aRaw: 104, bRaw: 72 },
  { id: 'cpl-qualified', label: 'CPL qualificado', phrase: 'CPL qualificado', kind: 'cost', a: 38, b: 57, aRaw: 248, bRaw: 172 },
  { id: 'coverage', label: 'Cobertura de dado', phrase: 'cobertura de dado', kind: 'rate', a: 72, b: 52, aRaw: 900, bRaw: 520 },
  { id: 'schedule', label: 'Taxa de agenda', phrase: 'taxa de agenda', kind: 'rate', a: 38, b: 64, aRaw: 475, bRaw: 640 },
  { id: 'reply', label: 'Taxa de resposta', phrase: 'taxa de resposta', kind: 'rate', a: 64, b: 61, aRaw: 800, bRaw: 610 },
  { id: 'fit', label: 'Taxa de fit', phrase: 'taxa de fit', kind: 'rate', a: 40, b: 45, aRaw: 500, bRaw: 450 },
];
