import { ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis, usePlotArea, useXAxisScale } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CplVariation } from './data';

/**
 * Cartão de KPI: a variação mensal do CPL qualificado em colunas divergentes, com o zero no
 * centro, domínio simétrico e cor pela polaridade da métrica (alta do custo é pior). Uma
 * sequência de três ou mais meses no sentido ruim leva colchete e rótulo.
 */
export interface CplVariationSparkbarProps {
  readonly data?: CplVariation;
  readonly className?: string;
}

const MARGIN = { top: 22, right: 2, bottom: 2, left: 2 } as const;
const BAR_CATEGORY_GAP = '30%';
const BAR_GAP_FRACTION = 0.3;
const BAR_MAX = 12;
/** Coluna menor que isto é desenhada com este tamanho para o mês quase parado não sumir. */
const MIN_COLUMN_HEIGHT = 2;
/** A sequência só ganha anotação a partir deste comprimento. */
const MIN_RUN = 3;
const BRACKET_TICK = 4;
const BRACKET_OFFSET = 6;
const NOTE_FONT_SIZE = 11;
/** Largura média de um caractere de 11 px, para o rótulo não sair da caixa. */
const NOTE_CHAR_WIDTH = 6.2;
/** A partir de 10% de variação, a casa decimal não muda a decisão. */
const WHOLE_PERCENT_FROM = 0.1;

interface RunNote {
  readonly startMonth: string;
  readonly endMonth: string;
  readonly length: number;
}

interface ColumnShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: { readonly variation: number };
}

function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  const digits = absolute >= WHOLE_PERCENT_FROM ? 0 : 1;
  // Sinal de menos tipográfico (U+2212), não hífen.
  return `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, digits)}`;
}

/** Maior sequência de meses no sentido ruim; `null` quando nenhuma chega ao mínimo. */
function longestBadRun(series: CplVariation['series'], badSign: 1 | -1): RunNote | null {
  let best: RunNote | null = null;
  let start = -1;
  series.forEach((point, index) => {
    const isBad = Math.sign(point.variation) === badSign;
    if (isBad && start === -1) start = index;
    const closes = !isBad || index === series.length - 1;
    if (start !== -1 && closes) {
      const end = isBad ? index : index - 1;
      const length = end - start + 1;
      const from = series[start];
      const to = series[end];
      if (length >= MIN_RUN && from && to && (best === null || length > best.length)) {
        best = { startMonth: from.month, endMonth: to.month, length };
      }
      start = -1;
    }
  });
  return best;
}

/** Colchete sobre a sequência: lê a escala do eixo X escondido para achar as colunas. */
function RunBracket({ note, text }: { readonly note: RunNote; readonly text: string }): ReactElement | null {
  const scale = useXAxisScale();
  const area = usePlotArea();
  if (!scale || !area || note.length < 1) return null;
  const bandStart = scale(note.startMonth, { position: 'start' });
  const bandEnd = scale(note.endMonth, { position: 'end' });
  if (bandStart === undefined || bandEnd === undefined) return null;
  const inset = ((bandEnd - bandStart) / note.length) * BAR_GAP_FRACTION;
  const left = bandStart + inset;
  const right = bandEnd - inset;
  const lineY = area.y - BRACKET_OFFSET;
  const half = (text.length * NOTE_CHAR_WIDTH) / 2;
  const center = Math.min(Math.max((left + right) / 2, area.x + half), area.x + area.width - half);
  return (
    <g aria-hidden>
      <path
        d={`M${String(left)} ${String(lineY + BRACKET_TICK)} V${String(lineY)} H${String(right)} V${String(lineY + BRACKET_TICK)}`}
        fill="none"
        stroke="var(--text-secondary)"
        strokeWidth={1}
      />
      <text className="font-sans" fill="var(--text-secondary)" fontSize={NOTE_FONT_SIZE} textAnchor="middle" x={center} y={lineY - 5}>
        {text}
      </text>
    </g>
  );
}

