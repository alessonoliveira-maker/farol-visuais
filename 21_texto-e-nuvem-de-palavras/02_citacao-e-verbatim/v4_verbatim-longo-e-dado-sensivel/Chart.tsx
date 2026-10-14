import { Filter } from 'lucide-react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LongVerbatim, type ReasonNote, type SensitiveNote } from './data';

/**
 * Verbatim longo recortado ao redor do termo e com o dado sensível mascarado. A ordem é fixa e
 * importa: primeiro o mascaramento do texto inteiro, depois o recorte por palavras, por último o
 * realce do termo; assim o dado sensível nunca chega ao realce nem à tela. O recorte marca as duas
 * pontas com reticências e escreve quantos caracteres ficaram de fora. Motivo sem anotação mostra
 * o estado vazio, sem citação inventada.
 */
export interface LongVerbatimProps {
  readonly data?: LongVerbatim;
  readonly className?: string;
}

/** Palavras mantidas de cada lado do termo no recorte. */
const WINDOW_WORDS = 12;
const ELLIPSIS = '…';
const TERM_MARK = 'rounded-sm bg-chart-1/20 px-0.5 text-text-primary underline decoration-chart-1 decoration-2 decoration-solid underline-offset-4';
const MASK_CHIP = 'rounded-sm bg-surface-sunken px-1 text-text-secondary';
const WORD_CHAR = /[\p{L}\p{N}]/u;
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu;
const PHONE = /(?:\(\d{2}\)\s?)?\d{4,5}-\d{4}/g;
const PLACEHOLDER = /\[(?:telefone|e-mail|nome)\]/g;

type MaskKind = 'email' | 'phone' | 'name';

interface Masked {
  readonly text: string;
  readonly counts: Record<MaskKind, number>;
}

interface Segment {
  readonly text: string;
  readonly kind: 'plain' | 'mask' | 'term';
}

interface Excerpt {
  readonly segments: readonly Segment[];
  readonly omitted: number;
  readonly cutBefore: boolean;
  readonly cutAfter: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Mascara e-mail, telefone e nomes conhecidos; devolve o texto e quantos de cada tipo saíram. */
function maskNote(note: SensitiveNote): Masked {
  const counts: Record<MaskKind, number> = { email: 0, phone: 0, name: 0 };
  const swap = (text: string, pattern: RegExp, kind: MaskKind, label: string): string =>
    text.replace(pattern, () => {
      counts[kind] += 1;
      return label;
    });
  let text = swap(note.text, EMAIL, 'email', '[e-mail]');
  text = swap(text, PHONE, 'phone', '[telefone]');
  for (const name of note.knownNames) {
    text = swap(text, new RegExp(`(?<![\\p{L}])${escapeRegExp(name)}`, 'gu'), 'name', '[nome]');
  }
  return { text, counts };
}

/** Texto normalizado (sem acento, minúsculo) e o índice original de cada caractere dele. */
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

/** Intervalos [início, fim) do termo na forma original, só em palavra inteira. */
function termRanges(text: string, term: string): readonly (readonly [number, number])[] {
  const { norm, origin } = normalizeWithMap(text);
  const out: (readonly [number, number])[] = [];
  let from = norm.indexOf(term);
  while (from !== -1) {
    const to = from + term.length;
    const before = from > 0 ? norm[from - 1] : undefined;
    const after = norm[to];
    const first = origin[from];
    const last = origin[to - 1];
    const whole = (before === undefined || !WORD_CHAR.test(before)) && (after === undefined || !WORD_CHAR.test(after));
    if (whole && first !== undefined && last !== undefined) out.push([first, last + 1]);
    from = norm.indexOf(term, from + 1);
  }
  return out;
}

function segmentsOf(text: string, term: string): readonly Segment[] {
  const spans: { start: number; end: number; kind: 'mask' | 'term' }[] = [
    ...[...text.matchAll(PLACEHOLDER)].map((m) => ({ start: m.index, end: m.index + m[0].length, kind: 'mask' as const })),
    ...termRanges(text, term).map(([start, end]) => ({ start, end, kind: 'term' as const })),
  ].sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) continue;
    if (span.start > cursor) out.push({ text: text.slice(cursor, span.start), kind: 'plain' });
    out.push({ text: text.slice(span.start, span.end), kind: span.kind });
    cursor = span.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), kind: 'plain' });
  return out;
}

