import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ConcordanceData } from './data';

/**
 * Concordância KWIC ordenada: as linhas se agrupam pela chave sem acento da palavra que o leitor
 * escolheu (contexto esquerdo, termo ou contexto direito), e cada grupo diz quantas ocorrências tem.
 * Os sentidos do termo ficam lado a lado, separados por espaço vertical e sem divisória.
 */
export interface SortedConcordanceProps {
  readonly data?: ConcordanceData;
  readonly height?: number;
  readonly className?: string;
}

type SortBy = 'left' | 'term' | 'right';

/** Limite de caracteres de cada contexto: a coluna de 1fr tem cerca de 220 px a 12 px, já descontada a de contagem. */
const CONTEXT_MAX_CHARS = 32;
const ELLIPSIS = '…';
const OPENING_END = /[(“«[]$/u;
const CLOSING_START = /^[,.;:!?)”»\]%]/u;
const EDGE_PUNCT = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u;

const SORT_OPTIONS: readonly { readonly value: SortBy; readonly label: string }[] = [
  { value: 'left', label: 'Contexto esquerdo' },
  { value: 'term', label: 'Termo' },
  { value: 'right', label: 'Contexto direito' },
];
/** Forma que a frase acessível usa, para não reaproveitar o rótulo do botão (maiúscula) no meio da oração. */
const SORT_PHRASE: Record<SortBy, string> = { left: 'contexto esquerdo', term: 'termo', right: 'contexto direito' };

interface Occurrence {
  readonly id: string;
  readonly left: string;
  readonly term: string;
  readonly right: string;
  /** Chave de ordenação de cada lado, calculada sobre o contexto inteiro e não sobre o cortado. */
  readonly keys: Readonly<Record<SortBy, string>>;
}

function foldKey(word: string): string {
  return word.normalize('NFD').replace(/[̀-ͯ]/gu, '').toLowerCase();
}

function core(token: string | undefined): string {
  return EDGE_PUNCT.exec(token ?? '')?.[2] ?? '';
}

function cutByWords(text: string, side: 'left' | 'right'): string {
  const words = text.split(' ').filter((word) => word.length > 0);
  const ordered = side === 'left' ? [...words].reverse() : words;
  const kept: string[] = [];
  let length = 0;
  for (const word of ordered) {
    const next = length + word.length + (kept.length > 0 ? 1 : 0);
    if (next > CONTEXT_MAX_CHARS && kept.length !== 0) break;
    kept.push(word);
    length = next;
  }
  const wasCut = kept.length < words.length;
  if (side === 'left') {
    const body = kept.reverse().join(' ');
    return wasCut ? `${ELLIPSIS} ${body}` : body;
  }
  const body = kept.join(' ');
  return wasCut ? `${body} ${ELLIPSIS}` : body;
}

function locate(id: string, text: string, termKey: string): Occurrence | null {
  const tokens = text.split(' ').filter((token) => token.length > 0);
  const index = tokens.findIndex((token) => foldKey(core(token)) === termKey);
  const token = tokens[index];
  if (token === undefined) return null;
  const parts = EDGE_PUNCT.exec(token);
  const opening = parts?.[1] ?? '';
  const closing = parts?.[3] ?? '';
  const beforeTokens = tokens.slice(0, index);
  const afterTokens = tokens.slice(index + 1);
  const termText = parts?.[2] ?? token;
  const lastBefore = [...beforeTokens].reverse().find((word) => core(word).length > 0);
  const firstAfter = afterTokens.find((word) => core(word).length > 0);
  return {
    id,
    left: cutByWords([...beforeTokens, ...(opening ? [opening] : [])].join(' '), 'left'),
    term: termText,
    right: cutByWords([...(closing ? [closing] : []), ...afterTokens].join(' '), 'right'),
    keys: { left: foldKey(core(lastBefore)), term: foldKey(termText), right: foldKey(core(firstAfter)) },
  };
}

/** Chave vazia (termo na borda) vai para o fim; o resto segue a ordem alfabética da chave sem acento. */
function compareKeys(a: string, b: string): number {
  if (a === b) return 0;
  if (a === '') return 1;
  if (b === '') return -1;
  return a < b ? -1 : 1;
}

