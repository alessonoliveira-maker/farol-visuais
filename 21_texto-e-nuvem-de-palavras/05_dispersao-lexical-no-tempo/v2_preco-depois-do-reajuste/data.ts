/**
 * Menções de cinco termos de motivo de perda nas anotações do comercial, de 2026-04-01 a
 * 2026-09-29, com o reajuste fictício de taxa em 2026-07-01 no meio. As duas janelas têm 91 dias
 * cada: 2026-04-01 a 2026-06-30 antes do reajuste e 2026-07-01 a 2026-09-29 depois. Dado fictício
 * e fixo: nenhum termo, pessoa ou empresa é real. A série sai de um gerador de semente fixa
 * (congruência linear), por isso o desenho é o mesmo em qualquer máquina e em qualquer dia; só
 * dias úteis têm menção. O termo preço adensa depois do reajuste e os outros ficam estáveis.
 */
export interface TermMention {
  readonly date: string;
  readonly count: number;
}

export interface TermSeries {
  readonly id: string;
  readonly term: string;
  readonly mentions: readonly TermMention[];
}

export interface LexicalDispersion {
  readonly start: string;
  readonly end: string;
  /** Data do evento que divide as duas janelas, e o texto curto dele. */
  readonly eventDate: string;
  readonly eventLabel: string;
  /** Id do termo em destaque. */
  readonly highlightId: string;
  readonly series: readonly TermSeries[];
}

interface Phase {
  readonly from: string;
  readonly to: string;
  /** Chance de o dia útil ter menção, de 0 a 1. */
  readonly chance: number;
}

const START = '2026-04-01';
const END = '2026-09-29';
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Dias desde 2026-01-01 (que é uma quinta-feira). */
function ordinalOf(iso: string): number {
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  const before = MONTH_LENGTHS.slice(0, month - 1).reduce((sum, length) => sum + length, 0);
  return before + day - 1;
}

function isoOf(ordinal: number): string {
  let rest = ordinal;
  for (let month = 0; month < MONTH_LENGTHS.length; month += 1) {
    const length = MONTH_LENGTHS[month] ?? 0;
    if (rest < length) return `2026-${String(month + 1).padStart(2, '0')}-${String(rest + 1).padStart(2, '0')}`;
    rest -= length;
  }
  return '2026-12-31';
}

function build(id: string, term: string, seed: number, phases: readonly Phase[]): TermSeries {
  let state = seed;
  const next = (): number => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
  const mentions: TermMention[] = [];
  for (let ordinal = ordinalOf(START); ordinal <= ordinalOf(END); ordinal += 1) {
    const weekday = (ordinal + 3) % 7;
    const iso = isoOf(ordinal);
    const phase = phases.find((item) => iso >= item.from && iso <= item.to);
    const draw = next();
    const extra = next();
    if (weekday >= 5 || !phase || draw >= phase.chance) continue;
    mentions.push({ date: iso, count: extra < 0.3 ? 2 : 1 });
  }
  return { id, term, mentions };
}

export const data: LexicalDispersion = {
  start: START,
  end: END,
  eventDate: '2026-07-01',
  eventLabel: 'reajuste de taxa',
  highlightId: 'preco',
  series: [
    build('preco', 'preço', 71, [
      { from: START, to: '2026-06-30', chance: 0.2 },
      { from: '2026-07-01', to: END, chance: 0.6 },
    ]),
    build('concorrente', 'concorrente', 83, [{ from: START, to: END, chance: 0.3 }]),
    build('prazo', 'prazo de entrega', 97, [{ from: START, to: END, chance: 0.26 }]),
    build('financiamento', 'financiamento', 101, [{ from: START, to: END, chance: 0.28 }]),
    build('atendimento', 'atendimento', 113, [{ from: START, to: END, chance: 0.12 }]),
  ],
};
