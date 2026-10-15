import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

import { seriesColor, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { activeId as defaultActiveId, data as defaultData, type LossReasonCount } from './data';

/**
 * Rosca de composição com fatia ativa: o motivo aberto por padrão já nasce em destaque, o
 * ponteiro, a legenda e o teclado (via foco na legenda) trocam qual fatia está ativa, e o
 * centro alterna entre o total e o item, com um pequeno atraso de saída para não piscar.
 */
export interface LossReasonDonutProps {
  readonly data?: readonly LossReasonCount[];
  readonly height?: number;
  readonly className?: string;
}

const INNER_RADIUS = '62%';
const OUTER_RADIUS = '74%';
/** Ganho de raio da fatia ativa (revisão A20): visível sem depender só da cor. */
const ACTIVE_RADIUS_GAIN = 8;
/** Atraso de saída: sem ele, o centro pisca entre item e total ao cruzar o separador de duas fatias vizinhas. */
const EXIT_DELAY_MS = 100;
/** Máximo de caracteres por linha do nome no centro: 16 x ~7,1 px (Manrope 14 px, peso 600) = ~114 px, dentro da corda do raio interno (~116 px). */
const CENTER_NAME_MAX_CHARS = 16;
const CENTER_NAME_LINE_PX = 17;
const CENTER_GAP_PX = 4;
const CENTER_COUNT_LINE_PX = 13;

/** Quebra por palavra, de forma determinística (contagem de caracteres), sem reticência e sem medir o DOM. */
function wrapName(label: string): readonly string[] {
  const lines: string[] = [];
  for (const word of label.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && last.length + 1 + word.length <= CENTER_NAME_MAX_CHARS) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

/** Percentuais inteiros pelo método do maior resto: a soma exibida é sempre 100 (NUM-2). */
function integerShares(values: readonly number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((share) => Math.floor(share));
  let remainder = 100 - floors.reduce((sum, share) => sum + share, 0);
  const order = raw
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  const result = [...floors];
  for (const { index } of order) {
    if (remainder <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    remainder -= 1;
  }
  return result;
}

interface SliceShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly fill?: string;
  readonly payload?: LossReasonCount;
}

interface CenterLabelProps {
  /** `x`/`y` nunca são lidos: existem só para o Label não cair no branch cartesiano da
   * checagem de tipo fraco do Recharts (`ViewBox` é `Cartesian | Polar`, e um tipo só com
   * campos opcionais precisa de ao menos uma propriedade em comum com cada lado da união). */
  readonly viewBox?: { readonly cx?: number; readonly cy?: number; readonly x?: number; readonly y?: number };
}

export default function LossReasonDonut({ data = defaultData, height, className }: LossReasonDonutProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const [activeId, setActiveId] = useState<string | undefined>(defaultActiveId);
  const exitTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (exitTimer.current !== undefined) window.clearTimeout(exitTimer.current);
    },
    [],
  );

  function activate(id: string): void {
    if (exitTimer.current !== undefined) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = undefined;
    }
    setActiveId(id);
  }

  function scheduleExit(): void {
    exitTimer.current = window.setTimeout(() => {
      setActiveId(undefined);
      exitTimer.current = undefined;
    }, EXIT_DELAY_MS);
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não houve perda registrada no período.</span>
      </div>
    );
  }

  const rows = [...data].sort((a, b) => b.count - a.count);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const active = rows.find((row) => row.id === activeId);
  const leader = rows[0];
  const shares = integerShares(rows.map((row) => row.count));
  const shareOf = (id: string): number => (shares[rows.findIndex((row) => row.id === id)] ?? 0) / 100;

  const summary = [
    `Gráfico de rosca com ${String(total)} perdas do trimestre em ${String(rows.length)} motivos.`,
    leader ? `O maior é ${leader.label}, com ${formatInt(leader.count)} perdas, ${formatPercent(shareOf(leader.id), 0)} do total.` : '',
    'O centro mostra o motivo em foco; passe o ponteiro ou o teclado pela legenda para trocar.',
  ]
    .filter(Boolean)
    .join(' ');

  const renderSlice = (props: SliceShapeProps): ReactElement => {
    const isActive = props.payload?.id === activeId;
    return (
      <Sector
        cx={props.cx}
        cy={props.cy}
        endAngle={props.endAngle}
        fill={props.fill}
        innerRadius={props.innerRadius}
        outerRadius={(props.outerRadius ?? 0) + (isActive ? ACTIVE_RADIUS_GAIN : 0)}
        startAngle={props.startAngle}
        stroke="var(--surface-raised)"
        strokeWidth={2}
      />
    );
  };

  const renderCenter = ({ viewBox }: CenterLabelProps): ReactElement | null => {
    if (viewBox?.cx === undefined || viewBox.cy === undefined) return null;
    const { cx, cy } = viewBox;
    if (active) {
      const nameLines = wrapName(active.label);
      const blockHeight = nameLines.length * CENTER_NAME_LINE_PX + CENTER_GAP_PX + CENTER_COUNT_LINE_PX;
      const top = cy - blockHeight / 2;
      return (
        <text textAnchor="middle">
          {nameLines.map((line, index) => (
            <tspan className="font-sans" fill="var(--text-primary)" fontSize={14} fontWeight={600} key={line} x={cx} y={top + 13 + index * CENTER_NAME_LINE_PX}>
              {line}
            </tspan>
          ))}
          <tspan
            className="font-display"
            fill="var(--text-secondary)"
            fontSize={11}
            fontWeight={700}
            x={cx}
            y={top + nameLines.length * CENTER_NAME_LINE_PX + CENTER_GAP_PX + 10}
          >
            {formatInt(active.count)} perdas ({formatPercent(shareOf(active.id), 0)})
          </tspan>
        </text>
      );
    }
    return (
      <text textAnchor="middle" x={cx} y={cy}>
        <tspan className="font-display" dy="-0.3em" fill="var(--text-primary)" fontSize={14} fontWeight={600} x={cx}>
          {formatInt(total)} perdas
        </tspan>
        <tspan className="font-sans" dy="1.5em" fill="var(--text-muted)" fontSize={11} x={cx}>
          no trimestre
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center gap-6', className)} role="img" style={style}>
      <div className="aspect-square h-full max-h-full shrink-0">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              cx="50%"
              cy="50%"
              data={rows}
              dataKey="count"
              endAngle={-270}
              innerRadius={INNER_RADIUS}
              isAnimationActive={animate}
              nameKey="label"
              onMouseEnter={(entry) => {
                const id = (entry.payload as LossReasonCount | undefined)?.id;
                if (id) activate(id);
              }}
              onMouseLeave={scheduleExit}
              outerRadius={OUTER_RADIUS}
              shape={renderSlice}
              startAngle={90}
            >
              {rows.map((row) => (
                <Cell fill={seriesColor(row.colorIndex)} key={row.id} />
              ))}
              {/* Sem `position="center"` (ver v1): aqui ele quebraria o Label por completo. */}
              <Label content={renderCenter} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {rows.map((row) => {
          const isActive = row.id === activeId;
          return (
            <li key={row.id}>
              <button
                className="flex w-full items-center gap-2.5 border-0 bg-transparent p-0 text-left text-xs"
                onBlur={scheduleExit}
                onClick={() => {
                  activate(row.id);
                }}
                onFocus={() => {
                  activate(row.id);
                }}
                onMouseEnter={() => {
                  activate(row.id);
                }}
                onMouseLeave={scheduleExit}
                type="button"
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seriesColor(row.colorIndex) }}
                />
                <span className={cn('min-w-0 flex-1 truncate', isActive ? 'font-bold text-text-primary' : 'text-text-secondary')}>
                  {row.label}
                </span>
                <span className="kpi-number w-8 shrink-0 text-right text-text-primary">{formatInt(row.count)}</span>
                <span className="kpi-number w-10 shrink-0 text-right text-text-muted">{formatPercent(shareOf(row.id), 0)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