/** Recorte por palavras ao redor da primeira ocorrência do termo (ou do começo, sem ocorrência). */
function excerptOf(masked: string, term: string): Excerpt {
  const words = [...masked.matchAll(/\S+/g)].map((m) => ({ start: m.index, end: m.index + m[0].length }));
  const hit = termRanges(masked, term)[0];
  const center = hit === undefined ? 0 : Math.max(0, words.findIndex((w) => w.end > hit[0]));
  const first = Math.max(0, center - WINDOW_WORDS);
  const last = Math.min(words.length - 1, center + WINDOW_WORDS + (hit === undefined ? WINDOW_WORDS : 0));
  const from = words[first]?.start ?? 0;
  const to = words[last]?.end ?? masked.length;
  return {
    segments: segmentsOf(masked.slice(from, to), term),
    omitted: from + (masked.length - to),
    cutBefore: from > 0,
    cutAfter: to < masked.length,
  };
}

function maskedTotal(counts: Record<MaskKind, number>): number {
  return counts.email + counts.phone + counts.name;
}

function maskedList(counts: Record<MaskKind, number>): string {
  const parts = [
    counts.email > 0 ? `${formatInt(counts.email)} e-mail` : '',
    counts.phone > 0 ? `${formatInt(counts.phone)} telefone` : '',
    counts.name > 0 ? `${formatInt(counts.name)} ${counts.name === 1 ? 'nome' : 'nomes'}` : '',
  ].filter((part) => part !== '');
  return parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1] ?? ''}`;
}

function summaryOf(data: LongVerbatim, rows: readonly { entry: ReasonNote; masked: Masked | null; excerpt: Excerpt | null }[]): string {
  const parts = rows.map(({ entry, masked, excerpt }) => {
    if (entry.note === null || masked === null || excerpt === null) return `sem anotação para ${entry.reason}`;
    return `anotação de ${entry.reason} de ${formatDate(entry.note.calledOn)} recortada ao redor de ${data.term}, com ${formatInt(maskedTotal(masked.counts))} dados mascarados e ${formatInt(excerpt.omitted)} de ${formatInt(masked.text.length)} caracteres omitidos`;
  });
  return `Verbatim longo da ${data.team}: ${parts.join('; ')}.`;
}

export default function LongVerbatimCard({ data = defaultData, className }: LongVerbatimProps) {
  if (data.entries.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum motivo neste recorte: não há anotação a recortar.</span>
      </div>
    );
  }

  const rows = data.entries.map((entry) => {
    const masked = entry.note === null ? null : maskNote(entry.note);
    return { entry, masked, excerpt: masked === null ? null : excerptOf(masked.text, data.term) };
  });

  return (
    <div aria-label={summaryOf(data, rows)} className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-4', className)} role="group">
      {rows.map(({ entry, masked, excerpt }) =>
        entry.note === null || masked === null || excerpt === null ? (
          <div className="flex flex-col gap-1.5" key={entry.id}>
            <p className="m-0 text-xs font-semibold text-text-secondary">Motivo: {entry.reason}</p>
            <div className="flex items-center gap-2 text-xs text-text-muted" role="status">
              <Filter aria-hidden className="size-4 shrink-0" />
              <span>Nenhuma anotação de ligação com esse motivo: não há trecho a mostrar, e nenhum foi inventado.</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5" key={entry.id}>
            <p className="m-0 flex items-baseline justify-between gap-3 text-xs font-semibold text-text-secondary">
              <span>Motivo: {entry.reason}</span>
              <span className="text-[0.6875rem] font-normal text-text-muted">ligação de {formatDate(entry.note.calledOn)}</span>
            </p>
            <p className="m-0 border-s-4 border-chart-1 ps-4 text-sm leading-6 text-text-primary">
              {excerpt.cutBefore ? <span className="text-text-muted">{ELLIPSIS} </span> : null}
              {excerpt.segments.map((segment, index) =>
                segment.kind === 'term' ? (
                  <mark className={TERM_MARK} key={index}>{segment.text}</mark>
                ) : segment.kind === 'mask' ? (
                  <span className={MASK_CHIP} key={index}>{segment.text}</span>
                ) : (
                  segment.text
                ),
              )}
              {excerpt.cutAfter ? <span className="text-text-muted"> {ELLIPSIS}</span> : null}
            </p>
            <p className="m-0 ps-5 text-[0.6875rem] text-text-muted">
              {formatInt(excerpt.omitted)} de {formatInt(masked.text.length)} caracteres omitidos do recorte. Mascarados antes do realce: {maskedList(masked.counts)}.
            </p>
          </div>
        ),
      )}
    </div>
  );
}
