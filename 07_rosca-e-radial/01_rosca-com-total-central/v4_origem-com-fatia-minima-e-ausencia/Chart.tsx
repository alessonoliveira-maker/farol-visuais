import { Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

import { seriesColor, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadOriginCount } from './data';

/**
 * Rosca de composição com teto de fatias: até 5 origens ficam individuais, da sexta em diante
 * vira "Outros", e a ausência declarada nunca soma a "Outros" nem entra no teto de cor.
 */
export interface LeadOriginDonutProps {
  readonly data?: readonly LeadOriginCount[];
  readonly height?: number;
  /** Quando definida, ignora `data` e desenha o trilho tracejado de fonte indisponível. */
  readonly unavailableReason?: string;
  readonly className?: string;
}

const INNER_RADIUS = '62%';
const OUTER_RADIUS = '74%';
const ACTIVE_RADIUS_GAIN = 6;
/** No máximo 5 origens nomeadas ficam individuais (COR-4 permite até 6; este modelo usa 5). */
const MAX_NAMED = 5;
/** Slot reservado só para o agregado "Outros" (COR-3): fixo por identidade de categoria, nunca
 * disputado com o `colorIndex` de uma origem nomeada, para o agregado não trocar de cor conforme
 * quem entra ou sai do grupo. */
const OUTROS_COLOR_INDEX = 3;

interface Slice {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly kind: 'origin' | 'outros' | 'ausencia';
  /** Ausente (`undefined`) só na fatia de ausência, que não tem preenchimento. */
  readonly colorIndex?: number;
}

interface SliceShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly payload?: Slice;
}

interface CenterLabelProps {
  /** `x`/`y` nunca são lidos: existem só para o Label não cair no branch cartesiano da
   * checagem de tipo fraco do Recharts (`ViewBox` é `Cartesian | Polar`, e um tipo só com
   * campos opcionais precisa de ao menos uma propriedade em comum com cada lado da união). */
  readonly viewBox?: { readonly cx?: number; readonly cy?: number; readonly x?: number; readonly y?: number };
}

