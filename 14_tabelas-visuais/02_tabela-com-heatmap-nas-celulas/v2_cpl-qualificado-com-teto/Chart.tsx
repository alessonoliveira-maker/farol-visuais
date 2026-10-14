import { AlertTriangle } from 'lucide-react';

import { formatCurrencyCompact, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CPL_CEILING, data as defaultData, MONTHS, type PlatformMonthlyCpl } from './data';

/**
 * Tabela de calor do CPL qualificado por plataforma e mês, numa faixa manual de R$ 60 a R$ 240 em
 * 5 degraus: um outlier não distorce a escala, diferente do gradiente automático de mínimo a
 * máximo. Aqui a polaridade é invertida: tom mais forte é CPL mais caro, ou seja pior.
 */
export interface CplQualificadoComTetoProps {
  readonly data?: readonly PlatformMonthlyCpl[];
  readonly height?: number;
  readonly className?: string;
}

/** Faixa manual em reais; valor fora dela encosta no extremo (RANGE_MIN ou RANGE_MAX). */
const RANGE_MIN = 60;
const RANGE_MAX = 240;
/**
 * Cinco degraus, não sete: mesma razão da v1 (--seq-4 sem par de texto acima de 4,5:1 nos dois
 * temas; --seq-5 inverte a régua entre eles). `--text-primary` cobre os três primeiros e
 * `--accent-cyan-contrast` os dois últimos, medido nos dois temas.
 */
const SEQ_TOKENS = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-6)', 'var(--seq-7)'];
const SEQ_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
];
const CELL_GAP = 2;

function levelForValue(value: number): number {
  const t = (value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN);
  return Math.min(SEQ_TOKENS.length - 1, Math.max(0, Math.round(t * (SEQ_TOKENS.length - 1))));
}

export default function CplQualificadoComTeto({ data = defaultData, height, className }: CplQualificadoComTetoProps) {
  const worst = data.reduce<{ name: string; value: number } | null>((acc, platform) => {
    const localMax = Math.max(...platform.cpl.filter((value): value is number => value !== null));
    return acc === null || localMax > acc.value ? { name: platform.platformName, value: localMax } : acc;
  }, null);

  const summary = `Tabela de calor com o CPL qualificado de ${String(data.length)} plataformas de mídia paga no primeiro semestre de 2026, em faixa manual de ${formatCurrencyCompact(RANGE_MIN)} a ${formatCurrencyCompact(RANGE_MAX)}. A plataforma com o mês mais caro é ${worst?.name ?? ''}, a ${formatCurrencyCompact(worst?.value ?? 0)}, acima do teto de ${formatCurrencyCompact(CPL_CEILING)}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <table className="w-full flex-1 table-fixed text-[11px]" style={{ borderCollapse: 'separate', borderSpacing: CELL_GAP }}>
        <thead>
          <tr>
            <th className="w-36 text-left align-bottom text-[11px] font-medium text-text-muted">Plataforma</th>
            {MONTHS.map((month) => (
              <th className="text-center align-bottom font-medium text-text-muted" key={month}>
                {formatMonthShort(month)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((platform) => (
            <tr key={platform.platformId}>
              <th className="truncate text-left align-middle font-medium text-text-secondary" scope="row">
                {platform.platformName}
              </th>
              {platform.cpl.map((value, index) => {
                const month = MONTHS[index] ?? '';
                if (value === null) {
                  return (
                    <td className="rounded-sm border border-dashed border-line-strong p-1 text-center" key={month}>
                      <span className="break-words text-[11px] leading-tight text-text-muted">{formatUnavailable()}</span>
                    </td>
                  );
                }
                const level = levelForValue(value);
                const aboveCeiling = value > CPL_CEILING;
                return (
                  <td
                    className={cn('rounded-sm p-1 text-center font-display font-medium tabular-nums', aboveCeiling && 'border-2 border-warning')}
                    key={month}
                    style={{ backgroundColor: SEQ_TOKENS[level], color: SEQ_TEXT[level] }}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {aboveCeiling ? <AlertTriangle aria-hidden className="size-2.5 shrink-0" /> : null}
                      {formatCurrencyCompact(value)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption aria-hidden className="flex shrink-0 flex-wrap items-center gap-2 text-[11px] text-text-muted">
        <span>{formatCurrencyCompact(RANGE_MIN)}</span>
        <span className="flex overflow-hidden rounded-sm" style={{ gap: CELL_GAP }}>
          {SEQ_TOKENS.map((token) => (
            <span className="h-3 w-6" key={token} style={{ backgroundColor: token }} />
          ))}
        </span>
        <span>{formatCurrencyCompact(RANGE_MAX)}</span>
        <span>· faixa manual, tom mais forte é CPL mais caro (pior)</span>
        <span className="inline-flex shrink-0 items-center gap-1">
          <AlertTriangle aria-hidden className="size-2.5 shrink-0" />
          acima do teto de {formatCurrencyCompact(CPL_CEILING)}
        </span>
      </figcaption>
    </figure>
  );
}
