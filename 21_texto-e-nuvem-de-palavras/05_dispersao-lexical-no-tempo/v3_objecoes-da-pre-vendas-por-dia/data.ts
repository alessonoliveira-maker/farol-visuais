/**
 * Menções de doze objeções anotadas pela pré-vendas nas ligações, dia a dia, de 2026-06-01 a
 * 2026-08-31, uma linha por dia com ao menos uma menção e a contagem do dia. Dado fictício e fixo:
 * nenhuma objeção, pessoa ou empresa é real. A série sai de um gerador de semente fixa
 * (congruência linear), por isso o desenho é o mesmo em qualquer máquina e em qualquer dia; só
 * dias úteis têm ligação. Cada objeção começa em uma data própria, e a objeção de preço tem um dia
 * de pico com mais de 10 menções, para exercitar o aviso de contagem alta.
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

const START = '2026-06-01';
const END = '2026-08-31';
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

/** Dia de pico com contagem fixada à mão, por cima do que o gerador sortearia. */
interface Burst {
  readonly date: string;
  readonly count: number;
}

function build(id: string, term: string, seed: number, phases: readonly Phase[], bursts: readonly Burst[] = []): TermSeries {
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
    if (weekday >= 5) continue;
    const burst = bursts.find((item) => item.date === iso);
    if (burst) {
      mentions.push({ date: iso, count: burst.count });
      continue;
    }
    if (!phase || draw >= phase.chance) continue;
    mentions.push({ date: iso, count: extra < 0.3 ? 2 : 1 });
  }
  return { id, term, mentions };
}

export const data: LexicalDispersion = {
  start: START,
  end: END,
  series: [
    build('preco', 'preço alto', 5, [{ from: START, to: END, chance: 0.7 }], [{ date: '2026-07-14', count: 12 }]),
    build('juros', 'taxa de juros', 13, [{ from: '2026-06-03', to: END, chance: 0.45 }]),
    build('prazo', 'prazo de entrega', 29, [{ from: '2026-06-08', to: '2026-07-31', chance: 0.38 }]),
    build('fornecedor', 'já tenho fornecedor', 31, [{ from: '2026-06-10', to: END, chance: 0.33 }]),
    build('orcamento', 'sem orçamento agora', 47, [{ from: '2026-06-17', to: END, chance: 0.3 }]),
    build('socio', 'falar com o sócio', 59, [{ from: '2026-06-22', to: END, chance: 0.22 }]),
    build('comparar', 'quero comparar', 61, [{ from: '2026-07-01', to: END, chance: 0.28 }]),
    build('depois', 'volte mais tarde', 73, [{ from: '2026-07-06', to: END, chance: 0.2 }]),
    build('documentacao', 'documentação', 79, [{ from: '2026-07-13', to: '2026-08-14', chance: 0.25 }]),
    build('interesse', 'sem interesse', 89, [{ from: '2026-07-20', to: END, chance: 0.18 }]),
    build('confianca', 'desconfiança', 97, [{ from: '2026-08-03', to: END, chance: 0.2 }]),
    build('plano', 'mudança de plano', 103, [{ from: '2026-08-10', to: END, chance: 0.16 }]),
  ],
};
