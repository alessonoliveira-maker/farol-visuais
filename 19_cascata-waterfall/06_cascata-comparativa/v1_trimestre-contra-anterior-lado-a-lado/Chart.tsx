import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyAxis, formatDecimal, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type BridgeItem, type BridgePanel } from './data';

/** A mesma ponte em dois recortes lado a lado, na mesma escala: compara a forma, não só o resultado. */
export interface PairedBridgeProps {
  readonly data?: readonly BridgePanel[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Corpo medido no canvas 1024 x 460 com moldura `card` e caso de uso em uma linha (seção 13):
 * 1024 − 66 = 958 de largura e 460 − 118,5 = 341,5 de altura. O viewBox tem esse tamanho, então a
 * escala do SVG é 1 e os 11 px declarados chegam como 11 px (GEO-18).
 */
const VIEW_W = 958;
const VIEW_H = 341.5;
const AXIS_W = 62;
const PANEL_GAP = 28;
const EDGE = 4;
const READING_Y = 14;
const HEAD_Y = 38;
const PLOT_TOP = 62;
const PLOT_BOTTOM = VIEW_H - 30;
const BAR_W = 24;
const CORNER = 3;
const LABEL_GAP = 6;
const ZERO_MARK = 2;
const MIN_BAR = 2;
const TICK_STEP = 500_000;
const CHAR_W = 7;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Row extends BridgeItem {
  readonly low: number;
  readonly high: number;
  readonly end: number;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signed(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyAxis(Math.abs(value))}`;
}

/** Total em milhões com duas casas: R$ 1,58 mi, que o compacto de uma casa arredondaria para 1,6. */
function millions(value: number): string {
  return `R$ ${formatDecimal(value / 1_000_000, 2)} mi`;
}

/** Variação inteira a partir de 10% e com uma casa abaixo disso (NUM-1). */
function pctText(fraction: number): string {
  const abs = Math.abs(fraction);
  return formatPercent(abs, abs >= 0.1 ? 0 : 1);
}

/** Cada passo nasce onde o anterior terminou; total reancora no valor dele. */
function buildRows(items: readonly BridgeItem[]): readonly Row[] {
  let running = 0;
  return items.map((item) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : running + item.value;
    running = end;
    return { ...item, low: Math.min(start, end), high: Math.max(start, end), end };
  });
}

/** Quanto a soma dos passos erra o fim menos o início; `null` sem início, fim ou passos. */
function closureGap(items: readonly BridgeItem[]): number | null {
  const first = items[0];
  const last = items[items.length - 1];
  const steps = items.filter((item) => item.kind === 'step');
  if (!first || !last || first.kind !== 'total' || last.kind !== 'total' || steps.length === 0) return null;
  return last.value - first.value - steps.reduce((acc, item) => acc + item.value, 0);
}

/** Domínio comum: o maior ponto de todos os painéis, subido à primeira linha de grade acima dele. */
function commonDomain(panels: readonly (readonly Row[])[]): { readonly max: number; readonly ticks: readonly number[] } {
  const peak = Math.max(1, ...panels.flatMap((rows) => rows.map((row) => row.high)));
  const max = (Math.floor(peak / TICK_STEP) + 1) * TICK_STEP;
  const ticks: number[] = [];
  for (let tick = 0; tick <= max; tick += TICK_STEP) ticks.push(tick);
  return { max, ticks };
}

/** Rótulo centrado na coluna, mas nunca para fora do cartão: o último total encosta na borda direita. */
function labelX(cx: number, text: string): number {
  const half = (text.length * CHAR_W) / 2;
  return Math.min(Math.max(cx, EDGE + half), VIEW_W - EDGE - half);
}

/** Centros de colunas de largura igual: nos dois painéis o mesmo passo cai na mesma posição relativa. */
function columnCenters(rows: readonly Row[], left: number, width: number): readonly number[] {
  const span = width / rows.length;
  return rows.map((_, index) => left + span * (index + 0.5));
}

interface PanelProps {
  readonly panel: BridgePanel;
  readonly rows: readonly Row[];
  readonly left: number;
  readonly width: number;
  readonly toY: (value: number) => number;
}

/** Uma ponte inteira: título, grade, colunas, conectores, rótulos e nomes dos passos. */
function Panel({ panel, rows, left, width, toY }: PanelProps): ReactElement {
  const centers = columnCenters(rows, left, width);
  const first = rows[0];
  const last = rows[rows.length - 1];
  const delta = first && last ? last.value - first.value : 0;
  const base = first && first.value !== 0 ? `${delta >= 0 ? '+' : '−'}${pctText(delta / first.value)} contra ${millions(first.value)} no início` : 'sem base medida no início';
  return (
    <g>
      <text className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={left} y={HEAD_Y}>
        <tspan fill="var(--text-primary)" fontWeight={600}>{panel.label}</tspan>
        {`: ${signed(delta)}, ${base}`}
      </text>
      <line stroke="var(--line-strong)" strokeWidth={1} x1={left} x2={left + width} y1={toY(0)} y2={toY(0)} />
      {rows.map((row, index) => {
        const cx = centers[index] ?? left;
        const next = rows[index + 1];
        const nextCx = centers[index + 1] ?? cx;
        const isTotal = row.kind === 'total';
        const isZero = !isTotal && row.value === 0;
        const top = toY(row.high);
        const bottom = toY(row.low);
        const fill = isTotal ? 'var(--chart-1)' : row.value >= 0 ? 'var(--positive)' : 'var(--negative)';
        return (
          <g key={row.id}>
            {next ? <line stroke="var(--text-muted)" strokeWidth={1} x1={cx + BAR_W / 2} x2={nextCx - BAR_W / 2} y1={toY(row.end)} y2={toY(row.end)} /> : null}
            {isZero ? (
              <rect fill="var(--text-secondary)" height={ZERO_MARK} width={BAR_W} x={cx - BAR_W / 2} y={top - ZERO_MARK / 2} />
            ) : (
              <rect fill={fill} height={Math.max(bottom - top, MIN_BAR)} rx={CORNER} width={BAR_W} x={cx - BAR_W / 2} y={top} />
            )}
            <text
              className="font-display"
              fill={isTotal ? 'var(--text-primary)' : isZero ? 'var(--text-muted)' : fill}
              fontSize={isTotal ? 14 : 12}
              fontWeight={isTotal ? 600 : 500}
              style={HALO}
              textAnchor="middle"
              x={labelX(cx, isTotal ? millions(row.value) : signed(row.value))}
              y={top - LABEL_GAP}
            >
              {isTotal ? millions(row.value) : signed(row.value)}
            </text>
            <text className="font-sans" fill="var(--text-secondary)" fontSize={11} fontWeight={isTotal ? 600 : 500} textAnchor="middle" x={cx} y={PLOT_BOTTOM + 18}>
              {row.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function PairedBridge({ data = defaultData, height, className }: PairedBridgeProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum painel neste recorte: não há receita registrada para montar as pontes.</span>
      </div>
    );
  }

  const built = data.map((panel) => ({ panel, rows: buildRows(panel.items) }));
  const { max, ticks } = commonDomain(built.map((entry) => entry.rows));
  // Escala linear valor para pixel, única para todos os painéis: o domínio vem antes de qualquer desenho.
  const toY = (value: number): number => PLOT_BOTTOM - (value / max) * (PLOT_BOTTOM - PLOT_TOP);
  const panelWidth = (VIEW_W - AXIS_W - EDGE - PANEL_GAP * (built.length - 1)) / built.length;
  const panelLeft = (index: number): number => AXIS_W + index * (panelWidth + PANEL_GAP);

  const gaps = built.map((entry) => closureGap(entry.panel.items));
  const openPanel = built.findIndex((_, index) => (gaps[index] ?? 0) !== 0);
  const openGap = openPanel >= 0 ? gaps[openPanel] : null;
  const reading =
    `Mesma escala nos ${built.length === 2 ? 'dois' : String(built.length)} painéis, de ${formatCurrencyAxis(0)} a ${formatCurrencyAxis(max)}` +
    (openPanel >= 0 && openGap != null ? `; em ${built[openPanel]?.panel.label ?? ''} os passos não fecham em ${signed(openGap)}` : '');

  const phrases = built.map(({ panel, rows }) => {
    const first = rows[0];
    const last = rows[rows.length - 1];
    const biggest = rows.filter((row) => row.kind === 'step').sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0];
    if (!first || !last) return `${panel.label} sem dado`;
    return `${panel.label} foi de ${millions(first.value)} a ${millions(last.value)}${biggest ? `, maior passo ${biggest.label.toLowerCase()} ${signed(biggest.value)}` : ''}`;
  });
  const summary = `Gráfico de cascata da receita em ${String(built.length)} painéis, na mesma escala. ${phrases.join('. ')}.`;

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="h-full w-full" preserveAspectRatio="xMidYMin meet" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={EDGE} y={READING_Y}>
          {reading}
        </text>
        {ticks.map((tick) => (
          <g key={tick}>
            {tick > 0
              ? built.map((entry, index) => (
                  <line key={entry.panel.id} stroke="var(--line-subtle)" strokeWidth={1} x1={panelLeft(index)} x2={panelLeft(index) + panelWidth} y1={toY(tick)} y2={toY(tick)} />
                ))
              : null}
            <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={AXIS_W - LABEL_GAP - 2} y={toY(tick)}>
              {formatCurrencyAxis(tick)}
            </text>
          </g>
        ))}
        {built.map((entry, index) => (
          <Panel key={entry.panel.id} left={panelLeft(index)} panel={entry.panel} rows={entry.rows} toY={toY} width={panelWidth} />
        ))}
      </svg>
    </div>
  );
}
