/**
 * Minutos até o primeiro contato de cada lead de agosto, por SDR. Dado fictício e fixo: os 900
 * casos nascem de um gerador com semente fixa (mulberry32) e distribuição lognormal, então saem
 * iguais em qualquer máquina. Cada SDR tem uma mediana própria e uma cauda de casos acima do teto
 * de escala de 120 minutos; Pietra G. trabalhou poucos leads e é a linha com menos casos.
 */
export interface LeadContact {
  readonly id: string;
  readonly sdr: string;
  readonly minutes: number;
}

/** Teto do SLA de primeiro contato, em minutos. */
export const SLA_MINUTES = 30;
/** Teto da escala: o caso acima dele é marcado na borda, e o valor exato fica na dica. */
export const SCALE_CEILING_MINUTES = 120;

interface SdrProfile {
  readonly name: string;
  readonly leads: number;
  readonly medianMinutes: number;
  readonly spread: number;
}

const PROFILES: readonly SdrProfile[] = [
  { name: 'Talita V.', leads: 218, medianMinutes: 9, spread: 0.8 },
  { name: 'Murilo C.', leads: 197, medianMinutes: 14, spread: 0.85 },
  { name: 'Renan A.', leads: 176, medianMinutes: 19, spread: 0.9 },
  { name: 'Ana Beatriz Cavalcanti', leads: 142, medianMinutes: 46, spread: 0.95 },
  { name: 'Caio M.', leads: 104, medianMinutes: 50, spread: 1.0 },
  { name: 'Pietra G.', leads: 63, medianMinutes: 44, spread: 1.1 },
];

/** Gerador de números em [0, 1) com semente fixa. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLeads(): LeadContact[] {
  const next = mulberry32(20260805);
  const leads: LeadContact[] = [];
  let serial = 0;
  for (const profile of PROFILES) {
    for (let i = 0; i < profile.leads; i += 1) {
      // Box-Muller: duas uniformes viram uma normal; a exponencial dela dá a cauda longa à direita.
      const u1 = Math.max(next(), 1e-9);
      const u2 = next();
      const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const minutes = Math.max(1, Math.round(profile.medianMinutes * Math.exp(profile.spread * normal)));
      serial += 1;
      leads.push({ id: `lead-${String(serial).padStart(4, '0')}`, sdr: profile.name, minutes });
    }
  }
  return leads;
}

export const data: readonly LeadContact[] = buildLeads();
