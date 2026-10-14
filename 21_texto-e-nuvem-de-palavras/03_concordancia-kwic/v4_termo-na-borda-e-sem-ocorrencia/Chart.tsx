import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type BorderCaseData, type CallNote } from './data';

/**
 * Concordância nos casos de borda: o termo que abre ou fecha a anotação (o contexto vazio ganha um
 * marcador e a coluna não colapsa), grafias com e sem acento agrupadas pela chave e exibidas como
 * foram escritas, pontuação colada ao termo mantida no contexto, e o termo que não ocorre no recorte,
 * que troca a grade por um estado vazio.
 */
export interface BorderConcordanceProps {
  readonly data?: BorderCaseData;
  readonly height?: number;
  readonly className?: string;
}

/** Cabe na coluna de 1fr do canvas card (cerca de 250 px a 12 px, descontado o termo). */
const CONTEXT_MAX_CHARS = 34;
const ELLIPSIS = '…';
const OPENING_END = /[(“«[]$/u;
const CLOSING_START = /^[,.;:!?)”»\]%]/u;
const EDGE_PUNCT = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u;

interface Row {
  readonly id: string;
  readonly left: string;
  readonly term: string;
  readonly right: string;
}

interface Section {
  readonly term: string;
  readonly rows: readonly Row[];
  /** Grafias distintas como foram escritas, em minúsculas, na ordem em que aparecem. */
  readonly spellings: readonly string[];
}

function foldKey(word: string): string {
  return word.normalize('NFD').replace(/[̀-ͯ]/gu, '').toLowerCase();
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

/** A pontuação colada ao termo vai para o contexto do lado dela e nunca para dentro do destaque. */
function locate(note: CallNote, termKey: string): Row | null {
  const tokens = note.text.split(' ').filter((token) => token.length > 0);
  const index = tokens.findIndex((token) => foldKey(EDGE_PUNCT.exec(token)?.[2] ?? '') === termKey);
  const token = tokens[index];
  if (token === undefined) return null;
  const parts = EDGE_PUNCT.exec(token);
  const opening = parts?.[1] ?? '';
  const closing = parts?.[3] ?? '';
  return {
    id: note.id,
    left: cutByWords([...tokens.slice(0, index), ...(opening ? [opening] : [])].join(' '), 'left'),
    term: parts?.[2] ?? token,
    right: cutByWords([...(closing ? [closing] : []), ...tokens.slice(index + 1)].join(' '), 'right'),
  };
}

function occurrenceNoun(count: number): string {
  return count === 1 ? 'ocorrência' : 'ocorrências';
}

export default function BorderConcordance({ data = defaultData, height, className }: BorderConcordanceProps) {
  const style = height === undefined ? undefined : { height };

  const sections = useMemo<readonly Section[]>(
    () =>
      data.terms.map((term) => {
        const termKey = foldKey(term);
        const rows = data.notes.flatMap((note) => locate(note, termKey) ?? []);
        const spellings = rows.map((row) => row.term.toLowerCase()).filter((spelling, index, all) => all.indexOf(spelling) === index);
        return { term, rows, spellings };
      }),
    [data.terms, data.notes],
  );

  if (data.notes.length === 0 || data.terms.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma anotação neste recorte: não há contexto para ler.</span>
      </div>
    );
  }

  const parts = sections.map((section) =>
    section.rows.length === 0
      ? `${section.term} sem ocorrência no recorte`
      : `${section.term} em ${formatInt(section.rows.length)} ${occurrenceNoun(section.rows.length)} e ${formatInt(section.spellings.length)} ${section.spellings.length === 1 ? 'grafia' : 'grafias'}`,
  );
  const summary = `Concordância de ${formatInt(sections.length)} termos em ${formatInt(data.notes.length)} anotações de pré-vendas: ${parts.join('; ')}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-3', className)} role="group" style={style}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
        {sections.map((section) => (
          <section className="min-w-0" key={section.term}>
            <h3 className="mb-1 flex items-baseline gap-2 text-xs font-semibold text-text-primary">
              {section.term}
              <span className="text-[0.6875rem] font-normal text-text-muted">
                {section.rows.length === 0
                  ? 'sem ocorrência'
                  : `${formatInt(section.rows.length)} ${occurrenceNoun(section.rows.length)}, grafias ${section.spellings.join(' e ')}`}
              </span>
            </h3>
            {section.rows.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-text-muted" role="status">
                <Filter aria-hidden className="size-4 shrink-0" />
                <span>{`Nenhuma das ${formatInt(data.notes.length)} anotações cita ${section.term}: o termo não ocorre neste recorte.`}</span>
              </div>
            ) : (
              <div className="grid min-w-0 grid-cols-[1fr_auto_1fr]">
                {section.rows.map((row) => (
                  <div className="contents" key={row.id}>
                    <span className={cn('min-w-0 whitespace-nowrap py-0.5 text-right text-xs leading-4 text-text-secondary', OPENING_END.test(row.left) ? 'pr-0' : 'pr-2')}>
                      {row.left.length > 0 ? row.left : <span className="text-text-muted">início da anotação</span>}
                    </span>
                    <span className="whitespace-nowrap py-0.5 text-center text-xs font-semibold leading-4 text-text-primary">{row.term}</span>
                    <span className={cn('min-w-0 whitespace-nowrap py-0.5 text-left text-xs leading-4 text-text-secondary', CLOSING_START.test(row.right) ? 'pl-0' : 'pl-2')}>
                      {row.right.length > 0 ? row.right : <span className="text-text-muted">fim da anotação</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
      <p aria-hidden className="shrink-0 text-[0.6875rem] text-text-muted">
        Grafias com e sem acento contam como o mesmo termo e aparecem como foram escritas.
      </p>
    </div>
  );
}
