import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type BarShapeProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  currentMonth as defaultCurrentMonth,
  data as defaultData,
  previousMonth as defaultPreviousMonth,
  type PlatformCpl,
} from './data';

/**
 * Barras divergentes com a variação percentual do CPL de cada plataforma contra o mês anterior.
 * O zero fica no centro com domínio simétrico, a cor segue a polaridade da métrica (custo que cai
 * é bom) e não o sinal, e cada linha escreve a variação na ponta e o CPL de base na coluna ao lado.
 */
export interface CplChangeBarsProps {
  /** CPL por plataforma nos dois meses. A ordem de entrada não importa: o componente ordena. */
  readonly data?: readonly PlatformCpl[];
  /** Mês atual, em YYYY-MM. */
  readonly currentMonth?: string;
  /** Mês de comparação, em YYYY-MM. */
  readonly previousMonth?: string;
  /** Sentido bom da métrica: 'down' para custo (padrão), 'up' para receita ou volume. */
  readonly goodDirection?: 'down' | 'up';
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Semântica pela polaridade: a cor diz bom ou ruim, o sinal no rótulo diz subiu ou caiu. */
const GOOD_FILL = 'var(--positive)';
const BAD_FILL = 'var(--negative)';
/** Zero sólido em --line-strong: a única linha do visual, sem grade porque todo valor está escrito. */
const ZERO_STROKE = 'var(--line-strong)';
const NAME_WIDTH = 150;
/** Espaço do rótulo de variação fora da ponta, reservado dos dois lados do domínio simétrico. */
const LABEL_ROOM = 52;
/** Coluna com o CPL atual e o de base, alinhada à direita. */
const COLUMN_WIDTH = 124;
const MARGIN = { top: 22, right: LABEL_ROOM + COLUMN_WIDTH, bottom: 2, left: 0 } as const;
const VALUE_LABEL_GAP = 6;
const HEADER_GAP = 10;
const BAR_MAX = 16;
const BAR_RADIUS = 3;
/** Camada de rótulo do Recharts (2000): texto por cima das barras (300) e da linha do zero. */
const LABEL_Z = 2000;
/** Abaixo de 10% a variação ganha uma casa decimal (NUM-1). */
const ONE_DECIMAL_BELOW = 0.1;
const MINUS = '−';

type GoodDirection = 'down' | 'up';

interface ChangeRow {
  readonly id: string;
  readonly name: string;
  readonly current: number;
  readonly previous: number | null;
  /** Variação como fração (0,24 é +24%); null quando não há mês anterior medido. */
  readonly change: number | null;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Variação com sinal à mão sobre o valor absoluto (NUM-3); zero sai sem sinal. */
function formatChange(change: number): string {
  const absolute = Math.abs(change);
  const digits = absolute < ONE_DECIMAL_BELOW ? 1 : 0;
  const text = formatPercent(absolute, digits);
  if (text === formatPercent(0, digits)) return text;
  return `${change > 0 ? '+' : MINUS}${text}`;
}

function isGood(change: number, goodDirection: GoodDirection): boolean {
  return goodDirection === 'down' ? change < 0 : change > 0;
}

/** Linhas com variação calculada, do maior ganho à maior perda; sem base vão por último. */
function toRows(data: readonly PlatformCpl[]): ChangeRow[] {
  const rows = data.map((item) => ({
    id: item.id,
    name: item.platform,
    current: item.currentCpl,
    previous: item.previousCpl,
    change:
      item.previousCpl === null || item.previousCpl === 0
        ? null
        : (item.currentCpl - item.previousCpl) / item.previousCpl,
  }));
  return rows.sort((a, b) => {
    if (a.change === null || b.change === null) {
      if (a.change === b.change) return a.name.localeCompare(b.name, 'pt-BR');
      return a.change === null ? 1 : -1;
    }
    return b.change - a.change || a.name.localeCompare(b.name, 'pt-BR');
  });
}

interface RowTextProps {
  readonly rows: readonly ChangeRow[];
  readonly goodDirection: GoodDirection;
  readonly currentLabel: string;
  readonly previousLabel: string;
}

/**
 * Rótulos posicionados pelas escalas do próprio gráfico: variação fora da ponta (à direita no
 * positivo, à esquerda no negativo), coluna de CPL e o cabeçalho com o sentido de cada lado.
 */
function RowText({ rows, goodDirection, currentLabel, previousLabel }: RowTextProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!xScale || !yScale || !plot) return null;

