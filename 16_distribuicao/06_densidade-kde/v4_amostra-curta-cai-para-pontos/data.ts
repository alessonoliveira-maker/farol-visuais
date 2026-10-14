/**
 * Ticket de fechamento dos negócios ganhos por segmento de cliente, em reais por negócio, depois de
 * um filtro que deixou amostras de tamanhos muito diferentes. Dado fictício e fixo: nenhuma
 * correspondência com a base real.
 *
 * Cinco grupos, escolhidos para exercitar a regra de piso. Dois são grandes (146 e 88 negócios) e
 * merecem curva. Um tem 22 e outro 9: pouco para estimar forma, então a peça desenha os pontos.
 * O último tem 3 negócios, abaixo de qualquer desenho, e sai só como valor escrito. Os quatro
 * primeiros vêm de um sorteador de semente fixa; o quinto é literal, para o texto ser conferível.
 */

export interface SegmentTickets {
  readonly id: string;
  readonly name: string;
  /** Um ticket por negócio ganho, em reais. */
  readonly values: readonly number[];
}

interface Profile {
  readonly id: string;
  readonly name: string;
  readonly count: number;
  readonly median: number;
  readonly spread: number;
}

const SEED = 20261008;
/** Menor ticket que a política comercial aceita fechar, em reais. A métrica não é negativa. */
const FLOOR = 4_000;

const PROFILES: readonly Profile[] = [
  { id: 'industry', name: 'Indústria', count: 146, median: 44_000, spread: 0.3 },
  { id: 'commerce', name: 'Comércio', count: 88, median: 26_000, spread: 0.3 },
  { id: 'retail', name: 'Varejo', count: 22, median: 24_000, spread: 0.4 },
  { id: 'services', name: 'Serviços', count: 9, median: 38_000, spread: 0.3 },
];

const PUBLIC_SECTOR_VALUES: readonly number[] = [31_200, 38_000, 44_500];

/** Sorteador determinístico de 32 bits: a mesma semente devolve a mesma sequência. */
function seededUniform(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(): readonly SegmentTickets[] {
  const next = seededUniform(SEED);
  const gauss = (): number => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  const drawn = PROFILES.map((profile) => ({
    id: profile.id,
    name: profile.name,
    values: Array.from({ length: profile.count }, () =>
      Math.round(Math.max(FLOOR, profile.median * Math.exp(profile.spread * gauss())) / 100) * 100,
    ),
  }));
  return [...drawn, { id: 'public-sector', name: 'Governo', values: PUBLIC_SECTOR_VALUES }];
}

/** Os cinco segmentos, do maior n para o menor. */
export const data: readonly SegmentTickets[] = build();
