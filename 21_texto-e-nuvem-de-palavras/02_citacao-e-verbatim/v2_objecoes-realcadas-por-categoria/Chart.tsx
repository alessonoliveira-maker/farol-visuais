import { Filter } from 'lucide-react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CallNote, type ObjectionCategory } from './data';

/**
 * Anotação de ligação com as objeções realçadas por categoria. A string vira segmentos pelos
 * índices das ocorrências (busca sem acento e em minúsculas, realce na forma escrita) e cada
 * segmento de termo sai como `mark`, sem HTML injetado. A cor trabalha junto de um sublinhado de
 * estilo próprio por categoria, para o realce não depender só do matiz.
 */
export interface ObjectionNoteProps {
  readonly data?: CallNote;
  readonly className?: string;
}

interface Segment {
  readonly text: string;
  readonly categoryId: string | null;
}

interface Hit {
  readonly start: number;
  readonly end: number;
  readonly categoryId: string;
}

type Slot = ObjectionCategory['slot'];

/** Classes completas por slot, porque o Tailwind só gera o que aparece escrito por inteiro. */
const MARK_TONE: Record<Slot, string> = {
  1: 'bg-chart-1/20 decoration-chart-1',
  3: 'bg-chart-3/20 decoration-chart-3',
  6: 'bg-chart-6/20 decoration-chart-6',
};
/** Estilo do sublinhado por slot: o segundo canal além da cor. */
const MARK_LINE: Record<Slot, string> = {
  1: 'decoration-solid',
  3: 'decoration-dotted',
  6: 'decoration-dashed',
};
const MARK_BASE = 'rounded-sm px-0.5 text-text-primary underline decoration-2 underline-offset-4';
const WORD_CHAR = /[\p{L}\p{N}]/u;

function markClass(slot: Slot): string {
  return cn(MARK_BASE, MARK_TONE[slot], MARK_LINE[slot]);
}

/** Texto normalizado e, para cada caractere dele, o índice do caractere original. */
function normalizeWithMap(text: string): { readonly norm: string; readonly origin: readonly number[] } {
  let norm = '';
  const origin: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    const piece = (text[i] ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    for (const ch of piece) {
      norm += ch;
      origin.push(i);
    }
  }
  return { norm, origin };
}

function isWordEdge(norm: string, start: number, end: number): boolean {
  const before = start > 0 ? norm[start - 1] : undefined;
  const after = norm[end];
  return (before === undefined || !WORD_CHAR.test(before)) && (after === undefined || !WORD_CHAR.test(after));
}

/** Ocorrências de todas as chaves; em sobreposição vence a mais longa, depois a que começa antes. */
function findHits(text: string, categories: readonly ObjectionCategory[]): readonly Hit[] {
  const { norm, origin } = normalizeWithMap(text);
  const found: Hit[] = [];
  for (const category of categories) {
    for (const key of category.keys) {
      let from = norm.indexOf(key);
      while (from !== -1) {
        const to = from + key.length;
        const first = origin[from];
        const last = origin[to - 1];
        if (isWordEdge(norm, from, to) && first !== undefined && last !== undefined) {
          found.push({ start: first, end: last + 1, categoryId: category.id });
        }
        from = norm.indexOf(key, from + 1);
      }
    }
  }
  const ranked = [...found].sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const kept: Hit[] = [];
  for (const hit of ranked) {
    if (!kept.some((other) => hit.start < other.end && other.start < hit.end)) kept.push(hit);
  }
  return kept.sort((a, b) => a.start - b.start);
}

function segmentsOf(text: string, hits: readonly Hit[]): readonly Segment[] {
  const out: Segment[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start > cursor) out.push({ text: text.slice(cursor, hit.start), categoryId: null });
    out.push({ text: text.slice(hit.start, hit.end), categoryId: hit.categoryId });
    cursor = hit.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), categoryId: null });
  return out;
}

function summaryOf(data: CallNote, counts: ReadonlyMap<string, number>, total: number): string {
  const parts = data.categories.map((c) => `${formatInt(counts.get(c.id) ?? 0)} de ${c.label}`);
  const list = parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1] ?? ''}`;
  return `Anotação de ligação da ${data.team} em ${formatDate(data.calledOn)} com ${formatInt(total)} termos de objeção realçados: ${list}. Cada categoria tem cor e sublinhado próprios.`;
}

export default function ObjectionNote({ data = defaultData, className }: ObjectionNoteProps) {
  if (data.text.trim() === '') {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma anotação de ligação neste recorte: não há texto a realçar.</span>
      </div>
    );
  }

  const hits = findHits(data.text, data.categories);
  const segments = segmentsOf(data.text, hits);
  const counts = new Map<string, number>();
  for (const hit of hits) counts.set(hit.categoryId, (counts.get(hit.categoryId) ?? 0) + 1);
  const slotOf = new Map(data.categories.map((c) => [c.id, c.slot] as const));

  return (
    <div
      aria-label={summaryOf(data, counts, hits.length)}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-4', className)}
      role="group"
    >
      <div aria-hidden className="flex flex-col gap-2">
        <p className="text-[0.6875rem] text-text-muted">termos realçados por categoria</p>
        <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
          {data.categories.map((category) => (
            <li className="flex items-center gap-2" key={category.id}>
              <span className={cn(markClass(category.slot), 'text-xs font-medium')}>{category.label}</span>
              <span className="kpi-number text-xs font-semibold text-text-primary">{formatInt(counts.get(category.id) ?? 0)}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="m-0 text-sm leading-7 text-text-secondary">
        {segments.map((segment, index) => {
          const slot = segment.categoryId === null ? undefined : slotOf.get(segment.categoryId);
          return slot === undefined ? (
            segment.text
          ) : (
            <mark className={markClass(slot)} key={index}>
              {segment.text}
            </mark>
          );
        })}
      </p>

      <p aria-hidden className="text-[0.6875rem] text-text-muted">
        Anotação de ligação da {data.team} em {formatDate(data.calledOn)}
      </p>
    </div>
  );
}