  const zeroX = xScale(0) ?? plot.x + plot.width / 2;
  const columnRight = plot.x + plot.width + LABEL_ROOM + COLUMN_WIDTH;
  const headerY = plot.y - HEADER_GAP;
  const downFill = goodDirection === 'down' ? 'var(--positive)' : 'var(--negative)';
  const upFill = goodDirection === 'down' ? 'var(--negative)' : 'var(--positive)';

  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <g fontSize={11}>
        <text className="font-sans" dominantBaseline="central" fill={downFill} textAnchor="end" x={zeroX - VALUE_LABEL_GAP} y={headerY}>
          queda
        </text>
        <text className="font-sans" dominantBaseline="central" fill={upFill} x={zeroX + VALUE_LABEL_GAP} y={headerY}>
          alta
        </text>
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" textAnchor="end" x={columnRight} y={headerY}>
          {currentLabel} contra {previousLabel}
        </text>
      </g>
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        const tip = row.change === null ? zeroX : (xScale(row.change) ?? zeroX);
        const toLeft = row.change !== null && row.change < 0;
        return (
          <g key={row.id}>
            {row.change === null ? (
              <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={zeroX + VALUE_LABEL_GAP} y={center}>
                sem {previousLabel} para comparar
              </text>
            ) : (
              <text
                className="font-display"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={12}
                fontWeight={500}
                textAnchor={toLeft ? 'end' : 'start'}
                x={toLeft ? tip - VALUE_LABEL_GAP : tip + VALUE_LABEL_GAP}
                y={center}
              >
                {formatChange(row.change)}
              </text>
            )}
            <text dominantBaseline="central" textAnchor="end" x={columnRight} y={center}>
              <tspan className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500}>
                {formatCurrency(row.current, 0)}
              </tspan>
              {row.previous === null ? null : (
                <>
                  <tspan className="font-sans" fill="var(--text-muted)" fontSize={11}>
                    {' contra '}
                  </tspan>
                  <tspan className="font-display" fill="var(--text-muted)" fontSize={11}>
                    {formatCurrency(row.previous, 0)}
                  </tspan>
                </>
              )}
            </text>
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function CplChangeBars({
  data = defaultData,
  currentMonth = defaultCurrentMonth,
  previousMonth = defaultPreviousMonth,
  goodDirection = 'down',
  height,
  className,
}: CplChangeBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = toRows(data);

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não houve investimento com lead nos dois meses.</span>
      </div>
    );
  }

  const currentLabel = formatMonthShort(currentMonth);
  const previousLabel = formatMonthShort(previousMonth);
  const measured = rows.filter((row): row is ChangeRow & { readonly change: number } => row.change !== null);
  const maxAbs = Math.max(0, ...measured.map((row) => Math.abs(row.change)));
  /** Domínio simétrico: a mesma variação tem o mesmo comprimento dos dois lados do zero. */
  const domainEdge = maxAbs > 0 ? maxAbs : 1;
  const rises = measured.filter((row) => row.change > 0);
  const falls = measured.filter((row) => row.change < 0);
  const topRise = rises[0];
  const topFall = falls[falls.length - 1];
  const worst = goodDirection === 'down' ? topRise : topFall;
  const missing = rows.filter((row) => row.change === null);
  const byId = new Map(rows.map((row) => [row.id, row]));

  const summary = [
    `Gráfico de barras divergentes com a variação do CPL de ${String(rows.length)} plataformas entre ${previousLabel} e ${currentLabel}.`,
    `O CPL caiu em ${String(falls.length)} e subiu em ${String(rises.length)}.`,
    topRise ? `Maior alta: ${topRise.name}, ${formatChange(topRise.change)}.` : '',
    topFall ? `Maior queda: ${topFall.name}, ${formatChange(topFall.change)}.` : '',
    missing.length > 0 ? `Sem base em ${previousLabel}: ${missing.map((row) => row.name).join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {byId.get(String(payload?.value ?? ''))?.name ?? ''}
    </text>
  );

  /** Raio só na ponta livre: à direita no positivo, à esquerda no negativo. */
  const renderBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[index];
    const barWidth = Number(width ?? 0);
    if (!row || row.change === null || barWidth === 0) return <g />;
    const left = Math.min(Number(x ?? 0), Number(x ?? 0) + barWidth);
    const radius: [number, number, number, number] =
      row.change > 0 ? [0, BAR_RADIUS, BAR_RADIUS, 0] : [BAR_RADIUS, 0, 0, BAR_RADIUS];
    return (
      <Rectangle
        fill={isGood(row.change, goodDirection) ? GOOD_FILL : BAD_FILL}
        height={Number(barHeight ?? 0)}
        radius={radius}
        width={Math.abs(barWidth)}
        x={left}
        y={Number(y ?? 0)}
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {worst && worst.previous !== null ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Maior {worst.change > 0 ? 'alta' : 'queda'} em <span className="font-semibold text-text-primary">{worst.name}</span>:{' '}
          <span className="kpi-number font-medium text-text-primary">{formatChange(worst.change)}</span> contra{' '}
          <span className="kpi-number font-medium text-text-primary">{formatCurrency(worst.previous, 0)}</span> em{' '}
          {previousLabel}
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[-domainEdge, domainEdge]} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_WIDTH + LABEL_ROOM}
            />
            <ReferenceLine ifOverflow="extendDomain" stroke={ZERO_STROKE} strokeWidth={1} x={0} />
            <Bar dataKey="change" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar} />
            <RowText currentLabel={currentLabel} goodDirection={goodDirection} previousLabel={previousLabel} rows={rows} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
