/**
 * Ticket de fechamento dos 208 negócios ganhos nos últimos 12 meses, em reais por negócio.
 * Dado fictício e fixo: nenhuma correspondência com a base real.
 *
 * O array traz uma observação por negócio, e quem estima a curva é o componente. A amostra é
 * gerada por um sorteador de semente fixa, então sai igual em qualquer máquina e em qualquer dia.
 * Ela tem duas populações de propósito: a maioria fecha o plano de entrada, perto de R$ 25 mil, e
 * uma parte menor fecha o plano completo, perto de R$ 68 mil. É essa segunda moita que a pergunta
 * "a curva tem mais de um pico" precisa encontrar, e que a média sozinha esconderia.
 */

const SAMPLE_SIZE = 208;
const SEED = 20261005;
const ENTRY_SHARE = 0.62;
const ENTRY_MEAN = 25_000;
const ENTRY_SPREAD = 8_000;
const FULL_MEAN = 72_000;
const FULL_SPREAD = 15_800;
/** Menor ticket que a política comercial aceita fechar, em reais. A métrica não é negativa. */
const FLOOR = 4_000;

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

function buildSample(): number[] {
  const next = seededUniform(SEED);
  const values: number[] = [];
  for (let index = 0; index < SAMPLE_SIZE; index += 1) {
    const isEntry = next() < ENTRY_SHARE;
    const radius = Math.sqrt(-2 * Math.log(1 - next()));
    const gauss = radius * Math.cos(2 * Math.PI * next());
    const raw = isEntry ? ENTRY_MEAN + ENTRY_SPREAD * gauss : FULL_MEAN + FULL_SPREAD * gauss;
    values.push(Math.round(Math.max(FLOOR, raw) / 100) * 100);
  }
  return values;
}

/** Um valor por negócio ganho, em reais, na ordem de fechamento. */
export const data: readonly number[] = buildSample();
