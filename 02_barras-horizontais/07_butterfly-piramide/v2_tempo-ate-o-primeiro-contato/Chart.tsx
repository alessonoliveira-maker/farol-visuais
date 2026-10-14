import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, Rectangle, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type ContactSpeedBand } from './data';

/**
 * Dois BarChart irmãos numa grade de três colunas: entradas à esquerda com o eixo invertido,
 * agendas à direita, e a faixa de tempo com a taxa de conversão na coluna do meio. As bandas
 * batem entre os dois lados porque compartilham a mesma lista, a mesma margem e o mesmo
 * `barCategoryGap`, sem precisar de uma escala comum entre entradas e agendas.
 */
export interface ContactSpeedButterflyProps {
  readonly data?: readonly ContactSpeedBand[];
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const HIGHLIGHT_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--line-strong)';
const MARGIN = { top: 4, right: 30, bottom: 4, left: 30 } as const;
const BAR_MAX = 18;
const VALUE_GAP = 6;
const CENTER_WIDTH = 132;

interface Row {
  readonly id: string;
  readonly band: string;
  readonly entries: number;
  readonly meetings: number;
}

function toRows(data: readonly ContactSpeedBand[]): Row[] {
  return [...data].reverse();
}

function fillFor(id: string, highlightId: string): string {
  return id === highlightId ? HIGHLIGHT_FILL : NEUTRAL_FILL;
}

export default function ContactSpeedButterfly({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: ContactSpeedButterflyProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = toRows(data);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma faixa neste recorte: não houve entrada de lead no período.</span>
      </div>
    );
  }

  const byId = new Map(rows.map((row) => [row.id, row]));
  const highlighted = byId.get(highlightId);
  const maxEntries = Math.max(1, ...rows.map((row) => row.entries));
  const maxMeetings = Math.max(1, ...rows.map((row) => row.meetings));

  const summary = [
    `Gráfico butterfly com entradas à esquerda e agendas à direita, em ${String(rows.length)} faixas até o contato; entradas até ${formatInt(maxEntries)}, agendas até ${formatInt(maxMeetings)}.`,
    highlighted ? `Faixa em destaque ${highlighted.band}: ${formatRateWithVolume(highlighted.meetings, highlighted.entries)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderEntryBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return <Rectangle fill={fillFor(row.id, highlightId)} height={Number(barHeight ?? 0)} radius={[3, 0, 0, 3]} width={Number(width ?? 0)} x={Number(x ?? 0)} y={Number(y ?? 0)} />;
  };

  const renderMeetingBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return <Rectangle fill={fillFor(row.id, highlightId)} height={Number(barHeight ?? 0)} radius={[0, 3, 3, 0]} width={Number(width ?? 0)} x={Number(x ?? 0)} y={Number(y ?? 0)} />;
  };

  const renderEntryValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const isHighlight = row.id === highlightId;
    return (
      <text className="font-display" dominantBaseline="central" fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={12} fontWeight={isHighlight ? 700 : 500} textAnchor="end" x={Number(x) + Number(width) - VALUE_GAP} y={Number(y) + Number(barHeight) / 2}>
        {formatInt(row.entries)}
      </text>
    );
  };

  const renderMeetingValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const isHighlight = row.id === highlightId;
    return (
      <text className="font-display" dominantBaseline="central" fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={12} fontWeight={isHighlight ? 700 : 500} x={Number(x) + Number(width) + VALUE_GAP} y={Number(y) + Number(barHeight) / 2}>
        {formatInt(row.meetings)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 text-[11px] text-text-muted">
        Entradas à esquerda, agendas à direita, taxa de conversão no centro; escalas independentes, entradas até {formatInt(maxEntries)} e
        agendas até {formatInt(maxMeetings)}, cada lado no próprio máximo.
      </p>
      <div className="grid min-h-0 flex-1" style={{ gridTemplateColumns: `1fr ${String(CENTER_WIDTH)}px 1fr` }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="30%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, maxEntries]} hide reversed type="number" />
            <YAxis dataKey="id" hide type="category" />
            <Bar dataKey="entries" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderEntryBar}>
              <LabelList content={renderEntryValue} dataKey="entries" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-col" style={{ paddingTop: MARGIN.top, paddingBottom: MARGIN.bottom }}>
          {rows.map((row) => {
            const isHighlight = row.id === highlightId;
            return (
              <div className="flex flex-1 flex-col items-center justify-center px-1 text-center" key={row.id}>
                <span className={cn('text-xs', isHighlight ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary')}>{row.band}</span>
                <span className={cn('kpi-number text-[11px]', isHighlight ? 'text-text-primary' : 'text-text-muted')}>
                  {formatRateWithVolume(row.meetings, row.entries)}
                </span>
              </div>
            );
          })}
        </div>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="30%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, maxMeetings]} hide type="number" />
            <YAxis dataKey="id" hide type="category" />
            <Bar dataKey="meetings" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderMeetingBar}>
              <LabelList content={renderMeetingValue} dataKey="meetings" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
