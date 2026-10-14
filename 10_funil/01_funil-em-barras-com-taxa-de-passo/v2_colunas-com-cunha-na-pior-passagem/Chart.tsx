import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, excludedStages as defaultExcluded, type ColumnStage } from './data';

/**
 * Colunas do funil ligadas por uma cunha translúcida: a cunha vale a proporção exata entre a
 * coluna atual e a seguinte, então a inclinação nunca é decorativa. A cunha da pior passagem sai
 * em negativo; as demais recuam em neutro, e cada uma escreve a taxa com o denominador do passo.
 */
export interface WedgeColumnsProps {
  readonly data?: readonly ColumnStage[];
  readonly excludedStages?: readonly { readonly label: string; readonly value: number }[];
  readonly height?: number;
  readonly className?: string;
}

interface EnrichedStage extends ColumnStage {
  readonly proximo: number | null;
  readonly passoRate: number | null;
  readonly exited: number | null;
  readonly isWorst: boolean;
}

const MARGIN = { top: 32, right: 4, bottom: 4, left: 4 } as const;
const COLUMN_SHARE = 0.55;
const VALUE_LABEL_GAP = 6;
const LABEL_LINE_HEIGHT = 12;
/** Três linhas por cunha (taxa, denominador, saída absoluta): o rótulo termina esta distância acima da base da coluna. */
const LABEL_BOTTOM_GAP = 36;
/**
 * COR-7: a pior cunha é semântica, então o rótulo não pode ler sobre o próprio fundo tingido; o halo devolve o texto ao
 * par aprovado (--negative sobre --surface-raised). O halo precisa cobrir as três linhas inteiras, com folga de
 * ascendente acima da primeira linha e de descendente abaixo da terceira: um halo que para na segunda linha deixa a
 * terceira (a saída absoluta) direto sobre a cunha, abaixo do contraste mínimo AA.
 */
const WORST_LABEL_HALO_WIDTH = 64;
const WORST_LABEL_HALO_TOP_PAD = 9;
const WORST_LABEL_HALO_BOTTOM_PAD = 8;
const WORST_LABEL_HALO_HEIGHT = WORST_LABEL_HALO_TOP_PAD + 2 * LABEL_LINE_HEIGHT + WORST_LABEL_HALO_BOTTOM_PAD;

function ColumnWithWedge({ x, y, width, height, payload }: BarShapeProps): ReactElement {
  const stage = payload as EnrichedStage;
  const colW = width * COLUMN_SHARE;
  const hProx = stage.proximo === null || stage.value <= 0 ? null : height * (stage.proximo / stage.value);
  const wedgeFill = stage.isWorst ? 'var(--negative)' : 'var(--line-strong)';
  const labelX = x + colW + (width - colW) / 2;
  const labelY = Math.min(y + height - (hProx ?? 0) / 2 - 2 * LABEL_LINE_HEIGHT, y + height - LABEL_BOTTOM_GAP);
  const labelColor = stage.isWorst ? 'var(--negative)' : 'var(--text-muted)';
  return (
    <g>
      <rect fill="var(--chart-1)" height={height} rx={2} width={colW} x={x} y={y} />
      {hProx === null ? null : (
        <polygon
          fill={wedgeFill}
          fillOpacity={stage.isWorst ? 0.38 : 0.2}
          points={`${String(x + colW)},${String(y)} ${String(x + width)},${String(y + height - hProx)} ${String(x + width)},${String(y + height)} ${String(x + colW)},${String(y + height)}`}
        />
      )}
      {stage.passoRate === null || stage.exited === null ? null : (
        <>
          {stage.isWorst ? (
            <rect
              fill="var(--surface-raised)"
              height={WORST_LABEL_HALO_HEIGHT}
              rx={4}
              width={WORST_LABEL_HALO_WIDTH}
              x={labelX - WORST_LABEL_HALO_WIDTH / 2}
              y={labelY - WORST_LABEL_HALO_TOP_PAD}
            />
          ) : null}
          <text className="font-sans" fill={labelColor} fontSize={11} textAnchor="middle" x={labelX} y={labelY}>
            <tspan className="font-display" fontWeight={stage.isWorst ? 700 : 500} x={labelX}>
              {formatPercent(stage.passoRate)}
            </tspan>
            <tspan x={labelX} dy={LABEL_LINE_HEIGHT}>
              do passo
            </tspan>
            <tspan x={labelX} dy={LABEL_LINE_HEIGHT}>
              {formatInt(stage.exited)} saíram
            </tspan>
          </text>
        </>
      )}
    </g>
  );
}

export default function WedgeColumns({ data = defaultData, excludedStages = defaultExcluded, height, className }: WedgeColumnsProps) {
  const animate = useAnimateOnce();
  const rows = data;
  const style = height === undefined ? undefined : { height };

  if (rows.length < 2) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Funil precisa de ao menos duas etapas para calcular taxa de passo.</span>
      </div>
    );
  }

  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const transitions = rows.slice(1).map((stage, i) => {
    const prev = rows[i]!;
    const exited = prev.value - stage.value;
    const passoRate = prev.value > 0 ? stage.value / prev.value : 0;
    return { prev, stage, exited, passoRate };
  });
  const worst = transitions.reduce((acc, t) => (t.passoRate < acc.passoRate ? t : acc), transitions[0]!);

  const enriched: EnrichedStage[] = rows.map((stage, i) => {
    const t = transitions[i];
    return {
      ...stage,
      proximo: t ? t.stage.value : null,
      passoRate: t ? t.passoRate : null,
      exited: t ? t.exited : null,
      isWorst: t === worst,
    };
  });

  const summary =
    `Gráfico de colunas com o funil de marketing de agosto de 2026 em ${String(rows.length)} etapas, de ${formatInt(first.value)} ${first.noun} a ${formatInt(last.value)} ${last.noun}. ` +
    `A cunha da pior passagem, ${worst.prev.label.toLowerCase()} para ${worst.stage.label.toLowerCase()}, mostra ${formatPercent(worst.passoRate)} do passo: ${formatInt(worst.exited)} saíram.`;

  const reading = `Agosto de 2026: de ${formatInt(first.value)} leads a ${formatInt(last.value)} agendas realizadas, ${formatPercent(last.value / first.value)} da entrada.`;

  const footnote = excludedStages.length
    ? `Fora do gráfico, ordem de grandeza maior: ${excludedStages.map((s) => `${formatInt(s.value)} ${s.label}`).join(' e ')}.`
    : '';

  const renderTopo = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const stage = enriched[index ?? -1];
    if (!stage) return null;
    return (
      <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={600} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - VALUE_LABEL_GAP}>
        {formatInt(stage.value)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={0} data={enriched} margin={MARGIN}>
            <XAxis axisLine={false} dataKey="label" interval={0} tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} tickLine={false} />
            <YAxis domain={[0, 'dataMax']} hide type="number" />
            <Bar dataKey="value" isAnimationActive={animate} shape={ColumnWithWedge}>
              <LabelList content={renderTopo} dataKey="value" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {footnote ? (
        <p aria-hidden className="mt-1 shrink-0 truncate text-[11px] text-text-muted">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}
