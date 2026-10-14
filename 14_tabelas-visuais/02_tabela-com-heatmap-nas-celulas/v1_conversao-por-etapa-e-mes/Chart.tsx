import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, MONTHS, type StageMonthlyRate } from './data';

/**
 * Tabela de conversão por etapa do funil e mês, com o fundo de cada célula na rampa sequencial
 * proporcional à taxa. Escala comum às 12 colunas (o mínimo e o máximo vêm da tabela inteira, não
 * de cada mês). O texto troca de token por degrau para não perder contraste nos tons mais fortes.
 */
export interface ConversaoPorEtapaEMesProps {
  readonly data?: readonly StageMonthlyRate[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Cinco degraus, não sete. `--seq-4` não tem par de texto acima de 4,5:1 nos dois temas
 * (`--text-primary` mede 4,29:1 no escuro; `--accent-cyan-contrast` mede 3,59:1) e `--seq-5`
 * inverte a régua entre temas (o token que passa no escuro reprova no claro e vice-versa).
 * Os dois graus saem da escala; sobram cinco com um único par de texto por lado, medido e estável
 * nos dois temas (mínimo 5,19:1 no escuro, 4,82:1 no claro).
 */
const SEQ_TOKENS = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-6)', 'var(--seq-7)'];
const SEQ_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
];
/** Vão entre células (Few: 1 px já separa a leitura; 2 px cabe na régua de múltiplos de 2). */
const CELL_GAP = 2;

function levelForValue(value: number, min: number, max: number): number {
  const span = max - min || 1;
  const t = (value - min) / span;
  return Math.min(SEQ_TOKENS.length - 1, Math.max(0, Math.round(t * (SEQ_TOKENS.length - 1))));
}

export default function ConversaoPorEtapaEMes({ data = defaultData, height, className }: ConversaoPorEtapaEMesProps) {
  const flat = data.flatMap((stage) => stage.rates.filter((rate): rate is number => rate !== null));
  const min = flat.length > 0 ? Math.min(...flat) : 0;
  const max = flat.length > 0 ? Math.max(...flat) : 1;
  const bestStage = data.reduce<{ name: string; value: number } | null>((best, stage) => {
    const localMax = Math.max(...stage.rates.filter((rate): rate is number => rate !== null));
    return best === null || localMax > best.value ? { name: stage.stageName, value: localMax } : best;
  }, null);

  const summary = `Tabela de calor com a conversão de ${String(data.length)} etapas do funil em 12 meses de 2026. Escala comum de ${formatPercent(min, 0)} a ${formatPercent(max, 0)}. A transição com o melhor mês é ${bestStage?.name ?? ''}, com ${formatPercent(bestStage?.value ?? 0, 0)}.`;

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
            <th className="w-32 text-left align-bottom text-[11px] font-medium text-text-muted">Etapa</th>
            {MONTHS.map((month) => (
              <th className="text-center align-bottom font-medium text-text-muted" key={month}>
                {formatMonthShort(month)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((stage) => (
            <tr key={stage.stageId}>
              <th className="truncate text-left align-middle font-medium text-text-secondary" scope="row">
                {stage.stageName}
              </th>
              {stage.rates.map((rate, index) => {
                const month = MONTHS[index] ?? '';
                if (rate === null) {
                  return (
                    <td className="rounded-sm border border-dashed border-line-strong p-1 text-center" key={month}>
                      <span className="break-words text-[11px] leading-tight text-text-muted">{formatUnavailable()}</span>
                    </td>
                  );
                }
                const level = levelForValue(rate, min, max);
                return (
                  <td
                    className="rounded-sm p-1 text-center font-display font-medium tabular-nums"
                    key={month}
                    style={{ backgroundColor: SEQ_TOKENS[level], color: SEQ_TEXT[level] }}
                  >
                    {formatPercent(rate, 0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption aria-hidden className="flex shrink-0 items-center gap-2 text-[11px] text-text-muted">
        <span>{formatPercent(min, 0)}</span>
        <span className="flex overflow-hidden rounded-sm" style={{ gap: CELL_GAP }}>
          {SEQ_TOKENS.map((token) => (
            <span className="h-3 w-6" key={token} style={{ backgroundColor: token }} />
          ))}
        </span>
        <span>{formatPercent(max, 0)}</span>
        <span>
          · escala comum às <span className="tabular-nums">{formatInt(MONTHS.length)}</span> colunas, mínimo ao máximo da tabela inteira
        </span>
      </figcaption>
    </figure>
  );
}
