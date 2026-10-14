import { CircleDashed } from 'lucide-react';

import { formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, QUARTERS, type AreaQuarterlyDeviation } from './data';

/**
 * Tabela de calor divergente do desvio contra a meta trimestral, centrada em 0%. Três degraus por
 * lado em opacidade de --positive e --negative, medidos para não passar de 55% (acima disso o
 * texto em --text-primary reprova 4,5:1 nos dois temas). Célula sem meta cadastrada não é a mesma
 * coisa que desvio zero: zero desenha a marca, sem meta não desenha nenhuma.
 */
export interface DesvioDivergenteESemMetaProps {
  readonly data?: readonly AreaQuarterlyDeviation[];
  readonly height?: number;
  readonly className?: string;
}

/** Fronteiras em fração absoluta: abaixo de 2 pontos é dentro da margem. */
const NEUTRAL_LIMIT = 0.02;
const MODERATE_LIMIT = 0.08;
const STRONG_LIMIT = 0.18;
/**
 * Opacidades medidas nos dois temas com --text-primary por cima: no escuro, --positive a 55%
 * mede 4,62:1 e --negative a 55% mede 5,86:1; no claro os dois passam de 6,6:1. Em 65% o par mais
 * fraco (--positive no escuro) cai para 3,76:1 e reprova, por isso o teto fica em 55%.
 */
type Intensity = 'leve' | 'moderado' | 'forte';
/**
 * Classes literais, não interpoladas: o Tailwind só gera o CSS de uma classe que aparece por
 * extenso no código-fonte, e `bg-${tone}/${grau}` some sem avisar. `positive` primeiro, negative
 * segundo, casando com o `tone` de `intensityFor`.
 */
const TONE_CLASSES: Record<Intensity, readonly [string, string]> = {
  leve: ['bg-positive/20', 'bg-negative/20'],
  moderado: ['bg-positive/40', 'bg-negative/40'],
  forte: ['bg-positive/55', 'bg-negative/55'],
};

function intensityFor(absValue: number): Intensity | null {
  if (absValue < NEUTRAL_LIMIT) return null;
  if (absValue < MODERATE_LIMIT) return 'leve';
  if (absValue < STRONG_LIMIT) return 'moderado';
  return 'forte';
}

/** NUM-3: sinal sempre escrito, mesmo dentro da faixa neutra; zero sai sem sinal (mesma regra do resto do catálogo). */
function signedPercent(fraction: number): string {
  const text = formatPercent(Math.abs(fraction), 0);
  if (text === formatPercent(0, 0)) return text;
  return `${fraction > 0 ? '+' : '−'}${text}`;
}

export default function DesvioDivergenteESemMeta({ data = defaultData, height, className }: DesvioDivergenteESemMetaProps) {
  const worst = data.reduce<{ name: string; value: number } | null>((acc, row) => {
    const localMin = Math.min(...row.deviations.filter((value): value is number => value !== null));
    return acc === null || localMin < acc.value ? { name: row.areaName, value: localMin } : acc;
  }, null);
  const missing = data.reduce((count, row) => count + row.deviations.filter((value) => value === null).length, 0);

  const summary = `Tabela de calor divergente com o desvio de ${String(data.length)} áreas contra a meta em 4 trimestres de 2026, centrada em 0%. O maior desvio abaixo da meta é ${worst?.name ?? ''}, a ${signedPercent(worst?.value ?? 0)}. ${String(missing)} de ${String(data.length * QUARTERS.length)} células não têm meta cadastrada.`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <table className="w-full flex-1 table-fixed text-[11px]" style={{ borderCollapse: 'separate', borderSpacing: 2 }}>
        <thead>
          <tr>
            <th className="w-32 text-left align-bottom text-[11px] font-medium text-text-muted">Área</th>
            {QUARTERS.map((quarter) => (
              <th className="text-center align-bottom font-medium text-text-muted" key={quarter}>
                {quarter}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.areaId}>
              <th className="truncate text-left align-middle font-medium text-text-secondary" scope="row">
                {row.areaName}
              </th>
              {row.deviations.map((value, index) => {
                const quarter = QUARTERS[index] ?? '';
                if (value === null) {
                  return (
                    <td className="rounded-sm border border-dashed border-line-strong p-1 text-center" key={quarter}>
                      <span className="inline-flex items-center gap-0.5 text-[11px] leading-tight text-text-muted">
                        <CircleDashed aria-hidden className="size-2.5 shrink-0" />
                        sem meta
                      </span>
                    </td>
                  );
                }
                const intensity = intensityFor(Math.abs(value));
                const toneClass = intensity === null ? null : TONE_CLASSES[intensity][value >= 0 ? 0 : 1];
                return (
                  <td
                    className={cn(
                      'rounded-sm p-1 text-center font-display font-medium tabular-nums',
                      intensity === null ? 'text-text-secondary' : 'text-text-primary',
                      toneClass,
                    )}
                    key={quarter}
                  >
                    {signedPercent(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption aria-hidden className="flex shrink-0 flex-wrap items-center gap-2 text-[11px] text-text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-4 rounded-sm bg-negative/55" />
          <span className="h-3 w-4 rounded-sm bg-negative/40" />
          <span className="h-3 w-4 rounded-sm bg-negative/20" />
          <span className="h-3 w-4 rounded-sm border border-line-subtle" />
          <span className="h-3 w-4 rounded-sm bg-positive/20" />
          <span className="h-3 w-4 rounded-sm bg-positive/40" />
          <span className="h-3 w-4 rounded-sm bg-positive/55" />
        </span>
        <span>
          abaixo da meta · dentro de ±{formatPercent(NEUTRAL_LIMIT, 0)} · acima da meta · degraus em ±{formatPercent(MODERATE_LIMIT, 0)} e ±
          {formatPercent(STRONG_LIMIT, 0)} · <CircleDashed aria-hidden className="inline size-2.5" /> sem meta cadastrada
        </span>
      </figcaption>
    </figure>
  );
}
