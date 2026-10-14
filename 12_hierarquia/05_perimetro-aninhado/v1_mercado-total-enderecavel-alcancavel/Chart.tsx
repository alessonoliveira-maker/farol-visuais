import { formatCurrencyCompact, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type NestedPerimeterData } from './data';

/**
 * Perímetro aninhado: quadrados contidos uns nos outros, alinhados no canto inferior esquerdo,
 * com o lado de cada nível proporcional à raiz quadrada do valor. HTML com Tailwind; nenhum SVG
 * é necessário porque a forma inteira é geometria de caixa (largura e altura percentuais).
 */
export interface NestedPerimeterProps {
  readonly data?: NestedPerimeterData;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Estilo por nível, do mais amplo (índice 0) ao mais estreito (índice 3, a participação, o
 * destaque). Um hue só, `--chart-1` (COR-1: série única, uma cor só; sem isenção de contraste a
 * verificar, porque `--chart-1` já mede acima de 3:1 nos dois temas, ao contrário de
 * `--line-strong`). O contorno engrossa e o traço deixa de ser tracejado à medida que o perímetro
 * fica mais firme, até o preenchimento sólido do destaque.
 */
const LEVEL_VISUAL: readonly string[] = [
  'border border-dashed border-chart-1',
  'border border-chart-1',
  'border-2 border-chart-1',
  'bg-chart-1',
];
const DEFAULT_VISUAL = 'border border-chart-1';

/** Lado do quadrado, em percentual do lado do maior nível: raiz quadrada da razão de valor. */
function sidePercent(value: number, base: number): number {
  if (base <= 0) return 0;
  return Math.sqrt(value / base) * 100;
}

/** Fração do nível sobre o nível imediatamente anterior; `null` no primeiro nível, que não tem base. */
function shareOfPrevious(levels: NestedPerimeterData['levels'], index: number): number | null {
  if (index <= 0) return null;
  const level = levels.at(index);
  const previous = levels.at(index - 1);
  if (!level || !previous || previous.value <= 0) return null;
  return level.value / previous.value;
}

export default function NestedPerimeter({ data = defaultData, height, className }: NestedPerimeterProps) {
  const base = data.levels[0].value;
  const outer = data.levels[0];
  const inner = data.levels[3];
  const innerShare = shareOfPrevious(data.levels, 3);

  const summary = [
    `Perímetro aninhado com ${String(data.levels.length)} níveis: do ${outer.label.toLowerCase()} de ${formatCurrencyCompact(outer.value)} até a ${inner.label.toLowerCase()} de ${formatCurrencyCompact(inner.value)}`,
    innerShare === null ? '.' : `, ${formatPercent(innerShare, 0)} do nível anterior.`,
    ' A participação é quase um ponto nesta escala.',
  ].join('');

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="text-xs text-text-secondary">
        <span className="kpi-number font-semibold text-text-primary">{formatCurrencyCompact(inner.value)}</span> de participação
        equivalem a{' '}
        <span className="kpi-number font-semibold text-text-primary">{innerShare === null ? formatUnavailable() : formatPercent(innerShare, 0)}</span>{' '}
        do alcançável.
      </p>

      <div className="flex min-h-0 flex-1 items-center gap-4">
        <div aria-hidden className="relative aspect-square h-full shrink-0">
          {data.levels.map((level, index) => {
            const side = sidePercent(level.value, base);
            return (
              <div
                className={cn(
                  'absolute bottom-0 left-0',
                  LEVEL_VISUAL[index] ?? DEFAULT_VISUAL,
                  index === 3 && 'shadow-[0_0_0_1.5px_var(--surface-raised)]',
                )}
                key={level.id}
                style={{ height: `${String(side)}%`, width: `${String(side)}%` }}
              />
            );
          })}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="pr-0.5 text-right text-[0.6875rem] leading-none text-text-muted">% do nível acima</p>

          <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
            {data.levels.map((level, index) => {
              const isHighlight = index === 3;
              const share = shareOfPrevious(data.levels, index);
              return (
                <li className="flex flex-col gap-0.5" key={level.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span aria-hidden className={cn('size-2.5 shrink-0', LEVEL_VISUAL[index] ?? DEFAULT_VISUAL)} />
                      <span className={cn('text-xs', isHighlight ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                        {level.label}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-baseline gap-1.5">
                      <span className={cn('kpi-number text-xs', isHighlight ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                        {formatCurrencyCompact(level.value)}
                      </span>
                      <span className="min-w-9 shrink-0 text-right text-[0.6875rem] text-text-muted tabular-nums">
                        {share === null ? formatUnavailable() : formatPercent(share, 0)}
                      </span>
                    </span>
                  </div>
                  {isHighlight && (
                    <p aria-hidden className="pl-4 text-[0.6875rem] leading-tight text-text-muted">
                      quase um ponto nesta escala
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p className="text-[0.6875rem] leading-snug text-text-muted">{data.perimeterNote}</p>
    </figure>
  );
}
