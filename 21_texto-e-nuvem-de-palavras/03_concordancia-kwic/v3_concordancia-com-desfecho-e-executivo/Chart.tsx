import { CircleCheck, CircleDashed, CircleX, Filter } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type KwicWithOutcomeData, type Outcome } from './data';

/**
 * Concordância KWIC com os metadados de cada linha: data, desfecho da oportunidade e executivo.
 * O filtro por desfecho traz a contagem do recorte inteiro em cada opção, e o rodapé diz quantas
 * linhas o preview carrega do total. O desfecho vai com ícone e palavra, nunca só com a cor.
 */
export interface OutcomeConcordanceProps {
  readonly data?: KwicWithOutcomeData;
  readonly height?: number;
  readonly className?: string;
}

type OutcomeFilter = 'todas' | Outcome;

/** Cabe na coluna de 1fr do canvas largo (cerca de 270 px a 12 px, já descontadas as colunas de metadado). */
const CONTEXT_MAX_CHARS = 40;
const ELLIPSIS = '…';
const OPENING_END = /[(“«[]$/u;
const CLOSING_START = /^[,.;:!?)”»\]%]/u;
const EDGE_PUNCT = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u;

const OUTCOME_VIEW: Record<Outcome, { readonly label: string; readonly Icon: LucideIcon; readonly tone: string }> = {
  ganha: { label: 'ganha', Icon: CircleCheck, tone: 'text-positive' },
  perdida: { label: 'perdida', Icon: CircleX, tone: 'text-negative' },
  aberta: { label: 'aberta', Icon: CircleDashed, tone: 'text-text-secondary' },
};
const OUTCOME_ORDER: readonly Outcome[] = ['ganha', 'perdida', 'aberta'];
const HEADER_CELL = 'pb-1 text-[0.6875rem] font-medium text-text-muted';

interface Row {
  readonly id: string;
  readonly date: string;
  readonly outcome: Outcome;
  readonly executive: string;
  readonly left: string;
  readonly term: string;
  readonly right: string;
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

function locate(note: KwicWithOutcomeData['notes'][number], termKey: string): Row | null {
  const tokens = note.text.split(' ').filter((token) => token.length > 0);
  const index = tokens.findIndex((token) => foldKey(EDGE_PUNCT.exec(token)?.[2] ?? '') === termKey);
  const token = tokens[index];
  if (token === undefined) return null;
  const parts = EDGE_PUNCT.exec(token);
  const opening = parts?.[1] ?? '';
  const closing = parts?.[3] ?? '';
  return {
    id: note.id,
    date: note.date,
    outcome: note.outcome,
    executive: note.executive,
    left: cutByWords([...tokens.slice(0, index), ...(opening ? [opening] : [])].join(' '), 'left'),
    term: parts?.[2] ?? token,
    right: cutByWords([...(closing ? [closing] : []), ...tokens.slice(index + 1)].join(' '), 'right'),
  };
}

export default function OutcomeConcordance({ data = defaultData, height, className }: OutcomeConcordanceProps) {
  const [filter, setFilter] = useState<OutcomeFilter>('todas');
  const style = height === undefined ? undefined : { height };
  const termKey = foldKey(data.term);

  const loaded = useMemo(() => data.notes.flatMap((note) => locate(note, termKey) ?? []), [data.notes, termKey]);
  const rows = useMemo(() => (filter === 'todas' ? loaded : loaded.filter((row) => row.outcome === filter)), [loaded, filter]);

  if (loaded.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhuma anotação cita ${data.term} neste recorte: não há contexto para ler.`}</span>
      </div>
    );
  }

  const optionTotal = (value: OutcomeFilter): number => (value === 'todas' ? data.totalOccurrences : data.totalsByOutcome[value]);
  const filterPhrase = filter === 'todas' ? '' : ` com desfecho ${OUTCOME_VIEW[filter].label}`;
  const scope = `${formatInt(rows.length)} de ${formatInt(optionTotal(filter))} ocorrências de ${data.term}${filterPhrase}`;
  const summary = `Concordância do termo ${data.term} com data, desfecho e executivo de cada linha: ${scope} exibidas, da mais recente para a mais antiga, e o resto do recorte fica fora do preview.`;
  const options: readonly OutcomeFilter[] = ['todas', ...OUTCOME_ORDER];

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="mb-2 flex shrink-0 items-center gap-2">
        <span className="text-[0.6875rem] text-text-muted">Desfecho</span>
        <div className="flex gap-0.5 rounded-md bg-surface-sunken p-0.5">
          {options.map((value) => (
            <button
              aria-pressed={filter === value}
              className={cn(
                'rounded px-2 py-0.5 text-[0.6875rem] outline-none focus-visible:ring-2 focus-visible:ring-chart-1',
                filter === value ? 'bg-surface-raised font-semibold text-text-primary' : 'font-medium text-text-secondary',
              )}
              key={value}
              onClick={() => { setFilter(value); }}
              type="button"
            >
              <span className="capitalize">{value}</span>
              <span className="ml-1 font-display tabular-nums text-text-muted">{formatInt(optionTotal(value))}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        {rows.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-xs text-text-muted" role="status">
            <Filter aria-hidden className="size-4 shrink-0" />
            <span>Nenhuma das linhas carregadas tem este desfecho; o recorte completo traz mais.</span>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-[auto_1fr_auto_1fr_auto_auto] content-start">
            <span className={cn(HEADER_CELL, 'pr-3')}>Data</span>
            <span className={cn(HEADER_CELL, 'pr-2 text-right')}>Antes do termo</span>
            <span className={cn(HEADER_CELL, 'text-center')}>Termo</span>
            <span className={cn(HEADER_CELL, 'pl-2')}>Depois do termo</span>
            <span className={cn(HEADER_CELL, 'px-3')}>Desfecho</span>
            <span className={cn(HEADER_CELL, 'pr-2')}>Executivo</span>
            {rows.map((row) => {
              const view = OUTCOME_VIEW[row.outcome];
              return (
                <div className="contents" key={row.id}>
                  <span className="whitespace-nowrap py-0.5 pr-3 font-display text-[0.6875rem] leading-4 text-text-muted tabular-nums">{formatDate(row.date)}</span>
                  <span className={cn('min-w-0 whitespace-nowrap py-0.5 text-right text-xs leading-4 text-text-secondary', OPENING_END.test(row.left) ? 'pr-0' : 'pr-2')}>
                    {row.left.length > 0 ? row.left : <span className="text-text-muted">início</span>}
                  </span>
                  <span className="whitespace-nowrap py-0.5 text-center text-xs font-semibold leading-4 text-text-primary">{row.term}</span>
                  <span className={cn('min-w-0 whitespace-nowrap py-0.5 text-left text-xs leading-4 text-text-secondary', CLOSING_START.test(row.right) ? 'pl-0' : 'pl-2')}>
                    {row.right.length > 0 ? row.right : <span className="text-text-muted">fim</span>}
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap px-3 py-0.5 text-[0.6875rem] leading-4 text-text-secondary">
                    <view.Icon aria-hidden className={cn('size-3 shrink-0', view.tone)} />
                    {view.label}
                  </span>
                  <span className="whitespace-nowrap py-0.5 pr-2 text-[0.6875rem] leading-4 text-text-muted">{row.executive}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        {`Primeiras ${scope}, da mais recente para a mais antiga. O resto do recorte entra ao colar no Farol, com filtro e virtualização.`}
      </p>
    </div>
  );
}