function occurrenceNoun(count: number): string {
  return count === 1 ? 'ocorrência' : 'ocorrências';
}

export default function SortedConcordance({ data = defaultData, height, className }: SortedConcordanceProps) {
  const [sortBy, setSortBy] = useState<SortBy>('right');
  const style = height === undefined ? undefined : { height };
  const termKey = foldKey(data.term);

  const rows = useMemo(() => {
    const found = data.notes.flatMap((note) => locate(note.id, note.text, termKey) ?? []);
    // Array.prototype.sort é estável: dentro do mesmo grupo a ordem original do dado se mantém.
    return found.sort((a, b) => compareKeys(a.keys[sortBy], b.keys[sortBy]));
  }, [data.notes, termKey, sortBy]);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhuma anotação cita ${data.term} neste recorte: não há sentidos para agrupar.`}</span>
      </div>
    );
  }

  // Tamanho de cada grupo, indexado pela linha em que o grupo começa.
  const groupSizes = new Map<number, number>();
  let groupStart = 0;
  rows.forEach((row, index) => {
    const previous = rows[index - 1];
    if (previous === undefined || previous.keys[sortBy] !== row.keys[sortBy]) groupStart = index;
    groupSizes.set(groupStart, (groupSizes.get(groupStart) ?? 0) + 1);
  });

  const summary = `Concordância do termo ${data.term} em ${formatInt(rows.length)} de ${formatInt(data.totalOccurrences)} ocorrências, ordenada pelo ${SORT_PHRASE[sortBy]} e agrupada em ${formatInt(groupSizes.size)} sentidos, cada um com a sua contagem.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="mb-2 flex shrink-0 items-center gap-2">
        <span className="text-[0.6875rem] text-text-muted">Ordenar pelo</span>
        <div className="flex gap-0.5 rounded-md bg-surface-sunken p-0.5">
          {SORT_OPTIONS.map((option) => (
            <button
              aria-pressed={sortBy === option.value}
              className={cn(
                'rounded px-2 py-0.5 text-[0.6875rem] outline-none focus-visible:ring-2 focus-visible:ring-chart-1',
                sortBy === option.value ? 'bg-surface-raised font-semibold text-text-primary' : 'font-medium text-text-secondary',
              )}
              key={option.value}
              onClick={() => { setSortBy(option.value); }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[1fr_auto_1fr_auto] content-start overflow-hidden">
        {rows.map((row, index) => {
          const size = groupSizes.get(index);
          const topPad = size !== undefined && index > 0 ? 'pt-3' : 'pt-0.5';
          return (
            <div className="contents" key={row.id}>
              <span className={cn('min-w-0 whitespace-nowrap pb-0.5 text-right text-xs leading-4 text-text-secondary', topPad, OPENING_END.test(row.left) ? 'pr-0' : 'pr-2')}>
                {row.left.length > 0 ? row.left : <span className="text-text-muted">início</span>}
              </span>
              <span className={cn('whitespace-nowrap pb-0.5 text-center text-xs font-semibold leading-4 text-text-primary', topPad)}>{row.term}</span>
              <span className={cn('min-w-0 whitespace-nowrap pb-0.5 text-left text-xs leading-4 text-text-secondary', topPad, CLOSING_START.test(row.right) ? 'pl-0' : 'pl-2')}>
                {row.right.length > 0 ? row.right : <span className="text-text-muted">fim</span>}
              </span>
              <span className={cn('whitespace-nowrap pb-0.5 pl-3 text-right text-[0.6875rem] leading-4 text-text-muted tabular-nums', topPad)}>
                {size === undefined ? '' : `${formatInt(size)} ${occurrenceNoun(size)}`}
              </span>
            </div>
          );
        })}
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        {`${formatInt(rows.length)} de ${formatInt(data.totalOccurrences)} ocorrências de ${data.term}, agrupadas pela palavra sem acento.`}
      </p>
    </div>
  );
}
