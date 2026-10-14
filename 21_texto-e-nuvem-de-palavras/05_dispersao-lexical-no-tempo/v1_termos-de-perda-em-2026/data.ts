/**
 * Menções de seis termos de motivo de perda nas anotações do comercial, de 2026-01-01 a
 * 2026-09-30, uma linha por dia com ao menos uma menção e a contagem do dia. Dado fictício e
 * fixo: nenhum termo, pessoa ou empresa é real. A série sai de um gerador de semente fixa
 * (congruência linear), por isso o desenho é o mesmo em qualquer máquina e em qualquer dia; só
 * dias úteis têm menção, e cada termo tem fases de intensidade para exercitar começo, adensamento
 * e sumiço. Um termo (atendimento) é raro de propósito, para a faixa quase vazia aparecer.
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
  readonly series: readonly TermSeries[];
}

interface Phase {
  readonly from: string;
  readonly to: string;
  /** Chance de o dia útil ter menção, de 0 a 1. */
  readonly chance: number;
}

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
  for (let ordinal = 0; ordinal <= ordinalOf('2026-09-30'); ordinal += 1) {
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
  start: '2026-01-01',
  end: '2026-09-30',
  series: [
    build('preco', 'preço', 11, [
      { from: '2026-01-01', to: '2026-06-30', chance: 0.22 },
      { from: '2026-07-01', to: '2026-09-30', chance: 0.62 },
    ]),
    build('concorrente', 'concorrente', 23, [{ from: '2026-03-02', to: '2026-09-30', chance: 0.3 }]),
    build('prazo', 'prazo de entrega', 37, [{ from: '2026-01-01', to: '2026-04-24', chance: 0.4 }]),
    build('financiamento', 'financiamento', 41, [{ from: '2026-05-04', to: '2026-09-30', chance: 0.42 }]),
    build('documentacao', 'documentação', 53, [
      { from: '2026-02-02', to: '2026-02-27', chance: 0.55 },
      { from: '2026-09-01', to: '2026-09-30', chance: 0.55 },
    ]),
    build('atendimento', 'atendimento', 67, [{ from: '2026-01-01', to: '2026-09-30', chance: 0.05 }]),
  ],
};
