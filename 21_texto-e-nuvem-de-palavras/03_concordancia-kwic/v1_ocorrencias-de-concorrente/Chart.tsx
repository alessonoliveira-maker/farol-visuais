import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ConcordanceData } from './data';

/**
 * Concordância KWIC: cada ocorrência do termo vira uma linha, com o termo numa coluna central
 * e o contexto esquerdo alinhado à direita, de modo que o olho desce pela coluna do termo e lê
 * o que vem antes e depois. O corte do contexto é feito por palavras, em TypeScript, e não por CSS.
 */
export interface ConcordanceProps {
  readonly data?: ConcordanceData;
  readonly height?: number;
  readonly className?: string;
}

/** Limite de caracteres de cada contexto, reticência e espaço inclusos: 46 caracteres a cerca de 6,4 px (294 px) cabem na coluna de cerca de 320 px do canvas de 760. */
const CONTEXT_MAX_CHARS = 46;
const ELLIPSIS = '…';
const ELLIPSIS_COST = 2;
/** Pontuação de abertura cola no termo pela esquerda; a de fechamento, pela direita. */
const OPENING_END = /[(“«[]$/u;
const CLOSING_START = /^[,.;:!?)”»\]%]/u;
const EDGE_PUNCT = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u;

interface Occurrence {
  readonly id: string;
  readonly left: string;
  readonly term: string;
  readonly right: string;
}

/** Chave de comparação: minúscula e sem acento, para preco e preço serem o mesmo termo. */
function foldKey(word: string): string {
  return word.normalize('NFD').replace(/[̀-ͯ]/gu, '').toLowerCase();
}

/** Mantém as palavras mais próximas do termo: do fim para trás no esquerdo, do começo no direito. */
function cutByWords(text: string, side: 'left' | 'right'): string {
  const words = text.split(' ').filter((word) => word.length > 0);
  const ordered = side === 'left' ? [...words].reverse() : words;
  const fits = (chars: number) => chars <= CONTEXT_MAX_CHARS;
  const total = words.reduce((sum, word, i) => sum + word.length + (i > 0 ? 1 : 0), 0);
  /** Se o texto inteiro cabe, não há reticência a pagar; se não, a reticência entra na conta. */
  const budget = fits(total) ? CONTEXT_MAX_CHARS : CONTEXT_MAX_CHARS - ELLIPSIS_COST;
  const kept: string[] = [];
  let length = 0;
  for (const word of ordered) {
    const next = length + word.length + (kept.length > 0 ? 1 : 0);
    if (next > budget && kept.length !== 0) break;
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

/** Primeira ocorrência do termo na anotação; a pontuação colada ao termo fica no contexto. */
function locate(id: string, text: string, termKey: string): Occurrence | null {
  const tokens = text.split(' ').filter((token) => token.length > 0);
  const index = tokens.findIndex((token) => foldKey(EDGE_PUNCT.exec(token)?.[2] ?? '') === termKey);
  const token = tokens[index];
  if (token === undefined) return null;
  const parts = EDGE_PUNCT.exec(token);
  const opening = parts?.[1] ?? '';
  const closing = parts?.[3] ?? '';
  const before = [...tokens.slice(0, index), ...(opening ? [opening] : [])].join(' ');
  const after = [...(closing ? [closing] : []), ...tokens.slice(index + 1)].join(' ');
  return { id, left: cutByWords(before, 'left'), term: parts?.[2] ?? token, right: cutByWords(after, 'right') };
}

export default function Concordance({ data = defaultData, height, className }: ConcordanceProps) {
  const style = height === undefined ? undefined : { height };
  const termKey = foldKey(data.term);
  const rows = useMemo(
    () => data.notes.flatMap((note) => locate(note.id, note.text, termKey) ?? []),
    [data.notes, termKey],
  );

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhuma anotação cita ${data.term} neste recorte: não há contexto para ler.`}</span>
      </div>
    );
  }

  const summary = `Concordância do termo ${data.term} nas anotações das oportunidades perdidas: ${formatInt(rows.length)} de ${formatInt(data.totalOccurrences)} ocorrências exibidas, em ordem de data, com o contexto cortado pelas palavras mais próximas do termo.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[1fr_auto_1fr] content-start overflow-hidden">
        <span className="pb-1 pr-2 text-right text-[0.6875rem] font-medium text-text-muted">Antes do termo</span>
        <span className="px-3 pb-1 text-center text-[0.6875rem] font-medium text-text-muted">Termo</span>
        <span className="pb-1 pl-2 text-[0.6875rem] font-medium text-text-muted">Depois do termo</span>
        {rows.map((row) => (
          <div className="contents" key={row.id}>
            <span className={cn('min-w-0 whitespace-nowrap py-0.5 text-right text-xs leading-4 text-text-secondary', OPENING_END.test(row.left) ? 'pr-0' : 'pr-2')}>
              {row.left.length > 0 ? row.left : <span className="text-text-muted">início</span>}
            </span>
            <span className="whitespace-nowrap py-0.5 text-center text-xs font-semibold leading-4 text-text-primary">{row.term}</span>
            <span className={cn('min-w-0 whitespace-nowrap py-0.5 text-left text-xs leading-4 text-text-secondary', CLOSING_START.test(row.right) ? 'pl-0' : 'pl-2')}>
              {row.right.length > 0 ? row.right : <span className="text-text-muted">fim</span>}
            </span>
          </div>
        ))}
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        {`${formatInt(rows.length)} de ${formatInt(data.totalOccurrences)} ocorrências de ${data.term} nas perdas de 2026-T3, na ordem da data. Contexto cortado pelas palavras.`}
      </p>
    </div>
  );
}
