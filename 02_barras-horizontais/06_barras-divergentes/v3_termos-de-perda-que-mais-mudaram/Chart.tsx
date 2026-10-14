import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatPercentPoints, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, q2Total as defaultQ2Total, q3Total as defaultQ3Total, type LossReasonTerm } from './data';

/**
 * Word shift: barras divergentes com a contribuição de cada termo de motivo de perda para a
 * mudança de vocabulário entre dois trimestres, em pontos percentuais de diferença de proporção.
 * Termo raro demais oscila à toa, por isso um mínimo de ocorrências somadas fica de fora e
 * declarado; termo que só existe no trimestre novo leva o selo "novo".
 */
export interface LossReasonShiftProps {
  /** Contagem do termo em cada trimestre. A ordem de entrada não importa: o componente ordena pela contribuição. */
  readonly data?: readonly LossReasonTerm[];
  /** Total de motivos de perda registrados no 2º trimestre. */
  readonly q2Total?: number;
  /** Total de motivos de perda registrados no 3º trimestre. */
  readonly q3Total?: number;
  /** Ocorrências somadas dos dois trimestres abaixo disso ficam de fora do gráfico. */
  readonly minOccurrences?: number;
  readonly height?: number;
  readonly className?: string;
}

const Q2_LABEL = '2º tri/26';
const Q3_LABEL = '3º tri/26';
const GROW_FILL = 'var(--chart-1)';
const SHRINK_FILL = 'var(--chart-3)';
/** Só do selo de texto "novo": em marca teria o mesmo hex de SHRINK_FILL nos dois temas. */
const NEW_LABEL_FILL = 'var(--info)';
const ZERO_STROKE = 'var(--line-strong)';
const NAME_WIDTH = 168;
const MARGIN = { top: 22, right: 64, bottom: 2, left: 0 } as const;
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 14;
const MINUS = '−';
const DEFAULT_MIN_OCCURRENCES = 5;

interface TermRow {
  readonly id: string;
  readonly term: string;
  readonly q2Count: number;
  readonly q3Count: number;
  readonly isNew: boolean;
  /** Diferença de proporção entre os dois trimestres, já em pontos percentuais. */
  readonly contribution: number;
  readonly q2Total: number;
  readonly q3Total: number;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Sinal à mão sobre o valor absoluto (NUM-3); contribuição nula sai sem sinal. */
function formatContribution(value: number): string {
  const text = formatPercentPoints(Math.abs(value));
  if (value === 0) return text;
  return `${value > 0 ? '+' : MINUS}${text}`;
}

/**
 * Contribuição por diferença de proporção (a métrica mais explicável do Shifterator). Termos
 * abaixo do mínimo de ocorrências somadas ficam de fora: raros oscilam à toa entre trimestres.
 */
function toRows(data: readonly LossReasonTerm[], q2Total: number, q3Total: number, minOccurrences: number): TermRow[] {
  const rows = data
    .filter((term) => term.q2Count + term.q3Count >= minOccurrences)
    .map((term) => ({
      id: term.id,
      term: term.term,
      q2Count: term.q2Count,
      q3Count: term.q3Count,
      isNew: term.q2Count === 0 && term.q3Count > 0,
      contribution: (term.q3Count / q3Total - term.q2Count / q2Total) * 100,
      q2Total,
      q3Total,
    }));
  return rows.sort((a, b) => b.contribution - a.contribution || a.term.localeCompare(b.term, 'pt-BR'));
}

/**
 * Dica com a contagem de cada trimestre (catálogo: "contagem de cada grupo na dica, não no
 * rótulo"). Construída a partir da linha completa em `payload[0].payload`, não da série
 * `contribution`, para não repetir o número que já está escrito na ponta da barra.
 */
interface ReasonTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly payload?: unknown }>;
}

function renderReasonTooltip({ active, payload }: ReasonTooltipProps): ReactElement | null {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload as TermRow | undefined;
  if (!row) return null;
  const items: ChartTooltipProps['payload'] = [
    { color: 'var(--text-muted)', dataKey: 'q2', graphicalItemId: 'q2', name: Q2_LABEL, value: formatRateWithVolume(row.q2Count, row.q2Total) },
    { color: 'var(--text-muted)', dataKey: 'q3', graphicalItemId: 'q3', name: Q3_LABEL, value: formatRateWithVolume(row.q3Count, row.q3Total) },
  ];
  return <ChartTooltip active label={row.term} payload={items} valueFormat="text" />;
}

interface RenderNameArgs extends NameTickProps {
  readonly byId: ReadonlyMap<string, TermRow>;
}

