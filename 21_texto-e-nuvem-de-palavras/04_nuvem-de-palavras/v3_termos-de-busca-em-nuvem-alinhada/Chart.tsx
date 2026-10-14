import { Filter } from 'lucide-react';
import { useState } from 'react';

import { formatCurrencyCompact, formatInt, formatMonthShort, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, period as defaultPeriod, selectedId as defaultSelected, type SearchTerm } from './data';

/** `alphabetical` é a ordem de achar um termo; `leads` é a ordem de ver quem pesa mais. */
export type TermOrder = 'alphabetical' | 'leads';

/**
 * Nuvem alinhada, a variante em HTML da nuvem de palavras: os termos correm em linhas, como
 * texto, e cada um é um botão que filtra o painel. Responde quais termos de busca paga trouxeram
 * mais leads e quais deles qualificam a maioria do que trazem.
 *
 * 1. O tamanho tem cinco degraus, pelo quinto da distribuição de leads em que o termo cai, e não
 *    uma escala contínua: degrau se compara de relance, e termo longo não ganha fonte por ser longo.
 * 2. A cor e o peso dizem outra coisa, a maioria qualificada: mais da metade dos leads do termo
 *    passou na qualificação. Metade exata não é maioria.
 * 3. A ordem padrão é a alfabética, declarada na linha de leitura; o seletor troca para a ordem
 *    por leads. Em nenhuma das duas a posição codifica valor: quem codifica é o degrau.
 * 4. O termo selecionado mostra a contagem ao lado do nome e a linha de estado traz a taxa com o
 *    volume e o custo por lead qualificado. A dica de cada botão traz os mesmos três números.
 *
 * A seleção funciona sozinha, com `defaultSelectedId`, ou controlada pela página, com `selectedId`
 * e `onSelect`.
 */
export interface SearchTermsTagCloudProps {
  readonly data?: readonly SearchTerm[];
  /** Mês do recorte, em `YYYY-MM`. */
  readonly period?: string;
  /** Seleção controlada pela página: o id do termo, ou `null` para nenhum filtro. */
  readonly selectedId?: string | null;
  /** Seleção inicial quando a página não controla. */
  readonly defaultSelectedId?: string | null;
  /** Avisa a página do filtro: recebe o id do termo, ou `null` quando o filtro sai. */
  readonly onSelect?: (id: string | null) => void;
  /** Ordem inicial dos termos. */
  readonly defaultOrder?: TermOrder;
  readonly height?: number;
  readonly className?: string;
}

/** Fonte de cada degrau, do quinto mais baixo de leads ao mais alto, em px. O piso é de 12 px. */
const STEP_FONT_SIZES = [12, 14, 17, 20, 24] as const;
const STEP_COUNT = STEP_FONT_SIZES.length;
/** Maioria qualificada: a parcela precisa PASSAR da metade dos leads do termo. */
const MAJORITY_SHARE = 0.5;
const ORDER_OPTIONS: readonly { readonly id: TermOrder; readonly label: string }[] = [
  { id: 'alphabetical', label: 'Alfabética' },
  { id: 'leads', label: 'Por leads' },
];

