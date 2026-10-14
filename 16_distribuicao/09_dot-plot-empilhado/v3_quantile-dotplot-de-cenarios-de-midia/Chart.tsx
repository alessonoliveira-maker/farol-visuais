import { Filter } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';

import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AXIS_MAX, AXIS_MIN, CAPACITY, QUANTILES, data as defaultData, type MediaScenario } from './data';

/**
 * Quantile dotplot: cada cenário vira 20 pontos, e cada ponto é um desfecho simulado igualmente
 * provável (o quantil de nível (i + 0,5) / 20 das amostras do simulador), não um lead. A leitura é
 * por contagem contra um limiar: quantos dos 20 desfechos passam do teto de capacidade.
 *
 * A grade de empilhar nasce no teto, e não no início da régua: assim nenhum ponto cruza a linha e a
 * pilha de cada lado é exatamente a contagem escrita. O k é fixo em 20 no produto inteiro.
 */
export interface MediaScenarioDotplotProps {
  readonly data?: readonly MediaScenario[];
  readonly capacity?: number;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 22, right: 8, bottom: 24, left: 8 } as const;
/** Tamanho antes da primeira medição real do corpo; o desenho final vem do ResizeObserver. */
const FALLBACK_SIZE = { width: 894, height: 190 } as const;
const NAME_WIDTH = 150;
const COUNT_WIDTH = 140;
const DOT_MAX = 16;
const DOT_MIN = 7;
const DOT_STEP = 0.5;
const ROW_PAD = 3;
const WITHIN_FILL = 'var(--chart-1)';
/** Acima do teto é o ruim de uma contagem de capacidade: polaridade negativa (COR-6), com a contagem escrita ao lado. */
const OVER_FILL = 'var(--negative)';
const DOT_STROKE = 'var(--surface-raised)';
const DOT_STROKE_WIDTH = 1;
const ROW_LINE = 'var(--line-subtle)';
const LIMIT_STROKE = 'var(--line-strong)';
const LABEL_FONT_SIZE = 11;
const TICK_STEP = 40;

interface Size {
  readonly width: number;
  readonly height: number;
}

function useMeasuredSize(ref: RefObject<HTMLDivElement | null>): Size {
  const [size, setSize] = useState<Size>(FALLBACK_SIZE);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [ref]);
  return size;
}

/** Quantil por interpolação linear, ou `null` para lista vazia: ausência não vira zero (EST-1b). */
function quantile(sorted: readonly number[], level: number): number | null {
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * level;
  const low = Math.floor(position);
  const lowValue = sorted[low] ?? 0;
  const highValue = sorted[Math.min(low + 1, sorted.length - 1)] ?? lowValue;
  return lowValue + (highValue - lowValue) * (position - low);
}

/** Os k desfechos de um cenário, ou `null` quando o simulador não devolveu amostra nenhuma. */
function outcomes(samples: readonly number[]): readonly number[] | null {
  const sorted = [...samples].sort((a, b) => a - b);
  const levels = Array.from({ length: QUANTILES }, (_, index) => (index + 0.5) / QUANTILES);
  const values = levels.map((level) => quantile(sorted, level));
  return values.every((value): value is number => value !== null) ? values : null;
}

interface Row {
  readonly scenario: MediaScenario;
  readonly values: readonly number[] | null;
  /** Desfechos acima do teto, ou `null` quando não há amostra: ausência não é zero (EST-1b). */
  readonly over: number | null;
}

