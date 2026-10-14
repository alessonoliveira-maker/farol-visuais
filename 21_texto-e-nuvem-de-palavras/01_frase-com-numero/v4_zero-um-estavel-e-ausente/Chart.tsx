import { Filter, Unplug } from 'lucide-react';
import type { ReactNode } from 'react';

import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type AgendaPhrases, type PlatformAgendas, type TeamAgendas } from './data';

/**
 * A mesma função de frase diante dos casos de borda: nenhuma agenda, uma agenda, variação dentro do
 * corte de estabilidade, base anterior zero e dado não coletado, mais o título dinâmico que nomeia
 * as plataformas empatadas. Cada caso tem a sua palavra e nenhum vira zero falso ou infinito.
 */
export interface AgendaPhrasesProps {
  readonly data?: AgendaPhrases;
  readonly className?: string;
}

/** Variação abaixo de 1% é lida como estável: sem verbo de movimento e sem cor semântica. */
const STABLE_CUT = 0.01;
/** Base anterior abaixo de 10 compara contagens; percentual sobre base pequena promove ruído. */
const SMALL_BASE = 10;
/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;

type CaseKind = 'zero' | 'one' | 'many' | 'stable' | 'no-base' | 'no-previous' | 'unavailable';
type Tone = 'good' | 'bad';
type Piece =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'number'; readonly text: string }
  | { readonly kind: 'delta'; readonly text: string; readonly tone: Tone }
  | { readonly kind: 'unavailable' };

const CASE_LABEL: Record<CaseKind, string> = {
  zero: 'zero',
  one: 'um',
  many: 'plural',
  stable: 'estável',
  'no-base': 'sem base',
  'no-previous': 'sem anterior',
  unavailable: 'sem coleta',
};
const TIE_LABEL = 'empate';

const text = (value: string): Piece => ({ kind: 'text', text: value });
const num = (value: string): Piece => ({ kind: 'number', text: value });

/** Zero por extenso, singular e plural: o substantivo concorda com o número (NUM-6). */
function countPieces(count: number, done: boolean): readonly Piece[] {
  if (count === 0) return [num('nenhuma'), text(done ? ' agenda realizada' : ' agenda')];
  if (count === 1) return [num(formatInt(count)), text(done ? ' agenda realizada' : ' agenda')];
  return [num(formatInt(count)), text(done ? ' agendas realizadas' : ' agendas')];
}

/** Variação sobre o anterior, ou `null` sem base positiva (nunca infinito, EST-1b). */
function variationOf(current: number, previous: number): number | null {
  return previous > 0 ? (current - previous) / previous : null;
}

function caseOf(team: TeamAgendas): CaseKind {
  const { current, previous } = team;
  if (current === null) return 'unavailable';
  if (previous === null) return 'no-previous';
  if (previous === 0 && current > 0) return 'no-base';
  const fraction = variationOf(current, previous);
  if (previous >= SMALL_BASE && fraction !== null && Math.abs(fraction) < STABLE_CUT) return 'stable';
  return current === 0 ? 'zero' : current === 1 ? 'one' : 'many';
}

/** Sinal à mão sobre o valor absoluto (NUM-3); o corte de estabilidade já saiu antes. */
function deltaPiece(fraction: number): Piece {
  const absolute = Math.abs(fraction);
  const shown = `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1)}`;
  return { kind: 'delta', text: shown, tone: fraction > 0 ? 'good' : 'bad' };
}

function teamSentence(team: TeamAgendas, kind: CaseKind, data: AgendaPhrases): readonly Piece[] {
  const month = formatMonthShort(data.month);
  const before = formatMonthShort(data.previousMonth);
  const { current, previous } = team;
  const head = text(`${team.team} em ${month}: `);
  if (current === null || previous === null) {
    if (current === null) return [head, { kind: 'unavailable' }, text(`, ${team.unavailableReason ?? 'sem coleta no mês'}.`)];
    return [head, ...countPieces(current, true), text(`, sem ${before} medido para comparar.`)];
  }
  const done = countPieces(current, true);
  if (kind === 'no-base') return [head, ...done, text(`, sem base de comparação, pois ${before} não teve agendas.`)];
  const fraction = variationOf(current, previous);
  const against = [text(' contra '), ...countPieces(previous, false), text(` em ${before}.`)];
  if (kind === 'stable' && fraction !== null) return [head, ...done, text(', estável ('), num(formatPercent(Math.abs(fraction), 1)), text(')'), ...against];
  if (previous >= SMALL_BASE && fraction !== null) return [head, ...done, text(', '), deltaPiece(fraction), ...against];
  return [head, ...done, text(','), ...against];
}

function joinNames(names: readonly string[]): string {
  const last = names[names.length - 1] ?? '';
  return names.length < 2 ? last : `${names.slice(0, -1).join(', ')} e ${last}`;
}

/** Título dinâmico: um líder é nomeado, empate nomeia todos os empatados (nunca escolhe um). */
function leaderSentence(platforms: readonly PlatformAgendas[], month: string): readonly Piece[] {
  const measured = platforms.flatMap((p) => (p.agendas === null ? [] : [{ name: p.name, agendas: p.agendas }]));
  const top = measured.length === 0 ? null : Math.max(...measured.map((p) => p.agendas));
  if (top === null) return [text('Nenhuma plataforma com agendas medidas em '), text(month), text(': '), { kind: 'unavailable' }, text('.')];
  const leaders = measured.filter((p) => p.agendas === top).map((p) => p.name);
  return [text(`${joinNames(leaders)} ${leaders.length > 1 ? 'empatam em ' : 'lidera com '}`), ...countPieces(top, false), text(` em ${month}.`)];
}

function renderPiece(piece: Piece, index: number): ReactNode {
  switch (piece.kind) {
    case 'number':
      return <span className="kpi-number font-semibold text-text-primary" key={index}>{piece.text}</span>;
    case 'delta':
      return <span className={cn('kpi-number font-semibold', piece.tone === 'good' ? 'text-positive' : 'text-negative')} key={index}>{piece.text}</span>;
    case 'unavailable':
      return (
        <span className="inline-flex items-center gap-1.5 align-middle text-text-muted" key={index}>
          <Unplug aria-hidden className="size-[0.8em] shrink-0" />
          <span className="font-display">{formatUnavailable()}</span>
        </span>
      );
    case 'text':
      return piece.text;
  }
}

export default function AgendaPhrasesList({ data = defaultData, className }: AgendaPhrasesProps) {
  if (data.teams.length === 0 && data.platforms.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma equipe neste recorte: não há agendas para escrever em frase.</span>
      </div>
    );
  }

  const month = formatMonthShort(data.month);
  const rows = [
    ...data.teams.map((team) => {
      const kind = caseOf(team);
      return { id: team.id, tag: CASE_LABEL[kind], pieces: teamSentence(team, kind, data) };
    }),
    { id: 'platforms', tag: TIE_LABEL, pieces: leaderSentence(data.platforms, month) },
  ];
  const tags = rows.map((row) => row.tag);
  const summary = `${formatInt(rows.length)} frases de agendas realizadas em ${month}, geradas pela mesma função, uma por caso: ${tags.slice(0, -1).join(', ')} e ${tags[tags.length - 1] ?? ''}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col justify-center', className)} role="group">
      <ul aria-hidden className="flex flex-col gap-3">
        {rows.map((row) => (
          <li className="flex min-w-0 gap-3" key={row.id}>
            <span className="w-20 shrink-0 pt-1 text-[0.6875rem] text-text-muted">{row.tag}</span>
            <p className="min-w-0 text-base leading-6 text-text-secondary">{row.pieces.map(renderPiece)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