/** A contagem nunca sai crua: leva o substantivo, no singular ou no plural (NUM-6). */
function countOf(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

function leadsOf(value: number): string {
  return countOf(value, 'lead', 'leads');
}

/** Parcela qualificada dos leads do termo, ou `null` quando o termo não trouxe lead. */
function qualifiedShareOf(term: SearchTerm): number | null {
  return term.leads > 0 ? term.qualified / term.leads : null;
}

/** Custo por lead qualificado, ou `null` quando ninguém qualificou: não existe custo sobre zero. */
function qualifiedCostOf(term: SearchTerm): number | null {
  return term.qualified > 0 ? term.spend / term.qualified : null;
}

function hasQualifiedMajority(term: SearchTerm): boolean {
  const share = qualifiedShareOf(term);
  return share !== null && share > MAJORITY_SHARE;
}

/**
 * Degrau de cada termo, pelo `id`: o quinto da distribuição de leads em que ele cai, contado
 * pelos termos com MENOS leads do que ele. Termos empatados caem no mesmo degrau.
 */
function stepsOf(terms: readonly SearchTerm[]): ReadonlyMap<string, number> {
  const steps = new Map<string, number>();
  // Sem termo não há distribuição a dividir: o mapa volta vazio.
  if (terms.length === 0) return steps;
  for (const term of terms) {
    const below = terms.filter((other) => other.leads < term.leads).length;
    steps.set(term.id, Math.min(STEP_COUNT - 1, Math.floor((below / terms.length) * STEP_COUNT)));
  }
  return steps;
}

/** Ordem alfabética do português com o idioma fixo: não depende do idioma do navegador. */
function compareLabels(a: SearchTerm, b: SearchTerm): number {
  return a.label.localeCompare(b.label, 'pt-BR');
}

function orderTerms(terms: readonly SearchTerm[], order: TermOrder): SearchTerm[] {
  const sorted = [...terms];
  if (order === 'leads') return sorted.sort((a, b) => b.leads - a.leads || compareLabels(a, b));
  return sorted.sort(compareLabels);
}

/** Os três números de um termo, na mesma redação para a dica e para a linha de estado. */
function describe(term: SearchTerm): string {
  const cost = qualifiedCostOf(term);
  const rate = `${formatRateWithVolume(term.qualified, term.leads)} ${term.qualified === 1 ? 'qualificado' : 'qualificados'}`;
  return `${leadsOf(term.leads)}, ${rate} e custo por lead qualificado ${cost === null ? formatUnavailable() : `de ${formatCurrencyCompact(cost)}`}`;
}

export default function SearchTermsTagCloud({
  data = defaultData,
  period = defaultPeriod,
  selectedId,
  defaultSelectedId = defaultSelected,
  onSelect,
  defaultOrder = 'alphabetical',
  height,
  className,
}: SearchTermsTagCloudProps) {
  const [order, setOrder] = useState<TermOrder>(defaultOrder);
  const [innerSelectedId, setInnerSelectedId] = useState<string | null>(defaultSelectedId);
  const style = height === undefined ? undefined : { height };
  const month = formatMonthShort(period);

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum termo de busca paga com lead em {month}: não há o que filtrar.</span>
      </div>
    );
  }

  // `selectedId` definido, mesmo `null`, quer dizer que a página controla a seleção.
  const activeId = selectedId === undefined ? innerSelectedId : selectedId;
  const selected = data.find((term) => term.id === activeId);
  const toggle = (id: string) => {
    const next = id === activeId ? null : id;
    setInnerSelectedId(next);
    onSelect?.(next);
  };

  const ordered = orderTerms(data, order);
  const steps = stepsOf(data);
  const totalLeads = data.reduce((sum, term) => sum + term.leads, 0);
  const leader = orderTerms(data, 'leads')[0];
  const majorityCount = data.filter(hasQualifiedMajority).length;
  const orderSentence = order === 'alphabetical' ? 'em ordem alfabética' : 'por leads, do maior para o menor';

  const summary = [
    `Nuvem alinhada de ${countOf(data.length, 'termo', 'termos')} de busca paga, com ${leadsOf(totalLeads)} em ${month}, ${orderSentence}.`,
    leader ? `O maior é ${leader.label}, com ${leadsOf(leader.leads)}.` : '',
    `${countOf(majorityCount, 'termo tem', 'termos têm')} maioria qualificada.`,
    selected ? `Filtro ativo: ${selected.label}, com ${leadsOf(selected.leads)}.` : 'Nenhum filtro ativo.',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="mb-2 flex shrink-0 items-center justify-between gap-4">
        <p aria-hidden className="min-w-0 text-xs tabular-nums text-text-secondary">
          Termos {orderSentence}. Tamanho em cinco degraus pelos leads de {month}.
        </p>
        <div aria-label="Ordem dos termos" className="flex shrink-0 items-center gap-1 text-xs" role="group">
          {ORDER_OPTIONS.map((option) => (
            <button
              aria-pressed={order === option.id}
              className={cn(
                'rounded border px-2 py-0.5',
                order === option.id ? 'border-line-strong bg-surface-sunken font-semibold text-text-primary' : 'border-transparent text-text-muted',
              )}
              key={option.id}
              onClick={() => setOrder(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {/* A cor de cada termo vai declarada no próprio botão: herdada do contêiner, ela não chega
          ao preview e o destaque se inverte no tema escuro. */}
      <ul className="flex min-h-0 flex-1 flex-wrap content-start items-baseline gap-x-2 gap-y-1">
        {ordered.map((term) => {
          const isSelected = term.id === activeId;
          const isMajority = hasQualifiedMajority(term);
          return (
            <li key={term.id}>
              <button
                aria-pressed={isSelected}
                className={cn(
                  // 7 px de recuo mais 1 px de borda: o texto do termo fica a 8 px da caixa do botão.
                  'rounded border px-[7px] leading-tight',
                  isSelected ? 'border-line-strong bg-surface-sunken' : 'border-transparent',
                  isMajority ? 'font-semibold' : 'font-normal text-text-secondary',
                )}
                onClick={() => toggle(term.id)}
                style={{ fontSize: STEP_FONT_SIZES[steps.get(term.id) ?? 0], color: isMajority ? 'var(--chart-1)' : undefined }}
                title={`${term.label}: ${describe(term)}`}
                type="button"
              >
                {term.label}
                {isSelected ? <span className="ml-2 font-display text-xs font-medium text-text-primary">{leadsOf(term.leads)}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className="mt-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {selected ? (
          <>
            Filtro ativo: <span className="font-semibold text-text-primary">{selected.label}</span>, com {describe(selected)}.
          </>
        ) : (
          'Nenhum filtro ativo: escolha um termo para filtrar o painel por ele.'
        )}
      </p>
      <p className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">
        <span className="font-semibold" style={{ color: 'var(--chart-1)' }}>
          Em destaque
        </span>
        : maioria qualificada, mais da metade dos leads do termo. Os demais ficam em tom neutro.
      </p>
    </div>
  );
}
