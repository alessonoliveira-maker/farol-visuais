import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ReferenceArea, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercentPoints, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MediaBudgetPanel, type MediaPlatformBudget } from './data';

/**
 * Bullet vertical: cada coluna é uma plataforma, a escala é o percentual do orçamento
 * planejado, a faixa de conforto atravessa todas as colunas e a meta é um traço horizontal.
 * Plataforma sem veiculação tem percentual null: não desenha coluna e escreve indisponível com ícone.
 */
export interface MediaBudgetChartProps {
  readonly data?: MediaBudgetPanel;
  readonly height?: number;
  readonly className?: string;
}

type RowDatum = MediaPlatformBudget & { readonly percent: number | null };

/** `left` cresceu de 34 para 68 px para caber "meta 100%" (ANO-2 pede nome e valor, não só o nome). */
const MARGIN = { top: 12, right: 76, bottom: 8, left: 68 } as const;
/**
 * Teto de cartão da ESP-2 (24 px). Corpo de ~464 px com 4 colunas e vão de 34% dá um passo de
 * 116 px, que sem teto rende 37 px de espessura efetiva (medido no preview.svg, não no
 * `maxBarSize` sozinho); o teto é quem prende a coluna em 24 px, centrada na própria banda.
 */
const COLUMN_MAX = 24;
const VALUE_LABEL_GAP = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface BarGeometry {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: RowDatum;
}

interface CategoryTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
}

interface LineViewBox {
  readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number; readonly height?: number };
}

export default function MediaBudgetChart({ data = defaultData, height, className }: MediaBudgetChartProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  if (data.platforms.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2', className)} role="status" style={style}>
        <Filter aria-hidden color="var(--text-muted)" height={16} width={16} />
        <span className="font-sans" style={{ color: 'var(--text-muted)', fontSize: 12 }}>O recorte não tem plataformas no mês, então não há orçamento a comparar com o planejado.</span>
      </div>
    );
  }
  const spentPercents = data.platforms.filter((p) => p.spent !== null).map((p) => ((p.spent ?? 0) / p.planned) * 100);
  const domainMax = Math.max(data.comfortTo, ...spentPercents) * 1.05;
  const rows: readonly RowDatum[] = data.platforms.map((p) => ({
    ...p,
    percent: p.spent === null ? null : (p.spent / p.planned) * 100,
  }));
  const missing = rows.filter((row) => row.spent === null);
  const excedente = rows.filter((row) => row.percent !== null && row.percent > data.comfortTo);

  const summary = [
    `Bullet chart vertical com o orçamento de mídia paga consumido em ${formatMonthShort(data.month)} por ${String(rows.length)} plataformas, contra o planejado.`,
    `Faixa de conforto entre ${String(data.comfortFrom)}% e ${String(data.comfortTo)}% do planejado.`,
    excedente[0] ? `${excedente[0].fullLabel} passou do conforto.` : '',
    missing[0] ? `${missing[0].fullLabel} não teve veiculação no mês.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderComfortLabel = ({ viewBox }: LineViewBox): ReactElement => (
    <text fill="var(--text-muted)" fontSize={11} textAnchor="start" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) + 6} y={(viewBox?.y ?? 0) + (viewBox?.height ?? 0) / 2}>
      Conforto
    </text>
  );

  /** Lado esquerdo, oposto ao rótulo da faixa: as duas leituras nunca disputam a mesma coluna. */
  const renderTargetLabel = ({ viewBox }: LineViewBox): ReactElement => (
    <text fill="var(--text-secondary)" fontSize={11} textAnchor="end" x={(viewBox?.x ?? 0) - 6} y={(viewBox?.y ?? 0) + 4}>
      meta {formatPercentPoints(100, 0)}
    </text>
  );

  /** Ausência é null: sem coluna, o rótulo de indisponível (ícone e texto) senta sobre a base da banda. */
  const renderCategory = ({ x, y, index = -1 }: CategoryTickProps): ReactElement => {
    const row = rows[index];
    const cx = Number(x);
    const ty = Number(y);
    return (
      <g>
        <text className="font-sans" fill="var(--text-secondary)" fontSize={12} textAnchor="middle" x={cx} y={ty + 12}>
          {row?.shortLabel ?? ''}
        </text>
        {row?.percent === null ? (
          <g>
            <Unplug aria-hidden color="var(--text-muted)" height={14} width={14} x={cx - 38} y={ty - 22} />
            <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={cx - 21} y={ty - 11}>
              {formatUnavailable()}
            </text>
          </g>
        ) : null}
      </g>
    );
  };

  const renderColumn = ({ x, y, width, height: colHeight, payload }: BarGeometry): ReactElement | null => {
    if (!payload) return null;
    const columnX = Number(x);
    const columnWidth = Number(width);
    if (payload.percent === null) return null;
    return (
      <g>
        <rect fill="var(--chart-1)" height={Number(colHeight)} rx={3} width={columnWidth} x={columnX} y={Number(y)} />
        {renderValue(payload, columnX, Number(y), columnWidth, Number(colHeight))}
      </g>
    );
  };

  /** O rótulo vive dentro do shape da própria coluna: a linha vem do `payload`, nunca de índice. */
  function renderValue(row: RowDatum, x: number, y: number, width: number, colHeight: number): ReactElement | null {
    if (row.spent === null || row.percent === null) return null;
    const excess = row.percent - data.comfortTo;
    /** Pixel da linha de meta a partir da própria geometria da coluna: nunca cruza o traço com o texto. */
    const pxPerUnit = row.percent > 0 ? Number(colHeight) / row.percent : 0;
    const baselineY = Number(y) + Number(colHeight);
    const metaPixelY = baselineY - 100 * pxPerUnit;
    const naturalLabelY = Number(y) - VALUE_LABEL_GAP;
    const labelY = Math.abs(naturalLabelY - metaPixelY) < 16 ? Math.min(Number(y), metaPixelY) - VALUE_LABEL_GAP : naturalLabelY;
    return (
      <text className="font-display" fontWeight={500} style={HALO} textAnchor="middle" x={Number(x) + Number(width) / 2} y={labelY}>
        <tspan fill="var(--text-primary)" fontSize={12}>
          {formatCurrencyCompact(row.spent)}
        </tspan>
        {excess > 0 ? (
          <tspan dx={4} fill="var(--negative)" fontSize={11}>
            +{formatInt(Math.round(excess))} pp de {formatPercentPoints(data.comfortTo, 0)}
          </tspan>
        ) : null}
      </text>
    );
  }

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} margin={MARGIN}>
          <XAxis axisLine={false} dataKey="shortLabel" interval={0} tick={renderCategory} tickLine={false} />
          <YAxis domain={[0, domainMax]} hide />
          <ReferenceArea
            fill="var(--surface-sunken)"
            fillOpacity={0.85}
            ifOverflow="extendDomain"
            key="conforto"
            label={renderComfortLabel}
            stroke="none"
            y1={data.comfortFrom}
            y2={data.comfortTo}
          />
          <Bar dataKey="percent" isAnimationActive={animate} maxBarSize={COLUMN_MAX} shape={renderColumn} />
          <ReferenceLine ifOverflow="extendDomain" label={renderTargetLabel} stroke="var(--text-primary)" strokeWidth={2} y={100} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