/** Nome do termo no eixo, com o selo "novo" para quem só existe no trimestre recente. */
function renderName({ y, payload, byId }: RenderNameArgs): ReactElement {
  const row = byId.get(String(payload?.value ?? ''));
  return (
    <text dominantBaseline="central" fontSize={12} y={Number(y)}>
      <tspan className="font-sans" fill="var(--text-secondary)" fontWeight={500} x={0}>
        {row?.term ?? ''}
      </tspan>
      {row?.isNew ? (
        <tspan className="font-sans" dx={6} fill={NEW_LABEL_FILL} fontWeight={600}>
          novo
        </tspan>
      ) : null}
    </text>
  );
}

interface RenderValueArgs extends LabelProps {
  readonly rows: readonly TermRow[];
}

/** Contribuição escrita fora da ponta livre, à direita quando cresce e à esquerda quando encolhe. */
function renderValue({ x, y, width, height: barHeight, index, rows }: RenderValueArgs): ReactElement | null {
  const row = index === undefined ? undefined : rows[index];
  if (!row) return null;
  const grows = row.contribution >= 0;
  /** Recharts pode devolver `width` negativo para valores abaixo do zero: normaliza antes de achar a ponta. */
  const left = Math.min(Number(x ?? 0), Number(x ?? 0) + Number(width ?? 0));
  const right = Math.max(Number(x ?? 0), Number(x ?? 0) + Number(width ?? 0));
  const tip = grows ? right : left;
  return (
    <text
      className="font-display"
      dominantBaseline="central"
      fill={grows ? GROW_FILL : SHRINK_FILL}
      fontSize={12}
      fontWeight={500}
      textAnchor={grows ? 'start' : 'end'}
      x={grows ? tip + VALUE_LABEL_GAP : tip - VALUE_LABEL_GAP}
      y={Number(y) + Number(barHeight) / 2}
    >
      {formatContribution(row.contribution)}
    </text>
  );
}

export default function LossReasonShift({
  data = defaultData,
  q2Total = defaultQ2Total,
  q3Total = defaultQ3Total,
  minOccurrences = DEFAULT_MIN_OCCURRENCES,
  height,
  className,
}: LossReasonShiftProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = toRows(data, q2Total, q3Total, minOccurrences);
  const byId = new Map(rows.map((row) => [row.id, row]));

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum termo com o mínimo de {String(minOccurrences)} ocorrências somadas nos dois trimestres.</span>
      </div>
    );
  }

  const top = rows[0];
  const bottom = rows[rows.length - 1];
  const domainEdge = Math.max(1, ...rows.map((row) => Math.abs(row.contribution)));

  // ACE-1: tipo, total e os dois destaques só; o resto (novo, fora do corte) fica no visual.
  const summary = [
    `Gráfico de barras divergentes (word shift) com a contribuição de ${String(rows.length)} termos de perda entre ${Q2_LABEL} e ${Q3_LABEL}.`,
    top ? `Mais ganhou: ${top.term} (${formatContribution(top.contribution)}).` : '',
    bottom && bottom.id !== top?.id ? `Mais perdeu: ${bottom.term} (${formatContribution(bottom.contribution)}).` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const tickWithRows = (props: NameTickProps): ReactElement => renderName({ ...props, byId });
  const labelWithRows = (props: LabelProps): ReactElement | null => renderValue({ ...props, rows });

  const renderBarShape = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[index];
    const barWidth = Number(width ?? 0);
    if (!row || barWidth === 0) return <g />;
    const left = Math.min(Number(x ?? 0), Number(x ?? 0) + barWidth);
    const radius: [number, number, number, number] = row.contribution >= 0 ? [0, 3, 3, 0] : [3, 0, 0, 3];
    return (
      <Rectangle
        fill={row.contribution >= 0 ? GROW_FILL : SHRINK_FILL}
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
      {top && bottom && top.id !== bottom.id ? (
        <p aria-hidden className="mb-1 shrink-0 truncate text-xs text-text-secondary">
          Mais ganhou peso <span className="font-semibold text-text-primary">{top.term}</span>{' '}
          <span className="kpi-number font-medium text-text-primary">{formatContribution(top.contribution)}</span>; mais
          perdeu <span className="font-semibold text-text-primary">{bottom.term}</span>{' '}
          <span className="kpi-number font-medium text-text-primary">{formatContribution(bottom.contribution)}</span>
        </p>
      ) : null}
      <p aria-hidden className="mb-2 shrink-0 text-[0.6875rem] text-text-muted">
        Contribuição em pontos percentuais entre {Q2_LABEL} e {Q3_LABEL}; termos com menos de {String(minOccurrences)}{' '}
        ocorrências somadas ficam de fora.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="30%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[-domainEdge, domainEdge]} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={tickWithRows}
              tickLine={false}
              type="category"
              width={NAME_WIDTH}
            />
            <ReferenceLine ifOverflow="extendDomain" stroke={ZERO_STROKE} strokeWidth={1} x={0} />
            <Bar dataKey="contribution" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBarShape}>
              <LabelList content={labelWithRows} dataKey="contribution" />
            </Bar>
            <Tooltip content={renderReasonTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

