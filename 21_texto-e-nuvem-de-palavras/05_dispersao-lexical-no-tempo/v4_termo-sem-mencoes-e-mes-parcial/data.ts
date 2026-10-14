/**
 * Menções de cinco termos nos campos livres dos formulários de captação, de 2026-08-01 a
 * 2026-10-13, uma linha por dia com ao menos uma menção e a contagem do dia. Dado fictício e fixo:
 * nenhum termo, pessoa ou empresa é real. A série sai de um gerador de semente fixa (congruência
 * linear), por isso o desenho é o mesmo em qualquer máquina e em qualquer dia. Três casos
 * difíceis: o termo cancelamento não aparece nenhuma vez (a faixa fica, com zero medido), a semana
 * de 2026-09-14 a 2026-09-20 ficou sem coleta de formulário (indisponível, não zero) e outubro,
 * o mês corrente, só tem dados até a data de corte `asOf`, 2026-10-13.
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

export interface CollectionGap {
  readonly from: string;
  readonly to: string;
}

export interface LexicalDispersion {
  /** Primeiro e último dia do eixo, o último fechando o mês corrente. */
  readonly start: string;
  readonly end: string;
  /** Data de corte do dado: depois dela o mês corrente ainda não tem medição. */
  readonly asOf: string;
  /** Períodos em que a coleta não funcionou: nenhuma menção neles quer dizer indisponível, e não zero. */
  readonly gaps: readonly CollectionGap[];
  readonly series: readonly TermSeries[];
}

interface Phase {
  readonly from: string;
  readonly to: string;
  /** Chance de o dia útil ter menção, de 0 a 1. */
  readonly chance: number;
}

const START = '2026-08-01';
const END = '2026-10-31';
const AS_OF = '2026-10-13';
const GAP: CollectionGap = { from: '2026-09-14', to: '2026-09-20' };
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
  for (let ordinal = ordinalOf(START); ordinal <= ordinalOf(AS_OF); ordinal += 1) {
    const iso = isoOf(ordinal);
    const phase = phases.find((item) => iso >= item.from && iso <= item.to);
    const draw = next();
    const extra = next();
    const inGap = iso >= GAP.from && iso <= GAP.to;
    if (inGap || !phase || draw >= phase.chance) continue;
    mentions.push({ date: iso, count: extra < 0.25 ? 2 : 1 });
  }
  return { id, term, mentions };
}

export const data: LexicalDispersion = {
  start: START,
  end: END,
  asOf: AS_OF,
  gaps: [GAP],
  series: [
    build('orcamento', 'orçamento', 7, [{ from: START, to: AS_OF, chance: 0.5 }]),
    build('simulacao', 'simulação', 19, [{ from: '2026-08-10', to: AS_OF, chance: 0.34 }]),
    build('parcelamento', 'parcelamento', 43, [{ from: '2026-09-01', to: AS_OF, chance: 0.22 }]),
    build('retorno', 'retorno', 59, [{ from: START, to: AS_OF, chance: 0.08 }]),
    build('cancelamento', 'cancelamento', 71, []),
  ],
};
