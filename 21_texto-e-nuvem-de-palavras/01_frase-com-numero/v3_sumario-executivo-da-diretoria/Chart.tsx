import { TriangleAlert, Unplug } from 'lucide-react';
import type { ReactNode } from 'react';

import { formatCurrencyCompact, formatDecimal, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveSummaryInput } from './data';

/**
 * Sumário executivo em três frases geradas pela mesma função: receita contra meta, entradas
 * previstas contra o teto de capacidade e o cenário do ano seguinte em faixa. Cada frase tem no
 * máximo dois números, e o que não é medição diz que é premissa na própria frase.
 */
export interface ExecutiveSummaryProps {
  readonly data?: ExecutiveSummaryInput;
  readonly className?: string;
}

/** Acima do teto a razão vira alerta; até ele, a frase diz que cabe. */
const CAPACITY_LIMIT = 1;

type Piece =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'number'; readonly text: string }
  | { readonly kind: 'alert'; readonly text: string }
  | { readonly kind: 'unavailable' };

interface Sentence {
  readonly id: string;
  readonly pieces: readonly Piece[];
}

const text = (value: string): Piece => ({ kind: 'text', text: value });
const num = (value: string): Piece => ({ kind: 'number', text: value });

/** Razão entre duas grandezas, ou `null` sem as duas ou com divisor zero (EST-1b). */
function ratioOf(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return numerator / denominator;
}

function revenueSentence(input: ExecutiveSummaryInput): Sentence {
  const month = formatMonthShort(input.revenueMonth);
  const attainment = ratioOf(input.revenueActual, input.revenueTarget);
  if (input.revenueActual === null) {
    return { id: 'revenue', pieces: [text(`A receita de ${month} está `), { kind: 'unavailable' }, text(', sem fechamento carregado.')] };
  }
  const head = [text(`A receita de ${month} ficou em `), num(formatCurrencyCompact(input.revenueActual))];
  if (attainment === null) return { id: 'revenue', pieces: [...head, text(', sem meta declarada para comparar.')] };
  return { id: 'revenue', pieces: [...head, text(', '), num(formatPercent(attainment, 1)), text(' da meta.')] };
}

function intakeSentence(input: ExecutiveSummaryInput): Sentence {
  const month = formatMonthShort(input.intakeMonth);
  const ratio = ratioOf(input.intakeForecast, input.intakeCapacity);
  if (ratio === null || input.intakeCapacity === null) {
    return { id: 'intake', pieces: [text(`As entradas previstas para ${month} estão `), { kind: 'unavailable' }, text(', sem teto de capacidade para comparar.')] };
  }
  const multiplier = `${formatDecimal(ratio, 1)}x`;
  const ceiling = [text(' o teto de '), num(`${formatInt(input.intakeCapacity)} agendas`), text(' por semana.')];
  const lead = text(`As entradas previstas para ${month} ${ratio > CAPACITY_LIMIT ? 'são' : 'cabem em'} `);
  return {
    id: 'intake',
    pieces: ratio > CAPACITY_LIMIT ? [lead, { kind: 'alert', text: multiplier }, ...ceiling] : [lead, num(multiplier), ...ceiling],
  };
}

/** O cenário é premissa: a faixa inteira, do menor ao maior, nunca o ponto médio. */
function scenarioSentence(input: ExecutiveSummaryInput): Sentence {
  const lead = `O cenário de ${input.scenarioYear}, uma premissa`;
  if (input.scenarioLow === null || input.scenarioHigh === null) {
    return { id: 'scenario', pieces: [text(`${lead}, está `), { kind: 'unavailable' }, text(': nenhuma faixa foi definida.')] };
  }
  const low = Math.min(input.scenarioLow, input.scenarioHigh);
  const high = Math.max(input.scenarioLow, input.scenarioHigh);
  if (low === high) return { id: 'scenario', pieces: [text(`${lead}, é de `), num(formatCurrencyCompact(low)), text('.')] };
  return { id: 'scenario', pieces: [text(`${lead}, vai de `), num(formatCurrencyCompact(low)), text(' a '), num(formatCurrencyCompact(high)), text('.')] };
}

function plainText(pieces: readonly Piece[]): string {
  return pieces.map((piece) => (piece.kind === 'unavailable' ? formatUnavailable() : piece.text)).join('');
}

function renderPiece(piece: Piece, index: number): ReactNode {
  switch (piece.kind) {
    case 'number':
      return (
        <span className="kpi-number font-semibold text-text-primary" key={index}>
          {piece.text}
        </span>
      );
    case 'alert':
      // Peso 700 só aqui: o multiplicador é o destaque do sumário (TIP-3), e o ícone e o sinal x acompanham a cor (ACE-2).
      return (
        <span className="inline-flex items-center gap-1.5 align-middle font-bold text-negative" key={index}>
          <TriangleAlert aria-hidden className="size-[0.8em] shrink-0" />
          <span className="kpi-number">{piece.text}</span>
        </span>
      );
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

export default function ExecutiveSummary({ data = defaultData, className }: ExecutiveSummaryProps) {
  const sentences = [revenueSentence(data), intakeSentence(data), scenarioSentence(data)];
  const summary = `Sumário da Diretoria em três frases. ${sentences.map((sentence) => plainText(sentence.pieces)).join(' ')}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-4', className)} role="group">
      {sentences.map((sentence) => (
        <p aria-hidden className="text-xl leading-8 text-text-secondary" key={sentence.id}>
          {sentence.pieces.map(renderPiece)}
        </p>
      ))}
    </div>
  );
}
