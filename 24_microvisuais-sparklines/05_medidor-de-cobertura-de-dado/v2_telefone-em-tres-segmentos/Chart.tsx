import { Unplug } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PhoneQuality, type PhoneState } from './data';

/**
 * Barra de qualidade do campo telefone em três segmentos de ordem fixa: válido, malformado e
 * ausente. Cada segmento tem largura proporcional à contagem, vão de 2 px entre eles e rótulos
 * fora da barra, em colunas à direita (contagem e percentual inteiro, que soma 100 pelo maior
 * resto). Ausente é contorno sem preenchimento, diferente de um zero medido. HTML com Tailwind.
 */
export interface PhoneQualityBarProps {
  readonly data?: PhoneQuality;
  readonly className?: string;
}

/** Ordem fixa dos estados, independente da ordem do dado. */
const ORDER: readonly PhoneState[] = ['valid', 'malformed', 'missing'];

const NAMES: Readonly<Record<PhoneState, string>> = {
  valid: 'Válido',
  malformed: 'Malformado',
  missing: 'Ausente',
};

const HINTS: Readonly<Record<PhoneState, string>> = {
  valid: 'pronto para contato',
  malformed: 'corrigível, o que o time de dados ataca',
  missing: 'nenhum telefone registrado',
};

/** Amostra e segmento por estado: ausente só tem contorno, sem preenchimento. */
const MARK_CLASS: Readonly<Record<PhoneState, string>> = {
  valid: 'bg-chart-1',
  malformed: 'bg-warning',
  missing: 'border border-text-muted',
};

/** Percentuais inteiros que somam 100, pelo maior resto (NUM-2). */
function wholePercents(counts: readonly number[]): readonly number[] {
  const total = counts.reduce((sum, c) => sum + c, 0);
  if (total === 0) return counts.map(() => 0);
  const exact = counts.map((c) => (c / total) * 100);
  const floors = exact.map((x) => Math.floor(x));
  let missing = 100 - floors.reduce((sum, f) => sum + f, 0);
  const byRemainder = exact
    .map((x, i) => ({ i, r: x - Math.floor(x) }))
    .sort((a, b) => b.r - a.r);
  const out = [...floors];
  for (const { i } of byRemainder) {
    if (missing <= 0) break;
    out[i] = (out[i] ?? 0) + 1;
    missing -= 1;
  }
  return out;
}

export default function PhoneQualityBar({ data = defaultData, className }: PhoneQualityBarProps) {
  const rows = ORDER.map((state) => {
    const found = data.segments.find((s) => s.state === state);
    return { state, count: found?.count ?? null };
  });
  const total = rows.reduce((sum, r) => sum + (r.count ?? 0), 0);

  if (total === 0) {
    return (
      <div
        aria-label="Qualidade do campo telefone: a base do período não tem leads para medir."
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2', className)}
        role="status"
      >
        <Unplug aria-hidden className="size-4 text-text-muted" />
        <p className="text-xs text-text-muted">A base do período não tem leads, então não há cobertura de telefone a mostrar.</p>
      </div>
    );
  }

  const percents = wholePercents(rows.map((r) => r.count ?? 0));
  const valid = rows[0]?.count ?? 0;
  const malformed = rows[1]?.count ?? 0;
  const missing = rows[2]?.count ?? 0;
  const validPercent = percents[0] ?? 0;
  const malformedPercent = percents[1] ?? 0;

  const summary = `Barra de qualidade do telefone em ${data.period}: de ${formatInt(total)} leads, ${formatInt(valid)} têm telefone válido (${String(validPercent)}%), ${formatInt(malformed)} malformado (${String(malformedPercent)}%) e ${formatInt(missing)} nenhum telefone (${String(percents[2] ?? 0)}%).`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-4', className)}
      role="img"
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-text-secondary">
          Telefone dos leads, {data.period}: <span className="kpi-number">{formatInt(total)}</span> leads
        </p>
        <p aria-hidden className="text-xs text-text-muted">
          {String(validPercent)}% têm telefone válido; {String(malformedPercent)}% só precisam de correção.
        </p>
      </div>

      <div aria-hidden className="flex h-5 w-full gap-0.5">
        {rows.map((r) =>
          (r.count ?? 0) === 0 ? null : (
            <div
              className={cn('h-full rounded-sm', MARK_CLASS[r.state])}
              key={r.state}
              style={{ flexGrow: r.count ?? 0, flexBasis: 0 }}
            />
          ),
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li className="flex items-center gap-3" key={r.state}>
            <span aria-hidden className={cn('size-3 shrink-0 rounded-sm', MARK_CLASS[r.state])} />
            <p className="min-w-0 flex-1 text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">{NAMES[r.state]}</span>, {HINTS[r.state]}
            </p>
            <span className="kpi-number w-16 shrink-0 text-right text-xs text-text-primary">
              {r.count === null ? 'sem dado' : formatInt(r.count)}
            </span>
            <span className="kpi-number w-12 shrink-0 text-right text-xs font-semibold text-text-primary">
              {formatPercent((percents[i] ?? 0) / 100, 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
