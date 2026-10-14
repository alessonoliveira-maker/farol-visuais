import { Filter } from 'lucide-react';
import type { ReactNode } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyLeads } from './data';

/**
 * Frase que substitui a legenda: os nomes das duas séries aparecem na frase com a cor do traço,
 * na ordem que o dado manda, e o gráfico logo abaixo não tem Legend. Responde "a qualificação
 * está crescendo mais que o volume?" sem obrigar a ir e voltar entre legenda e linha.
 */
export interface LeadsSentenceProps {
  readonly data?: readonly MonthlyLeads[];
  readonly height?: number;
  readonly className?: string;
}

type SeriesKey = 'qualified' | 'total';

/** Fonte única da cor: o traço, o marcador do fim e a palavra da frase leem daqui (COR-3). */
const SERIES: Record<SeriesKey, { readonly label: string; readonly color: string }> = {
  qualified: { label: 'leads qualificados', color: 'var(--chart-1)' },
  total: { label: 'leads totais', color: 'var(--chart-3)' },
};
const SERIES_KEYS: readonly SeriesKey[] = ['qualified', 'total'];

/** Variação abaixo de 0,5% é lida como estável: sem verbo de movimento. */
const STABLE_CUT = 0.005;
/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;
/** Passo do eixo: o teto é o múltiplo dele acima do maior valor (EIX-4). */
const Y_STEP = 500;
const MARGIN = { top: 12, right: 48, bottom: 0, left: 0 } as const;
const VALUE_LABEL_GAP = 8;

type Piece =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'number'; readonly text: string }
  | { readonly kind: 'series'; readonly key: SeriesKey };

/** Variação do último mês contra o anterior, ou `null` sem os dois pontos ou com base zero. */
function growthOf(data: readonly MonthlyLeads[], key: SeriesKey): number | null {
  const current = data[data.length - 1]?.[key];
  const previous = data[data.length - 2]?.[key];
  if (current === null || current === undefined || previous === null || previous === undefined || previous === 0) return null;
  return (current - previous) / previous;
}

function percentText(fraction: number): string {
  const absolute = Math.abs(fraction);
  return formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1);
}

/** Verbo e número juntos: o sentido vem do verbo, então o número sai sem sinal (NUM-3). */
function movement(fraction: number): readonly Piece[] {
  const number: Piece = { kind: 'number', text: percentText(fraction) };
  if (Math.abs(fraction) < STABLE_CUT) return [{ kind: 'text', text: 'ficaram estáveis (' }, number, { kind: 'text', text: ')' }];
  return [{ kind: 'text', text: fraction > 0 ? 'cresceram ' : 'caíram ' }, number];
}

/** A frase nasce do dado: a série com mais variação vem primeiro e o conector segue a relação. */
function buildSentence(data: readonly MonthlyLeads[]): readonly Piece[] {
  const last = data[data.length - 1];
  const previous = data[data.length - 2];
  if (!last || !previous) return [];
  const qualified = growthOf(data, 'qualified');
  const total = growthOf(data, 'total');
  const opening = `Em ${formatMonthShort(last.month)}, `;
  if (qualified === null || total === null) {
    return [
      { kind: 'text', text: `${opening}sem base em ${formatMonthShort(previous.month)} para comparar os ` },
      { kind: 'series', key: 'qualified' },
      { kind: 'text', text: ' com os ' },
      { kind: 'series', key: 'total' },
      { kind: 'text', text: '.' },
    ];
  }
  const qualifiedLeads = qualified >= total;
  const [first, second]: readonly [SeriesKey, SeriesKey] = qualifiedLeads ? ['qualified', 'total'] : ['total', 'qualified'];
  const g1 = qualifiedLeads ? qualified : total;
  const g2 = qualifiedLeads ? total : qualified;
  const bothUp = g1 > STABLE_CUT && g2 > STABLE_CUT;
  const bothDown = g1 < -STABLE_CUT && g2 < -STABLE_CUT;
  const head: readonly Piece[] = [
    { kind: 'text', text: `${opening}os ` },
    { kind: 'series', key: first },
    { kind: 'text', text: ' ' },
    ...movement(g1),
    { kind: 'text', text: ` contra ${formatMonthShort(previous.month)}, ` },
  ];
  if (bothUp || bothDown) {
    return [...head, { kind: 'text', text: `${bothUp ? 'mais' : 'menos'} que os ` }, { kind: 'series', key: second }, { kind: 'text', text: ', que ' }, ...movement(g2), { kind: 'text', text: '.' }];
  }
  return [...head, { kind: 'text', text: 'enquanto os ' }, { kind: 'series', key: second }, { kind: 'text', text: ' ' }, ...movement(g2), { kind: 'text', text: '.' }];
}

function plainText(pieces: readonly Piece[]): string {
  return pieces.map((piece) => (piece.kind === 'series' ? SERIES[piece.key].label : piece.text)).join('');
}

function renderPiece(piece: Piece, index: number): ReactNode {
  if (piece.kind === 'series') {
    // A cor sozinha não basta para quem não a distingue: o peso 600 acompanha (COR-2).
    return (
      <span className="font-semibold" key={index} style={{ color: SERIES[piece.key].color }}>
        {SERIES[piece.key].label}
      </span>
    );
  }
  if (piece.kind === 'number') {
    return (
      <span className="kpi-number font-semibold text-text-primary" key={index}>
        {piece.text}
      </span>
    );
  }
  return piece.text;
}

export default function LeadsSentence({ data = defaultData, height, className }: LeadsSentenceProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const first = data[0];
  const last = data[data.length - 1];

  if (!first || !last) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há leads para comparar.</span>
      </div>
    );
  }

  const pieces = buildSentence(data);
  const values = data.flatMap((point) => [point.total, point.qualified]).filter((value): value is number => value !== null);
  const top = Math.max(Y_STEP, Math.ceil(Math.max(0, ...values) / Y_STEP) * Y_STEP);
  const ticks = Array.from({ length: top / Y_STEP + 1 }, (_, i) => i * Y_STEP);
  const lastIndex = data.length - 1;
  const summary = `Gráfico de linhas com os leads qualificados e os leads totais por mês, de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}. ${plainText(pieces)}`;

  const endMarker =
    (key: SeriesKey) =>
    ({ cx, cy, index }: DotItemDotProps) => {
      const value = last[key];
      if (index !== lastIndex || cx === undefined || cy === undefined || value === null) return null;
      return (
        <g key={key}>
          <circle cx={cx} cy={cy} fill={SERIES[key].color} r={3} />
          <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={cx + VALUE_LABEL_GAP} y={cy}>
            {formatInt(value)}
          </text>
        </g>
      );
    };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-base leading-6 text-text-secondary">
        {pieces.map(renderPiece)}
      </p>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        leads por mês
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={data} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, top]} tickFormatter={formatInt} tickMargin={8} ticks={ticks} width={48} />
            <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} itemSorter={(item) => -(Number(item.value) || 0)} />
            {SERIES_KEYS.map((key) => (
              <Line activeDot={{ r: 4 }} connectNulls={false} dataKey={key} dot={endMarker(key)} isAnimationActive={animate} key={key} name={SERIES[key].label} stroke={SERIES[key].color} strokeWidth={2} type="linear" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