export default function CplVariationSparkbar({ data = defaultData, className }: CplVariationSparkbarProps) {
  const animate = useAnimateOnce();
  const series = [...data.series];
  const first = series.at(0);
  const current = series.at(-1);
  const previous = series.at(-2);

  if (!first || !current) {
    return (
      <div
        className={cn(
          'flex h-full w-full min-w-0 items-center gap-2 rounded-lg border border-line-subtle bg-surface-raised p-4 text-xs text-text-muted',
          className,
        )}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há variação do CPL registrada no período.</span>
      </div>
    );
  }

  const isGoodDown = data.goodDirection === 'down';
  const badSign = isGoodDown ? 1 : -1;
  const maxAbs = series.reduce((top, point) => Math.max(top, Math.abs(point.variation)), 0);
  const isGood = (variation: number): boolean => (isGoodDown ? variation < 0 : variation > 0);
  const colorOf = (variation: number): string => (isGood(variation) ? 'var(--positive)' : 'var(--negative)');
  const risen = series.filter((point) => point.variation > 0).length;
  const fallen = series.filter((point) => point.variation < 0).length;
  const run = longestBadRun(series, badSign);
  const runWord = isGoodDown ? 'altas' : 'quedas';
  const runText = run
    ? `${String(run.length)} ${runWord} seguidas, ${formatMonthShort(run.startMonth)} a ${formatMonthShort(run.endMonth)}`
    : '';
  const currentGood = isGood(current.variation);
  const CurrentIcon = current.variation < 0 ? ArrowDownRight : ArrowUpRight;

  const summary = [
    `Gráfico de colunas com a variação mensal do CPL qualificado em ${String(series.length)} meses, com ${String(risen)} altas e ${String(fallen)} quedas${isGoodDown ? '; alta é pior' : ''}.`,
    run ? `Houve ${String(run.length)} ${runWord} seguidas, de ${formatMonthShort(run.startMonth)} a ${formatMonthShort(run.endMonth)}.` : '',
    `Em ${formatMonthShort(current.month)} a variação foi ${signedPercent(current.variation)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderColumn = ({ x = 0, y = 0, width = 0, height = 0, payload }: ColumnShapeProps): ReactElement | null => {
    if (!payload) return null;
    // Recharts entrega altura negativa para valor abaixo do zero: normaliza antes de desenhar (REC bar).
    const top = Math.min(y, y + height);
    const size = Math.max(Math.abs(height), MIN_COLUMN_HEIGHT);
    const rectY = payload.variation >= 0 ? top + Math.abs(height) - size : top;
    return <rect fill={colorOf(payload.variation)} height={size} rx={1} width={width} x={x} y={rectY} />;
  };

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-xs text-text-muted tabular-nums">
          {formatMonthShort(first.month)} a {formatMonthShort(current.month)}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className={cn('flex items-center gap-1', currentGood ? 'text-positive' : 'text-negative')}>
          <CurrentIcon aria-hidden className="size-5 shrink-0" strokeWidth={2.5} />
          <span className="kpi-number text-3xl leading-none font-semibold">{signedPercent(current.variation)}</span>
        </p>
        <p className="shrink-0 text-right text-xs leading-snug text-text-muted">
          {previous ? <span className="block">contra {formatMonthShort(previous.month)}</span> : null}
          <span className="block">{isGoodDown ? 'alta do CPL é pior' : 'queda é pior'}</span>
        </p>
      </div>

      <div aria-hidden className="mt-2 min-h-8 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={series} margin={MARGIN}>
            {/* Domínio simétrico: o zero fica no centro e a escala das altas é a das quedas. */}
            <XAxis dataKey="month" hide />
            <YAxis domain={[-maxAbs, maxAbs]} hide />
            {/* ifOverflow estendido: sem ele a referência do zero some quando o domínio é recortado (REC-1). */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeWidth={1} y={0} />
            <Bar dataKey="variation" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderColumn} />
            {run ? <RunBracket note={run} text={runText} /> : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