export default function MediaScenarioDotplot({ data = defaultData, capacity = CAPACITY, height, className }: MediaScenarioDotplotProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const size = useMeasuredSize(bodyRef);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cenário simulado neste recorte: não há desfecho para contar contra o teto.</span>
      </div>
    );
  }

  /** Ordem pelo risco: o cenário com mais desfechos acima do teto vai para a primeira linha, a que o olho lê primeiro. */
  const rows: readonly Row[] = data
    .map((scenario) => {
      const values = outcomes(scenario.samples);
      return { scenario, values, over: values === null ? null : values.filter((value) => value > capacity).length };
    })
    .sort((a, b) => {
      if (a.over === null || b.over === null) return a.over === b.over ? 0 : a.over === null ? 1 : -1;
      return b.over - a.over;
    });
  /** Só cenários com amostra entram na ordem de risco, na frase e na linha de leitura. */
  const measured = rows.filter((row): row is Row & { readonly over: number } => row.over !== null);

  const plotLeft = MARGIN.left + NAME_WIDTH;
  const plotWidth = size.width - plotLeft - COUNT_WIDTH - MARGIN.right;
  const plotHeight = size.height - MARGIN.top - MARGIN.bottom;
  const rowHeight = plotHeight / rows.length;
  const unitWidth = plotWidth / (AXIS_MAX - AXIS_MIN);
  const xOf = (value: number): number => plotLeft + (value - AXIS_MIN) * unitWidth;
  const limitX = xOf(capacity);

  /** Coluna da grade ancorada no teto: valor igual ao teto fica no lado de dentro, só o que passa dele vai para a direita. */
  const columnOf = (value: number, diameter: number): number => Math.ceil((xOf(value) - limitX) / diameter) - 1;
  const tallestAt = (diameter: number): number =>
    Math.max(
      1,
      ...rows.map((row) => {
        const tally = new Map<number, number>();
        for (const value of row.values ?? []) {
          const column = columnOf(value, diameter);
          tally.set(column, (tally.get(column) ?? 0) + 1);
        }
        return Math.max(0, ...tally.values());
      }),
    );
  let diameter = DOT_MIN;
  for (let candidate = DOT_MAX; candidate > DOT_MIN; candidate -= DOT_STEP) {
    if (tallestAt(candidate) * candidate <= rowHeight - ROW_PAD) {
      diameter = candidate;
      break;
    }
  }

  const ticks = Array.from({ length: Math.floor((AXIS_MAX - AXIS_MIN) / TICK_STEP) + 1 }, (_, index) => AXIS_MIN + index * TICK_STEP);
  const worst = measured[0];
  const calmest = measured[measured.length - 1];
  const unmeasured = rows.length - measured.length;

  const summary =
    `Gráfico de pontos com ${formatInt(rows.length)} cenários de mídia em ${formatInt(QUANTILES)} desfechos simulados cada, contra o teto de ${formatInt(capacity)} entradas qualificadas por mês. ` +
    (worst === undefined || calmest === undefined
      ? 'Nenhum cenário tem amostra simulada.'
      : `${worst.scenario.name} passa do teto em ${formatInt(worst.over)} desfechos e ${calmest.scenario.name}, em ${formatInt(calmest.over)}.`) +
    (unmeasured > 0 ? ` ${formatInt(unmeasured)} cenário sem simulação, fora da ordem.` : '');

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p aria-hidden className="shrink-0 text-xs text-text-secondary">
        {worst === undefined
          ? 'Nenhum cenário tem amostra simulada para contar contra o teto.'
          : worst.over === 0
          ? `Nenhum cenário passa do teto de ${formatInt(capacity)} entradas qualificadas por mês em algum dos ${formatInt(QUANTILES)} desfechos.`
          : `${worst.scenario.name}: ${formatInt(worst.over)} de ${formatInt(QUANTILES)} desfechos passam do teto de ${formatInt(capacity)} entradas qualificadas por mês.`}
      </p>
      <div className="min-h-0 flex-1" ref={bodyRef}>
        <svg aria-hidden height={size.height} viewBox={`0 0 ${String(size.width)} ${String(size.height)}`} width={size.width}>
          {rows.map((row, index) => {
            const baseY = MARGIN.top + (index + 1) * rowHeight;
            const countX = size.width - MARGIN.right - COUNT_WIDTH + 12;
            const over = row.over;
            const within = over === null ? null : QUANTILES - over;
            return (
              <g key={row.scenario.id}>
                <line stroke={ROW_LINE} x1={plotLeft} x2={plotLeft + plotWidth} y1={baseY} y2={baseY} />
                <text fill="var(--text-secondary)" fontSize={LABEL_FONT_SIZE} textAnchor="end" x={plotLeft - 12} y={baseY - rowHeight / 2 + 4}>
                  {row.scenario.name}
                </text>
                {row.values === null || over === null || within === null ? (
                  <text fill="var(--text-muted)" fontSize={LABEL_FONT_SIZE} x={countX} y={baseY - rowHeight / 2 + 4}>
                    {`simulação ${formatUnavailable()}`}
                  </text>
                ) : (
                  <>
                    {tallyColumns(row.values, columnOf, diameter).map((dot) => (
                      <circle
                        cx={limitX + (dot.column + 0.5) * diameter}
                        cy={baseY - (dot.level + 0.5) * diameter - 1}
                        fill={dot.over ? OVER_FILL : WITHIN_FILL}
                        key={`${row.scenario.id}-${String(dot.index)}`}
                        r={diameter / 2}
                        stroke={DOT_STROKE}
                        strokeWidth={DOT_STROKE_WIDTH}
                      />
                    ))}
                    <text
                      className="tabular-nums"
                      fill={over > 0 ? OVER_FILL : 'var(--text-muted)'}
                      fontSize={LABEL_FONT_SIZE}
                      x={countX}
                      y={baseY - rowHeight / 2 - 2}
                    >
                      {`${formatInt(over)} de ${formatInt(QUANTILES)} acima do teto`}
                    </text>
                    <text className="tabular-nums" fill="var(--text-muted)" fontSize={LABEL_FONT_SIZE} x={countX} y={baseY - rowHeight / 2 + 12}>
                      {`${formatInt(within)} de ${formatInt(QUANTILES)} dentro`}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          <line stroke={LIMIT_STROKE} strokeDasharray="4 3" x1={limitX} x2={limitX} y1={MARGIN.top - 4} y2={MARGIN.top + plotHeight} />
          <text className="tabular-nums" fill="var(--text-muted)" fontSize={LABEL_FONT_SIZE} textAnchor="middle" x={limitX} y={MARGIN.top - 9}>
            {`teto de capacidade: ${formatInt(capacity)}`}
          </text>
          {ticks.map((tick) => (
            <text
              className="tabular-nums"
              fill="var(--text-muted)"
              fontSize={LABEL_FONT_SIZE}
              key={`tick-${String(tick)}`}
              textAnchor="middle"
              x={xOf(tick)}
              y={MARGIN.top + plotHeight + 16}
            >
              {formatInt(tick)}
            </text>
          ))}
        </svg>
      </div>
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`cada ponto é 1 em ${formatInt(QUANTILES)} desfechos simulados, não um lead`}</span>
        <span>entradas qualificadas por mês, mesma régua nos cenários</span>
        <span className="tabular-nums">{`quantis de ${formatPercent(0.5 / QUANTILES)} a ${formatPercent(1 - 0.5 / QUANTILES)} das amostras do simulador`}</span>
        <span>cenários em ordem de desfechos acima do teto, do maior para o menor</span>
      </div>
    </figure>
  );
}

interface PlacedDot {
  readonly index: number;
  readonly column: number;
  readonly level: number;
  readonly over: boolean;
}

/** Posição de cada ponto na grade ancorada no teto: coluna pela régua e nível pela ordem de chegada na coluna. */
function tallyColumns(values: readonly number[], columnOf: (value: number, diameter: number) => number, diameter: number): PlacedDot[] {
  const filled = new Map<number, number>();
  return [...values]
    .sort((a, b) => a - b)
    .map((value, index) => {
      const column = columnOf(value, diameter);
      const level = filled.get(column) ?? 0;
      filled.set(column, level + 1);
      return { index, column, level, over: column >= 0 };
    });
}