function integerShares(values: readonly number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((share) => Math.floor(share));
  let remainder = 100 - floors.reduce((sum, share) => sum + share, 0);
  const order = raw
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  for (const { index } of order) {
    if (remainder <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    remainder -= 1;
  }
  return result;
}

/** Agrupa a origem crua em até 5 fatias individuais, "Outros" para o resto e a ausência por último. */
function buildSlices(rows: readonly LeadOriginCount[]): Slice[] {
  const named = rows.filter((row) => row.declared).sort((a, b) => b.count - a.count);
  const absent = rows.find((row) => !row.declared);
  const top = named.slice(0, MAX_NAMED);
  const rest = named.slice(MAX_NAMED);
  const slices: Slice[] = top.map((row) => ({
    id: row.id,
    label: row.label,
    count: row.count,
    kind: 'origin',
    colorIndex: row.colorIndex,
  }));
  if (rest.length > 0) {
    slices.push({
      id: 'outros',
      label: `Outros (n=${String(rest.length)})`,
      count: rest.reduce((sum, row) => sum + row.count, 0),
      kind: 'outros',
      colorIndex: OUTROS_COLOR_INDEX,
    });
  }
  if (absent) slices.push({ id: absent.id, label: absent.label, count: absent.count, kind: 'ausencia' });
  return slices;
}

export default function LeadOriginDonut({ data = defaultData, height, unavailableReason, className }: LeadOriginDonutProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  if (unavailableReason) {
    return (
      <div
        aria-label={`Composição por origem, dado ${formatUnavailable()}: ${unavailableReason}`}
        className={cn('flex h-full w-full min-w-0 items-center justify-center', className)}
        role="img"
        style={style}
      >
        <div className="flex aspect-square h-full max-h-56 flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-line-strong px-4">
          <Unplug aria-hidden className="size-5 text-text-muted" />
          <span className="kpi-number text-sm font-semibold text-text-primary">{formatUnavailable()}</span>
          <span className="max-w-full text-center text-[0.6875rem] text-text-muted">{unavailableReason}</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não houve lead novo no período.</span>
      </div>
    );
  }

  const slices = buildSlices(data);
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const shares = integerShares(slices.map((slice) => slice.count));
  const biggest = slices[0];
  const absentShare = slices.findIndex((slice) => slice.kind === 'ausencia');
  const smallestOrigin = [...data].filter((row) => row.declared).sort((a, b) => a.count - b.count)[0];

  const summary = [
    `Gráfico de rosca com ${String(total)} leads do mês por origem.`,
    biggest ? `A maior é ${biggest.label}, com ${formatPercent((shares[0] ?? 0) / 100, 0)}.` : '',
    absentShare >= 0 ? `${formatPercent((shares[absentShare] ?? 0) / 100, 0)} chegaram sem origem declarada.` : '',
    smallestOrigin ? `${smallestOrigin.label} é a menor origem individual, com ${formatInt(smallestOrigin.count)} leads.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  function colorFor(slice: Slice): string | undefined {
    if (slice.colorIndex === undefined) return undefined;
    return seriesColor(slice.colorIndex);
  }

  const renderSlice = (props: SliceShapeProps): ReactElement => {
    const isActive = props.payload?.id === activeId;
    return (
      <Sector
        cx={props.cx}
        cy={props.cy}
        endAngle={props.endAngle}
        fill={props.fill ?? 'none'}
        innerRadius={props.innerRadius}
        outerRadius={(props.outerRadius ?? 0) + (isActive ? ACTIVE_RADIUS_GAIN : 0)}
        startAngle={props.startAngle}
        stroke={props.stroke ?? 'var(--surface-raised)'}
        strokeWidth={props.payload?.kind === 'ausencia' ? 1.5 : 2}
      />
    );
  };

  const renderCenter = ({ viewBox }: CenterLabelProps): ReactElement | null => {
    if (viewBox?.cx === undefined || viewBox.cy === undefined) return null;
    return (
      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
        <tspan className="font-display" dy="-0.3em" fill="var(--text-primary)" fontSize={14} fontWeight={600} x={viewBox.cx}>
          {formatInt(total)}
        </tspan>
        <tspan className="font-sans" dy="1.5em" fill="var(--text-muted)" fontSize={11} x={viewBox.cx}>
          leads no mês
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center gap-6', className)} role="img" style={style}>
      <div className="aspect-square h-full max-h-full shrink-0">
        <ResponsiveContainer height="100%" width="100%">
          {/* minAngle não é declarado (fica no padrão 0 do Recharts): a fatia mínima não pode ser inflada. */}
          <PieChart accessibilityLayer={false} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              cx="50%"
              cy="50%"
              data={slices}
              dataKey="count"
              endAngle={-270}
              innerRadius={INNER_RADIUS}
              isAnimationActive={animate}
              nameKey="label"
              outerRadius={OUTER_RADIUS}
              shape={renderSlice}
              startAngle={90}
            >
              {slices.map((slice) => (
                <Cell fill={colorFor(slice)} key={slice.id} stroke={slice.kind === 'ausencia' ? 'var(--text-muted)' : undefined} />
              ))}
              {/* Sem `position="center"` (ver v1 da 01_rosca-com-total-central): quebraria o Label. */}
              <Label content={renderCenter} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {slices.map((slice, index) => {
          const isActive = slice.id === activeId;
          const isAbsent = slice.kind === 'ausencia';
          return (
            <li key={slice.id}>
              <button
                className="flex w-full items-center gap-2.5 border-0 bg-transparent p-0 text-left text-xs"
                onBlur={() => {
                  setActiveId(undefined);
                }}
                onClick={() => {
                  setActiveId(slice.id);
                }}
                onFocus={() => {
                  setActiveId(slice.id);
                }}
                onMouseEnter={() => {
                  setActiveId(slice.id);
                }}
                onMouseLeave={() => {
                  setActiveId(undefined);
                }}
                type="button"
              >
                <span
                  aria-hidden
                  className={cn('size-2.5 shrink-0 rounded-full', isAbsent && 'border border-text-muted')}
                  style={isAbsent ? undefined : { backgroundColor: colorFor(slice) }}
                />
                <span className={cn('min-w-0 flex-1 truncate', isAbsent ? 'text-text-muted' : isActive ? 'font-bold text-text-primary' : 'text-text-secondary')}>
                  {slice.label}
                </span>
                <span className={cn('kpi-number w-8 shrink-0 text-right', isAbsent ? 'text-text-muted' : 'text-text-primary')}>
                  {formatInt(slice.count)}
                </span>
                <span className="kpi-number w-10 shrink-0 text-right text-text-muted">{formatPercent((shares[index] ?? 0) / 100, 0)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
